# craft

`!craft <item>` creates a mundane item from the configured item catalogue.

Costs follow `subsystems.crafting.config.recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "craft"` recipe when present. The RAW baseline uses the item's catalogue value: 2014 progresses 5 gp of item value per workday; 2024 progresses 10 gp per workday. Material cost is half the item value unless a recipe overrides it.

Output is controlled by `policies.inventory.item_handling` or `subsystems.crafting.command_config.craft.item_handling`.
