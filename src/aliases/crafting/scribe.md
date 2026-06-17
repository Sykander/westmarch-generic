# Scribe

`!scribe <spell> [-l level]` creates a spell scroll from the configured spell catalogue.

The command resolves spells through the shared catalogue search and validates the requested scroll level against the spell's base level. Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "scribe"` recipe when present. RAW fallback uses the configured rules edition's scroll baseline.

By default, RAW scribing also requires the spell to appear in the character's Avrae spellbook. Server owners can disable that gate with `subsystems.crafting.config.require_known_spell = False` or override it under `subsystems.crafting.command_config.scribe`.

Scroll item names differ by rules edition:

- 2014: `Scroll of Fireball (5th Lv.)`
- 2024: `Scroll of Fireball (Lv. 5 | SB +3 | DC 11)`

For 2024 scrolls, the stored use data is the spell attack bonus (`SB`) and save DC. The command uses the character's Avrae spellbook stats when available, since those include character-specific bonuses. Pass `-sb` and `-dc` to set the final values directly, or pass `-ability`, `-score`, and `-pb` as a fallback when spellbook stats are unavailable.
