# Economy — MVP implementation docs

**Config:** `SUBSYSTEMS.economy` · Tier F

Work-for-pay and shop commands. Matches [mvp-commands.md](../mvp-commands.md) `economy` subsystem.

## Commands

| # | Command | Doc | Source |
|---|---------|-----|--------|
| 1 | **job** | [job.md](job.md) | westmarch |
| 2 | **buy** | [buy.md](buy.md) | **new** |
| 3 | **sell** | [sell.md](sell.md) | **new** |

## Config

```py
"economy": {
    "enabled": True,
    "commands": { "job": True, "buy": True, "sell": True },
},
```

Shared shop engine: **`shops.gvar`**. Job payouts: **`JOB`** config block.

Planned aliases: `src/aliases/economy/` (westmarch sources live under `src/aliases/misc/`).

## Related

- [travel/travel.md](../travel/travel.md) — optional shop location gates  
- [public/assets/items.tsv](../../../../public/assets/items.tsv) — shop stock names
