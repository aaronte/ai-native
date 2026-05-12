import { and, eq, isNull } from "drizzle-orm";

import { sessions } from "@/lib/db/schema";

import type { CoachDb } from "./runTurn";

/**
 * Bind a prefilled intake session (`discord_user_id` null) to the Discord user
 * from OAuth. If that user already had a session row, merge intake into it and
 * delete the pending row (unique constraint on `discord_user_id`).
 */
export async function attachDiscordUserFromOAuth(
  db: CoachDb,
  intakeSessionId: string,
  discordUserId: string,
): Promise<void> {
  const [pending] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, intakeSessionId), isNull(sessions.discordUserId)))
    .limit(1);

  if (!pending) {
    throw new Error("invalid_or_used_intake");
  }

  const [existing] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.discordUserId, discordUserId))
    .limit(1);

  if (existing && existing.id !== intakeSessionId) {
    await db.transaction(async (tx) => {
      await tx
        .update(sessions)
        .set({
          problem: pending.problem,
          relevantSkillSlugs: pending.relevantSkillSlugs,
        })
        .where(eq(sessions.id, existing.id));
      await tx.delete(sessions).where(eq(sessions.id, intakeSessionId));
    });
    return;
  }

  await db
    .update(sessions)
    .set({ discordUserId })
    .where(eq(sessions.id, intakeSessionId));
}
