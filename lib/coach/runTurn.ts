import { generateText } from "ai";
import { and, asc, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { messages, sessions } from "@/lib/db/schema";
import {
  DEFAULT_COACH_MODEL,
  requireOpenRouter,
} from "@/lib/llm/openrouter";
import * as schema from "@/lib/db/schema";
import {
  buildInjectedSkillsBody,
  buildSkillIndex,
  buildSystemPrompt,
} from "@/lib/prompts/system";
import { loadAllSkills, skillsBySlug } from "@/lib/skills/loader";
import type { Skill } from "@/lib/skills/types";

export type CoachDb = PostgresJsDatabase<typeof schema>;

function resolveInjectedSkills(slugs: string[]): Skill[] {
  const map = skillsBySlug();
  return slugs.map((s) => map.get(s)).filter((s): s is Skill => Boolean(s));
}

export async function runCoachTurn(params: {
  db: CoachDb;
  sessionId: string;
  discordUserId: string;
  userContent: string;
}): Promise<{ reply: string }> {
  const { db, sessionId, discordUserId, userContent } = params;
  const trimmed = userContent.trim();
  if (!trimmed) {
    throw new Error("Empty message");
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) {
    throw new Error("Session not found");
  }
  if (session.discordUserId !== discordUserId) {
    throw new Error("Session does not belong to this Discord user");
  }

  await db.insert(messages).values({
    sessionId,
    role: "user",
    content: trimmed,
  });

  const rows = await db
    .select()
    .from(messages)
    .where(
      and(eq(messages.sessionId, sessionId), eq(messages.archived, false)),
    )
    .orderBy(asc(messages.createdAt));

  const summaryText = rows
    .filter((r) => r.role === "summary")
    .map((r) => r.content)
    .join("\n\n");

  const convo = rows.filter(
    (r) => r.role === "user" || r.role === "assistant",
  );
  const tail = convo.slice(-20);

  const slugs = session.relevantSkillSlugs ?? [];
  const injected = resolveInjectedSkills(slugs);
  const allSkills = loadAllSkills();

  let system = buildSystemPrompt({
    skillIndex: buildSkillIndex(allSkills),
    injectedSkills: buildInjectedSkillsBody(injected),
    seededProblem: session.problem,
  });
  if (summaryText) {
    system += `\n\n## Running conversation summary\n${summaryText}`;
  }

  const coreMessages = tail.map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
  }));

  const openrouter = requireOpenRouter();
  const modelId = process.env.OPENROUTER_COACH_MODEL ?? DEFAULT_COACH_MODEL;

  const { text } = await generateText({
    model: openrouter(modelId),
    system,
    messages: coreMessages,
  });

  const reply = text.trim() || "I’m not sure how to respond—could you rephrase?";

  await db.insert(messages).values({
    sessionId,
    role: "assistant",
    content: reply,
  });

  return { reply };
}
