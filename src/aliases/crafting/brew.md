# Brew

`!brew <potion>` creates a potion from the configured potion catalogue.

The command resolves potion names through the shared catalogue search. Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "brew"` recipe when present. RAW fallback uses potion/magic-item crafting costs by rarity. Resource checks and deductions are controlled by `policies.crafting.resources` and per-command overrides.

Output handling follows the inventory policy: `manual` prints the gained potion; `bags` adds it to the configured potions bag.
