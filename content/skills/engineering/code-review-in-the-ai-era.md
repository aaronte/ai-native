---
title: Code review in the AI era
discipline: engineering
summary: How to review pull requests when much of the code is AI-generated—depth, ownership, automated checks, and smells to catch early.
keywords:
  - code review
  - pull request
  - AI-generated code
  - quality
  - security
  - ownership
---

AI-authored PRs are **faster to produce and easier to rubber-stamp**. Your review bar must go **up**, not down. Default to reviewing **behavior, data flow, and failure modes**, not line-by-line style—that’s what linters are for.

**Depth**: Classify PRs: *mechanical* (rename, move), *bounded* (single module), *systemic* (auth, billing, migrations). Systemic reviews need **two reviewers** or a senior mandatory pass. For bounded PRs, time-box review but still run the app path locally once.

**Automated gates**: Enforce **tests for behavioral change**, not only coverage numbers. Add **secret scanning** and dependency license checks if you don’t have them. AI often introduces **verbose error handling** or **inconsistent logging**—standardize in CI via eslint rules or codegen templates.

**AI smells to flag**: duplicated logic across files “because it was faster,” **over-abstraction** without use cases, stale comments, **silent retries** on network calls, **broad try/catch** hiding bugs, and **permission checks** only on the client. Watch for **prompt injection adjacent** patterns—string-concatenating user content into shell commands or raw SQL in new code.

**Ownership**: The author must answer “**how do I roll this back?**” in the PR or thread. If they can’t, the change isn’t ready. Encourage **reviewer pairing** on unclear diffs instead of endless async comments.

**Culture**: Celebrate **surgical reviews** that catch one real bug, not nitpick counts. Publish **team examples** of good vs bad AI PRs quarterly. Review is how you keep **trust in shipping** as velocity rises.
