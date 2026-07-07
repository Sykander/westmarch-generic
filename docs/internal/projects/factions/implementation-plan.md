# Factions implementation plan

Status: planned for a later release. Do not implement before the first public release is tagged.

## Phase 0 - Release placement

- Keep factions out of the `1.0.0` release blocker list.
- Add factions to the `2.x.x` roadmap until the final target version is decided.
- Revisit this plan after `1.0.0` manual release testing is complete.

Acceptance:

- Release docs identify factions as post-`1.0.0`.
- No `1.0.0` checklist item requires factions.

## Phase 1 - Schema and helper design

- Finalize `subsystems.factions` command toggles and config defaults.
- Finalize the top-level `factions` catalogue shape.
- Define membership cvar shape and migration behavior.
- Define shared requirement helpers for `requirements.factions`.
- Document owner-authored examples for generic and Forgotten Realms configs.

Acceptance:

- Missing `subsystems.factions` defaults to disabled.
- Invalid faction ids, duplicate ranks, and malformed join policies have editor validation rules planned.
- User-entered faction lookup uses the standard 0 / 1 / many search behavior.

## Phase 2 - Runtime helpers

- Add `src/gvars/utils/world/factions.gvar` or another appropriate helper module.
- Implement catalogue loading, id normalization, and search.
- Implement membership read/write helpers for the configured cvar.
- Implement rank and renown resolution.
- Implement requirement checks without wiring them into every subsystem yet.

Acceptance:

- Gvar tests cover faction search, membership parsing, rank thresholds, and requirement checks.
- Helpers do not include setting-specific faction constants.

## Phase 3 - `!faction` command

- Add `src/aliases/factions/faction.alias` and help docs.
- Implement `status`, `list`, `show`, `join`, `leave`, and `renown` behavior.
- Add clear responses for no config, disabled subsystem, unknown faction, and ambiguous faction names.
- Add basic approval/pending support only if it can be expressed safely with character-local state.

Acceptance:

- Alias tests cover no config, list, exact match, ambiguous match, join, leave, and renown display.
- Disabled or absent subsystem gives the normal auth/config response.

## Phase 4 - Editor support

- Add the factions subsystem to editor domain metadata.
- Add guided faction catalogue editing.
- Add Check-page validation for faction data and enabled command requirements.
- Add reference validation for locations and any first integration target.

Acceptance:

- Editor tests cover enabled-without-data, duplicate ids, invalid join policies, invalid rank thresholds, and unknown references.
- Existing configs without factions remain clean.

## Phase 5 - Representative integrations

Pick one or two integrations for the first factions release:

- location faction presence;
- shop stock requirements;
- quest requirements or rewards;
- library collection requirements.

Acceptance:

- Integrations use shared faction helpers.
- Failure copy explains what membership or rank is required.
- Non-faction configs keep existing behavior.

## Phase 6 - Forgotten Realms example data

After generic helpers are complete, add example factions to the Forgotten Realms starter config if that preset is still maintained as a rich example.

Candidate factions:

- Harpers;
- Order of the Gauntlet;
- Emerald Enclave;
- Lords' Alliance;
- Zhentarim.

Acceptance:

- Example data is original prose.
- No faction-specific logic is hard-coded in aliases.
- Editor Check passes for the example preset.
