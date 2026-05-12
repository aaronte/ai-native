---
title: Bringing skeptical engineers along
discipline: engineering
summary: Tactics for winning buy-in from senior ICs and managers—pilots, proof, and sunsetting old workflows without shame campaigns.
keywords:
  - change management
  - engineers
  - adoption
  - skeptics
  - pilot
  - culture
---

Skepticism is often **accurate risk assessment**, not Luddism. Lead with **specific problems AI solves for your team**—boilerplate, test scaffolding, migrations—not vague “10x” promises. Invite critics into **design of guardrails**; they’ll enforce what they helped shape.

**Pilot structure**: Pick one squad and one **non-critical codebase** slice. Define success from automated signals: **lead time**, **reopened bugs**, **reviewer load**, **test pass rate**, and lightweight developer pulse. Run **6–8 weeks**, then publish a Loom + AI summary of **wins and failures** with links to before/after artifacts. Kill pilots that only produce demos.

**Proof over rhetoric**: Publish **internal before/after** diffs with sensitive data stripped, plus AI-generated summaries of what changed and what stayed risky. Show **incident count pre/post** for the pilot area. Let skeptics **pick the next use case** to test—credibility beats slide decks.

**Skills and safety**: Pair AI adoption with **test baselines**, **feature flags**, and **clear rollback**. If quality drops, **slow the rollout** and fix prompts/reviews before expanding. Never use adoption % as the only KPI.

**Sunsetting old workflows**: Once the new path works, **remove duplicative manual steps** (e.g., obsolete templates and status docs now produced from PR/tracker data). Give **time back** in sprint planning; reinvest in architecture or debt. Acknowledge **learning curves**—junior-friendly doesn’t mean senior-hostile; offer **recorded office hours with AI summaries** led by peers, not only managers.

**Leadership behavior**: Executives **use the tools on real work** or delegate publicly to a staff engineer with air cover. Celebrate **quality wins** as much as speed wins. Trust compounds when skepticism is **met with data**, not slogans.
