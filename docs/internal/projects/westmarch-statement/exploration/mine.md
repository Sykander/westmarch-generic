# mine — MVP implementation

**Subsystem:** exploration · **Toggle:** `SUBSYSTEMS.exploration.commands.mine` · **Phase:** 1 (Tier B)

Second port in the exploration sequence (after **enc**). Same pipeline; activity key `"mine"`.

## Player-facing behaviour

```
!mine <location> [bonuses]
```

Mining-flavoured encounter at the given area code. Cooldown: 120s (`bags.mine_cooldown_code`).

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/mine.alias` |
| Alias tests | `westmarch/src/aliases/exploration/mine.alias-test` |

Diff from **enc** only:

| Aspect | enc | mine |
|--------|-----|------|
| Activity passed to list builder | `"enc"` | `"mine"` |
| Pool field on biome gvar | `enc_encounters` | `mine_encounters` |
| Cooldown cvar | `bags.enc_cooldown_code` | `bags.mine_cooldown_code` |
| Title/footer copy | Exploration theme | Mining theme |

No journey integration in westmarch (enc-only).

## Prerequisites

- [enc.md](enc.md) Phase 0 complete — shared `encounter_lists`, `process_encounters`, config loader
- Fixture config includes `mine_encounters` for at least one `AREA_CODES` entry

## Implementation checklist

- [ ] Copy generic **enc** alias pattern → `src/aliases/exploration/mine.alias`
- [ ] Gate on `exploration.commands.mine`
- [ ] Call `get_encounter_list(code, "mine")`
- [ ] Port `mine.alias-test` from westmarch (adjust svar/config fixtures)
- [ ] Enable toggle in template config: `"mine": True`
- [ ] Add mine pool entries to fixture biome config

## Exit criteria

Same as [enc.md](enc.md) per-command checks: help, valid area, toggle off, CI green.

## Related

- [enc.md](enc.md) — reference port
- [lumber.md](lumber.md) — next in sequence
