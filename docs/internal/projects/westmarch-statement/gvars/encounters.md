# encounters.gvar

**Path:** `src/gvars/utils/encounters/encounters.gvar` · **Phase:** 0–1

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

1. **Build `ectx`** — `{ character, rolls, args, encounter, config, activity, biome, encounter_kind, location... }` ([Encounter context](../data-shapes.md#encounter-context--ectx)).
2. **Rolls** — for each entry in `encounter["rolls"]`, call **`env.gvars.rolls`** **`get_roll(...)`** with `args` bonuses, then append the result to `ectx["rolls"]`.
3. **Resolve fields** — `name`, `description`, `combat_text`, `reward`, media — str or `callable(ectx)`.
4. **Combat** — append `combat_text` when provided; combat templates use `encounter_templates._display_combat(...)` for a standard ANSI-highlighted block. `subsystems.travel.config.combat_add_prompt` may append a `!combat` hint or copyable `!i madd` commands from `encounter["monsters"]`.
5. **Quest hooks** — append a compact quest marker and reward hint when the picked kind is `quest` or the encounter has `reward` / `reward_hint`.
6. **Outcomes** — resolve `outcomes` (static list or `callable(ectx)`), then **`_apply_outcomes(outcomes, character)`** internally.
7. **Return** — [encounter_result](../data-shapes.md#encounter-result--encounter_result) dict (`roll_text`, `rolls`, and `outcome_text` included).

## Internal: `_apply_outcomes`

Not exported to aliases. MVP types:

| `type` | Fields | Effect |
|--------|--------|--------|
| `damage` | `total` | **`pc.modify_hp(ch, -total)`** |
| `healing` | `total` | **`pc.modify_hp(ch, +total)`** |
| `gold` | `total` | **`pc.modify_gold(ch, total)`** |
| `item` | `name`, `total`, optional `bag` | **`pc.modify_bag(...)`** |
| `currency` | `id`, `total` | **`pc.modify_wallet(ch, id, total)`** |

Defer: `recipe`. **`quest`** — when outcome includes **`quest_id`**, call **`quests.activate_from_encounter`** if **`policies.quest.self_assign`** ([quests.md](quests.md)). All mutators return **`(success, message)`** — see [pc.md](pc.md).

## Dependencies

- **`core/`** — `rolls`, `strings`, `lists` via `env.gvars.*` ([core.md](core.md))
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
