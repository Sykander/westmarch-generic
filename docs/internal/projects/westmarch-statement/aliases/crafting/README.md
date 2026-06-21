# Crafting

**Subsystem:** `subsystems.crafting` · **Commands:** `craft`, `brew`, `scribe`, `enchant`

Slice 5 ports the crafting cluster with shared RAW-oriented behavior instead of the old westmarch skill-roll/DC aliases. All four commands use `crafting.gvar` for command toggles, catalogue resolution, optional recipe lookup, optional checks/tools, rules-edition branching, resource policy, and output handling.

## Commands

| Command | Catalogue | Output kind | Notes |
| --- | --- | --- | --- |
| `!craft <item>` | `items` | item | Mundane item cost uses RAW baseline unless recipe mode provides a recipe. |
| `!brew <potion>` | `potions` | potion | Potion/magic-item rarity baseline unless recipe mode provides a recipe. |
| `!scribe <spell> [-l level] [-i]` | `spells` | scroll | 2014 and 2024 scroll names differ; 2024 stores spell bonus and DC. `-i` bypasses only known-spell and spell-slot checks. |
| `!enchant <magic item>` | `magic_items` | magic item | Recipe `required` base items are consumed by default when item resources deduct. |

## Lookup Behavior

Catalogues and recipes resolve user-entered names through `lists.search_list` / `lists.search_list_by_key`.

- 0 matches: the command says no match was found.
- 1 match: the command proceeds.
- Many matches: the command asks the player to be more specific and shows a short match list.

Recipes are not required for RAW crafting. `subsystems.crafting.config.recipe_mode` controls how they are used:

| Mode | Behaviour |
| --- | --- |
| `raw` | Ignore recipes and always use RAW baseline costs. |
| `recipes` | Require a unique matching recipe before crafting can proceed. |
| `mixed` | Use a unique matching recipe when present; otherwise use RAW. This is the default. |

When a recipe applies, its `workdays`, `gold`, `consumed`, `required`, `spells`, and optional `tools` fields drive the command.

`scribe` also enforces RAW spell eligibility by default: the resolved spell name must appear in the character's Avrae spellbook. Set `subsystems.crafting.config.require_known_spell` to `False`, or override `subsystems.crafting.command_config.scribe.require_known_spell`, when the server tracks that eligibility elsewhere. Players can pass `-i` for feature-granted spells that Avrae does not expose as known spells or usable slots; gold, downtime, materials, tools, and crafting checks still apply, and success output records that ignore mode was used.

## Rules Edition

The helper uses `config.get_rules_edition()` for the server default, then allows crafting-specific overrides:

```py
subsystems = {
    "crafting": {
        "config": {"rules_version": None},
        "command_config": {
            "scribe": {"rules_version": "2014"},
        },
    },
}
```

Scroll names are edition-specific:

```text
2014: Scroll of Fireball (5th Lv.)
2024: Scroll of Fireball (Lv. 5 | SB +3 | DC 11)
```

For 2024 scrolls, `SB` and `DC` are the data needed when the scroll is used. The command uses the character's Avrae spellbook values when available, accepts `-sb` and `-dc` as final explicit values, and derives from `-ability`, `-score`, and `-pb` only when spellbook stats are unavailable.

## Optional Checks And Tools

RAW crafting does not require these commands to roll by default. Servers that want westmarch-style checks can opt in:

```py
"checks": {
    "scribe": {"mode": "roll", "skill": "arcana", "dc": 15, "require_success": True},
}
```

Check modes are `none`, `manual`, or `roll`. Tool policy modes are `off`, `manual`, or `check`:

```py
"tool_policy": {
    "scribe": {
        "mode": "check",
        "tools": ["Calligrapher's Supplies"],
        "require_proficiency": True,
        "require_kit": False,
    },
}
```

Tool proficiency checks use `tools.gvar` (`pTools` / `eTools`). Kit checks look in the configured bag.

## Resource Policy

Resource modes are `manual`, `check`, or `deduct`.

```py
policies = {
    "crafting": {
        "resources": {
            "gold": "manual",
            "materials": "manual",
            "items": "manual",
            "downtime": "check",
            "spell_slot": "manual",
        },
    },
}
```

Per-command overrides live under `subsystems.crafting.command_config.<command>.resources`. This lets a server track downtime for scribing but leave enchanting manual, or deduct gold for brewing while leaving spell slots manual.

## Item Output

Global output handling lives under `policies.inventory.item_handling`:

```py
"inventory": {
    "item_handling": {
        "mode": "manual",  # or "bags"
        "default_bag": "Equipment",
        "equipment_bag": "Equipment",
        "crafted_bag": "Equipment",
        "potions_bag": "Potions",
        "scrolls_bag": "Scrolls",
        "magic_items_bag": "Equipment",
        "materials_bag": "Materials",
    },
}
```

`manual` prints `You gained one ...`. `bags` writes to the Bags cvar through `pc.modify_bag`. Per-command output overrides can be a simple mode string or an object with `mode` and bag names.

## Tests

Coverage lives in:

- `src/gvars/utils/crafting/crafting.gvar-test`
- `src/gvars/utils/catalogues/items/items.gvar-test`
- `src/gvars/utils/catalogues/spells/spells.gvar-test`
- `src/gvars/utils/misc/recipe.gvar-test`
- `src/aliases/crafting/*.alias-test`
