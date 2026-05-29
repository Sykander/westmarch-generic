# westmarch-statement

Foundational planning documents for **westmarch-generic**: problem, users, solution, MVP scope, and a critical review of the set.

Previously named `initial-statement`; renamed to reflect that this is the **westmarch product/planning** bundle, not a one-time kickoff artifact.

| Doc | Shorthand | Purpose |
|-----|-----------|---------|
| [problem-statement.md](problem-statement.md) | **PS** | Why the project exists |
| [user-stories.md](user-stories.md) | **US** | Journeys and use cases by persona |
| [solution-statement.md](solution-statement.md) | **SS** | Architecture, options, implementation plan |
| [mvp-commands.md](mvp-commands.md) | **MVP** | Command scope, tiers, config surface |
| [review.md](review.md) | — | Critical review of the full set |

## Implementation docs *(by `SUBSYSTEMS` key)*

| Folder | Config key | Commands |
|--------|------------|----------|
| [exploration/](exploration/README.md) | `exploration` | enc, mine, lumber, forage, fish, hunt, loot |
| [travel/](travel/README.md) | `travel` | travel, location, time, weather |
| [downtime/](downtime/README.md) | `downtime` | downtime |
| [crafting/](crafting/README.md) | `crafting` | craft, brew, scribe, enchant |
| [economy/](economy/README.md) | `economy` | job, buy, sell |
| [content/](content/README.md) | `content` | library, read |
| [misc/](misc/README.md) | `misc` | quest, recipe |

**Read order for newcomers:** PS → US → SS → MVP → review.

**Implementers:** [exploration/enc.md](exploration/enc.md) (Phase 0) · [travel/travel.md](travel/travel.md) + [downtime/downtime.md](downtime/downtime.md) (Tier C/D) · [crafting/craft.md](crafting/craft.md) (Tier E) · [economy/job.md](economy/job.md) (Tier F) · [content/library.md](content/library.md) (Tier G) · [misc/quest.md](misc/quest.md) (Tier H).
