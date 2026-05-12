import "dotenv/config";

import { REST, Routes, SlashCommandBuilder } from "discord.js";

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

const commands = [
  new SlashCommandBuilder()
    .setName("skills")
    .setDescription("List playbooks loaded for your coach session.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Clear DM history with the coach (keeps your seeded problem).")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(token);

async function main() {
  await rest.put(Routes.applicationCommands(appId), { body: commands });
  console.log("Registered global application (/) commands: skills, reset.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
