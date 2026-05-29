# Exploration — MVP implementation docs

**Config:** `SUBSYSTEMS.exploration` · Tier A–B (activities) + Tier C (**hunt**, **loot**)

Implementation plans for exploration commands. Scope and toggles: [mvp-commands.md](../mvp-commands.md).

## Commands

| # | Command | Doc | Tier | Notes |
|---|---------|-----|------|-------|
| 1 | **enc** | [enc.md](enc.md) | A (Phase 0) | Reference port — encounter pipeline |
| 2 | **mine** | [mine.md](mine.md) | B | Activity clone |
| 3 | **lumber** | [lumber.md](lumber.md) | B | Activity clone |
| 4 | **forage** | [forage.md](forage.md) | B | Activity clone |
| 5 | **fish** | [fish.md](fish.md) | B | Activity clone |
| 6 | **hunt** | [hunt.md](hunt.md) | C | Monsters catalogue; after enc messaging |
| 7 | **loot** | [loot.md](loot.md) | C | Post-combat loot session |

## Shared activity pipeline

**enc**, **mine**, **lumber**, **forage**, **fish** share `encounter_lists` → `process_encounters`. See [enc.md](enc.md).

**hunt** → **loot** is the combat/loot loop (`!enc` before `!hunt` in westmarch help text).

## Config

```py
"exploration": {
    "enabled": True,
    "commands": {
        "enc": True, "forage": True, "fish": True,
        "mine": True, "lumber": True, "hunt": True, "loot": True,
    },
},
```

Asset data: [public/assets/monsters.tsv](../../../../public/assets/monsters.tsv) (hunt, loot); encounter pools in config (activities).

## Related

- [travel/](../travel/README.md) — journey hooks on **enc**
- [content/](../content/README.md) — **library** / **read** (separate subsystem)
