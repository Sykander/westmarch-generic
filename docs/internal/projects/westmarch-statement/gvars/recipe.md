# recipe.gvar

**Path:** `src/gvars/utils/misc/recipe.gvar` · **Phase:** 1 (Tier H)

**Read-only recipe browser** for **`!recipe`** — search and format rows from config **`recipes`** ([data-shapes.md § Recipe](../data-shapes.md#recipe)) plus catalogue metadata from [items.md](items.md).

Does **not** consume materials or start downtime (that stays on crafting aliases).

## API

```py
def search(config, query, mode="name"):
    """
    mode: "name" | "tag" | "ingredient"
    ingredient — match consumed/required item names.
    """

def get(config, recipe_id_or_name):

def format_recipe(config, recipe):
    """Embed — process description + structured consumed/required/spells/workdays."""

def merge_sources(config):
    """Optional — index config recipes + infer craft bands for items without recipe rows."""
```

Character **known recipes** (notebook from recipe encounters) may filter results later — storage via [pc.md](pc.md) cvars or vendored **`core/notes.gvar`** when ported; MVP may show all config recipes.

## Related

- [aliases/misc/recipe.md](../aliases/misc/recipe.md)
- [public/assets/recipes.tsv](../../../../public/assets/recipes.tsv)
