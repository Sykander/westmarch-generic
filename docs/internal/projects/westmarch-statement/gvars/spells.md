# spells.gvar

**Path:** `src/gvars/utils/catalogues/spells.gvar` · **Phase:** 1 (Tier E)

Search **spell** catalogue for **`!scribe`**. Source TSV: [public/assets/spells.tsv](../../../../public/assets/spells.tsv) → **`catalogues/spells/spells_list.gvar`** via **`utils/generate-spells.js`** ([content-pipeline.md](../content-pipeline.md)).

Single shard for MVP; split by spell level if gvar size requires — same lazy-load pattern as [items.md](items.md).

## API

```py
def search(config, query):
    """Prefix / substring on spell name."""

def get(config, name):
    """Exact match or None."""

def scroll_name(spell):
    """e.g. 'Spell scroll (Fireball)' — for bag add on scribe success."""
```

Spell dict:

```py
{ "name": str, "level": int | str, "school": str, ... }
```

Config **`spells`** list or **`extensions.spells`** UUID.

## Used by

- **`!scribe`** — lookup, scroll cost from config **`SCRIBE_SCROLL_COSTS`**
- Future content references

## Related

- [content-pipeline.md](../content-pipeline.md) · [utils/README.md](../../../../utils/README.md)
- [aliases/crafting/scribe.md](../aliases/crafting/scribe.md)
- [items.md](items.md)
