# encounter_templates.gvar

**Path:** `src/gvars/encounters/encounter_templates.gvar` · **Phase:** 0–1

Factory functions that return **[encounter](../data-shapes.md#encounter-input)** dicts (data only). Port from `westmarch/src/gvars/encounters/encounter_templates.gvar`.

Encounter field shapes and **`ectx`** callables: [data-shapes.md](../data-shapes.md).

## API (MVP subset)

Port these first (enough for **enc** / **forage** vertical slice):

| Function | Purpose |
|----------|---------|
| `get_gather_encounter(...)` | Skill check → item outcome |
| `get_gold_encounter(...)` | Simple gp reward |
| `get_damage_encounter(...)` | HP loss |
| `get_ambush_encounter(...)` | Combat setup |

Add remaining westmarch templates (quest, recipe, story, …) as Tier B exploration needs them.

## Usage

```py
using(templates = env.gvars.encounter_templates)

enc = templates.get_gather_encounter(
    item_name="Herbs",
    check="survival",
    dc=12,
    bag="Forage",
)
encounter_result = encounters.process_encounter(enc, character, args)
```

## Not in this module

- Rolling, embed text, sheet changes → [encounters.md](encounters.md)
- Picking from area pools → [encounter_lists.md](encounter_lists.md) + config biome pools

## Related

- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
- westmarch reference: `encounter_templates.gvar`
