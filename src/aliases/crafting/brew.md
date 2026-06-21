Creates a potion, tonic, poison, or similar consumable from the configured potion catalogue.

Usage: `!brew <potion>`

The command resolves potion names through the shared catalogue search. Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "brew"` recipe when present. RAW fallback uses potion/magic-item crafting costs by rarity. Resource checks and deductions are controlled by `policies.crafting.resources` and per-command overrides.

Output handling follows the inventory policy: `manual` prints the gained potion; `bags` adds it to the configured potions bag.

Examples:

- `!brew "Potion of Healing"`
- `!brew Antitoxin`

Configured under: `Crafting -> brew`
