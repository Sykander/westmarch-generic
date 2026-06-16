# forage — MVP implementation

**Subsystem:** exploration · **Toggle:** `subsystems.exploration.commands.forage` · **Phase:** 1 (Tier B) *(alternate Phase 0 candidate)*

Fourth in this doc sequence; was the other candidate for Tier A alongside **enc** in [mvp-commands.md](../../mvp-commands.md). If **enc** is Phase 0 anchor, **forage** follows as a Tier B clone.

## Player-facing behaviour

Biome resolution follows **`exploration.config.enc_biome_source`** (same as **enc** — see [README.md](README.md)):

| Mode | Usage |
|------|-------|
| Manual (`argument` / **`auto`** without locations) | `!forage <biome> [bonuses]` |
| Inferred (`location` / **`auto`** with locations) | `!forage [bonuses]` |

Foraging-flavoured encounter from JSON rows tagged **`forage.<kind>`** on the resolved biome gvar. Cooldown: **120s** via **[stats.gvar](../../gvars/stats.md)** + **`pc.check_cooldown(ch, "forage")`**.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/forage.alias` |
| Alias tests | `westmarch/src/aliases/exploration/forage.alias-test` |

westmarch used **`get_encounter_list(code, "forage")`** on inline pools — **not** ported. Generic: **`biomes.resolve_biome("forage", …)`** → **`encounter_lists.get_encounter(biome, "forage", …)`**.

## Why forage after enc/mine/lumber

Validates activity dispatch on shared pipeline after the reference **enc** port. Functionally equivalent diff to mine/lumber.

## Prerequisites

- [enc.md](enc.md) Phase 0 engine complete
- Biome gvar includes rows tagged **`forage.gather`** (and other kinds per **`distribution`**) for test biomes

## Implementation checklist

- [ ] Clone generic **enc** alias → `src/aliases/exploration/forage.alias`
- [ ] **`display.get_display()`** opener
- [ ] **`biomes.resolve_biome("forage", args, ch, cfg)`**
- [ ] **`encounter_lists.get_encounter(biome, "forage", ch, cfg)`**
- [ ] **`stats.add_log(ch, extras={ biome, encounter_kind })`**
- [ ] Toggle `exploration.commands.forage`
- [ ] `forage.alias-test`

## Related

- [lumber.md](lumber.md) · [fish.md](fish.md) · [README.md](README.md)
