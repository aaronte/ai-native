import { chunkDiscordMessage } from "./chunk";

type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

type DiscordEmbed = {
  title: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
};

export type DiscordReplyPayload = {
  content?: string;
  embeds?: DiscordEmbed[];
};

const SNAPSHOT_KPIS = [
  "Intent-To-Ship",
  "AI-Assisted Coverage",
  "AI Coverage",
  "Human Rework Rate",
  "Rework Rate",
  "Autonomous Task Completion",
  "Autonomous Completion",
  "Cross-Functional Alignment Score",
  "Alignment Score",
] as const;

const KPI_LABELS: Record<(typeof SNAPSHOT_KPIS)[number], string> = {
  "Intent-To-Ship": "Intent-To-Ship",
  "AI-Assisted Coverage": "AI-Assisted Coverage",
  "AI Coverage": "AI-Assisted Coverage",
  "Human Rework Rate": "Human Rework Rate",
  "Rework Rate": "Human Rework Rate",
  "Autonomous Task Completion": "Autonomous Completion",
  "Autonomous Completion": "Autonomous Completion",
  "Cross-Functional Alignment Score": "Alignment Score",
  "Alignment Score": "Alignment Score",
};

function stripMarkdown(value: string): string {
  return value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^[-*]\s+/, "")
    .trim();
}

function extractLineValue(text: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(
    new RegExp(`(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*:?\\s*([^\\n]+)`, "i"),
  );
  return match?.[1] ? stripMarkdown(match[1]) : null;
}

function extractSectionLine(text: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(
    new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*\\n([^\\n]+)`, "i"),
  );
  return match?.[1] ? stripMarkdown(match[1]) : null;
}

function renderSnapshotEmbed(reply: string): DiscordReplyPayload | null {
  if (!/AI-Native Development Score/i.test(reply)) {
    return null;
  }

  const score =
    extractLineValue(reply, "AI-Native Development Score") ??
    extractSectionLine(reply, "AI-Native Development Score");

  const fields: DiscordEmbedField[] = [];
  const seen = new Set<string>();
  for (const label of SNAPSHOT_KPIS) {
    const value = extractLineValue(reply, label);
    if (!value) continue;

    const canonical = KPI_LABELS[label];
    if (seen.has(canonical)) continue;
    seen.add(canonical);

    fields.push({ name: canonical, value, inline: true });
  }

  const recommendedAction =
    extractSectionLine(reply, "Recommended Action") ??
    extractLineValue(reply, "Recommended Action");
  if (recommendedAction) {
    fields.push({
      name: "Recommended Action",
      value: recommendedAction,
      inline: false,
    });
  }

  if (fields.length === 0) {
    return null;
  }

  return {
    content: "Here's the snapshot in a Discord-friendly format:",
    embeds: [
      {
        title: "AI-Native Team Snapshot",
        description: score
          ? `AI-Native Development Score: ${score}`
          : undefined,
        color: 0x5865f2,
        fields: fields.slice(0, 25),
      },
    ],
  };
}

function isMarkdownTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function formatMarkdownTables(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const next = lines[i + 1];
    if (line.includes("|") && next && isMarkdownTableSeparator(next)) {
      const table: string[] = [line, next];
      i += 2;
      while (i < lines.length && lines[i]!.includes("|")) {
        table.push(lines[i]!);
        i++;
      }
      out.push("```text", table.map(stripMarkdown).join("\n"), "```");
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join("\n");
}

export function renderDiscordReplies(reply: string): DiscordReplyPayload[] {
  const snapshot = renderSnapshotEmbed(reply);
  if (snapshot) {
    return [snapshot];
  }

  return chunkDiscordMessage(formatMarkdownTables(reply)).map((content) => ({
    content,
  }));
}
