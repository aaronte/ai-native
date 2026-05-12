/**
 * Must match **exactly** a Redirect URI configured under Discord → OAuth2.
 */
export function getDiscordOAuthRedirectUri(): string {
  const explicit = process.env.DISCORD_REDIRECT_URI?.trim();
  if (explicit) {
    return explicit;
  }
  const base = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error(
      "Set DISCORD_REDIRECT_URI or APP_URL so the OAuth redirect URI can be built.",
    );
  }
  return `${base}/api/discord/callback`;
}
