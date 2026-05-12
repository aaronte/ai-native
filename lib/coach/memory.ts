import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { and, asc, eq, inArray } from "drizzle-orm";

import { messages } from "@/lib/db/schema";

import type { CoachDb } from "./runTurn";

/** Rough context budget before folding old turns into a summary row. */
const THRESHOLD_CHARS = 200_000;
const DEFAULT_SUMMARY_MODEL = "claude-3-5-haiku-20241022";

/**
 * If the active (non-archived) conversation is tall, summarize the oldest half
 * into `role: summary` and archive the folded rows.
 */
export async function maybeCompressHistory(
  db: CoachDb,
  sessionId: string,
): Promise<void> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return;

  const rows = await db
    .select()
    .from(messages)
    .where(
      and(eq(messages.sessionId, sessionId), eq(messages.archived, false)),
    )
    .orderBy(asc(messages.createdAt));

  const convo = rows.filter(
    (r) => r.role === "user" || r.role === "assistant",
  );
  const charCount = convo.reduce((a, r) => a + r.content.length, 0);
  if (charCount < THRESHOLD_CHARS || convo.length < 6) return;

  const half = Math.floor(convo.length / 2);
  const toFold = convo.slice(0, half);
  const ids = toFold.map((r) => r.id);
  if (ids.length === 0) return;

  const blob = toFold.map((r) => `${r.role}: ${r.content}`).join("\n\n");

  const anthropic = createAnthropic({ apiKey: key });
  const modelId =
    process.env.ANTHROPIC_SUMMARY_MODEL ?? DEFAULT_SUMMARY_MODEL;

  const { text } = await generateText({
    model: anthropic(modelId),
    system:
      "Compress conversation history into a concise executive coaching brief. Use short bullets: key facts, decisions, open questions, tensions. Max ~1200 words. Preserve names and numbers exactly.",
    prompt: blob,
  });

  const summary = text.trim();
  if (!summary) return;

  await db.insert(messages).values({
    sessionId,
    role: "summary",
    content: summary,
  });

  await db
    .update(messages)
    .set({ archived: true })
    .where(inArray(messages.id, ids));
}
