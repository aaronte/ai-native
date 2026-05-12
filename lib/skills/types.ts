export type Discipline = "engineering" | "product" | "design" | "cross";

export type Skill = {
  slug: string;
  discipline: Discipline;
  title: string;
  summary: string;
  keywords: string[];
  /** Markdown body without frontmatter */
  body: string;
};
