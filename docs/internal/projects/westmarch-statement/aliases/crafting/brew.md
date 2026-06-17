# brew

`!brew <potion>` creates a potion from the configured potion catalogue.

Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "brew"` recipe when present. RAW fallback gives healing potions their special baseline and other potions the magic-item rarity baseline. Resource modes decide whether gold, downtime, and materials are manual, checked, or deducted.

Output is controlled by `policies.inventory.item_handling` or `subsystems.crafting.command_config.brew.item_handling`.
