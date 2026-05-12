import "dotenv/config";

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { eq } from "drizzle-orm";

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

client.once(Events.ClientReady, (c) => {
  console.log(`Ready as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  if (!message.content?.trim()) return;

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

  await message.reply(
    "You’re linked. Hang tight — the coaching reply loop is finishing deployment on this bot instance.",
  );
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("DISCORD_BOT_TOKEN is not set");
  process.exit(1);
}

void client.login(token);
