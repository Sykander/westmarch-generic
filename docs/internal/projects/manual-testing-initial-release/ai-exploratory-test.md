# AI Exploratory Test

This is an exploratory review of the current codebase for initial-release readiness. It is based on static code search and source inspection only.

No code changes and no test runs were performed.

## Finding 1: Generic Cooldown Fields Are Exposed For Commands That Do Not Use Cooldowns

Status: resolved for the current 1.0.0 release-candidate scope.

The guided editor now exposes cooldown controls only for commands with runtime cooldown support, and validation warns if raw config includes `cooldown_seconds` for unsupported commands.

The editor shows `command_config.<command>.cooldown_seconds` for every command in every subsystem. Runtime cooldown checks are only called by exploration activities, `job`, `library`, and `read`.

Risk: owners can configure cooldowns for `travel`, `location`, `downtime`, `craft`, `brew`, `enchant`, `scribe`, `buy`, `sell`, `wallet`, `quest`, or `recipe` and see no effect.

## Finding 2: Economy Setup Is Hard To Discover In The Editor

Status: partially resolved for the current 1.0.0 release-candidate scope.

Runtime shop diagnostics and editor validation now make missing shops, sell support, stock, currencies, and wallet caps visible. A fully guided shop/currency editor remains a post-`1.0.0` convenience.

Buy/sell require configured `shops` with stock rows, and wallet requires configured `currencies`. The editor exposes economy command toggles but does not provide guided shop/currency editors.

Risk: owners can enable economy commands and get lookup failures that look like player input problems rather than missing server data.

## Finding 3: Path Editor Can Export Empty Encounter Steps

Status: resolved for the current 1.0.0 release-candidate scope.

Path rendering no longer emits `Run !enc `, and editor validation checks incomplete encounter steps.

The path builder creates new encounter steps with `biome: ''`, and validation checks route endpoints but not encounter step completeness.

Risk: `!travel` can render route steps like `Run !enc ` or suggest unusable journey steps.

## Finding 4: `policies.auth.require_character = False` Does Not Fully Disable Character Requirements

`auth.is_allowed` respects `policies.auth.require_character`, but most alias bodies call `character()` again and return command-specific "requires a character" messages.

Risk: the policy appears configurable but cannot actually make many commands run without a selected character.

## Finding 5: Planned Time/Weather Features Leak Into Active UX

Status: resolved for the current 1.0.0 release-candidate scope.

`time` and `weather` are now implemented commands backed by calendar and weather config, with alias tests for the generic command behavior and the Forgotten Realms starter.

Original finding: `time` and `weather` were in subsystem toggles, auth mappings, help docs, and default HUD fields, but their aliases and backing modules were stubs/placeholders.

Risk: a server owner can enable them and players hit `not implemented`. If time is enabled in the HUD, fallback text may show `manual` rather than a useful in-world time.

## Finding 6: The Web Editor Starter Snippet Is Hand-Maintained And Can Drift

Status: resolved for the current 1.0.0 release-candidate scope.

The editor loads starter sources from the canonical config files, and tests assert that starter sources parse and match the canonical starter.

`STARTER_SNIPPET` in `editor/src/app/App.tsx` is separate from `src/gvars/configs/starter.gvar`, `createBlankConfig`, and `config.gvar` runtime defaults.

Risk: new configs started from the web editor can teach a different shape than the canonical starter and runtime defaults.

## Finding 7: Reserved/Deferred Policy Flags Have Uneven Validation

Status: resolved for the current 1.0.0 release-candidate scope.

Editor validation now warns for deferred travel, inventory, and combat policy flags, validates quest self-assign dependencies, and checks economy wallet cap shape.

The schema includes flags such as `policies.travel.apply_path_costs`, `policies.travel.consume_rations`, inventory enforcement, combat scaling, and quest self-assign. Some are documented as deferred or warn-worthy, but editor validation does not consistently warn when they are enabled in raw config.

Risk: owners can turn on a flag and believe behavior is enforced when the runtime does not use it yet.

## Finding 8: Process Docs Still Mention `westmarch check`, But The Command Is Retired

Status: resolved for the current 1.0.0 release-candidate scope.

Active repo instructions now point config validation at the web editor and `westmarch show`. Remaining `westmarch check` mentions are historical notes in this manual-testing project.

The repo instructions say config changes should update `westmarch check`, while `src/aliases/westmarch/westmarch.alias` treats `westmarch check` as retired and points users to the web editor.

Risk: future contributors may update the wrong surface or miss the actual validation surface.
