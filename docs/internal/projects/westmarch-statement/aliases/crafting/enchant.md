# enchant

`!enchant <magic item>` creates a magic item from the configured magic item catalogue.

Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "enchant"` recipe when present. Recipes override costs, materials, required base items, and spell requirements. RAW fallback uses the magic-item rarity baseline for the configured rules edition. Required base items are checked as item resources and, for `enchant`, are consumed by default when item resources are set to `deduct`.

Output is controlled by `subsystems.crafting.config.item_handling` or `subsystems.crafting.command_config.enchant.item_handling`.
