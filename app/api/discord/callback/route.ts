import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function appOrigin(): string {
  const u = process.env.APP_URL?.replace(/\/$/, "");
  if (!u) throw new Error("APP_URL is not set");
  return u;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const origin = appOrigin();

  if (err) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err)}`, origin),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=oauth_missing_params", origin),
    );
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/?error=server_misconfigured", origin),
    );
  }

  const redirectUri = `${origin}/api/discord/callback`;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/?error=oauth_token_exchange_failed", origin),
    );
  }

  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) {
    return NextResponse.redirect(
      new URL("/?error=oauth_no_access_token", origin),
    );
  }

  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!meRes.ok) {
    return NextResponse.redirect(
      new URL("/?error=discord_user_fetch_failed", origin),
    );
  }

  const me = (await meRes.json()) as { id?: string };
  if (!me.id) {
    return NextResponse.redirect(new URL("/?error=discord_no_user_id", origin));
  }

  const db = getDb();

  const [target] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, state))
    .limit(1);

  if (!target) {
    return NextResponse.redirect(
      new URL("/?error=session_not_found", origin),
    );
  }

  await db
    .update(sessions)
    .set({ discordUserId: null })
    .where(
      and(eq(sessions.discordUserId, me.id), ne(sessions.id, state)),
    );

  await db
    .update(sessions)
    .set({ discordUserId: me.id })
    .where(eq(sessions.id, state));

  return NextResponse.redirect(
    new URL(`/installed?session=${encodeURIComponent(state)}`, origin),
  );
}
