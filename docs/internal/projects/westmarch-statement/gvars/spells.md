# spells.gvar

**Path:** `src/gvars/catalogues/spells.gvar` · **Phase:** 1 (Tier E)

Search **spell** catalogue from config for **`!scribe`**. Source TSV: [public/assets/spells.tsv](../../../../public/assets/spells.tsv).

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

- [aliases/crafting/scribe.md](../aliases/crafting/scribe.md)
- [items.md](items.md)
