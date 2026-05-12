---
title: AI-native developer workflow
discipline: engineering
summary: Daily working pattern with AI coding assistants—planning, implementation, review, and merge habits that keep velocity high without eroding ownership.
keywords:
  - developer workflow
  - Cursor
  - Claude Code
  - Copilot
  - planning
  - pull request
  - code review
  - AI coding
---

Treat AI as a **pair programmer with no memory of yesterday**. Your job is to supply context, enforce boundaries, and own outcomes. Start each day (or each feature) with a **short intent doc**: what you’re building, constraints, files touched, and definition of done. Feed that into your agent before you ask for code—don’t expect it to infer product goals from vibes.

**Planning**: Break work into **reviewable slices** (half-day to one day). Ask the agent to outline a plan first; you approve or edit before it writes large diffs. For refactors, insist on **incremental PRs** with mechanical commits so history stays bisectable.

**Implementation**: Use a **single “driver” model** per repo area—don’t mix five tools on the same module without standards. Prefer **explicit filenames and symbols** in prompts (“edit `lib/auth/session.ts` only”). Run tests and typecheck **after every meaningful chunk**, not only at the end; agents will happily stack errors.

**Review**: Require **human-readable PR descriptions** that state what the AI did and what you verified. Use automated gates (lint, test, security scan) as non-negotiable. For AI-heavy diffs, add a “**risk notes**” section: side effects, data migrations, rollback. Treat generated comments and docs as untrusted—delete noise.

**Ownership**: The merging engineer owns production behavior. If the agent suggested it, you still **explain it in standup** and **document edge cases**. Rotate tricky reviews to senior ICs so juniors don’t become prompt-only merge buttons.

**Cadence**: End each sprint with a **15-minute workflow retro**: what prompt patterns worked, which files are now “agent-hostile,” and one process tweak. Operational excellence here is **discipline + small batch size**, not more tools.
