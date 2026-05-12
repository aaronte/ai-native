import { loadAllSkills } from "./loader";
import type { Skill } from "./types";

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
  if (top.length > 0) return top;
  return skills.slice(0, limit).map((s) => s.slug);
}
