# lumber — MVP implementation

**Subsystem:** exploration · **Toggle:** `SUBSYSTEMS.exploration.commands.lumber` · **Phase:** 1 (Tier B)

Third port in the exploration sequence. Activity key `"lumber"`.

## Player-facing behaviour

```
!lumber <location> [bonuses]
```

Lumbering-flavoured encounter at the given area code. Cooldown: 120s (`bags.lumber_cooldown_code`).

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/lumber.alias` |
| Alias tests | `westmarch/src/aliases/exploration/lumber.alias-test` |

Uses `lumber_encounters` pool via `get_encounter_list(code, "lumber")`. Otherwise identical structure to [mine.md](mine.md) / [enc.md](enc.md).

## Prerequisites

- Shared encounter engine from **enc** Phase 0
- Config biome includes `lumber_encounters` for test areas

## Implementation checklist

- [ ] `src/aliases/exploration/lumber.alias` from generic enc template
- [ ] Toggle `exploration.commands.lumber`
- [ ] `get_encounter_list(code, "lumber")`
- [ ] `lumber.alias-test` + config fixture pools
- [ ] Template config `"lumber": True`

## Related

- [mine.md](mine.md) — prior port
- [forage.md](forage.md) — next in sequence
