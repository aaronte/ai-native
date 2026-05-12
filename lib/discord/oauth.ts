/**
 * Builds Discord OAuth2 URL to authorize user install and link Discord identity.
 * Scopes: `identify` (for user id) + `applications.commands` (slash commands on user account).
 */
export function getDiscordAuthorizeUrl(params: {
  sessionId: string;
}): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  if (!clientId || !appUrl) {
    throw new Error("DISCORD_CLIENT_ID and APP_URL must be set");
  }

  const redirectUri = `${appUrl}/api/discord/callback`;

  const q = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify applications.commands",
    state: params.sessionId,
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${q.toString()}`;
}
