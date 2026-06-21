# crafting.gvar

Shared helper for `!craft`, `!brew`, `!scribe`, and `!enchant`.

## Responsibilities

- Checks the crafting subsystem and command toggles.
- Resolves item, potion, spell, magic item, and optional recipe catalogues through the catalogue facades.
- Uses `lists.search_list` semantics through the catalogue helpers: no match, one match, or a short ambiguity list.
- Gets the default rules edition from `config.get_rules_edition()`, then applies crafting-level or command-level `rules_version` overrides.
- Builds RAW-oriented cost/workday plans for 2014 and 2024 crafting.
- Applies `recipe_mode`: `raw`, `recipes`, or `mixed`.
- Applies the default-on RAW scribing gate: the resolved spell must appear in the character's Avrae spellbook unless `require_known_spell` is disabled.
- Applies optional crafting check and tool policies when configured.
- Applies resource policy for gold, materials, ingredient items, downtime, and spell slots.
- Applies item output policy: manual text or mutation through the configured Bags cvar.

## Public Surface

| Function | Role |
|----------|------|
| `command_enabled(cfg, command)` | Returns whether a crafting command is active. |
| `rules_edition(config_override=None, command=None)` | Resolves the edition used for crafting math. |
| `recipe_mode(config_override=None, command=None)` | Resolves `raw`, `recipes`, or `mixed`. |
| `require_known_spell(config_override=None, command="scribe")` | Resolves the RAW scribing spellbook gate. |
| `character_knows_spell(ch, spell_name)` | Checks whether a spell name appears in the character spellbook. |
| `check_policy(config_override, command)` | Resolves optional check mode/skill/DC. |
| `tool_policy(config_override, command)` | Resolves optional tool proficiency/kit policy. |
| `subject_from_args(argslist)` | Extracts the lookup text while skipping known flags. |
| `build_plan(config_override, command, query, args=None, ch=None)` | Resolves catalogue/recipe data and returns the crafting plan. |
| `execute_plan(ch, config_override, plan, args=None)` | Checks/deducts resources and applies configured output. |
| `run_command(ch, config_override, command, query, args, prefix="!")` | Alias-facing wrapper returning `(ok, message)`. |
| `format_scroll_name(spell_name, level, edition, stats=None)` | Produces bag/manual item names for spell scrolls. |

## Scroll Output

2014 scrolls are named with spell and slot level only:

```text
Scroll of Fireball (5th Lv.)
```

2024 scrolls include the scribe's scroll-use stats because the created scroll uses those values when cast:

```text
Scroll of Fireball (Lv. 5 | SB +3 | DC 11)
```

`SB` is the spell attack bonus and `DC` is the spell save DC. No other bracket data is required for RAW use; the spell name and scroll level identify the spell and slot level, and the 2024 stat pair covers attack/save resolution. When available, the helper uses Avrae spellbook values for this pair so character-specific bonuses are preserved; explicit `-sb/-dc` values override that, and `-ability/-score/-pb` is the fallback when spellbook stats are unavailable.

## Config Inputs

- `subsystems.crafting.config.catalogues`
- `subsystems.crafting.config.rules_version`
- `subsystems.crafting.config.recipe_mode`
- `subsystems.crafting.config.require_known_spell`
- `subsystems.crafting.config.checks`
- `subsystems.crafting.config.tool_policy`
- `subsystems.crafting.config.resources`
- `subsystems.crafting.config.item_handling`
- `subsystems.crafting.command_config.<command>`
- `subsystems.downtime.config`

See [data-shapes.md](../data-shapes.md#craftingconfig) and [aliases/crafting/README.md](../aliases/crafting/README.md).
