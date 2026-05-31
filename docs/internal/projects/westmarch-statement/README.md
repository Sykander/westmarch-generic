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
| [data-shapes.md](data-shapes.md) | — | Reusable data shapes (encounter, location, path, **policies**, …) |
| [server-config.md](server-config.md) | — | How server config is stored, loaded, validated |

## Implementation docs

### Aliases *(by `subsystems` key)*

| Folder | Config key | Commands |
|--------|------------|----------|
| [aliases/exploration/](aliases/exploration/README.md) | `exploration` | enc, mine, lumber, forage, fish, hunt, loot |
| [aliases/travel/](aliases/travel/README.md) | `travel` | travel, location, time, weather |
| [aliases/downtime/](aliases/downtime/README.md) | `downtime` | downtime |
| [aliases/crafting/](aliases/crafting/README.md) | `crafting` | craft, brew, scribe, enchant |
| [aliases/economy/](aliases/economy/README.md) | `economy` | job, buy, sell, wallet |
| [aliases/content/](aliases/content/README.md) | `content` | library, read |
| [aliases/misc/](aliases/misc/README.md) | `misc` | quest, recipe *(MVP)*; diary, journal hub *(post-MVP)* |
| [aliases/admin/](aliases/admin/README.md) | *(not in config)* | westmarch (`setup`, `check`, `show`) — role-gated |

### Engine gvars

| Folder | Modules |
|--------|---------|
| [gvars/](gvars/README.md) | `config`, `check_config`, `auth`, `pc`, encounters, journeys, catalogues, … |
| [gvars/configs.md](gvars/configs.md) | Example server presets — FR, generic fantasy, Spelljammer (`src/gvars/configs/`) |

**Read order for newcomers:** PS → US → SS → MVP → review.

**Implementers:** [gvars/config.md](gvars/config.md) + [aliases/exploration/enc.md](aliases/exploration/enc.md) (Phase 0) · [aliases/admin/westmarch.md](aliases/admin/westmarch.md) (Phase 0) · [aliases/travel/travel.md](aliases/travel/travel.md) + [aliases/downtime/downtime.md](aliases/downtime/downtime.md) (Tier C/D) · [aliases/crafting/craft.md](aliases/crafting/craft.md) (Tier E) · [aliases/economy/job.md](aliases/economy/job.md) (Tier F) · [aliases/content/library.md](aliases/content/library.md) (Tier G) · [aliases/misc/quest.md](aliases/misc/quest.md) (Tier H).
