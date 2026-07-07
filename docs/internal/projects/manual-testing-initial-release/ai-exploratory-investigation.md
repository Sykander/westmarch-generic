# AI Exploratory Investigation

Companion investigation for `ai-exploratory-test.md`.

No code changes and no test runs were performed.

## Finding 1: Generic Cooldown Fields Are Exposed For Commands That Do Not Use Cooldowns

Status: resolved for the current 1.0.0 release-candidate scope.

Resolution: `commandSupportsCooldown` defines the supported command set, guided editor cooldown fields are filtered to that set, and validation warns on unsupported raw cooldown config.

Evidence:

- `editor/src/app/App.tsx` renders cooldown fields for every `commandEntries` item in `SubsystemAdvancedEditor`.
- Runtime `pc.check_cooldown` calls appear only in:
  - `src/gvars/utils/exploration/exploration.gvar`
  - `src/aliases/economy/job.alias`
  - `src/aliases/content/library.alias`
  - `src/aliases/content/read.alias`
- `stats.add_log` is also only called by those cooldown-aware command paths.

What went wrong: the editor generalized command cooldown UI faster than runtime support was added.

Best fix:

- Add per-command metadata that says whether cooldown is implemented.
- Only show cooldown fields for commands that call `pc.check_cooldown` and log usage.
- Or implement cooldown checks/logging for the commands where cooldowns are intended.

Same issue may be present in:

- Setup/onboarding copy that says `command_config.<cmd>.cooldown_seconds` is generally supported.
- `editor/src/lib/config.ts` validation, which validates cooldown fields for some subsystems without proving runtime support.

## Finding 2: Economy Setup Is Hard To Discover In The Editor

Status: partially resolved for the current 1.0.0 release-candidate scope.

Resolution: runtime shop diagnostics and editor validation now cover missing shops/currencies and malformed stock. A fully guided shop/currency editor remains a future usability improvement.

Evidence:

- `shops.gvar` reads top-level `shops` or `world_data.shops`.
- `wallet.alias` reads top-level `currencies`.
- `src/gvars/configs/starter.gvar` documents both as commented raw examples.
- The editor has economy command toggles but no guided `shops` or `currencies` editor.

What went wrong: the editor can enable economy behavior without guiding the required data setup.

Best fix:

- Add guided editors for `currencies` and `shops`.
- Add validation warnings/errors:
  - `wallet` enabled with no `currencies`.
  - `buy`/`sell` enabled with no `shops`.
  - `sell` enabled but no shop has `accepts_sells: True`.
  - shop stock entries missing item/price.
- Improve buy/sell runtime errors to point at missing shop setup.

Same issue may be present in:

- `server-config.md` and starter examples, which are accurate but not discoverable inside the guided editor workflow.
- `westmarch show`, which counts currencies but does not guide missing shop/currency setup.

## Finding 3: Path Editor Can Export Empty Encounter Steps

Status: resolved for the current 1.0.0 release-candidate scope.

Resolution: path display handles blank biome values without malformed commands, and validation reports incomplete encounter steps when location inference is not configured.

Evidence:

- `PathBuilder` creates new paths with `steps: [{ type: 'encounter', biome: '' }]`.
- `PathFields` adds new steps with `{ type: 'encounter', biome: '' }`.
- `validateTravel` checks path endpoint shape but does not inspect step type, biome, activity, or cost/proceed contents.
- `paths.gvar` renders encounter steps with `Run `{prefix}{activity} {biome}``.

What went wrong: the editor uses empty encounter steps as drafts, but export/validation does not force them to be completed before runtime display.

Best fix:

- Keep empty draft values in local component state, but prevent export or warn in Check until the step is complete.
- Validate `world_data.paths.*.steps.*`.
- Make runtime display robust against missing biome by omitting the extra space and showing a setup warning when needed.

Same issue may be present in:

- Any raw JSON path edits, because validation is the only safety net.
- Tracked journey display, because it uses the same path display helpers.

## Finding 4: `policies.auth.require_character = False` Does Not Fully Disable Character Requirements

Evidence:

- `auth.gvar` skips the auth-level character gate when `policies.auth.require_character` is not true.
- Many aliases then call `character()` directly after auth, including exploration, crafting, economy, content, travel, downtime, quest, and recipe commands.
- Some commands genuinely need a character for cvars, bags, coinpurse, cooldowns, or location.

What went wrong: the policy name implies a global behavior switch, but aliases still enforce their own character requirement.

Best fix:

- Decide whether the policy means "skip auth preflight only" or "commands should be usable without a character when possible".
- If it is auth-only, rename/document it to avoid implying more.
- If it is global, audit aliases and only require `character()` at the point where character state is truly needed.

Same issue may be present in:

- Docs that describe `policies.auth.require_character` as "Must player have a character selected?"
- Editor help for auth/player setup if added later.

## Finding 5: Planned Time/Weather Features Leak Into Active UX

Status: resolved for the current 1.0.0 release-candidate scope.

Resolution: `time` and `weather` are implemented as config-backed travel commands. The release surface now treats them as active command toggles, with editor validation for required calendar/weather data.

Original evidence:

- `auth.gvar` maps `time` and `weather` as travel commands.
- `editor/src/lib/config.ts` includes both in default travel commands and warns when enabled.
- `time.alias` and `weather.alias` are stubs.
- `clock.gvar` and `weather.gvar` are placeholders.
- `westmarch.alias` default HUD fields include `time` and `weather`; time can fall back to the policy mode string.

What went wrong: planned features were represented as normal command toggles.

Implemented fix:

- Implement time/weather as config-backed commands.
- Validate the required calendar/weather data when owners enable those toggles.

Same issue may be present in:

- Setup docs and starter comments that describe world clock/weather future behavior.
- `westmarch show`, which can summarize policy modes that are not backed by implemented commands.

## Finding 6: The Web Editor Starter Snippet Is Hand-Maintained And Can Drift

Status: resolved for the current 1.0.0 release-candidate scope.

Resolution: editor starter sources are imported from config source files and covered by parser/drift tests.

Evidence:

- `STARTER_SNIPPET` lives directly in `editor/src/app/App.tsx`.
- Canonical starter config lives in `src/gvars/configs/starter.gvar`.
- Runtime defaults live in `src/gvars/utils/config/config.gvar`.
- Guided blank config defaults live in `editor/src/lib/config.ts`.

What went wrong: there are four sources that can teach or generate the initial config shape.

Best fix:

- Prefer one canonical starter source.
- Generate the editor starter from `src/gvars/configs/starter.gvar`, or replace the raw starter button with `createBlankConfig` plus guided export.
- Add a lightweight drift check in future CI if the starter must stay duplicated.

Same issue may be present in:

- Setup alias onboarding text if it embeds a compact starter independently.
- Docs snippets in `server-config.md`.

## Finding 7: Reserved/Deferred Policy Flags Have Uneven Validation

Status: resolved for the current 1.0.0 release-candidate scope.

Resolution: editor validation warns for deferred policy flags and checks dependency-sensitive options such as quest self-assign and wallet caps.

Evidence:

- `config.gvar` and `starter.gvar` define reserved/deferred policy fields.
- `data-shapes.md` says validation should warn for several deferred flags, including travel cost/ration enforcement, inventory enforcement, combat scaling, and quest self-assign dependencies.
- `editor/src/lib/config.ts` does not currently search for many of those fields in validation.

What went wrong: the schema reserved future knobs before all validation guardrails were added.

Best fix:

- Add validation for reserved flags:
  - warn when `apply_path_costs` or `consume_rations` are true until enforcement lands;
  - warn/error for inventory enforcement flags until implemented;
  - warn when combat scaling is enabled;
  - validate quest self-assign dependencies;
  - validate economy `starting_gold` and wallet cap completeness.
- Keep raw JSON owners from believing reserved flags are active.

Same issue may be present in:

- `westmarch show`, which summarizes loaded config but does not validate it.
- Starter comments that mention future behavior without an editor warning.

## Finding 8: Process Docs Still Mention `westmarch check`, But The Command Is Retired

Status: resolved for the current 1.0.0 release-candidate scope.

Resolution: active repo instructions now point config validation at the web editor and `westmarch show`. Remaining mentions are historical notes in this manual-testing project.

Evidence:

- Repo instructions say config changes should update admin-facing config commands, especially `westmarch check` and `westmarch show`.
- `src/aliases/westmarch/westmarch.alias` treats `westmarch check` as retired and directs users to the web editor for validation.
- The editor Check page is now the active validation surface.

What went wrong: process docs were not updated after retiring the Discord-side check command.

Best fix:

- Update repo contributor instructions to say config changes must update the web editor Check page and `westmarch show`.
- If Discord-side validation is desired again, reintroduce it deliberately rather than leaving stale references.

Same issue may be present in:

- Internal docs that refer to `westmarch check`.
- Future task checklists copied from old repo conventions.
