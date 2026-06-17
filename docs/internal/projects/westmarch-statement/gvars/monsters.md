# monsters.gvar

**Path:** `src/gvars/utils/catalogues/monsters/monsters.gvar` · **Phase:** 1 (Tier C)

Search and load **monster** rows from engine catalogue shards. Source TSV: [assets/monsters.tsv](../../../../../assets/monsters.tsv) → built by **`utils/generate-monsters.js`** ([content-pipeline.md](../content-pipeline.md)).

## Shards

26 letter gvars: **`catalogues/monsters/monsters_{a-z}.gvar.json`** — JSON arrays, one per first letter of **`name`**.

Facade builds candidates from owner entries, the query's first-letter shard, and small hotpath routes for common families such as **dragon**, **goblin**, and **ooze**. It then uses shared **`lists.search_list_by_key`** semantics over those candidates. If there are no matches, commands report no matches. If there are multiple matches, commands ask for a more specific name and show up to five matches. Shards are loaded through `get_gvar` and cached per invocation.

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

Owner entries can be added inline under **`world_data.monsters`**. Large **owner** catalogues use config **`extensions.monsters`** UUID → same row shape as the generated shard arrays.

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
