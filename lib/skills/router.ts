import { loadAllSkills, skillsBySlug } from "./loader";
import type { Skill } from "./types";

/**
 * Prepended when picking skills so coaching defaults to async capture, tooling, and AI-augmented
 * workflows rather than asking leaders for heavy manual write-ups.
 */
export const AUTOMATION_LEAN_SKILL_SLUGS: readonly string[] = [
  "transparency-and-async",
  "prds-and-specs-in-the-ai-era",
];

const WORD = /\b[a-z0-9]{2,}\b/gi;

function tokenize(text: string): Set<string> {
  const s = text.toLowerCase();
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(WORD.source, WORD.flags);
  while ((m = re.exec(s)) !== null) {
    out.add(m[0]);
  }
  return out;
}

export function scoreSkills(problem: string, skills: Skill[]): { slug: string; score: number }[] {
  const words = tokenize(problem);
  return skills.map((skill) => {
    let score = 0;
    const titleTokens = tokenize(skill.title);
    const summaryTokens = tokenize(skill.summary);
    const kwLower = skill.keywords.map((k) => k.toLowerCase());

    for (const kw of kwLower) {
      if (kw.length < 2) continue;
      if (problem.toLowerCase().includes(kw)) score += 5;
    }
    for (const w of words) {
      if (titleTokens.has(w)) score += 3;
      if (summaryTokens.has(w)) score += 1;
      for (const k of kwLower) {
        if (k.includes(w) || w.includes(k)) score += 2;
      }
    }
    return { slug: skill.slug, score };
  });
}

export function pickTopSkillSlugs(problem: string, limit = 6): string[] {
  const skills = loadAllSkills();
  const scored = scoreSkills(problem, skills)
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit).map((s) => s.slug);
  if (top.length > 0) return mergeAutomationLeanSlugs(top, limit);
  return mergeAutomationLeanSlugs(
    skills.slice(0, limit).map((s) => s.slug),
    limit,
  );
}

/** Dedupes, prepends automation-lean slugs that exist in the library, then fills from `slugs`. */
export function mergeAutomationLeanSlugs(slugs: string[], limit = 6): string[] {
  const map = skillsBySlug();
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (s: string) => {
    if (!map.has(s) || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };

  for (const bias of AUTOMATION_LEAN_SKILL_SLUGS) {
    if (out.length >= limit) break;
    push(bias);
  }
  for (const s of slugs) {
    if (out.length >= limit) break;
    push(s);
  }
  return out;
}
