# recipe.gvar

**Path:** `src/gvars/utils/misc/recipe.gvar`

Optional recipe catalogue facade used by crafting commands and `!recipe`. Recipes can use the engine source `engine:configs/recipes/recipes_list`, live inline under `subsystems.crafting.config.catalogues.recipes` or `world_data.recipes`, or load by UUID through `extensions.recipes`.

## API

```py
recipe.catalogue_entries(cfg, kind="brew")
recipe.resolve(cfg, "Potion of Healing", "brew")
recipe.search_matches(cfg, "healing", "brew")
recipe.name_matches(cfg, "healing", "brew")
recipe.recipe_workdays(entry)
recipe.recipe_gold(entry)
recipe.recipe_consumed(entry)
recipe.recipe_required(entry)
recipe.recipe_spells(entry)
recipe.recipe_tools(entry)
```

Resolution uses `lists.search_list_by_key`. Crafting commands apply recipes according to `subsystems.crafting.config.recipe_mode`: `raw`, `recipes`, or `mixed`.
