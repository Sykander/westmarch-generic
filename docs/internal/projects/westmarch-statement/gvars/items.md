# items.gvar

**Path:** `src/gvars/utils/catalogues/items.gvar` · **Phase:** 1 (Tier E/F)

Search **item catalogues** from engine shards — mundane **Item**, **Potion**, and **Magic Item** pools (three generated files from [items.tsv](../../../../../assets/items.tsv) **`type`** column).

Built by **`utils/generate-items.js`** — [content-pipeline.md](../content-pipeline.md). **Lazy-load:** fetch only the shard for the requested **`kind`** (westmarch loaded all three at import — generic avoids that).

## API

```py
def search(config, query, kind=None):
    """
    kind: "Item" | "Potion" | "Magic Item" | None (all pools).
    Prefix / substring match on name — returns list of dicts.
    """

def get(config, name, kind=None):
    """Best exact match or None."""

def parse_value(item):
    """Extract gp int from value string e.g. '15 gp' — for craft price bands."""
```

Item dict *(from catalogue)*:

```py
{ "name": str, "value": str, "tier": str, "type": "Item" | "Potion" | "Magic Item", "rarity": str, ... }
```

Config may override via **`extensions.items`** / **`potions`** / **`magic_items`** UUIDs — same lazy shard pattern.

## Shards

| File | `type` filter |
|------|----------------|
| `catalogues/items/items_list.gvar` | Item |
| `catalogues/items/potions_list.gvar` | Potion |
| `catalogues/items/magic_items_list.gvar` | Magic Item |

## Used by

| Command / module | Usage |
|------------------|--------|
| **craft** | `search(..., kind="Item")`, price band DC |
| **brew** | `kind="Potion"`, rarity DC |
| **enchant** | `kind="Magic Item"`, rarity DC |
| **buy** / **sell** | Resolve shop stock names — [shops.md](shops.md) |
| **recipe** | Merge with config **`recipes`** — [recipe.md](recipe.md) |

Crafting DC tables stay in config or optional **`crafting.gvar`** helpers — not in this module.

## westmarch reference

`westmarch/src/gvars/utils/items.gvar` + `utils/generate-items.js` — port three-way split; **lazy** per-type load.

## Related

- [content-pipeline.md](../content-pipeline.md) · [utils/README.md](../../../../utils/README.md)

- [spells.md](spells.md) · [recipe.md](recipe.md) · [shops.md](shops.md)
- [aliases/crafting/README.md](../aliases/crafting/README.md)
