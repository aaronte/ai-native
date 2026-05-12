import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  /**
   * Supabase: limit introspection. `push` can still crash when Postgres returns CHECK rows with no
   * `constraint_definition` — use `DIRECT_URL` (session / port 5432) instead of the pooler if setup fails.
   */
  schemaFilter: ["public"],
  tablesFilter: ["sessions", "messages"],
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
