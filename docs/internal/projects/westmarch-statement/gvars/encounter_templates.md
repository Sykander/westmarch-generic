# encounter_templates.gvar

**Path:** `src/gvars/utils/encounters/encounter_templates.gvar` · **Phase:** 0–1

Factory functions that expand compact JSON rows into **[encounter](../data-shapes.md#encounter-input)** dicts (data only). Used by biome gvars so one encounter row can appear in multiple pools without duplicating the full dict.

Encounter field shapes and **`ectx`** callables: [data-shapes.md](../data-shapes.md).

## Row API

Biome rows use:

```json
[pool_tags_or_null, "template_name", "...args"]
```

`encounter_templates.expand_row(row)` ignores the pool tag element and expands the template name plus args:

```py
enc = encounter_templates.expand_row([["enc.gather"], "flavour", "Wild berries", "You find ripe berries."])
```

## Templates (MVP subset)

| Template            | Kind                | Args                                                                                                     |
| ------------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| `flavour` / `story` | `gather`            | `name`, `description`                                                                                    |
| `gather_item`       | `gather`            | `name`, `description`, `check_name`, `dc`, `item_name`, `total`, optional `bag`                          |
| `skill_check`       | `gather`            | `name`, `description`, `check_name`, `dc`                                                                |
| `saving_throw`      | `gather`            | `name`, `description`, `save_name`, `dc`                                                                 |
| `combat`            | `combat`            | `name`, `description`, `cr`, optional `monster` or monster list, optional `difficulty`                   |
| `ambush`            | `combat`            | `name`, `description`, `cr`, optional `monster` or monster list, optional `difficulty`, optional `dc`    |
| `damage_combat`     | `combat`            | `name`, `description`, `cr`, optional `monster` or monster list, optional `difficulty`, optional `total` |
| `quest`             | `quest`             | `name`, `description`, optional `reward_hint`                                                            |
| `gold`              | `gather`            | `name`, `description`, `total`                                                                           |
| `healing`           | `gather`            | `name`, `description`, `total`                                                                           |
| `healing_check`     | `gather`            | `name`, `description`, `check_name`, `dc`, `total`                                                       |
| `damage`            | `gather`            | `name`, `description`, `total`                                                                           |
| `raw`               | from literal        | `encounter_dict`                                                                                         |

`check_name` accepts the check names understood by `rolls.gvar`: standard skills,
ability checks such as `Strength`, and `Initiative`.
`save_name` accepts standard ability saves plus special saves from `rolls.gvar`
such as `Death`, `Honor`, and `Sanity`.

`gather_item` emits an `outcomes(ectx)` callable so the item is awarded only when
the first resolved roll passes.

Built-in templates keep template-specific expansion logic inside the template
function. Shared helpers are intentionally small:

| Helper | Purpose |
| --- | --- |
| `_args(args, index, default)` / `arg(...)` | Read compact row arguments with defaults. |
| `_display_roll(roll, show_dc=False, show_result=False)` | Format resolved rolls as `{roll.full} **{roll.name}**`, optionally adding DC and Passed/Failed details. |
| `_display_combat(enemies, surprised=None, details=None)` | Format the standard combat announcement block with enemies and surprise/details lines. |

Combat templates set `combat_text` so `encounters.process_encounter` appends the
standard block. `ambush` makes `combat_text` callable and reports the character as
surprised when the first resolved roll fails.

Westmarch conditional templates such as `check_or_damage`, `check_or_gold`,
`check_or_lose_gold`, and `check_or_monsters` need roll-gated outcomes in
`encounters.gvar` before editor rows should emit them. Prefer new templates over
large `raw` rows once a pattern repeats.

## Config-owned templates

Server configs may define additional Drac2 template functions and expose them
through a top-level `encounter_templates` map:

```py
def custom_scene(args):
    title = _arg(args, 0, "Scene")
    description = _arg(args, 1, "A custom owner-authored encounter.")
    return {
        "name": title,
        "description": description,
        "rolls": [{"type": "check", "name": "Survival", "ability": "wis", "dc": "12"}],
        "outcomes": [{"type": "item", "name": "Supplies", "total": 1, "bag": "Forage"}],
        "thumb": "https://example.test/thumb.png",
        "image": "https://example.test/scene.png",
    }

encounter_templates = {
    "custom_scene": custom_scene,
}
```

The function receives `args`, the compact row values after the template id, and
must return an encounter dict. Use `_arg(args, index, default)` to read row values
with optional defaults. Pool tags are matched before the function runs, so routing
fields do not belong in the returned encounter. The editor may also export
`encounter_template_meta` with labels, argument names, required flags, and
defaults; runtime ignores that metadata.

The engine module also exposes `encounter_templates.arg(args, index, default)` for
owner-authored template gvars that import the engine helper instead of defining a
local `_arg`.

Owner templates can also live in a separate workshop gvar. Point config at that
gvar with either:

```py
extensions = {
    "encounter_templates": "<owner-template-gvar-uuid>",
}

# or
encounter_templates_gvar_id = "<owner-template-gvar-uuid>"
```

The external gvar exports the same `encounter_templates` map:

```py
using(env="d83fd033-128f-4b1c-a32c-7a9984ccf766")
using(templates = env.gvars.encounter_templates)

def external_scene(args):
    title = templates.arg(args, 0, "Scene")
    return {"name": title, "description": "A useful detail."}

encounter_templates = {
    "external_scene": external_scene,
}
```

Common return fields:

| Field | Meaning |
| --- | --- |
| `name`, `description` | Main encounter title and body text. |
| `rolls` | Optional check/save/passive roll specs. |
| `outcomes` | Optional sheet changes such as `item`, `gold`, `healing`, `damage`, or `currency`. |
| `thumb`, `image` | Optional embed thumbnail and wide image URLs. |
| `reward` | Quest reward hint. |
| `cr`, `monsters`, `difficulty` | Combat lookup/scaling hints. |

## Usage

```py
using(templates = env.gvars.encounter_templates)

row = [["enc.gather", "forage.gather"], "gather_item", "Wild herbs", "You find useful herbs near a damp hollow.", "Wisdom (Survival)", 12, "Herbs", 1]
enc = templates.expand_row(row)
encounter_result = encounters.process_encounter(enc, character, args)
```

## Not in this module

- Rolling, embed text, sheet changes → [encounters.md](encounters.md)
- Picking from biome rows → [encounter_lists.md](encounter_lists.md) + config biome registry

## Related

- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
- westmarch reference: `encounter_templates.gvar`
