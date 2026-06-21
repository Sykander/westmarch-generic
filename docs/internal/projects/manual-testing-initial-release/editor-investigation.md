# Editor Investigation

Source: `editor-test.md`, based on manual testing against config `5fd499a7-c865-43d2-941c-d32ee7975fb3` and local `make editor` inspection.

No code or test runs were performed for this investigation.

## Issue 1: Policies Tab Contains Subsystem Configuration

The broad problem is real: `PoliciesView` in `editor/src/app/App.tsx` has become a mixed control surface for table-wide policy, subsystem wiring, crafting setup, inventory output, display, player setup, and exploration presentation. That makes the page hard to reason about and makes some fields look like they are stored under `policies` even when they already write to `subsystems.*.config`.

The existing model in `docs/internal/projects/westmarch-statement/data-shapes.md` says:

- `policies` = table-wide enforcement modes.
- `subsystems.*.config` = subsystem wiring and behavior.
- `subsystems.*.command_config` = per-command duration/cost/resource overrides.

That boundary is not consistently reflected in the editor UI.

### Encounter Biome Source

Current storage: `subsystems.exploration.config.enc_biome_source`.

Current editor state:

- It appears in the Policies tab.
- It also appears in the Subsystems tab under Exploration guided config.

What went wrong: this is a duplicated UI control. The storage path is already the subsystem path the manual note expected, but the Policies tab still exposes it.

Best fix: remove `Encounter biome source` from the Policies tab and keep it in the Exploration guided config under Subsystems. Update validation issue metadata that labels `subsystems.exploration.config.*` issues as `Policies`.

Related places to check:

- `editor/src/app/App.tsx`: `PoliciesView`, `SubsystemAdvancedEditor`.
- `editor/src/lib/config.ts`: validation sections for exploration currently report several subsystem config paths under the `Policies` section.
- `src/aliases/westmarch/show.alias`: policy summary includes exploration subsystem config values.

### Repeat Encounters

Current storage: `policies.exploration.avoid_repeat_encounters`.

Related subsystem config: `subsystems.exploration.config.repeat_exclude_window`.

What went wrong: this one is not simply in the wrong path. The current docs intentionally split the repeat behavior into a policy gate (`avoid_repeat_encounters`) and a subsystem knob (`repeat_exclude_window`). The manual test expectation would move the whole repeat feature into `subsystems.exploration.config`.

Best fix: decide the schema boundary explicitly.

Recommended path: keep `avoid_repeat_encounters` under `policies.exploration` because it is a table-wide enforcement toggle, but display it next to the Exploration guided config so the owner experiences it as one exploration setup workflow. If the desired schema is instead `subsystems.exploration.config.avoid_repeat_encounters`, add compatibility readers and migration guidance.

Related places to check:

- `src/gvars/utils/encounters/encounter_lists.gvar`: repeat policy consumption.
- `src/gvars/utils/config/config.gvar`: runtime defaults.
- `src/gvars/configs/starter.gvar`: starter shape.
- `editor/src/lib/config.ts`: defaults and validation.
- `docs/internal/projects/westmarch-statement/data-shapes.md`: policy versus config reference.

### Downtime Mode, Acquisition, And Max Workdays

Current storage: `policies.downtime.mode`, `policies.downtime.acquisition`, `policies.downtime.max_workdays`.

What went wrong: this conflicts with the manual expectation, but it matches the current documented schema. `subsystems.downtime.config` is currently reserved for labels and schedule-flavour fields like `workday_hours` and `workweek_days`.

Best fix: do not move these paths without a deliberate schema migration. They are policy/ledger behavior rather than command wiring. Improve the editor by grouping them as a Downtime policy block near the Downtime subsystem controls, and make the label/path relationship visible in help text.

If they are moved anyway, update:

- `src/gvars/utils/pc/pc.gvar`: `downtime_mode`, `downtime_cap`, and downtime mutation behavior.
- `src/aliases/downtime/downtime.alias`.
- `src/gvars/utils/config/config.gvar` defaults.
- `src/gvars/configs/starter.gvar`.
- `editor/src/lib/config.ts` defaults and validation.
- `src/aliases/westmarch/show.alias`.
- Data-shape docs and any `.alias-test` / `.gvar-test` coverage.

### Crafting Rules, Recipes, Spell Requirement, Catalogues, Checks, Tools, And Overrides

Current storage for several of these is already under `subsystems.crafting.config` or `subsystems.crafting.command_config`, but the controls are shown in the Policies tab.

Fields already stored under subsystem config:

- `subsystems.crafting.config.rules_version`
- `subsystems.crafting.config.recipe_mode`
- `subsystems.crafting.config.require_known_spell`
- `subsystems.crafting.config.catalogues`
- `subsystems.crafting.config.checks`
- `subsystems.crafting.config.tool_policy`
- `subsystems.crafting.command_config`

What went wrong: the editor page placement is wrong even where the data path is correct.

Best fix: move these controls to the Crafting guided config in the Subsystems tab, or create a dedicated Crafting setup page/section if the Subsystems tab becomes too dense.

Related places to check:

- `editor/src/app/App.tsx`: `PoliciesView`, `CraftingCataloguesEditor`, `CraftingChecksEditor`, `CraftingToolPolicyEditor`, `CraftingCommandOverridesEditor`.
- `editor/src/lib/config.ts`: validation section names.
- `src/aliases/westmarch/show.alias`: crafting summary already has a dedicated section.

### Crafting Resource Modes And Crafted Item Output

Current storage:

- `policies.crafting.resources.*`
- `policies.inventory.item_handling.*`
- Optional narrower overrides: `policies.crafting.item_handling`, `subsystems.crafting.config.item_handling`, `subsystems.crafting.command_config.<cmd>.item_handling`.

What went wrong: the editor currently edits the broad global inventory output policy for "Crafted item output". That can affect more than crafting and is easy to misunderstand from the label.

Best fix:

- Rename the global controls to make their scope explicit, for example `Default item output` and `Inventory bag defaults`.
- Add a crafting-specific output override control that writes to `subsystems.crafting.config.item_handling` when the owner wants crafting-only output behavior.
- Keep `policies.crafting.resources` under policies unless the schema boundary is intentionally changed, because these are enforcement modes.

Same issue elsewhere: command overrides already support per-command resources and item handling, but the UI hides that behind a dense matrix in the Policies tab.

### Crafting Catalogue Sources Rename

Current storage: `subsystems.crafting.config.catalogues`.

Manual note: rename to `Catalogue resources` and keep under policies because catalogues are used across exploration, crafting, economy, and content.

Investigation: the current implementation does not have one shared catalogue resource object. Crafting reads `subsystems.crafting.config.catalogues`; economy reads top-level `shops` and item catalogues from `items.gvar`; content reads book sources through content/world data. Moving this to `policies` would put data-source wiring under a policy block, which conflicts with the current model.

Best fix: do not just rename the existing crafting field as if it were global. Choose one of these:

- Short-term: keep `subsystems.crafting.config.catalogues`, label it `Crafting catalogues`, and move it out of the Policies tab.
- Longer-term: introduce a real shared catalogue resource shape, probably top-level or under `world_data`, then update crafting, economy, content, editor validation, docs, and `westmarch show` together.

### Exploration Distribution, Monster Art, And DC Visibility

Current storage:

- `subsystems.exploration.config.distribution`
- `subsystems.exploration.config.monster_images.hunt`
- `subsystems.exploration.config.monster_images.loot`
- `subsystems.exploration.config.show_check_dcs.hunt`
- `subsystems.exploration.config.show_check_dcs.loot`

What went wrong: these fields already write to the expected subsystem config paths, but the editor displays them in the Policies tab. Distribution also appears in the Exploration guided config, so it is duplicated.

Best fix: remove these from Policies and keep them under Exploration guided config. Expand that guided config to include monster art and DC visibility.

Same issue elsewhere:

- `editor/src/lib/config.ts` reports validation issues for these paths under section `Policies`.
- `src/aliases/westmarch/show.alias` includes these under `_policy_summary`, even though they are subsystem config.

## Issue 2: Sidebar And Action Log Scroll Out Of Frame

What went wrong: `.workspace` is a normal grid with `.sidebar`, `.main-pane`, and `.right-pane`. Only `.topbar` is sticky. On desktop, the left navigation and right action/log pane scroll away with the document.

Best fix: make desktop side panes sticky below the topbar and independently scrollable:

- Add a shared top offset based on the topbar height.
- Apply `position: sticky`, `top`, `height`, and `overflow-y: auto` to `.sidebar` and `.right-pane`.
- Keep the current mobile behavior where the topbar becomes static and panes collapse/stack.
- Check the fixed `.cta-bar` so it does not cover right-pane content or side-pane scroll bottoms.

Related places to check:

- `editor/src/styles/main.css`: `.topbar`, `.workspace`, `.sidebar`, `.right-pane`, `.cta-bar`, responsive breakpoints at `1100px` and `760px`.

## Issue 3: Expanded Row Headers Are Not Consistently Sticky

What went wrong: the editor already has a sticky rule for `.builder-row.open > .builder-row-head`, but:

- It uses `top: 0`, so it can sit under the sticky app topbar on desktop.
- It only applies to builder rows, not every expandable/details-style row.
- Reusable sections like `.gvar-source-row`, `.collection-item`, `.subsystem-details`, `.command-override`, and advanced JSON details do not share one sticky-header pattern.

Best fix:

- Define a CSS variable for the sticky content top offset.
- Apply sticky headers to the reusable expandable row selectors, especially `details[open] > summary` patterns and custom builder row heads.
- Use `scroll-margin-top` with the same offset so focused/opened rows do not hide beneath the topbar.
- Keep mobile top offsets at `0` because the mobile topbar is static.

Related places to check:

- `editor/src/styles/main.css`: `.builder-row.open > .builder-row-head`, `.collection-item > summary`, `.subsystem-details > summary`, `.command-override > summary`, `.advanced-json-details > summary`, `.gvar-source-head`.
- `editor/src/components/ExpandableBlockRows.tsx`
- `editor/src/components/GvarSourceRows.tsx`
- `editor/src/app/App.tsx` world/path/crafting expandable sections.

## Recommended Fix Order

1. Clean up page placement without changing schema: move duplicate subsystem-config controls out of Policies.
2. Rename labels where broad policies are staying broad, especially inventory output.
3. Update validation section names and `westmarch show` summaries so paths are not reported under the wrong conceptual group.
4. Only then consider schema migrations for downtime/repeat/resources/catalogues, because those require runtime compatibility and docs/test updates.
5. Fix sticky side panes and expanded-row headers as a separate layout slice.
