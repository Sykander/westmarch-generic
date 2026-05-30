# monsters.gvar

**Path:** `src/gvars/catalogues/monsters.gvar` · **Phase:** 1 (Tier C)

Search and load **monster** rows from config (or extension gvars). Source TSV: [public/assets/monsters.tsv](../../../../public/assets/monsters.tsv).

## API

```py
def search(config, query):
    """Prefix / substring match on name — returns list of monster dicts."""

def get(config, name):
    """Exact name or None."""

def format_combat_block(monster, prefix="!"):
    """Embed snippet for hunt success — monster list + !i madd suggestion."""
```

Monster dict shape *(minimal)*:

```py
{ "name": str, "cr": number | str, "type": str, "size": str, ... }
```

Large catalogues: config **`extensions.monsters`** UUID → load via same pattern as [items.md](items.md).

## Used by

| Consumer | Role |
|----------|------|
| **`!hunt`** | Resolve creature, compute Survival DC from CR |
| **`!loot`** | Build loot table from monster type + CR — [loot.md](loot.md) |
| **`encounters.gvar`** | **`combat_block`** when encounter has `cr > 0` |

## westmarch reference

`westmarch/src/gvars/utils/monsters.gvar` — letter-sharded gvars; generic loads from config/extension instead.

## Related

- [loot.md](loot.md) · [aliases/exploration/hunt.md](../aliases/exploration/hunt.md)
