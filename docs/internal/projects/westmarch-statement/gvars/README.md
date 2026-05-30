# Engine gvars — implementation docs

Shared **engine workshop** modules under `src/gvars/`. Aliases `using()` these via `env` — they do not contain server world data (that lives in the owner’s config gvar pointed to by `westmarch_config` svar).

**Core utilities** (`commands`, `embeds`, `rolls`, …) are **vendored** from [drac2-tools](https://github.com/Sykander/drac2-tools) into [`src/gvars/core/`](core.md). Domain modules (e.g. **`pc`**) port from westmarch and/or drac2-tools and adapt to this engine’s contracts. See **[core.md](core.md)**.

## Modules

| Gvar | Doc | Phase | Role |
|------|-----|-------|------|
| **core/** *(commands, embeds, rolls, …)* | [core.md](core.md) | 0–1 | Vendored drac2-tools helpers — one workshop, no external `env` UUIDs |
| **config** | [config.md](config.md) | 0 | `get_config()` — lazy cache + defaults merge |
| **auth** | [auth.md](auth.md) | 0 | `is_allowed()` — roles, `subsystems`, channel policy |
| **pc** | [pc.md](pc.md) | 0–1 | Player character state — gp, wallet, bags, downtime, cooldowns |
| **encounter_templates** | [encounter_templates.md](encounter_templates.md) | 0–1 | Build [encounter](../data-shapes.md#encounter-input) dicts |
| **encounter_lists** | [encounter_lists.md](encounter_lists.md) | 0–1 | Pick kind + encounter from config pools |
| **encounters** | [encounters.md](encounters.md) | 0–1 | Rolls, `ectx` callables, outcomes, `encounter_result` |
| **locations** | [locations.md](locations.md) | 1 | Config location lookup + `display_location` |
| **paths** | [paths.md](paths.md) | 1 | Path edge lookup, cost, steps, single-leg display |
| **journeys** | [journeys.md](journeys.md) | 1 | Shortest route, journey/location cvars, `next_step` |
| **clock** | [clock.md](clock.md) | 1 | In-world calendar/clock for `!time` |
| **weather** | [weather.md](weather.md) | 1 | Regional weather for `!weather` |
| **monsters** | [monsters.md](monsters.md) | 1 | Monster catalogue search — hunt, loot, combat |
| **loot** | [loot.md](loot.md) | 1 | Post-combat loot session engine for `!loot` |
| **items** | [items.md](items.md) | 1 | Item / potion / magic item catalogue search |
| **spells** | [spells.md](spells.md) | 1 | Spell catalogue — scribe |
| **shops** | [shops.md](shops.md) | 1 | Buy / sell transactions |
| **library** | [library.md](library.md) | 1 | Book search, comprehension, read display |
| **quests** | [quests.md](quests.md) | 1 | Quest journal cvars |
| **recipe** | [recipe.md](recipe.md) | 1 | Recipe search / format for `!recipe` |

Shared shapes: [data-shapes.md](../data-shapes.md).

## Layout (planned)

```
src/gvars/
  env.dev.gvar / env.prod.gvar
  core/                    # vendored drac2-tools helpers — see core.md
    commands.gvar
    embeds.gvar
    rolls.gvar
    strings.gvar
    lists.gvar
    …
  config/config.gvar
  auth/auth.gvar
  pc/pc.gvar
  encounters/
    encounter_templates.gvar
    encounter_lists.gvar
    encounters.gvar
  world/
    locations.gvar
    paths.gvar
    journeys.gvar
    clock.gvar
    weather.gvar
  catalogues/
    items.gvar
    spells.gvar
    monsters.gvar
  exploration/
    loot.gvar
  economy/
    shops.gvar
  content/
    library.gvar
  misc/
    quests.gvar
    recipe.gvar
```

## Principles

- **Minimal surface** — small functions, no extra layers until a second caller needs them.
- **Server data stays in config gvar** — engine gvars are behaviour only.
- **Vendored core** — copy drac2-tools utilities into `core/`; one workshop subscription for adopters ([core.md](core.md)).
- **Domain ports** — westmarch-specific modules copy relevant upstream code, then wire **`config`**, **`auth`**, **`pc`** ([pc.md](pc.md)).
- **westmarch reference** — world modules port from `westmarch/src/gvars/areas/`; encounters from `process_encounters.gvar`.

## Related

- [core.md](core.md) — vendoring drac2-tools / westmarch into `src/gvars/core/` and domain modules
- [data-shapes.md](../data-shapes.md)
- [server-config.md](../server-config.md)
- [mvp-commands.md](../mvp-commands.md)
