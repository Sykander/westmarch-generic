# mine — MVP implementation

**Subsystem:** exploration · **Toggle:** `subsystems.exploration.commands.mine` · **Phase:** 1 (Tier B)

Second port in the exploration sequence (after **enc**). Same pipeline; activity key **`"mine"`**.

## Player-facing behaviour

Biome resolution follows **`exploration.config.enc_biome_source`** (same as **enc** — see [README.md](README.md)):

| Mode | Usage |
|------|-------|
| Manual | `!mine <biome> [bonuses]` |
| Inferred | `!mine [bonuses]` |

Mining-flavoured encounter from JSON rows tagged **`mine.<kind>`** on the resolved biome gvar. Cooldown: **120s** via **[stats.gvar](../../gvars/stats.md)** + **`pc.check_cooldown(ch, "mine")`**.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/mine.alias` |
| Alias tests | `westmarch/src/aliases/exploration/mine.alias-test` |

Diff from **enc**:

| Aspect | enc | mine |
|--------|-----|------|
| Activity | `"enc"` | `"mine"` |
| Biome row tag | **`enc.<kind>`** | **`mine.<kind>`** |
| Cooldown key | **`"enc"`** | **`"mine"`** |
| Title/footer | **`command_display.enc`** | **`command_display.mine`** — via **`display.get_display()`** |

No journey integration in westmarch (enc-only).

## Prerequisites

- [enc.md](enc.md) Phase 0 complete
- Biome gvar includes rows tagged **`mine.gather`** for fixture biomes

## Implementation checklist

- [ ] Clone **enc** alias → `src/aliases/exploration/mine.alias`
- [ ] **`biomes.resolve_biome("mine", args, ch, cfg)`**
- [ ] **`encounter_lists.get_encounter(biome, "mine", ch, cfg)`**
- [ ] **`stats.add_log(ch, extras={ biome, encounter_kind })`**
- [ ] Toggle `exploration.commands.mine`
- [ ] `mine.alias-test` + biome **`mine.gather`** row fixture

## Exit criteria

Same as [enc.md](enc.md): help, valid biome, toggle off, CI green.

## Related

- [enc.md](enc.md) · [lumber.md](lumber.md)
