import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { getDiscordAuthorizeUrl } from "@/lib/discord/oauth";
import { pickTopSkillSlugs } from "@/lib/skills/router";

const bodySchema = z.object({
  problem: z.string().min(20).max(20000),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Describe your situation in at least 20 characters." },
      { status: 400 },
    );
  }

  const problem = parsed.data.problem.trim();
  const slugs = pickTopSkillSlugs(problem);

  const db = getDb();
  const [row] = await db
    .insert(sessions)
    .values({
      problem,
      relevantSkillSlugs: slugs,
    })
    .returning({ id: sessions.id });

  const installUrl = getDiscordAuthorizeUrl({ sessionId: row.id });

  return NextResponse.json({
    sessionId: row.id,
    installUrl,
  });
}
