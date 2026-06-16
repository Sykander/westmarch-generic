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
enc = encounter_templates.expand_row([["enc.gather"], "flavour", "Wild berries", "You find ripe berries.", "gather"])
```

## Templates (MVP subset)

| Template | Kind | Args |
|----------|------|------|
| `flavour` | `gather` by default | `name`, `description`, optional `kind` |
| `gather_item` | `gather` | `name`, `description`, `check_name`, `dc`, `item_name`, `total`, optional `bag` |
| `skill_check` | `gather` | `name`, `description`, `check_name`, `dc`, optional `success_text`, optional `failure_text` |
| `combat` | `combat` | `name`, `description`, `cr`, optional `monster` or monster list |
| `quest` | `quest` | `name`, `description`, optional `reward_hint` |
| `gold` | `gather` | `name`, `description`, `total` |
| `raw` | from literal | `encounter_dict` |

Add remaining westmarch templates (recipe, story, damage, healing, …) as Tier B exploration needs them. Prefer new templates over large `raw` rows once a pattern repeats.

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
