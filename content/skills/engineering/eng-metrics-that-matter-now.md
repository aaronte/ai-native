---
title: Engineering metrics that matter now
discipline: engineering
summary: Throughput, lead time, quality, and reliability signals when LLMs increase raw output—so leaders don’t mistake motion for progress.
keywords:
  - metrics
  - DORA
  - lead time
  - deployment frequency
  - change failure rate
  - engineering KPIs
---

Raw lines of code and “story points completed” **lie more than ever** when AI assists implementation. Shift emphasis to **outcome and flow metrics** that reflect customer value and sustainable pace.

**Flow**: Track **lead time for changes** (commit to production) and **deployment frequency**. If AI speeds coding but review or QA becomes the bottleneck, **visualize queue time** in your board and invest there—otherwise you’re hoarding WIP.

**Quality**: Monitor **change failure rate** and **mean time to restore**. Spikes often follow **large batch merges** or **under-tested generated code**. Add **canary releases** or feature flags before blaming “the model.”

**Throughput vs thrash**: Pair velocity with **rework rate**—PRs reopened, hotfixes within 48 hours, incidents tagged “recent change.” High velocity + high rework means **prompt or review debt**, not genius.

**Human load**: Measure **on-call interrupts**, **pager noise**, and **reviewer hours per engineer**. If seniors drown in reviews, your AI strategy is **extracting leverage from juniors without scaling senior judgment**.

**Learning**: Quarterly, correlate **business outcomes** (activation, revenue, NPS drivers) with shipped epics—not raw output. Publish a one-page **engineering scorecard** for execs: flow, quality, people sustainability. Metrics should **guide investments**, not punish individuals.
