# fish — MVP implementation

**Subsystem:** exploration · **Toggle:** `SUBSYSTEMS.exploration.commands.fish` · **Phase:** 1 (Tier B)

Fifth activity port; completes the Tier B activity cluster (before **hunt** / **loot** in Tier C).

## Player-facing behaviour

```
!fish <location> [bonuses]
```

Fishing-flavoured encounter at the given area code. Cooldown: 120s (`bags.fish_cooldown_code`).

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/exploration/fish.alias` |
| Alias tests | `westmarch/src/aliases/exploration/fish.alias-test` |

Uses `fish_encounters` via `get_encounter_list(code, "fish")`.

## Prerequisites

- All shared engine gvars from **enc** Phase 0
- Config biome pools include `fish_encounters` (westmarch often uses **river** / **sea** areas heavily — include at least one water area in fixture)

## Implementation checklist

- [ ] `src/aliases/exploration/fish.alias`
- [ ] Toggle `exploration.commands.fish`
- [ ] `fish.alias-test` with river or sea area fixture
- [ ] Mark Tier B exploration cluster complete in tracking

## Tier B cluster exit criteria

When **fish** lands with mine/lumber/forage:

| Criterion | Status |
|-----------|--------|
| All five activities call shared list builder | Required |
| Per-command toggles independent | Required |
| One alias-test per command in CI | Required |
| Quest/journey overlays still deferred | OK for MVP |

## Related

- [forage.md](forage.md) — prior port
- [hunt.md](hunt.md) — next subsystem command (Tier C)
