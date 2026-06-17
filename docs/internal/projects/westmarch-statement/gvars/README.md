# Engine gvars — implementation docs

Shared **engine workshop** modules under `src/gvars/`. Aliases `using()` these via `env` — they do not contain server world data (that lives in the owner’s config gvar pointed to by `westmarch_config` svar).

**Core utilities** (`commands`, `embeds`, `rolls`, …) are **vendored** from [drac2-tools](https://github.com/Sykander/drac2-tools) into [`src/gvars/utils/core/`](core.md). Domain modules (e.g. **`pc`**) port from westmarch and/or drac2-tools and adapt to this engine’s contracts. See **[core.md](core.md)**.

## Modules

| Gvar | Doc | Phase | Role |
|------|-----|-------|------|
| **core/** *(commands, embeds, rolls, …)* | [core.md](core.md) | 0–1 | Vendored drac2-tools helpers — one workshop, no external `env` UUIDs |
| **config** | [config.md](config.md) | 0 | `get_config()` — lazy cache + defaults merge |
| **display** | [display.md](display.md) | 0 | `get_display()` → configured **`embeds.get_embed`** for ctx |
| **world_data** | [world_data.md](world_data.md) | — | Config shape doc (owner gvar, not engine module) |
| **auth** | [auth.md](auth.md) | 0 | `is_allowed()` — roles, `subsystems`, channel policy |
| **pc** | [pc.md](pc.md) | 0–1 | Player character state — gp, wallet, bags, downtime; cooldown reads from stats |
| **stats** | [stats.md](stats.md) | 0–1 | **`add_log()`** — per-command usage, cooldown timestamps, exploration aggregates |
| **encounter_templates** | [encounter_templates.md](encounter_templates.md) | 0–1 | Build [encounter](../data-shapes.md#encounter-input) dicts |
| **encounter_lists** | [encounter_lists.md](encounter_lists.md) | 0–1 | Kind-first pick + random encounter from biome row tags |
| **encounters** | [encounters.md](encounters.md) | 0–1 | Rolls, `ectx` callables, outcomes, `encounter_result` |
| **biomes** | [biomes.md](biomes.md) | 0–1 | Lazy-load biome gvar bodies from **`world_data.biomes`** |
| **location_encounters** | [location_encounters.md](location_encounters.md) | 1 | Lazy-load place-specific pools from **`encounters_gvar_id`** |
| **locations** | [locations.md](locations.md) | 1 | **`world_data.locations`** lookup + `display_location` |
| **paths** | [paths.md](paths.md) | 1 | **`world_data.paths`**, transport-aware steps |
| **journeys** | [journeys.md](journeys.md) | 1 | Shortest route, journey/location cvars, `next_step` |
| **clock** | [clock.md](clock.md) | 1 | In-world calendar/clock for `!time` |
| **weather** | [weather.md](weather.md) | 1 | Regional weather for `!weather` |
| **monsters** | [monsters.md](monsters.md) | 1 | Monster catalogue search — hunt, loot, combat |
| **loot** | [loot.md](loot.md) | 1 | Post-combat loot session engine for `!loot` |
| **items** | [items.md](items.md) | 1 | Item / potion / magic item catalogue search |
| **spells** | [spells.md](spells.md) | 1 | Spell catalogue — scribe |
| **shops** | [shops.md](shops.md) | 1 | Buy / sell transactions |
| **library** | [library.md](library.md) | 1 | Book search, comprehension, read display |
| **quests** | [quests.md](quests.md) | 1 | Quest log cvars — **`!quest`** |
| **recipe** | [recipe.md](recipe.md) | 1 | Recipe search / format — **`!recipe`** |
| **diary** | [diary.md](diary.md) | post-MVP | Personal RP journal cvars — **`!diary`** |
| **crafting** | *(doc TBD)* | 1 | Shared craft DC / proficiency helpers |
| **configs/** *(example server configs)* | [configs.md](configs.md) | 1+ | Prefab setting modules — FR, generic, Spelljammer; tests + onboarding |

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
  display/display.gvar
  auth/auth.gvar
  pc/pc.gvar
  pc/stats.gvar
  encounters/
    encounter_templates.gvar
    encounter_lists.gvar
    encounters.gvar
  world/
    biomes.gvar
    locations.gvar
    paths.gvar
    journeys.gvar
    clock.gvar
    weather.gvar
  catalogues/
    monsters/              # generate-monsters.js → monsters_{a-z}.gvar.json + monsters_names.gvar.json
    items/                 # generate-items.js → *_list.gvar.json
    spells/
  exploration/
    loot.gvar
  economy/
    shops.gvar
  content/
    library.gvar
  misc/
    quests.gvar
    recipe.gvar
  configs/                 # example server configs + preset bodies — see configs.md
    starter.gvar             # minimal empty schema
    biomes/                  # preset biome JSON row-list bodies — engine:configs/biomes/<code>
    books/                   # generate-books.js — forgotten_realms_*, real_*
    recipes/                 # generate-recipes.js — recipes_list.gvar.json
    forgotten_realms_2014.gvar
    generic_fantasy_2014.gvar
    …
```

## Principles

- **Minimal surface** — small functions, no extra layers until a second caller needs them.
- **Server data stays in config gvar** — engine gvars are behaviour only; example bodies live in **`configs/`** ([configs.md](configs.md)).
- **Vendored core** — copy drac2-tools utilities into `core/`; one workshop subscription for adopters ([core.md](core.md)).
- **Domain ports** — westmarch-specific modules copy relevant upstream code, then wire **`config`**, **`auth`**, **`pc`** ([pc.md](pc.md)).
- **Catalogue data** — TSV → JSON shards via **`utils/generate-*`**; facades lazy-load shards ([content-pipeline.md](../content-pipeline.md)).
- **westmarch reference** — world modules port from `westmarch/src/gvars/areas/`; encounters from `process_encounters.gvar`; catalogue generators from westmarch **`utils/`**.

## Related

- [content-pipeline.md](../content-pipeline.md) — TSV → split catalogue gvars
- Web config editor — validation source of truth for owner configs
- [configs.md](configs.md) — example server presets (`src/gvars/configs/`)
- [core.md](core.md) — vendoring drac2-tools / westmarch into `src/gvars/utils/core/` and domain modules
- [data-shapes.md](../data-shapes.md)
- [server-config.md](../server-config.md)
- [mvp-commands.md](../mvp-commands.md)
