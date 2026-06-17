# fish — MVP implementation

**Subsystem:** exploration · **Toggle:** `subsystems.exploration.commands.fish` · **Phase:** 1 (Tier B)

Fifth activity port; completes the Tier B activity cluster (before **hunt** / **loot** in Tier C).

## Player-facing behaviour

Biome resolution follows **`exploration.config.enc_biome_source`** (same as **enc** — see [README.md](README.md)):

| Mode | Usage |
|------|-------|
| Manual | `!fish <biome> [bonuses]` |
| Inferred | `!fish [bonuses]` |

Fishing-flavoured encounter from JSON rows tagged **`fish.<kind>`** on the resolved biome gvar. Cooldown: **120s** via **[stats.gvar](../../gvars/stats.md)** + **`pc.check_cooldown(ch, "fish")`**.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/fish.alias` |
| Alias tests | `westmarch/src/aliases/exploration/fish.alias-test` |

westmarch **`get_encounter_list(code, "fish")`** → generic **`biomes.resolve_biome("fish", …)`** + **`encounter_lists.get_encounter(biome, "fish", …)`**.

## Prerequisites

- Shared engine gvars from **enc** Phase 0
- Biome gvar rows tagged **`fish.gather`** for at least one water-adjacent biome in fixture (e.g. river/sea codes)

## Implementation checklist

- [x] Thin alias wrapper → `src/aliases/exploration/fish.alias`
- [x] Shared **`exploration.run_activity("fish", args, get_embed)`** pipeline
- [x] **`biomes.resolve_biome("fish", args, ch, cfg)`**
- [x] **`encounter_lists.get_encounter(biome, "fish", ch, cfg)`**
- [x] **`stats.add_log`**
- [x] Toggle `exploration.commands.fish`
- [x] `fish.alias-test`

## Tier B cluster exit criteria

When **fish** lands with mine/lumber/forage:

| Criterion | Status |
|-----------|--------|
| All five activities use **`biomes.resolve_biome`** + shared list builder | Done |
| Per-command toggles independent | Done |
| One alias-test per command in CI | Done |
| Quest overlays still deferred | OK for MVP |
| Matching journey steps complete via shared activity hook | Covered |

## Related

- [forage.md](forage.md) · [hunt.md](hunt.md) · [README.md](README.md)
