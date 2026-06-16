# monsters.gvar

**Path:** `src/gvars/utils/catalogues/monsters/monsters.gvar` · **Phase:** 1 (Tier C)

Search and load **monster** rows from engine catalogue shards. Source TSV: [assets/monsters.tsv](../../../../../assets/monsters.tsv) → built by **`utils/generate-monsters.js`** ([content-pipeline.md](../content-pipeline.md)).

## Shards

26 letter gvars: **`catalogues/monsters/monsters_{a-z}.gvar`** — JSON arrays, one per first letter of **`name`**. The generator also writes **`catalogues/monsters/monsters_names.gvar`**, a JSON array of monster names used for consistent `lists.search_list` matching before loading a data shard.

Facade loads **`monsters_names`** first to resolve user input. If there are no matches, commands report no matches. If there are multiple matches, commands ask for a more specific name and show up to five matches. Only a single resolved name loads the matching letter shard via `get_gvar` + per-invocation cache.

## API

```py
def search(config, query):
    """Compatibility lookup; returns a monster only when query resolves to one name."""

def resolve(config, query):
    """Return (monster, matching_names, error_message) for player-facing commands."""

def get_monster(config, name):
    """Exact name or None — single letter shard."""

def format_combat_block(monster, prefix="!"):
    """Embed snippet for hunt success — monster list + !i madd suggestion."""

def monster_image(monster):
    """Best available embed image URL, preferring image_url."""
```

Monster dict shape *(minimal)*:

```py
{ "name": str, "cr": number | str, "type": str, "size": str, "image_url": str, ... }
```

Large **owner** catalogues: config **`extensions.monsters`** UUID → same shard or single extension gvar pattern as [items.md](items.md).

## Used by

| Consumer | Role |
|----------|------|
| **`!hunt`** | Resolve creature, compute Survival DC from CR |
| **`!loot`** | Build loot table from monster type + CR — [loot.md](loot.md) |
| **`encounters.gvar`** | **`combat_block`** when encounter has `cr > 0` |

## westmarch reference

`westmarch/src/gvars/utils/monsters.gvar` + `utils/generate-monsters.js` — port shard layout; keep lazy letter load.

## Related

- [content-pipeline.md](../content-pipeline.md) · [utils/README.md](../../../../utils/README.md)
- [loot.md](loot.md) · [aliases/exploration/hunt.md](../aliases/exploration/hunt.md)
