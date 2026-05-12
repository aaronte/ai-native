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

function normalizeTableDashes(line: string): string {
  return line.replace(/[\u2013\u2014]/g, "-");
}

/** Split a pipe table row into cells (GFM-style, outer pipes optional). */
function splitPipeRow(line: string): string[] {
  let t = normalizeTableDashes(line.trim());
  t = t.replace(/\*\*/g, "");
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split("|").map((c) => c.replace(/`/g, "").trim());
}

function isSeparatorCells(cells: string[]): boolean {
  if (cells.length < 2) return false;
  return cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function isMarkdownTableSeparatorLine(line: string): boolean {
  if (!line.includes("|")) return false;
  const cells = splitPipeRow(line);
  if (cells.some((c) => c === "")) return false;
  return isSeparatorCells(cells);
}

/**
 * Discord does not render Markdown tables; pipe grids look broken in chat.
 * Turn pipe tables into short sections: bold row label, then each column on its own line.
 */
function pipeTableToDiscord(headerLine: string, bodyLines: string[]): string {
  const headers = splitPipeRow(headerLine).map(stripMarkdown);
  if (headers.length < 2) {
    return ["```", normalizeTableDashes(headerLine), ...bodyLines.map(normalizeTableDashes), "```"].join(
      "\n",
    );
  }

  const blocks: string[] = [];
  for (const rowLine of bodyLines) {
    if (isMarkdownTableSeparatorLine(rowLine)) continue;
    const cells = splitPipeRow(rowLine).map(stripMarkdown);
    const label = (cells[0] ?? "").trim();
    if (!label) continue;

    const lines: string[] = [`**${label}**`];
    for (let col = 1; col < headers.length; col++) {
      const h = (headers[col] ?? "").trim();
      if (!h) continue;
      const v = (cells[col] ?? "").trim();
      const isScoreCol = /score|rate|rating|\(1\s*[-–]\s*5\)/i.test(h);
      if (isScoreCol) {
        lines.push(v ? `${h}: **${v}**` : `_${h}:_ *(add 1–5)*`);
      } else if (v) {
        lines.push(v);
      } else {
        lines.push(`_${h}:_ —`);
      }
    }
    blocks.push(lines.join("\n"));
  }

  return blocks.join("\n\n");
}

function formatMarkdownTables(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const next = lines[i + 1];
    if (
      line.includes("|") &&
      next &&
      isMarkdownTableSeparatorLine(next)
    ) {
      const header = line;
      i += 2;
      const body: string[] = [];
      while (i < lines.length && lines[i]!.includes("|")) {
        body.push(lines[i]!);
        i++;
      }
      out.push(pipeTableToDiscord(header, body));
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
