/**
 * Install link with `client_id` only — Discord applies the app’s **Default Install
 * Settings** from the Developer Portal (user install, scopes, etc.).
 *
 * @see https://discord.com/developers/docs/topics/oauth2
 */
export function discordDefaultInstallUrl(clientId: string): string {
  const q = new URLSearchParams({ client_id: clientId });
  return `https://discord.com/oauth2/authorize?${q.toString()}`;
}
