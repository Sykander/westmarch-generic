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

currencies = {
    "shards": { "name": "Arcane Shard", "plural": "Arcane Shards" },
},

shops = {
    "general_store": {
        "id": "general_store",
        "name": "General Store",
        "location_id": "river_town",
        "accepts_sells": True,
        "buyback": 0.5,
        "stock": [
            { "item": "Rope", "price": { "gold": 1 } },
        ],
    },
}
```

Shapes: [data-shapes.md § Currency](../../data-shapes.md#currency), [Shop](../../data-shapes.md#shop).

Shared engines: **[shops.gvar](../../gvars/shops.md)** (transactions via **`pc`**), **[pc.gvar](../../gvars/pc.md)** (gp, wallet, bags). Job payouts: **`JOB`** config block.

Planned aliases: `src/aliases/economy/`.

## Related

- [travel/travel.md](../travel/travel.md) — optional shop **`location_id`** gates  
- [server-config.md](../../server-config.md) — config layers  
- [public/assets/items.tsv](../../../../public/assets/items.tsv) — shop stock names
