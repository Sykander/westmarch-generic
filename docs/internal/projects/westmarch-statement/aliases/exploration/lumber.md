# lumber — MVP implementation

**Subsystem:** exploration · **Toggle:** `subsystems.exploration.commands.lumber` · **Phase:** 1 (Tier B)

Third port in the exploration sequence. Activity key **`"lumber"`**.

## Player-facing behaviour

Biome resolution follows **`exploration.config.enc_biome_source`** (same as **enc** — see [README.md](README.md)):

| Mode | Usage |
|------|-------|
| Manual | `!lumber <biome> [bonuses]` |
| Inferred | `!lumber [bonuses]` |

Lumbering-flavoured encounter from JSON rows tagged **`lumber.<kind>`** on the resolved biome gvar. Cooldown: **120s** via **[stats.gvar](../../gvars/stats.md)** + **`pc.check_cooldown(ch, "lumber")`**.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/lumber.alias` |
| Alias tests | `westmarch/src/aliases/exploration/lumber.alias-test` |

westmarch **`get_encounter_list(code, "lumber")`** → generic **`biomes.resolve_biome("lumber", …)`** + **`encounter_lists.get_encounter(biome, "lumber", …)`**.

## Prerequisites

- Shared encounter engine from **enc** Phase 0
- Biome gvar rows tagged **`lumber.gather`** for test biomes

## Implementation checklist

- [ ] Clone **enc** alias → `src/aliases/exploration/lumber.alias`
- [ ] **`biomes.resolve_biome("lumber", args, ch, cfg)`**
- [ ] **`encounter_lists.get_encounter(biome, "lumber", ch, cfg)`**
- [ ] **`stats.add_log`**
- [ ] Toggle `exploration.commands.lumber`
- [ ] `lumber.alias-test`

## Related

- [mine.md](mine.md) · [forage.md](forage.md)
