---
title: Prototyping with AI
discipline: design
summary: When to use Figma plus v0 / Magic Patterns / code prototypes—and when to ship a prototype straight to engineering.
keywords:
  - prototyping
  - v0
  - Magic Patterns
  - Figma
  - code prototype
  - validation
---

Prototypes exist to **reduce uncertainty**, not to impress stakeholders. AI tools let you explore **interaction models** faster—use them after a **clear user job** is written, not instead of it.

**Choose the medium**: Use **Figma** for visual polish and stakeholder alignment; use **code prototypes** when you’re uncertain about **performance, accessibility, or data latency**. Generators excel at **standard components**; humans should own **novel physics** in UX.

**v0-class tools**: Ideal for **marketing pages and simple app shells**. Always **diff the output against your design system**—replace magic numbers with **tokens** before merge. Treat first pass as **scaffold**, not production.

**Validation**: Connect prototypes to **user tests** quickly—five sessions beat fifty internal opinions. Instrument **click paths** even on throwaway builds when learning is the goal.

**Handoff**: If code is “good enough,” **hand to eng early** with flags; polish in production when metrics justify it. If code is wrong for a11y or i18n, **no amount of prompting fixes ownership**—design stays accountable for **acceptance criteria**.

**Debt control**: Label experiments in analytics and **sunset prototypes** that graduate or die. AI makes disposable UI cheap—**disposability without discipline** clutters your app surface.
