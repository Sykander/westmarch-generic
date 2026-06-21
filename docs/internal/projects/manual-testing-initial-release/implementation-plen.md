# Implementation Plen

Source docs:

- `commands-test.md`
- `commands-investigation.md`
- `editor-test.md`
- `editor-investigation.md`
- `ai-exploratory-test.md`
- `ai-exploratory-investigation.md`

This document is a planning artifact only. It proposes how to address the issues found during manual and exploratory testing. No implementation work or test runs are part of this document.

## Guiding Decisions

The initial-release fixes should prefer:

- improving truthful UX over adding large unfinished systems;
- preserving the documented config model unless a schema migration is deliberately chosen;
- adding editor validation where runtime behavior is not yet implemented;
- sharing diagnostics in helpers instead of duplicating command-specific copy;
- covering changes through focused `.alias-test`, `.gvar-test`, editor validation tests, and manual release checks.

Positive notes from the test docs do not need implementation changes:

- `job` seemed fine.
- Journey progression messages like `Journey step completed.` and `Arrived in Oakwood.` should be preserved.

## Proposed Fixes

### 1. Alias Help Docs Still Contain Placeholder Text

Observed issue: `!help enc -here` shows placeholder copy such as `Example help doc for the !enc command.` The investigation found the same broad problem across many sourcemapped `.md` alias help files.

Recommended change: replace placeholder alias docs with short, player-facing help. Use a shared content pattern:

- one-line purpose;
- usage;
- important arguments;
- setup/config location;
- one or two examples only when the examples actually work;
- for runtime-aware commands, point to the command's runtime help, for example `!enc help`.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Update only `src/aliases/exploration/enc.md` | Fastest; fixes the observed failing manual check. | Leaves the same broken experience in other commands and creates inconsistent help quality. |
| Update every placeholder `.md` file in one pass | Gives a consistent first-release help surface; matches the manual test note. | Larger review surface; each example needs to be checked against real command behavior. |
| Generate `.md` help from runtime help functions | Reduces future drift between `!help` and command help. | More tooling work; runtime help can be server-aware while sourcemapped docs are static, so generation would still need careful static fallbacks. |

Decision: do a repository-wide placeholder help pass now, but keep it content-only. Defer automatic generation until the command docs are stable enough to standardize.

Testing plan:

- Add or update sourcemap/documentation checks if available for placeholder text.
- Manually inspect `!help enc -here` and a representative help command from each subsystem after build.
- Confirm examples in `craft`, `brew`, `enchant`, and `scribe` match the command catalogues.

### 2. Missing Encounter Text Loses Location Context

Observed issue: when a biome is inferred from a character's location, missing encounter output says only `No encounters configured for forest / mine on this server.` The desired output includes the location, for example `No encounters configured for River Town / forest / mine on this server.`

Recommended change: add a richer biome resolver result that keeps:

- resolved biome code;
- source mode, such as manual argument or inferred location;
- location id/name when inferred;
- error text.

Use that context in `exploration.run_activity` when building missing-pool messages. Keep the current text when the player manually supplied a biome.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Add a second resolver, for example `resolve_biome_context` | Low-risk compatibility; existing callers can migrate gradually. | Temporarily leaves two resolver APIs. |
| Change `resolve_biome` to return richer data | Cleaner final API; no duplicated resolver entry point. | Higher blast radius because every caller must be audited at once. |
| Re-resolve the location inside exploration after a missing pool | Small local change. | Duplicates lookup logic and can disagree with the resolver that picked the biome. |

Decision: add a richer resolver and migrate exploration activity calls to it. Keep any existing simple resolver as a compatibility wrapper.

Testing plan:

- Add `.alias-test` coverage for manual biome missing pool output.
- Add `.alias-test` coverage for location-inferred biome missing pool output.
- Cover shared activity commands that use `exploration.run_activity`: `enc`, `forage`, `fish`, `mine`, and `lumber`.

### 3. Time And Weather Are Exposed Before Implementation

Observed issue: `time` and `weather` are visible in command toggles, auth mappings, help docs, and HUD fields, but the aliases and utility modules are placeholders.

Recommended change for initial release:

- mark `time` and `weather` as planned/unavailable in the editor;
- make enabling either command a validation error, not just a warning;
- keep runtime aliases, but return a useful planned-feature/setup message instead of bare `not implemented`;
- remove or rewrite placeholder help docs as honest planned-feature docs;
- suppress HUD time/weather fields unless there is implemented/configured display data.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Hide `time` and `weather` entirely | Prevents accidental enablement. | Owners cannot see that the feature exists in the roadmap; may make config imports confusing if fields already exist. |
| Keep controls but mark as planned and block enablement | Transparent; protects players from stub commands. | Requires editor metadata and validation rules. |
| Implement full clock/weather now | Delivers the intended feature. | Much larger scope than an initial-release bug fix; needs design, state model, tests, docs, and migration. |

Decision: mark as planned and block enablement for now. Implement full clock/weather later as its own feature slice.

Testing plan:

- Editor validation should fail when `time` or `weather` is enabled.
- Runtime invocation should show planned-feature copy.
- HUD should not display `Time: manual`.
- Add alias tests for stub copy if the aliases remain callable.

### 4. Economy Setup Is Hard To Discover And Buy/Sell Errors Are Too Generic

Observed issues:

- `!buy Dagger` reports `Found no shop stock matches for Dagger.` with no setup hint.
- `!sell` has a similar missing-setup problem.
- The editor exposes economy toggles but has no guided `shops` or `currencies` editor.
- `!wallet` says `No owner-defined wallet currencies are configured. Avrae gp remains on your sheet coinpurse.`

Recommended change:

- Add shared shop diagnostics in the shop helper layer:
  - no shops configured;
  - shops configured, but none visible at this location;
  - shops visible here, but no stock;
  - stock exists, but no query match;
  - sell enabled, but no shop accepts sells;
  - explicit shop exists, but does not buy/sell as requested.
- Reuse those diagnostics in `buy` and `sell`.
- Add editor guided setup for `currencies` and `shops`.
- Add editor validation:
  - `wallet` enabled with no `currencies`;
  - `buy`/`sell` enabled with no `shops`;
  - `sell` enabled but no shop has `accepts_sells: True`;
  - stock entries missing item/price shape.
- Change wallet empty text to `No wallet currencies configured.`

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Only change command error text | Fast; improves player-facing confusion. | Owners can still enable broken economy setups in the editor. |
| Only add editor validation | Prevents new bad configs. | Existing bad configs still produce confusing runtime failures. |
| Add guided editor plus shared runtime diagnostics | Fixes both setup and player-facing failure modes; gives one diagnostic model for future shop commands. | Largest slice; needs editor, runtime, docs, and tests. |

Decision: implement shared runtime diagnostics and editor validation together. Guided editors can be implemented as a follow-up in the same economy slice if time allows; validation is the release blocker.

Testing plan:

- Alias tests for buy with no shops, no local shop, empty local stock, and no matching item.
- Alias tests for sell with no accepting shops and explicit shop that does not buy.
- Alias test for wallet empty-state copy.
- Editor validation tests for missing economy setup.
- Manual editor check that owners can discover the required `shops` and `currencies` data.

### 5. Quest Setup Is Not Discoverable Enough

Observed note: quest behavior looked good, but the tester did not know how to try it because quest encounters were not configured.

Recommended change: treat this as a setup/documentation gap rather than a runtime defect.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Add docs only | Low risk; helps testers and owners. | Still leaves setup discovery outside the editor. |
| Add editor validation/setup hints for quest encounter dependencies | Helps owners at the point of configuration. | Requires knowing the intended quest encounter data shape and dependency rules. |
| Add starter example quest data | Makes the feature easy to try. | Starter configs can become noisy or accidentally opinionated. |

Decision: add a small quest setup example to docs and editor help/validation text if a quest command is enabled without required encounter data. Avoid adding default active quest data unless the starter config already has a clear example-only pattern.

Testing plan:

- Manual review of quest setup docs.
- Editor validation check for enabled quest commands without required quest encounter data, if the dependency can be reliably detected.

### 6. Travel Route Rendering Can Output `Run !enc `

Observed issue: path display renders encounter steps as `Run !enc ` when a step has no biome.

Recommended change:

- Make path/journey display omit the trailing biome argument when empty.
- Add runtime setup warning for incomplete encounter steps when location-inferred exploration is not configured.
- Add validation for `world_data.paths.*.steps.*` so empty or malformed encounter steps are caught.
- Update the editor path builder so empty steps can exist as drafts but cannot pass validation/export unnoticed.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Display `Run !enc` when biome is empty | Minimal runtime fix; works for location-inferred exploration. | Can hide bad route data when manual biome mode is required. |
| Require biome on every encounter step | Strong data quality; simple display logic. | Does not support servers that intentionally infer biome from location. |
| Make validation conditional on exploration biome source | Matches real behavior. | Requires editor validation to understand cross-subsystem config. |

Decision: use conditional validation and robust rendering. `Run !enc` is valid only when location inference can supply the biome; otherwise warn in validation and route output.

Testing plan:

- `.gvar-test` or alias coverage for path display with no biome under inferred mode.
- Coverage for manual mode showing a setup warning or validation issue.
- Editor validation for empty encounter steps.
- Manual `!travel` route preview and tracked journey display checks.

### 7. Travel Steps Need Transport Icons And Config

Observed issue: route steps do not show transport mode icons, and the desired defaults are walk, fly, horse, and boat with editor controls for customization.

Recommended change:

- Add transport display config under the travel subsystem, for example `subsystems.travel.config.transport_icons`.
- Provide defaults for `walk`, `fly`, `horse`, and `boat`.
- Render transport icons in shared path/journey display helpers so route preview and active journeys stay consistent.
- Add editor controls using a compact default picker.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Hard-code transport icons in display helpers | Fast and consistent. | Not configurable; conflicts with the requested editor customization. |
| Store icons under `world_data.transport` | Keeps transport data near world/path concepts. | More world-data shape changes; may mix display settings with route data. |
| Store display icons under `subsystems.travel.config` | Matches subsystem behavior/display config; easier editor placement. | If transport has future mechanical rules, those may need a separate world-data model. |

Decision: use `subsystems.travel.config.transport_icons` for display. Keep mechanical transport requirements separate from display symbols.

Testing plan:

- Unit/gvar coverage for display helper output by transport mode.
- Editor validation for missing/empty transport icon values.
- Manual route preview and active journey display with walk, fly, horse, and boat steps.

### 8. `scribe` Needs An Ignore Flag For Spell Knowledge And Slot Checks

Observed issue: a character with a feature-granted spell but no spell slots can fail scribing with `No level 2 spell slots available.` The requested behavior is a `-i` flag similar to Avrae casting.

Recommended change:

- Parse `-i` for `scribe`.
- When present, bypass known-spell checks and spell-slot checks/deduction only.
- Do not bypass gold, downtime, materials, tool checks, or crafting checks.
- Change slot failure copy to `No level 2 spell slots available. Use -i to bypass this check.`
- Add success output text stating that ignore mode was used.
- Update runtime help and `.md` help.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| `-i` bypasses only slot checks | Narrowly fixes the observed failure. | Still blocks feature spells not visible to Avrae as known spells. |
| `-i` bypasses known-spell and slot checks | Matches the stated use case and Avrae cast expectations. | Needs clear audit text so staff know checks were bypassed. |
| Add separate flags for known spell and slot checks | More precise. | More complex UX for a rare case; diverges from familiar `-i` behavior. |

Decision: make `-i` bypass only known-spell and spell-slot checks, with explicit output audit text.

Testing plan:

- Alias tests for scribe failure without slots showing the new hint.
- Alias tests for `scribe -i` success path bypassing known-spell/slot checks.
- Tests confirming `-i` does not bypass gold, materials, downtime, tool, or crafting checks.

### 9. Crafting Help Examples Are Assigned To The Wrong Commands

Observed issue: `craft` help shows magic-item examples like `Potion of Healing` and `Cloak of Protection`, but those belong to `brew` and `enchant`.

Recommended change:

- Give `craft`, `brew`, `enchant`, and `scribe` separate example blocks in `crafting.help_text`.
- Ensure examples match the intended catalogue split:
  - `craft`: mundane physical items, objects, vehicles, tools, or similar configured mundane entries;
  - `brew`: potions, tonics, poisons, and similar consumables;
  - `enchant`: magic items created through enchanting;
  - `scribe`: spell scrolls.
- Update `.md` help to match runtime help.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Remove examples entirely | Avoids wrong examples. | Makes help less useful for new players. |
| Keep one generic example block but choose universal examples | Smaller change. | The commands do not share one catalogue, so universal examples are likely misleading. |
| Use command-specific examples | Accurate and clear. | Needs maintenance when catalogues change. |

Decision: use command-specific examples and keep them conservative.

Testing plan:

- Alias tests for runtime help output per crafting command.
- Manual check that each example resolves in the relevant configured catalogue or is clearly described as an example requiring config.

### 10. Policies Tab Contains Subsystem Configuration

Observed issue: the editor Policies tab includes or duplicates many controls that already write to `subsystems.*.config` or `subsystems.*.command_config`.

Recommended change:

- Move controls already stored under subsystem config into the corresponding guided subsystem editor.
- Remove duplicates from Policies.
- Keep true table-wide enforcement policies under Policies, but group/cross-link them near the relevant subsystem workflow where helpful.
- Rename labels where broad policies are currently presented as crafting-only or subsystem-only controls.
- Update validation issue sections and `westmarch show` summaries so subsystem config is not reported as `Policies`.

Fields to move out of Policies without schema migration:

- `subsystems.exploration.config.enc_biome_source`
- `subsystems.exploration.config.distribution`
- `subsystems.exploration.config.monster_images.*`
- `subsystems.exploration.config.show_check_dcs.*`
- `subsystems.crafting.config.rules_version`
- `subsystems.crafting.config.recipe_mode`
- `subsystems.crafting.config.require_known_spell`
- `subsystems.crafting.config.catalogues`
- `subsystems.crafting.config.checks`
- `subsystems.crafting.config.tool_policy`
- `subsystems.crafting.command_config`

Fields to keep as policies unless a deliberate migration is chosen:

- `subsystems.exploration.config.avoid_repeat_encounters`
- `subsystems.downtime.config.mode`
- `subsystems.downtime.config.acquisition`
- `subsystems.downtime.config.max_workdays`
- `subsystems.crafting.config.resources.*`
- broad inventory output defaults under `subsystems.crafting.config.item_handling.*`

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Move UI controls only, preserve schema | Low migration risk; aligns editor workflow with existing documented model. | Some users may still expect all related knobs to live in one JSON subtree. |
| Move data paths into subsystem config | Makes JSON paths match the tester's mental model for several fields. | Requires compatibility readers, starter/default updates, docs, tests, and migration guidance. |
| Leave UI as-is and improve labels | Smallest change. | Does not fix the main usability problem: Policies remains a mixed control surface. |

Decision: move UI controls without schema migration for initial release. Create explicit follow-up decisions for repeat encounters, downtime policy, crafting resources, and shared catalogue resources.

Testing plan:

- Editor regression test that moved controls still write the same config paths.
- Manual editor check that duplicated controls are gone.
- Validation issue section names match the current page/concept.
- `westmarch show` summaries do not describe subsystem config as policy where that is misleading.

### 11. Crafting Catalogue Sources Should Not Be Renamed As A Global Policy Yet

Observed issue: the manual test proposed renaming `Crafting catalogue sources` to `Catalogue resources` and keeping it under Policies because catalogues are used by multiple systems.

Recommended change: do not turn the existing crafting catalogue field into a global policy. Rename the label to `Crafting catalogues` and move it to crafting subsystem setup. Track a separate future design for truly shared catalogue resources.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Rename current field to `Catalogue resources` under Policies | Matches the manual note superficially. | Misrepresents the current implementation because economy/content/exploration do not share that field. |
| Keep current field but label it `Crafting catalogues` | Truthful and low-risk. | Does not solve broader catalogue discoverability yet. |
| Introduce a shared catalogue resource model now | Potentially cleaner long-term architecture. | High blast radius across crafting, economy, content, exploration, docs, editor, and tests. |

Decision: short-term label/path honesty. Defer shared catalogue resources to a dedicated design task.

Testing plan:

- Editor check that crafting catalogue changes still update `subsystems.crafting.config.catalogues`.
- Docs review to avoid implying this field controls all catalogue consumers.

### 12. Sidebar, Action Log, And Expanded Row Headers Need Sticky Behavior

Observed issues:

- Desktop left navigation and right action/log pane scroll out of frame.
- Open expandable row headers are not consistently sticky and can sit under the topbar.

Recommended change:

- Add shared CSS variables for topbar/sticky offsets.
- On desktop, make `.sidebar` and `.right-pane` sticky below the topbar with independent scrolling.
- Keep mobile stacked/static behavior.
- Apply sticky summary/header behavior to reusable expandable patterns.
- Add `scroll-margin-top` so focused/opened rows are not hidden under the sticky topbar.
- Ensure fixed action bars do not cover pane content.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Make only side panes sticky | Fixes the most visible desktop issue. | Expanded rows remain awkward in long forms. |
| Make only expanded headers sticky | Helps deep editing. | Navigation/action log still disappears. |
| Add a general sticky layout system | Consistent and reusable. | More CSS review across breakpoints. |

Decision: implement side-pane stickiness and reusable expanded-header stickiness together as one editor layout slice.

Testing plan:

- Manual desktop scroll test on Policies, Subsystems, World/Paths, and Check pages.
- Manual mobile-width test to confirm panes stack normally.
- Check that open row headers do not cover text or buttons.

### 13. Generic Cooldown Fields Are Shown For Commands That Do Not Use Cooldowns

Observed issue: the editor shows `command_config.<command>.cooldown_seconds` for every command, but runtime cooldown checks are only implemented by exploration activities, `job`, `library`, and `read`.

Recommended change:

- Add per-command editor metadata for implemented features, including `supportsCooldown`.
- Show cooldown fields only when supported.
- Add validation warnings/errors when raw config sets cooldowns for unsupported commands.
- Consider docs updates so `command_config` is not described as uniformly supported.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Hide unsupported cooldown fields | Prevents misleading guided edits. | Raw JSON can still contain no-op cooldown config unless validation catches it. |
| Implement cooldowns for all commands | Makes the UI truthful. | Some commands do not naturally need cooldowns; broad runtime changes risk side effects. |
| Keep fields visible but add warning text | Transparent. | Still invites owners to configure no-op values. |

Decision: use metadata to hide unsupported fields and validate unsupported raw config.

Testing plan:

- Editor component/regression test for cooldown field visibility by command.
- Validation test for unsupported cooldown values in raw config.
- Manual editor check for exploration commands, `job`, `library`, `read`, and unsupported commands.

### 14. `policies.auth.require_character = False` Has Ambiguous Semantics

Observed issue: auth preflight respects `require_character = False`, but many aliases call `character()` directly because they need character state.

Recommended change for initial release: clarify and rename/document the policy as an auth preflight requirement, not a guarantee that every command can run without a character. Longer term, audit commands for character-optional behavior where it actually makes sense.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Rename/document as auth preflight only | Low risk; matches current implementation. | Does not make more commands usable without a character. |
| Make the policy global and audit every alias | Stronger semantics. | Large behavior change; many commands need cvars, bags, coinpurse, cooldowns, or location. |
| Remove the policy | Avoids misleading config. | May break existing configs and removes a useful auth-level control. |

Decision: document and label the current semantics now. Open a later command-by-command audit for true characterless support.

Testing plan:

- Editor/docs review for policy label and help text.
- Alias tests for auth-level gating if existing coverage is available.
- Manual check that commands needing character state still produce clear command-specific messages.

### 15. Editor Starter Snippet Can Drift From Canonical Config

Observed issue: `STARTER_SNIPPET` in the editor is hand-maintained separately from `src/gvars/configs/starter.gvar`, `createBlankConfig`, and runtime defaults.

Recommended change:

- Prefer a single canonical starter source.
- For initial release, either generate/import the editor starter from `src/gvars/configs/starter.gvar`, or replace the raw starter snippet button with guided blank config creation plus export.
- Add a lightweight drift check if duplication must remain.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Keep duplication and manually update it | Fastest. | Drift will continue. |
| Generate editor starter from canonical `starter.gvar` | Keeps starter content aligned. | Requires build/import plumbing between Drac2 source and editor app. |
| Remove raw starter snippet from editor | Eliminates one duplicate source. | Users lose an easy full-example starting point unless docs fill the gap. |

Decision: prefer generated/imported canonical starter. If build complexity is too high for initial release, add a drift check and schedule generation after release.

Testing plan:

- Add a script/check comparing editor starter with canonical starter, if duplication remains.
- Manual editor import/export of starter config.
- Confirm `createBlankConfig` still produces a valid minimal config.

### 16. Reserved And Deferred Policy Flags Need Validation

Observed issue: several schema flags are reserved or deferred, but editor validation does not consistently warn when they are enabled.

Recommended change: add validation for deferred flags and dependency-sensitive options, including:

- `policies.travel.apply_path_costs`;
- `policies.travel.consume_rations`;
- inventory enforcement flags;
- combat scaling;
- quest self-assign dependencies;
- economy `starting_gold` and wallet cap completeness where relevant.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Warn only in docs | Low implementation cost. | Owners editing raw JSON may miss the warning. |
| Add editor warnings | Directly protects active config workflow. | Warnings can be ignored, so severe no-op flags may still look acceptable. |
| Add validation errors for all deferred flags | Prevents accidental reliance on unimplemented behavior. | Can block imported configs that intentionally reserve future values. |

Decision: use errors for features that produce visible broken/no-op player behavior when enabled, and warnings for passive reserved fields that do not affect current UX.

Testing plan:

- Editor validation tests for each deferred flag.
- Manual Check page review with raw JSON containing enabled deferred flags.
- Docs review so warning/error levels match documented support.

### 17. Process Docs Still Mention Retired `westmarch check`

Observed issue: contributor instructions still say config changes should update `westmarch check`, but the command is retired and points users to the web editor.

Recommended change:

- Update process docs to say config changes must update the web editor Check page and `westmarch show`.
- Search internal docs for stale `westmarch check` references.
- Do not reintroduce Discord-side validation unless it is deliberately designed as a new feature.

Alternatives:

| Option | Pros | Cons |
| --- | --- | --- |
| Update docs only | Corrects contributor workflow. | Does not add Discord-side validation. |
| Reintroduce `westmarch check` | Gives admins an in-Discord validation surface. | More runtime work and risk; duplicates editor validation. |
| Leave stale notes | No work. | Future contributors will update the wrong surface. |

Decision: update docs only for initial release.

Testing plan:

- `rg "westmarch check"` documentation audit.
- Manual review of updated contributor/config-change checklist.

## Implementation Slice Breakdown

### Slice 1: Editor Conceptual Cleanup Without Schema Migration

Goal: make the editor match the current config model before changing behavior.

Changes:

- Move subsystem config controls out of Policies.
- Remove duplicate controls for exploration and crafting.
- Keep true policies in Policies, but improve labels.
- Rename `Crafting catalogue sources` to `Crafting catalogues`.
- Rename broad inventory output controls so their global scope is clear.
- Update validation section names and `westmarch show` summaries where they mislabel subsystem config as policy.

Why first: this reduces confusion before adding more validation and setup UI.

Testing:

- Editor regression/manual test that moved controls write the same JSON paths.
- Manual navigation through Policies and Subsystems.
- No schema migration tests should be needed because storage paths remain unchanged.

### Slice 2: Editor Guardrails For Planned Or Unsupported Behavior

Goal: stop owners from enabling knobs that currently do nothing or produce stub UX.

Changes:

- Add command metadata for cooldown support.
- Hide unsupported cooldown fields.
- Validate unsupported raw cooldown config.
- Mark `time` and `weather` as planned/unavailable and block enablement.
- Add validation for deferred policy flags.
- Clarify `require_character` label/help as auth preflight behavior.

Why second: after page placement is fixed, validation can point to the right sections.

Testing:

- Editor validation tests for cooldowns, time/weather, deferred flags, and auth label/help snapshots if available.
- Manual Check page with deliberately invalid raw JSON.

### Slice 3: Economy Setup And Diagnostics

Goal: make buy/sell/wallet failures explain missing setup clearly.

Changes:

- Add shared shop diagnostic result types.
- Use setup-aware errors in `buy` and `sell`.
- Add `sell`-specific diagnostics for missing `accepts_sells`.
- Change wallet empty-state copy.
- Add editor validation for missing `currencies`, `shops`, sell support, and malformed stock.
- Add guided shop/currency editors if feasible in this slice; otherwise add clear setup hints and leave guided editors as the next economy task.

Testing:

- `.alias-test` cases for each shop diagnostic.
- Wallet empty-state test.
- Editor validation tests for economy setup.
- Manual buy/sell/wallet checks against empty, partial, and valid economy configs.

### Slice 4: Travel Path Completeness And Display

Goal: make travel output usable and route setup safer.

Changes:

- Render encounter commands without a trailing argument when biome is empty.
- Add conditional warnings for empty encounter steps when manual biome mode requires a biome.
- Validate path step completeness.
- Add `subsystems.travel.config.transport_icons` defaults.
- Render transport icons through shared path/journey helpers.
- Add editor transport icon controls.

Testing:

- Gvar/alias tests for path display in manual and inferred biome modes.
- Editor validation tests for incomplete path steps.
- Manual route preview and tracked journey display with each transport mode.

### Slice 5: Exploration Context And Help

Goal: make exploration failures and help text match player intent.

Changes:

- Add richer biome resolution context.
- Include location name in inferred-biome missing encounter messages.
- Keep manual-biome missing messages unchanged.
- Replace placeholder `enc` help.
- Begin the broader alias help placeholder pass.

Testing:

- `.alias-test` coverage for inferred versus manual biome missing-pool messages.
- Manual `!help enc -here` check.
- Search check for remaining placeholder help text.

### Slice 6: Crafting Runtime Help And `scribe -i`

Goal: fix incorrect crafting examples and support legitimate feature-spell scribing.

Changes:

- Add command-specific help examples for `craft`, `brew`, `enchant`, and `scribe`.
- Parse `-i` for `scribe`.
- Bypass only known-spell and slot checks when `-i` is present.
- Add bypass hint to slot failure text.
- Add audit text on successful ignored scribe output.
- Update `.md` help docs.

Testing:

- Alias tests for crafting help output.
- Alias tests for `scribe` failure hint.
- Alias tests for `scribe -i` bypass scope.
- Manual scribe checks with normal and ignore-mode flows.

### Slice 7: Editor Layout Polish

Goal: make long editor pages usable on desktop without hurting mobile layout.

Changes:

- Sticky desktop sidebar and action log with independent scroll.
- Shared sticky top offset CSS variable.
- Sticky expanded row headers for reusable details/summary patterns.
- `scroll-margin-top` for opened/focused rows.
- Check fixed action bar spacing.

Testing:

- Manual desktop scroll through long editor pages.
- Manual mobile-width layout check.
- Visual check for overlapping headers, buttons, and action bars.

### Slice 8: Starter Config Drift

Goal: reduce the chance that new editor-created configs differ from canonical starter/runtime shape.

Changes:

- Prefer importing/generating the editor starter from `src/gvars/configs/starter.gvar`.
- If that is too large for initial release, add a drift check and update the duplicated starter immediately.

Testing:

- Drift check if duplication remains.
- Manual editor starter import/export validation.
- Compare exported starter shape with runtime defaults for expected compatibility.

### Slice 9: Docs And Process Cleanup

Goal: make contributor and owner instructions match the actual validation surfaces.

Changes:

- Update process docs that mention retired `westmarch check`.
- Add or improve quest setup docs.
- Update docs for moved editor concepts, economy setup, travel transport icons, `scribe -i`, time/weather planned state, and deferred flags.

Testing:

- Documentation search for stale `westmarch check`.
- Manual docs review against the editor and runtime behavior.

### Slice 10: Final Release Verification Pass

Goal: prove the fixes work together before initial release.

Verification commands to run during implementation, not during this planning task:

- `make build` after sourcemap/runtime edits.
- `make test` for the full repo check.
- `make sourcemap-test` or the documented sourcemap checks when help/docs sourcemaps change.
- `avrae-ls --run-tests src` for Drac2 tests.
- Editor validation/build checks according to the editor package scripts.

Manual verification checklist:

- `!help enc -here` no longer shows placeholder text.
- `!enc` missing-pool output includes location only when biome was inferred.
- `time` and `weather` cannot be enabled as active implemented commands.
- `!buy`, `!sell`, and `!wallet` explain missing setup clearly.
- `!travel` never renders `Run !enc ` with a trailing blank argument.
- Travel route and journey displays show configured transport icons.
- `scribe` slot failure mentions `-i`; successful `scribe -i` output records the bypass.
- Crafting help examples match `craft`, `brew`, `enchant`, and `scribe`.
- Policies tab no longer acts as a mixed dumping ground for subsystem config.
- Sidebar/action log and expanded row headers behave correctly on long desktop pages.
- Editor Check page reports unsupported/deferred behavior clearly.
