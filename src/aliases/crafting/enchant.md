Creates a magic item from the configured magic item catalogue.

Usage: `!enchant <magic item>`

The command resolves magic item names through the shared catalogue search. Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "enchant"` recipe when present. RAW fallback uses magic item costs by rarity. Recipe `required` items are checked as base items; by default `enchant` consumes required items when item resources are set to `deduct`.

Output handling follows the inventory policy: `manual` prints the gained magic item; `bags` adds it to the configured equipment/magic item bag.

Examples:

- `!enchant "Cloak of Protection"`
- `!enchant "Goggles of Night"`

Configured under: `Crafting -> enchant`
