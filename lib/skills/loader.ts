import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import type { Discipline, Skill } from "./types";

const frontmatterSchema = z.object({
  title: z.string(),
  discipline: z.enum(["engineering", "product", "design", "cross"]),
  summary: z.string(),
  keywords: z.array(z.string()),
});

let cache: Skill[] | null = null;

function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkMarkdownFiles(p));
    else if (e.isFile() && e.name.endsWith(".md")) files.push(p);
  }
  return files;
}

export function loadAllSkills(): Skill[] {
  if (cache) return cache;
  const root = path.join(process.cwd(), "content", "skills");
  const paths = walkMarkdownFiles(root);
  const skills: Skill[] = [];
  for (const filePath of paths) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`Skipping invalid skill frontmatter: ${filePath}`);
      continue;
    }
    const rel = path.relative(root, filePath);
    const slug = path.basename(rel, ".md");
    const discipline = path.dirname(rel).split(path.sep)[0] as Discipline;
    if (parsed.data.discipline !== discipline) {
      console.warn(
        `Discipline mismatch for ${filePath}: folder=${discipline} fm=${parsed.data.discipline}`,
      );
    }
    skills.push({
      slug,
      discipline: parsed.data.discipline,
      title: parsed.data.title,
      summary: parsed.data.summary,
      keywords: parsed.data.keywords,
      body: content.trim(),
    });
  }
  skills.sort((a, b) => a.slug.localeCompare(b.slug));
  cache = skills;
  return skills;
}

export function skillsBySlug(): Map<string, Skill> {
  return new Map(loadAllSkills().map((s) => [s.slug, s]));
}

/** Test helper */
export function clearSkillsCache() {
  cache = null;
}
