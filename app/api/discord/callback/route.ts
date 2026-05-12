import { NextResponse } from "next/server";

import { attachDiscordUserFromOAuth } from "@/lib/coach/attachDiscordFromOAuth";
import {
  exchangeDiscordOAuthCode,
  fetchDiscordUserId,
} from "@/lib/discord/oauth";
import { getDiscordOAuthRedirectUri } from "@/lib/discord/redirectUri";
import { getDb } from "@/lib/db/client";

function appOrigin(): string {
  const base = process.env.APP_URL?.trim().replace(/\/+$/, "");
  return base ?? "";
}

export async function GET(request: Request) {
  const origin = appOrigin();
  const fail = (code: string) =>
    NextResponse.redirect(
      origin ? `${origin}/?discord_oauth=${code}` : `/?discord_oauth=${code}`,
    );

  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return fail("denied");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return fail("missing_params");
  }

  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return fail("server_config");
  }

  let redirectUri: string;
  try {
    redirectUri = getDiscordOAuthRedirectUri();
  } catch {
    return fail("server_config");
  }

  let accessToken: string;
  try {
    const tokens = await exchangeDiscordOAuthCode({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });
    accessToken = tokens.access_token;
  } catch {
    return fail("token_exchange");
  }

  let discordUserId: string;
  try {
    discordUserId = await fetchDiscordUserId(accessToken);
  } catch {
    return fail("user_fetch");
  }

  const db = getDb();
  try {
    await attachDiscordUserFromOAuth(db, state, discordUserId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "invalid_or_used_intake") {
      return fail("invalid_state");
    }
    return fail("link_failed");
  }

  return NextResponse.redirect(
    origin ? `${origin}/?discord_oauth=ok` : `/?discord_oauth=ok`,
  );
}
