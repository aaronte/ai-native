import { skillsBySlug } from "@/lib/skills/loader";
import type { Discipline } from "@/lib/skills/types";

/** Mirrors the five KPIs in `content/skills/cross/ai-native-team-snapshot.md`. */
const FIVE_KPIS =
  "Intent-To-Ship Time; AI-Assisted Work Coverage; Human Rework Rate; Autonomous Task Completion Rate; Cross-Functional Alignment Score";

export type FunctionLens = Exclude<Discipline, "cross">;

const LENS_ORDER: Record<FunctionLens, string> = {
  design:
    "Human Rework Rate → Cross-Functional Alignment Score → AI-Assisted Work Coverage → Intent-To-Ship Time → Autonomous Task Completion Rate",
  product:
    "Cross-Functional Alignment Score → Intent-To-Ship Time → AI-Assisted Work Coverage → Human Rework Rate → Autonomous Task Completion Rate",
  engineering:
    "Intent-To-Ship Time → Autonomous Task Completion Rate → Human Rework Rate → AI-Assisted Work Coverage → Cross-Functional Alignment Score",
};

function countFromSkills(skillSlugs: string[]): Record<FunctionLens, number> {
  const map = skillsBySlug();
  const out: Record<FunctionLens, number> = {
    design: 0,
    product: 0,
    engineering: 0,
  };
  for (const slug of skillSlugs) {
    const s = map.get(slug);
    if (!s || s.discipline === "cross") continue;
    out[s.discipline] += 2;
  }
  return out;
}

function keywordBoost(problem: string): Record<FunctionLens, number> {
  const p = problem.toLowerCase();
  const out: Record<FunctionLens, number> = {
    design: 0,
    product: 0,
    engineering: 0,
  };
  if (
    /\b(design|designer|designers|figma|ux\b|ui\b|prototype|handoff|creative)\b/.test(
      p,
    )
  )
    out.design += 4;
  if (
    /\b(pm\b|product manager|product owners?|roadmap|discovery|prd|prds|stakeholder|backlog|sprint planning)\b/.test(
      p,
    )
  )
    out.product += 4;
  if (
    /\b(engineer|engineering|developer|code review|pull request|\bpr\b|deploy|ci\/cd|refactor|repo)\b/.test(
      p,
    )
  )
    out.engineering += 4;
  return out;
}

/**
 * Order function lens(es) for coaching from skills + problem wording.
 */
export function resolveFunctionLenses(args: {
  problem: string;
  skillSlugs: string[];
}): FunctionLens[] {
  const { problem, skillSlugs } = args;

  const skillPart = countFromSkills(skillSlugs);
  const kw = keywordBoost(problem);
  const total: Record<FunctionLens, number> = {
    design: skillPart.design + kw.design,
    product: skillPart.product + kw.product,
    engineering: skillPart.engineering + kw.engineering,
  };

  const ranked = (
    Object.entries(total) as [FunctionLens, number][]
  ).sort((a, b) => b[1] - a[1]);

  if (ranked[0]![1] === 0) {
    return ["product", "engineering", "design"];
  }

  const topScore = ranked[0]![1];
  const threshold = topScore * 0.55;
  const multi = ranked
    .filter(([, n]) => n >= threshold && n > 0)
    .map(([d]) => d);
  if (multi.length >= 2) return multi;
  return [ranked[0]![0]];
}

export function buildKpiPriorityBlock(args: {
  problem: string;
  skillSlugs: string[];
}): string {
  const lenses = resolveFunctionLenses(args);
  const orderLabel = lenses
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(", then ");

  const lines: string[] = [
    "## KPI priority",
    `Primary lens(es) in order: **${orderLabel}** (inferred from their problem text + loaded skills). When you suggest measuring progress, AI-Native Development Score components, or scorecards, **start with KPIs that this function moves first**, then cover the rest of the five so the exec still sees the full picture.`,
    `Shared five org KPIs (always this set): ${FIVE_KPIS}.`,
  ];

  for (const lens of lenses) {
    lines.push(
      `- **${lens.charAt(0).toUpperCase() + lens.slice(1)} emphasis (order to cite):** ${LENS_ORDER[lens]}`,
    );
  }

  lines.push(
    "(If they correct you on which function matters most, follow their lead.)",
  );

  return lines.join("\n");
}
