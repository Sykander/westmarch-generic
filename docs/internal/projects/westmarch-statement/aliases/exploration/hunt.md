# hunt — MVP implementation

**Subsystem:** exploration · **Toggle:** `subsystems.exploration.commands.hunt` · **Phase:** 1 (Tier C)

Survival check to track a creature before combat. westmarch expects **`!enc`** in the region first (messaging only — not enforced in alias).

## Player-facing behaviour

```
!hunt <creature> [-p party_size] [-n roll_number] [bonuses]
```

- **Help:** enc prerequisite note, usage, group hunt `-n` chaining. No-arg `!hunt` asks for a creature and points to `!hunt help`.
- **Creature:** shared `lists.search_list` semantics over owner rows plus targeted monster shards; no matches, one match, or ask for a more specific name with up to five matches.
- **Location policy:** `subsystems.exploration.config.hunt_location_policy` controls location enforcement. `off` allows any resolved catalogue creature, `location` requires the current location to expose `commands.hunt`, and `monsters` also requires the creature to be listed in `location.huntable_monsters`.
- **Party size:** optional named `-p <party_size>` flag. Positional numbers remain part of the creature query.
- **DC:** `floor((10 if party_size==1 else 8*party_size) + cr)`.
- **Roll:** Survival check.
- **Success:** embed with `!i madd` suggestion for combat init; if monster art exists, show it according to `subsystems.exploration.config.monster_images.hunt`.
- **Group failure:** copy-paste command for next hunter with `-p {party_size} -b {total}[previous] -n {n+1}`.
- **DC visibility:** `subsystems.exploration.config.show_check_dcs.hunt` controls whether public output includes the numeric DC.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/misc/hunt.alias` |
| Alias tests | `westmarch/src/aliases/misc/hunt.alias-test` |
| Monsters | `westmarch/src/gvars/utils/monsters.gvar` — `search_for_monster` |

## Generic architecture

```mermaid
flowchart TD
  A[!hunt alias] --> B{get_config}
  B --> C{exploration.commands.hunt?}
  C --> D{location mode?}
  D -->|yes| E{hunt_location_policy?}
  D -->|no| F[monsters.resolve cfg]
  E -->|off| F
  E -->|location| J{current location commands.hunt?}
  E -->|monsters| K{current location huntable_monsters?}
  J -->|yes| F
  K -->|yes| F
  F --> G[compute DC from CR + party]
  G --> H[survival check]
  H --> I[success / group / fail embed]
```

### Engine vs config split

| Data | Owner |
|------|-------|
| `monsters.gvar` search | **[monsters.gvar](../../gvars/monsters.md)**; catalogue in **config** |
| DC formula | **Engine**; coefficients optional in config `HUNT.dc` |
| Monster art / DC visibility | **Config** under `subsystems.exploration.config` |
| CR from monster entry | **Config** catalogue |

Large monster lists likely need Option C extension gvars ([solution-statement.md](../../solution-statement.md)).

## Prerequisites

- Config loader
- Minimal **MONSTERS** fixture (name, cr, image_url optional)
- Exploration activity cluster optional (messaging references enc)

## Implementation checklist

- [x] Port **`monsters.gvar`** — config-backed search
- [x] **`hunt.alias`** — loader, toggle, group hunt flow, roll-flag-aware creature parsing
- [x] **`hunt.alias-test`** — help, unknown creature, ambiguous creature, hunt smoke, group handoff flags
- [ ] **`rules_edition`** — monster assumptions if catalogue differs

## Related

- [fish.md](fish.md) — prior in exploration sequence (Tier B)
- [loot.md](loot.md) — paired combat loop command
- [README.md](README.md) — exploration subsystem
