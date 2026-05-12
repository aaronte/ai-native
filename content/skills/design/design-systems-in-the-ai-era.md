---
title: Design systems for AI codegen
discipline: design
summary: How tokens, components, and documentation must evolve so AI tools generate on-system code instead of bespoke chaos.
keywords:
  - design system
  - design tokens
  - components
  - AI codegen
  - consistency
---

AI codegen **amplifies system coherence—or chaos**. If tokens and components aren’t **machine-readable** and **documented with examples**, models invent parallel styles.

**Tokens first**: Expose **semantic tokens** (color.bg.default, spacing.m) not only raw hex values. Publish **JSON or Style Dictionary** exports consumed by code. Document **do/don’t** pairs next to each token category.

**Components**: Each core component needs **anatomy, variants, props, accessibility notes, and code links**. Prefer **small composable primitives** over giant kitchen-sink widgets—models assemble better from **legos** than from monoliths.

**Docs as prompts**: Add **copy-paste prompts** for internal agents (“generate a primary button using `@acme/button`”). Keep **screenshots and code snippets** synchronized through docs automation; stale docs train **bad habits**.

**Governance**: Run **monthly system health reviews** from automated scans: unused components, conflicting patterns, a11y debt, and off-token codegen. Introduce **contribution rules** so AI-suggested new components go through **human review and naming** only after a bot checks reuse, tokens, accessibility, and examples.

**Measure**: Track **off-system patterns** in code search and design QA. Target **downward trend** quarter over quarter. The payoff is **faster, safer AI assist** across teams.
