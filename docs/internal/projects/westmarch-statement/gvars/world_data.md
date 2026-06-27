# world_data — config access

**Not a separate engine gvar** — **`world_data`** is a top-level object on the **owner config gvar**, loaded by [config.gvar](config.md). Large locations and paths may live in owner JSON gvars referenced from this object.

Campaign geography and simulation: locations, paths, transport modes, calendars, biome registry. Shapes: [data-shapes.md § World data](../data-shapes.md#world-data).

## Access

```py
cfg = config.get_config()
wd = cfg.world_data
wd.default_location
wd.locations["oakwood"]
wd.locations_gvar_id
wd.paths
wd.paths_gvar_id
wd.transport["horse"]
wd.calendars["primary"]
wd.biomes["forest"].gvar_id
```

Engine gvars read **`world_data`** — they do not duplicate it:

| Module | Reads |
|--------|-------|
| [locations.gvar](locations.md) | **`locations`**, **`locations_gvar_id`**, **`default_location`** |
| [paths.gvar](paths.md) | **`paths`**, **`paths_gvar_id`**, **`transport`** |
| [journeys.gvar](journeys.md) | **`paths`**, **`locations`**, active transport |
| [clock.gvar](clock.md) | **`calendars`**, location **`calendar_id`** |
| [biomes.gvar](biomes.md) | **`biomes`** registry → lazy-load gvar bodies |
| [encounter_lists.gvar](encounter_lists.md) | biome JSON rows via **`biomes.gvar`** |
| [items.gvar](items.md) | **`items`** / **`catalogues.items`** owner item overlays |
| [library.gvar](library.md) | **`books`**, **`book_gvar_ids`**, **`book_gvars`** |

## Travel / location requirement

The web config editor reports an error when **`subsystems.travel`** or **`travel.commands.location`** is on but no location source exists. A location source may be inline **`world_data.locations`** or external **`world_data.locations_gvar_id`**. External world-data pointers are runtime gvar UUIDs; the editor may show shipped preset UUIDs as **`engine:configs/...`** aliases while editing. **`default_location`** is still required and should match an id in the inline or external locations map.

## Related

- [server-config.md](../server-config.md) — owner workflow
- [data-shapes.md](../data-shapes.md)
