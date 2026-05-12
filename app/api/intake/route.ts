import { NextResponse } from "next/server";
import { z } from "zod";

import { MIN_FIRST_MESSAGE_CHARS } from "@/lib/coach/constants";
import { discordGuildInstallAuthorizeUrl } from "@/lib/discord/oauth";
import { getDiscordOAuthRedirectUri } from "@/lib/discord/redirectUri";
import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { pickTopSkillSlugs } from "@/lib/skills/router";

const intakeSchema = z.object({
  nameAndTitle: z.string().max(320).optional(),
  situation: z
    .string()
    .min(MIN_FIRST_MESSAGE_CHARS)
    .max(12_000),
});

function buildProblemText(input: z.infer<typeof intakeSchema>): string {
  const lines: string[] = [];
  const who = input.nameAndTitle?.trim();
  if (who) lines.push(`Name, job title: ${who}`);
  if (lines.length) lines.push("");
  lines.push(input.situation.trim());
  return lines.join("\n");
}

export async function POST(request: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "Discord OAuth is not configured (need DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET).",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let redirectUri: string;
  try {
    redirectUri = getDiscordOAuthRedirectUri();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Redirect URI misconfigured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const problem = buildProblemText(parsed.data);
  const slugs = pickTopSkillSlugs(problem);

  const db = getDb();
  const [row] = await db
    .insert(sessions)
    .values({
      discordUserId: null,
      problem,
      relevantSkillSlugs: slugs,
    })
    .returning({ id: sessions.id });

  const sessionId = row!.id;

  const authorizeUrl = discordGuildInstallAuthorizeUrl({
    clientId,
    redirectUri,
    state: sessionId,
  });

  return NextResponse.json({ authorizeUrl });
}
