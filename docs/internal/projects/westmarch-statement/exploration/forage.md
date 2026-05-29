# forage — MVP implementation

**Subsystem:** exploration · **Toggle:** `SUBSYSTEMS.exploration.commands.forage` · **Phase:** 1 (Tier B) *(alternate Phase 0 candidate)*

Fourth in this doc sequence; was the other candidate for Tier A alongside **enc** in [mvp-commands.md](../mvp-commands.md). If **enc** is Phase 0 anchor, **forage** follows as a Tier B clone.

## Player-facing behaviour

```
!forage <location> [bonuses]
```

Foraging-flavoured encounter at the given area code. Cooldown: 120s (`bags.forage_cooldown_code`).

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/forage.alias` |
| Alias tests | `westmarch/src/aliases/exploration/forage.alias-test` |

Uses `forage_encounters` via `get_encounter_list(code, "forage")`.

## Why forage after enc/mine/lumber

Validates that the list builder activity dispatch works for multiple pool types after the reference **enc** port. Functionally equivalent diff to mine/lumber — order here is **documentation sequencing**, not technical dependency.

## Prerequisites

- [enc.md](enc.md) Phase 0 engine complete
- Config includes `forage_encounters` pools

## Implementation checklist

- [ ] `src/aliases/exploration/forage.alias`
- [ ] Toggle `exploration.commands.forage`
- [ ] `forage.alias-test`
- [ ] Config pools + toggle

## Related

- [lumber.md](lumber.md) — prior port
- [fish.md](fish.md) — next in sequence
