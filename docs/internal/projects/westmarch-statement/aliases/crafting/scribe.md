# scribe

`!scribe <spell> [-l level]` creates a spell scroll from the configured spell catalogue.

The command validates the requested scroll level against the spell's base level. Costs follow `recipe_mode`: `raw` ignores recipes, `recipes` requires one, and `mixed` uses a unique `kind: "scribe"` recipe when present. RAW fallback uses the configured rules edition's scroll baseline.

RAW spell eligibility is enforced by default: the resolved spell must appear in the character's Avrae spellbook. Servers can set `subsystems.crafting.config.require_known_spell` to `False`, or override `subsystems.crafting.command_config.scribe.require_known_spell`, when they track that outside Avrae.

Scroll item names are edition-specific:

```text
2014: Scroll of Fireball (5th Lv.)
2024: Scroll of Fireball (Lv. 5 | SB +3 | DC 11)
```

For 2024, the scroll name stores the spell attack bonus and spell save DC needed at use time. No extra bracket data is required for the command's use case; servers that want audit details can put ability score/source in the recipe description or notes.
