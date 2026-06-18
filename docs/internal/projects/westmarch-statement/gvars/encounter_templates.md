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

Westmarch conditional templates such as `check_or_damage`, `check_or_gold`,
`check_or_lose_gold`, and `check_or_monsters` need roll-gated outcomes in
`encounters.gvar` before editor rows should emit them. Prefer new templates over
large `raw` rows once a pattern repeats.

## Config-owned templates

Server configs may define additional Drac2 template functions and expose them
through a top-level `encounter_templates` map:

```py
def custom_scene(args):
    title = "Scene"
    description = "A custom owner-authored encounter."
    if len(args) > 0:
        title = args[0]
    if len(args) > 1:
        description = args[1]
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
must return an encounter dict. Pool tags are matched before the function runs, so
routing fields do not belong in the returned encounter. The editor may also export
`encounter_template_meta` with labels and argument names; runtime ignores that
metadata.

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
