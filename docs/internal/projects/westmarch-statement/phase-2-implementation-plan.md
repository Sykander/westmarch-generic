# Phase 2 implementation plan

Phase 2 goal: make the generic engine safe for a real long-running server, with extracted reference westmarch data, parity tests, a usable editor workflow, and a release path that does not depend on chat history.

Phase 1 proved the runtime shape: MVP commands can run from server-owned config, large catalogues can live in config or extension gvars, and the full test suite can protect the command surface. Phase 2 should now focus on confidence, migration, and authoring ergonomics.

This plan is intentionally sliced so each step can merge with implementation, docs, editor validation, and tests together.

## Entry criteria

- Phase 1 MVP aliases and utility gvars are implemented.
- `make test` passes on a clean workspace.
- `docs/internal/projects/westmarch-statement/phase-1-implementation-plan.md` reflects shipped, skipped, and deferred work.
- `../westmarch` remains available as the reference behaviour and data source.

## Exit criteria

- A reference westmarch config can be generated or maintained without hard-coded server data in aliases.
- A parity suite covers the behaviours most likely to regress during migration.
- The web editor can load, validate, edit, and export the config surfaces needed by the MVP.
- Public setup docs explain the real server-owner workflow.
- A Development workshop release has been smoke-tested against a staging or real server config.

## Slice 1 - Phase 1 stabilization audit

**Status:** implemented. Baseline recorded in [phase-2-slice-1-stabilization-audit.md](phase-2-slice-1-stabilization-audit.md).

Lock in the current MVP surface before adding more behaviour:

- run and record a full `make test` baseline
- audit `avrae-ls --analyze` warnings and classify each as fix, suppress/document, or upstream/tooling limitation
- compare public command docs to current aliases for economy, content, misc, travel, and crafting
- verify `!westmarch setup` and `!westmarch show` mention the editor and current config surfaces
- add missing tests for known Phase 1 edge cases discovered during review

Acceptance:

- no known command docs describe behaviour that is no longer true
- analyzer warnings have an owner and disposition
- `make test` remains green

Review notes:

- Phase 1 showed that alias-level tests catch wiring issues better than helper-only tests. Add alias coverage for every user-facing behaviour change.
- Do not chase analyzer noise blindly; prioritize runtime failures, parser issues, and actual command regressions.

## Slice 2 - Reference westmarch data extraction

**Status:** planned.

Extract the real reference server data from `../westmarch` into owner-owned config and extension gvar bodies:

- locations and paths from `../westmarch/src/gvars/areas`
- biome registries and encounter pools from `../westmarch/src/gvars/encounters`
- monsters, items, magic items, potions, spells, and books from `../westmarch/src/gvars/utils`
- quest, library, recipe, and economy data where it exists in server-specific aliases or gvars
- asset references and attribution notes for public maps/images when they are referenced by config

Preferred outputs:

- a generated or reviewed preset under `src/gvars/configs/`
- separate extension gvar bodies for bulky data such as books, monsters, and biome encounter pools
- a manifest that records source files, generated output files, and target gvar slots

Acceptance:

- extracted data loads through the generic config and catalogue loaders
- no reference server names, area constants, or content tables are introduced into generic aliases
- generated outputs are reproducible from scripts or clearly marked as hand-maintained

Review notes:

- Use config and extension gvars as the migration target, not special-case runtime compatibility.
- If a data shape must change to carry reference data, update `data-shapes.md`, starter config, editor validation, and tests in the same slice.

## Slice 3 - Reference parity test harness

**Status:** planned.

Build tests that compare generic behaviour against the reference server where behaviour matters:

- port representative `../westmarch` alias tests into generic fixtures with extracted config
- add parity fixtures for `travel`, `enc`, `hunt`, `loot`, `job`, `library`, `read`, `quest`, and crafting lookups
- assert player-facing outcomes, mutation effects, and ambiguous/no-match handling rather than internal implementation details
- keep fixture data small enough to run quickly while still exercising real lookup shapes

Acceptance:

- parity tests run as part of `make test`
- every extracted reference subsystem has at least one no-match, one ambiguous-match, and one success test where lookup is user-entered
- failures point to either a generic engine regression or an intentional documented divergence

Review notes:

- Matching `../westmarch` means behaviour and style, not legacy cvar names or hard-coded constants.
- Prefer focused fixture slices over loading the entire real server data set in every test.

## Slice 4 - Editor model parity for MVP config

**Status:** planned.

Bring editor validation and the normalized model up to the runtime config shape:

- top-level `currencies`, `shops`, `command_config`, and extension gvar references
- `world_data.items`, `world_data.books`, `world_data.book_gvar_ids`, locations, paths, and biome registries
- subsystem command toggles and cross-subsystem dependencies for economy, content, misc, crafting, travel, and exploration
- validation for item/book/shop references where static checks are practical
- raw-only fallbacks for shapes the browser cannot safely parse or round-trip

Acceptance:

- starter config and extracted reference config pass editor checks
- invalid gvar ids, unknown subsystem keys, missing required world data, and invalid command policies produce structured issues
- editor tests cover every validation rule added in this slice

Review notes:

- The editor is the validation source of truth; `!westmarch show` should stay a summary, not a full validator.
- Browser validation should be deterministic and conservative. Runtime aliases still need friendly feature-specific failures.

## Slice 5 - Guided editor completion for MVP authoring

**Status:** planned.

Move the editor from mostly raw JSON support to a practical guided workflow:

- setup/load/paste/import flow with source state, config id, dirty state, and parse state
- guided controls for display, rules edition, subsystem toggles, command cooldowns, and player setup HUD fields
- guided world editors for locations, paths, default location, transport requirements, and biome gvar ids
- guided economy editors for currencies, shops, stock, buy/sell rules, prices, and job payout bands
- guided content editors for books, book gvar ids, topic policy, and read/library cooldowns
- guided misc editors for quest labels/categories and recipe source checks
- export for main config plus any extension gvar bodies

Acceptance:

- a server owner can create or edit the MVP config without touching raw source for common fields
- raw mode never silently discards unsupported source
- editor unit tests cover model transforms, validation focus paths, and export output

Review notes:

- Avoid a marketing-style editor surface; this is an operational tool for repeated scanning and editing.
- Prefer compact table/list controls over giant forms for shops, paths, and catalogue entries.

## Slice 6 - First-server release pass

**Status:** planned.

Run the skipped Phase 1 operational slice as a dedicated Phase 2 release pass:

- allocate any needed workshop UUIDs from `unused_gvars.md`
- run `make build` when sourcemaps or generated gvars change
- run full `make test`
- publish or update the Development workshop
- smoke test via a subscribed bot with a copied config gvar
- document smoke results, known gaps, and rollback steps
- update public setup docs and release notes

Acceptance:

- a staging or real Discord server can subscribe, set `westmarch_config`, run `!westmarch show`, and use representative MVP commands
- release notes identify config-breaking changes and migration requirements
- Development workshop and repo sourcemaps agree

Review notes:

- Keep release operations separate from feature work. A clean release pass is easier to debug than a feature merge that also publishes.
- Generated files come from `make build`; do not hand-edit generated env gvars or varfiles.

## Slice 7 - State migration and compatibility

**Status:** planned.

Make migration from the monolithic westmarch server survivable:

- document legacy `Westmarch_*` cvars and their generic `wg_*` equivalents
- provide one-time migration helpers or admin instructions for location, journey, downtime, quest, wallet, and stats cvars
- decide which legacy reads are worth supporting temporarily at runtime
- test that generic commands prefer `wg_*` state after migration

Acceptance:

- server owners have a clear migration path for active characters
- aliases do not permanently depend on legacy cvar names
- migration helpers are idempotent or clearly marked one-time

Review notes:

- Compatibility should reduce adoption risk without turning the generic engine back into a reference-server fork.
- Prefer explicit migration commands or docs over hidden dual-write behaviour unless the hidden path is tested and temporary.

## Slice 8 - Deferred runtime hardening

**Status:** planned.

Prioritize small, high-value deferrals from Phase 1:

- `time` and `weather` commands using `world_data.calendars`, regions, and current location
- travel cost and ration/item deduction policies
- finite shop stock ledgers if a real server needs depletion
- player-to-player wallet transfer only after wallet audit and permission rules are documented
- richer library inference signals beyond location only when the reference data justifies them

Acceptance:

- each hardening item has a config shape, docs, editor validation, and alias/gvar tests before it ships
- unsupported policy values fail visibly instead of silently doing nothing
- new write paths go through `pc.gvar` or another documented state module

Review notes:

- Do not let nice-to-have parity delay the first server release. Prefer one operationally necessary hardening item per merge.
- Time/weather complete the travel surface better than broad new subsystems.

## Slice 9 - Public docs and examples

**Status:** planned.

Turn internal implementation knowledge into server-owner guidance:

- update `docs/setup.md` with the Phase 2 editor workflow
- add reference config examples or links to generated presets
- document extension gvar strategy for large books, items, monsters, and biome pools
- document command-specific setup checks for economy, content, travel, exploration, crafting, and misc
- add troubleshooting for unset svar, invalid config, disabled subsystems, stale gvar ids, and Avrae permissions

Acceptance:

- a new owner can follow public docs without reading internal planning docs
- examples pass editor validation
- docs distinguish public workflow from maintainer-only release steps

Review notes:

- Keep owner docs procedural and short; keep implementation rationale in `docs/internal/`.
- Every public example should either be tested or copied from tested fixtures.

## Explicit deferrals

- Dungeon subsystem migration.
- Diary and journal hub commands.
- Nexus, brand, moon, star, void, and other reference-server community structure commands.
- Full Avrae API publishing from the browser editor, unless token/CORS behaviour is proven safe in a separate spike.
- Public ecosystem marketplace for third-party configs.

## Plan review

Initial Phase 2 wording in older docs was too narrow: "Extract reference westmarch data; parity tests for ported commands." That remains necessary, but Phase 1 exposed additional work that must be first-class:

- the editor can drift behind runtime config unless model parity is a planned slice
- extension gvars are not optional for real books, monsters, and encounter pools
- alias tests are the best guard for command wiring, while helper tests are best for data resolution
- release and smoke testing should be operational work, not bundled into feature slices
- migration from legacy cvars needs explicit treatment before a real server changes over

Improvements applied in this plan:

- split reference extraction from parity testing so data migration and behaviour confidence can move independently
- split editor validation/model parity from guided editor completion so tests can land before broad UI work
- moved the skipped Phase 1 release pass into its own Phase 2 slice
- added migration and public docs slices so adoption does not rely on maintainers remembering chat context
- kept post-MVP commands explicitly deferred to protect the first production release

## Testing rule

Every implementation slice should end with the narrow tests for the changed surface and then the full suite:

```bash
PATH=/home/sykander/.local/share/uv/tools/avrae-ls/bin:/home/sykander/.local/bin:/home/sykander/.nvm/versions/node/v24.16.0/bin:$PATH make test
```

If `uv` cannot write to `~/.cache/uv` inside the sandbox, rerun the same command with escalated permissions.
