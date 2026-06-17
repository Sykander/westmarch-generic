# Craft

`!craft <item>` creates a mundane item from the configured item catalogue.

The command resolves item names through the shared catalogue search, uses the configured crafting rules edition, and applies the server's resource and item-output policies. When output handling is `manual`, the embed tells the player what they gained. When output handling is `bags`, the item is added to the configured bag.

Costs follow `subsystems.crafting.config.recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique recipe when present. The RAW baseline uses the item value: 2014 progresses 5 gp of item value per workday; 2024 progresses 10 gp per workday. Material cost is half the item value unless a recipe overrides it.
