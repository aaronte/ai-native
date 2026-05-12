import "dotenv/config";

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { eq } from "drizzle-orm";

import { runCoachTurn } from "../../lib/coach/runTurn";
import { chunkDiscordMessage } from "../../lib/discord/chunk";
import { getBotDb } from "../../lib/db/client";
import { sessions } from "../../lib/db/schema";

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
