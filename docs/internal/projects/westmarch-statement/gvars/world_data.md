# world_data — config access

**Not a separate gvar** — **`world_data`** is a top-level object on the **owner config gvar**, loaded by [config.gvar](config.md).

Campaign geography and simulation: locations, paths, transport modes, calendars, biome registry. Shapes: [data-shapes.md § World data](../data-shapes.md#world-data).

## Access

```py
cfg = config.get_config()
wd = cfg.world_data
wd.default_location
wd.locations["oakwood"]
wd.paths
wd.transport["horse"]
wd.calendars["primary"]
wd.biomes["forest"].gvar_id
```

Engine gvars read **`world_data`** — they do not duplicate it:

| Module | Reads |
|--------|-------|
| [locations.gvar](locations.md) | **`locations`**, **`default_location`** |
| [paths.gvar](paths.md) | **`paths`**, **`transport`** |
| [journeys.gvar](journeys.md) | **`paths`**, **`locations`**, active transport |
| [clock.gvar](clock.md) | **`calendars`**, location **`calendar_id`** |
| [biomes.gvar](biomes.md) | **`biomes`** registry → lazy-load gvar bodies |
| [encounter_lists.gvar](encounter_lists.md) | biome JSON rows via **`biomes.gvar`** |

## Travel / location requirement

The web config editor reports an error when **`subsystems.travel`** or **`travel.commands.location`** is on but **`world_data.locations`** or **`default_location`** is missing.

## Related

- [server-config.md](../server-config.md) — owner workflow
- [data-shapes.md](../data-shapes.md)
