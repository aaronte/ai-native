import { eq } from "drizzle-orm";

import { sessions } from "@/lib/db/schema";
import { pickTopSkillSlugs } from "@/lib/skills/router";

import { MIN_FIRST_MESSAGE_CHARS } from "./constants";

import type { CoachDb } from "./runTurn";

export { MIN_FIRST_MESSAGE_CHARS };

export async function getSessionForDiscordUser(
  db: CoachDb,
  discordUserId: string,
) {
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.discordUserId, discordUserId))
    .limit(1);
  return row ?? null;
}

/**
 * Resolve session for a DM: existing row, or create from first message (topic seed).
 */
export async function resolveSessionForDm(
  db: CoachDb,
  discordUserId: string,
  text: string,
): Promise<
  | { ok: true; sessionId: string }
  | { ok: false; error: "too_short"; minChars: number }
> {
  const existing = await getSessionForDiscordUser(db, discordUserId);
  if (existing) {
    return { ok: true, sessionId: existing.id };
  }

  const trimmed = text.trim();
  if (trimmed.length < MIN_FIRST_MESSAGE_CHARS) {
    return {
      ok: false,
      error: "too_short",
      minChars: MIN_FIRST_MESSAGE_CHARS,
    };
  }

  const slugs = pickTopSkillSlugs(trimmed);
  try {
    const [row] = await db
      .insert(sessions)
      .values({
        discordUserId,
        problem: trimmed,
        relevantSkillSlugs: slugs,
      })
      .returning({ id: sessions.id });
    return { ok: true, sessionId: row!.id };
  } catch {
    const again = await getSessionForDiscordUser(db, discordUserId);
    if (again) {
      return { ok: true, sessionId: again.id };
    }
    throw new Error("Could not create session for Discord user");
  }
}
