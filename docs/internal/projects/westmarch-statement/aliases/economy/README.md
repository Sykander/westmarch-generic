# Economy — MVP implementation docs

**Config:** `subsystems.economy` · Tier F

Work-for-pay, shops, and server currencies. Matches [mvp-commands.md](../../mvp-commands.md) `economy` subsystem.

## Commands

| # | Command | Doc | Source |
|---|---------|-----|--------|
| 1 | **job** | [job.md](job.md) | westmarch |
| 2 | **buy** | [buy.md](buy.md) | **new** |
| 3 | **sell** | [sell.md](sell.md) | **new** |
| 4 | **wallet** | [wallet.md](wallet.md) | **new** — all config `currencies` |

## Config

```py
"economy": {
    "enabled": True,
    "commands": { "job": True, "buy": True, "sell": True, "wallet": True },
},

# Optional — owner-defined currencies (not gp)
currencies = {
    "shards": { "name": "Arcane Shard", "plural": "Arcane Shards" },
}
```

Shape: [data-shapes.md § Currency](../../data-shapes.md#currency).

Shared engines: **`shops.gvar`**, **[pc.gvar](../../gvars/pc.md)** (wallet + gp). Job payouts: **`JOB`** config block.

Planned aliases: `src/aliases/economy/` (westmarch sources live under `src/aliases/misc/`).

## Related

- [travel/travel.md](../travel/travel.md) — optional shop location gates  
- [server-config.md](../../server-config.md) — config layers  
- [public/assets/items.tsv](../../../../public/assets/items.tsv) — shop stock names
