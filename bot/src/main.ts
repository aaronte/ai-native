import "dotenv/config";

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { eq } from "drizzle-orm";

import { maybeCompressHistory } from "../../lib/coach/memory";
import { runCoachTurn } from "../../lib/coach/runTurn";
import { chunkDiscordMessage } from "../../lib/discord/chunk";
import { getBotDb } from "../../lib/db/client";
import { messages, sessions } from "../../lib/db/schema";
import { skillsBySlug } from "../../lib/skills/loader";

const appUrl = process.env.APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

/** Per-user chain so concurrent DMs don’t interleave replies. */
const chains = new Map<string, Promise<void>>();

function enqueue(userId: string, task: () => Promise<void>): void {
  const prev = chains.get(userId) ?? Promise.resolve();
  const next = prev
    .then(task)
    .catch((err: unknown) => {
      console.error("DM handler error", err);
    })
    .finally(() => {
      if (chains.get(userId) === next) {
        chains.delete(userId);
      }
    });
  chains.set(userId, next);
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const db = getBotDb();
  const userId = interaction.user.id;

  if (interaction.commandName === "skills") {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.discordUserId, userId))
      .limit(1);

    if (!session) {
      await interaction.reply({
        content: `No session linked yet. Describe your situation on **${appUrl}** and complete Discord install first.`,
        ephemeral: true,
      });
      return;
    }

    const map = skillsBySlug();
    const slugs = session.relevantSkillSlugs ?? [];
    const lines = slugs.map((slug) => {
      const sk = map.get(slug);
      return sk ? `• **${sk.title}** (\`${slug}\`)` : `• \`${slug}\``;
    });

    await interaction.reply({
      content: lines.length
        ? `Playbooks prioritized for your session:\n${lines.join("\n")}`
        : "No skill slugs stored on this session.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "reset") {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.discordUserId, userId))
      .limit(1);

    if (!session) {
      await interaction.reply({
        content: `No session linked yet. Start at **${appUrl}**.`,
        ephemeral: true,
      });
      return;
    }

    await db.delete(messages).where(eq(messages.sessionId, session.id));

    await interaction.reply({
      content:
        "Cleared your DM history with the coach. Your seeded problem and skill picks are unchanged—send a new message to continue.",
      ephemeral: true,
    });
  }
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  const text = message.content?.trim();
  if (!text) return;

  enqueue(message.author.id, async () => {
    const db = getBotDb();
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.discordUserId, message.author.id))
      .limit(1);

    if (!session) {
      await message.reply(
        `Hi — I don’t have a session for your Discord account yet. Open **${appUrl}**, describe your team challenge, and complete the install flow. Then DM me again here.`,
      );
      return;
    }

    try {
      await maybeCompressHistory(db, session.id);
    } catch (e) {
      console.error("memory compression failed", e);
    }

    try {
      const channel = message.channel;
      if (channel.isDMBased()) {
        await channel.sendTyping();
      }
    } catch {
      /* ignore typing failures */
    }

    try {
      const { reply } = await runCoachTurn({
        db,
        sessionId: session.id,
        discordUserId: message.author.id,
        userContent: text,
      });
      const parts = chunkDiscordMessage(reply);
      for (let i = 0; i < parts.length; i++) {
        const chunk = parts[i]!;
        if (i > 0) {
          try {
            if (message.channel.isDMBased()) {
              await message.channel.sendTyping();
            }
          } catch {
            /* ignore */
          }
        }
        await message.reply(chunk);
      }
    } catch (e) {
      console.error(e);
      await message.reply(
        "Something went wrong generating a reply. Try again in a moment, or type `/reset` if the thread feels stuck.",
      );
    }
  });
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("DISCORD_BOT_TOKEN is not set");
  process.exit(1);
}

void client.login(token);
