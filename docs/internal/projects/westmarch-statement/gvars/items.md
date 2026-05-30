# items.gvar

**Path:** `src/gvars/catalogues/items.gvar` · **Phase:** 1 (Tier E/F)

Search **item catalogues** from config — mundane **Item**, **Potion**, and **Magic Item** pools (westmarch had three lists; one module, typed search).

Source TSV: [public/assets/items.tsv](../../../../public/assets/items.tsv) (`type` column).

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

Config may inline lists or use **`extensions.items`**, **`extensions.potions`**, **`extensions.magic_items`** UUIDs — loader caches per **`get_config()`** invocation.

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

`westmarch/src/gvars/utils/items.gvar` + `items_list` / `potions_list` / `magic_items_list` extension gvars.

## Related

- [spells.md](spells.md) · [recipe.md](recipe.md) · [shops.md](shops.md)
- [aliases/crafting/README.md](../aliases/crafting/README.md)
