import { config as loadEnv } from "dotenv";

/** Match Next.js: secrets live in `.env.local`; fall back to `.env`. */
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
} from "discord.js";
import { eq } from "drizzle-orm";

import {
  MIN_FIRST_MESSAGE_CHARS,
  resolveSessionForDm,
} from "../../lib/coach/botSession";
import { maybeCompressHistory } from "../../lib/coach/memory";
import { runCoachTurn } from "../../lib/coach/runTurn";
import { renderDiscordReplies } from "../../lib/discord/renderReply";
import { getBotDb } from "../../lib/db/client";
import { messages, sessions } from "../../lib/db/schema";
import { skillsBySlug } from "../../lib/skills/loader";

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    /** Needed so we can post a short “thanks for adding me” when installed to a server. */
    GatewayIntentBits.Guilds,
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

/** One hello in the server’s system/default channel when the bot is added to a guild (optional install path). */
client.on(Events.GuildCreate, async (guild) => {
  try {
    const me = guild.members.me ?? (await guild.members.fetchMe());
    const textChannels = guild.channels.cache.filter(
      (channel) => channel.type === ChannelType.GuildText,
    );
    const channel =
      guild.systemChannel && textChannels.has(guild.systemChannel.id)
        ? guild.systemChannel
        : textChannels.find((candidate) =>
            candidate.permissionsFor(me)?.has(PermissionFlagsBits.SendMessages),
          );

    if (!channel?.permissionsFor(me)?.has(PermissionFlagsBits.SendMessages)) {
      return;
    }

    const tag = guild.client.user?.username ?? "the coach";
    await channel.send({
      content:
        `Thanks for adding **${tag}** — coaching happens in **DM**: open your inbox with this bot and send what you’re working through (your web intake is linked if you used the QR flow).\n` +
        `Use **/skills** or **/reset** anytime after we’ve started.`,
    });
  } catch (e) {
    console.error("guild install welcome message failed", e);
  }
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
        content: `No coach session yet. DM me a short description of your org challenge (**at least ${MIN_FIRST_MESSAGE_CHARS} characters**) to start.`,
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
        content: `Nothing to reset yet. DM me first with your situation (**${MIN_FIRST_MESSAGE_CHARS}+** characters) to start a session.`,
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
    const resolved = await resolveSessionForDm(
      db,
      message.author.id,
      text,
    );

    if (!resolved.ok) {
      await message.reply(
        `Hi — kick off by sending **one message** with the team or org challenge you’re working through (at least **${resolved.minChars}** characters). I’ll use that to load the right playbooks and reply as your coach.`,
      );
      return;
    }

    const { sessionId } = resolved;

    try {
      await maybeCompressHistory(db, sessionId);
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
        sessionId,
        discordUserId: message.author.id,
        userContent: text,
      });
      const parts = renderDiscordReplies(reply);
      for (let i = 0; i < parts.length; i++) {
        const payload = parts[i]!;
        if (i > 0) {
          try {
            if (message.channel.isDMBased()) {
              await message.channel.sendTyping();
            }
          } catch {
            /* ignore */
          }
        }
        await message.reply(payload);
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
