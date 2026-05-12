/** Discord message content max length */
export const DISCORD_MAX = 2000;

export function chunkDiscordMessage(text: string, maxLen = DISCORD_MAX): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed ? [trimmed] : [];

  const parts: string[] = [];
  let rest = trimmed;
  while (rest.length > 0) {
    if (rest.length <= maxLen) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n\n", maxLen);
    if (cut < maxLen / 2) cut = rest.lastIndexOf(" ", maxLen);
    if (cut < maxLen / 2) cut = maxLen;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  return parts.filter(Boolean);
}
