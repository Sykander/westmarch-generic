# encounters.gvar

**Path:** `src/gvars/encounters/encounters.gvar` · **Phase:** 0–1

Run an [encounter dict](../data-shapes.md#encounter-input), apply sheet outcomes, return embed-ready result. Ports westmarch `process_encounters.gvar` as **one public API**.

## API

```py
def process_encounter(encounter, character, args):
    """
    Rolls → resolve callables(ectx) → apply outcomes → return encounter_result.
    See data-shapes.md for encounter, ectx, outcome, and encounter_result shapes.
    """
```

## Pipeline

1. **Rolls** — for each entry in `encounter["rolls"]`, call drac2-tools `rolls.get_roll(...)` with `args` bonuses.
2. **Build `ectx`** — `{ character, rolls, args, encounter }` ([Encounter context](../data-shapes.md#encounter-context--ectx)).
3. **Resolve fields** — `name`, `description`, `cr`, `difficulty`, `monsters`, media — str or `callable(ectx)`.
4. **Combat** — if `cr > 0`, build combat block via monsters helper (port with **hunt**; stub in earliest **enc** slice if needed).
5. **Outcomes** — resolve `outcomes` (static list or `callable(ectx)`), then **`_apply_outcomes(outcomes, character)`** internally.
6. **Return** — [encounter_result](../data-shapes.md#encounter-result--encounter_result) dict (`outcome_text` included).

## Internal: `_apply_outcomes`

Not exported to aliases. MVP types:

| `type` | Fields | Effect |
|--------|--------|--------|
| `damage` | `total` | **`pc.modify_hp(ch, -total)`** |
| `healing` | `total` | **`pc.modify_hp(ch, +total)`** |
| `gold` | `total` | **`pc.modify_gold(ch, total)`** |
| `item` | `name`, `total`, optional `bag` | **`pc.modify_bag(...)`** |
| `currency` | `id`, `total` | **`pc.modify_wallet(ch, id, total)`** |

Defer: `recipe`, `quest`. All mutators return **`(success, message)`** — see [pc.md](pc.md).

## Dependencies

- drac2-tools: `rolls`, `strings`, `lists`
- Engine: [pc.md](pc.md) (outcomes), [monsters.md](monsters.md) (when combat encounters enabled)

## Usage

```py
using(encounters = env.gvars.encounters)

encounter_result = encounters.process_encounter(enc, character, args)
# embed from encounter_result["name"], encounter_result["description"], encounter_result["outcome_text"], …
```

## Not in this module

- Building encounter dicts → [encounter_templates.md](encounter_templates.md)
- Shape definitions → [data-shapes.md](../data-shapes.md)

## Related

- westmarch: `process_encounters.gvar` lines 14–192
