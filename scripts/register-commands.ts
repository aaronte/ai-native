import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import {
  ApplicationIntegrationType,
  InteractionContextType,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`${name} is required`);
    process.exit(1);
  }
  return v;
}

const token = requireEnv("DISCORD_BOT_TOKEN");
const appId = requireEnv("DISCORD_APPLICATION_ID");

const integration = {
  integration_types: [ApplicationIntegrationType.UserInstall],
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ],
} as const;

const commands = [
  new SlashCommandBuilder()
    .setName("skills")
    .setDescription("List playbooks loaded for your coach session.")
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    )
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel,
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("reset")
    .setDescription(
      "Clear DM history with the coach (keeps your seeded problem).",
    )
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    )
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel,
    )
    .toJSON(),
];

void integration;

const rest = new REST({ version: "10" }).setToken(token);

async function main() {
  await rest.put(Routes.applicationCommands(appId), { body: commands });
  console.log("Registered global application (/) commands: skills, reset.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
