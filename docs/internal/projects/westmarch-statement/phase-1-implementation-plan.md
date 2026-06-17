# Phase 1 implementation plan

Phase 1 goal from [solution-statement.md](solution-statement.md): one real community or staging server can run daily on the generic engine plus server-owned config with the full MVP command set.

This plan breaks Phase 1 into narrow, testable slices. Each slice should update implementation, config shape/docs, editor validation, and alias/gvar tests together.

## Slice 1 — Travel and location

**Status:** implemented; path costs, time/weather, and guided builders remain deferred.

Deliver the smallest useful travel subsystem:

- `locations.gvar`: config-backed lookup/display from `world_data.locations`
- `paths.gvar`: directed path helpers from `world_data.paths`
- `journeys.gvar`: `wg_location`, `wg_journey`, route planning, simple `next`
- `!location`: current/default location, optional journey summary
- `!travel`: current location, route preview, `track`, `next`, `reset yes`, `set <location> yes`
- Config/editor/docs/tests for `world_data.default_location`, `locations`, and `paths`

Explicit deferrals:

- automated gold/ration/item deductions
- time and weather commands
- guided editor builders for locations and paths

Review notes:

- Generic cvars use `wg_*`, not legacy `Westmarch_*`.
- The preferred config path shape is generic (`steps`, `requirements.transport`, `cost`), but runtime should accept westmarch shorthand (`encs`, `horse`, `boat`, `gold`) during migration.
- User-entered destinations must use shared 0 / 1 / many lookup behavior.
- Matching `!enc` results automatically complete the active journey encounter step.

## Slice 2 — Exploration cluster parity

**Status:** implemented; quest-specific overlays remain deferred until **misc.quest**.

Complete Tier B around the already-shipped encounter pipeline:

- verify `enc`, `forage`, `fish`, `mine`, `lumber` against extracted biome fixtures
- add any missing command-specific display/cooldown docs
- wire location-mode exploration to the travel slice
- keep journey encounter auto-completion covered while expanding activity parity
- cover explicit activity-specific journey steps such as `!forage forest`

Review notes:

- Exploration should not depend on hard-coded biome constants.
- `auto` biome mode must stay safe when travel is incomplete.

## Slice 3 — Hunt and loot

Port the combat/loot loop:

- monster catalogue lookup through config/catalogue gvars
- `hunt` and `loot` command behavior parity
- monster art/DC display config already sketched under `subsystems.exploration.config`
- focused tests for lookup, no-match, ambiguous-match, and disabled config

Review notes:

- Loot tables are likely large; watch gvar size boundaries before committing to inline config.
- Combat output should remain generic and not name a reference server.

## Slice 4 — Downtime foundation

Port `downtime` as the character workday ledger:

- cvar model and display
- policy handling for manual vs tracked downtime
- docs/editor checks for crafting dependencies
- tests for read/update/reset flows

Review notes:

- Keep downtime independent enough that crafting can consume it later without forcing all servers into tracked mode.

## Slice 5 — Crafting cluster

Port `craft`, `brew`, `scribe`, `enchant`:

- shared crafting helper gvar
- item, potion, spell, magic item catalogue config
- recipe lookup behavior via `lists.search_list`
- downtime/workday policy integration
- command docs and editor validation for required catalogues

Review notes:

- Rules edition becomes more visible here; use `config.get_rules_edition()` rather than direct config reads.

## Slice 6 — Economy

Port `job`, then add generic `wallet`, `buy`, and `sell`:

- job payout tables and cooldowns
- owner-defined currencies in `currencies`
- shop config and location gates
- coinpurse/wallet mutation helpers
- tests for purchase/sale failures and successful mutations

Review notes:

- Avrae gp and owner-defined currencies are separate systems.
- Location gates should use the travel slice when enabled, but shops need a clear fallback when travel is disabled.

## Slice 7 — Content

Port `library` and `read`:

- book catalogue lookup
- topic source config (`manual`, `restricted`, `inferred`, `balanced`)
- location topic inference where travel is available
- read cooldown policy
- tests for title/author search and topic validation

Review notes:

- Location encounter gvars may eventually supplement library scenes, but the MVP can stay catalogue-only.

## Slice 8 — Misc utilities

Build `quest` and `recipe`:

- quest log cvar model and config labels/categories
- recipe search across crafting catalogues
- tests for player-owned notes and lookup behavior

Review notes:

- `diary` and `journal` remain post-MVP; do not let misc become a second hub in Phase 1.

## Slice 9 — First-server release pass

Prepare Phase 1 for a staging or real server:

- run full `make test`
- publish/update Development workshop
- smoke test via subscribed bot with copied config gvar
- update public setup docs and release notes
- capture migration gaps against `../westmarch`

## Plan review

This breakdown makes sense for incremental delivery because it follows dependency order: travel/location state first, exploration integration next, then systems that consume character/world state.

Assumptions to keep checking:

- A single master `westmarch_config` gvar remains viable through Phase 1. Large catalogues may force extension gvars earlier than planned.
- The first server can tolerate generic `wg_*` cvars, or will run a one-time migration from `Westmarch_*`.
- Time/weather are not blockers for a usable travel/location slice.
- Editor raw JSON fields are acceptable for the first travel slice; guided location/path builders can come later.
- Parity with `../westmarch` means player-facing behavior and route semantics, not identical internal cvar names or server-specific area data.
