Creates a mundane item from the configured item catalogue.

Usage: `!craft <item>`

The command resolves item names through the shared catalogue search, uses the configured crafting rules edition, and applies `subsystems.crafting.config.resources` plus `subsystems.crafting.config.item_handling`. When output handling is `manual`, the embed tells the player what they gained. When output handling is `bags`, the item is added to the configured bag.

Costs follow `subsystems.crafting.config.recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique recipe when present. The RAW baseline uses the item value: 2014 progresses 5 gp of item value per workday; 2024 progresses 10 gp per workday. Material cost is half the item value unless a recipe overrides it.

Examples:

- `!craft "Rope, Hemp (50 ft)"`
- `!craft Pony`

Configured under: `Crafting -> craft`
