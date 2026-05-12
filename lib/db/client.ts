import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

const globalForDb = globalThis as typeof globalThis & {
  __aiNativePostgres?: ReturnType<typeof postgres>;
};

/**
 * Next.js / API routes: one warm connection per serverless isolate via globalThis
 * in dev to avoid exhausting Supabase pooler connections.
 */
export function getDb() {
  const url = getDatabaseUrl();
  if (!globalForDb.__aiNativePostgres) {
    globalForDb.__aiNativePostgres = postgres(url, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return drizzle(globalForDb.__aiNativePostgres, { schema });
}

let botClient: ReturnType<typeof postgres> | null = null;

/** Discord bot process: small local pool. */
export function getBotDb() {
  if (!botClient) {
    const url = getDatabaseUrl();
    botClient = postgres(url, {
      max: 3,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return drizzle(botClient, { schema });
}

export { schema };
