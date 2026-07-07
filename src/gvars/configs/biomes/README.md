# Engine preset biomes

**Path:** `src/gvars/configs/biomes/biome_<code>.gvar.json` · **Sourcemap name:** `biome_<code>` · **Phase:** 0–1 *(bodies land incrementally)*

Minimal **wilderness encounter modules** shipped with the westmarch-generic engine workshop. Example configs and new servers reference them via:

```py
world_data = {
    "biomes": {
        "forest": { "gvar_id": "engine:configs/biomes/forest", "name": "Forest" },
    },
}
```

After `publish-avrae create-assets`, **`engine:configs/biomes/forest`** resolves through **`env.gvars.biome_forest`** to this folder’s workshop UUID.

**Scope:** Exploration & gathering only — `enc`, `forage`, `mine`, `fish`, `lumber`. Jobs, shops, libraries, and workshops belong on **locations** ([location encounter modules](../../../docs/internal/projects/westmarch-statement/gvars/location_encounters.md)), not biome presets.

Not to be confused with **`src/gvars/utils/config/`** — the engine **`config.gvar`** loader (`get_config()`).

## Preset codes

| Code | Typical use |
|------|-------------|
| `beach` | Coast, tidal zones |
| `forest` | Temperate woodland |
| `mountain` | Peaks, high trails |
| `cave` | Natural underground |
| `ruins` | Ruined structures, dungeons |
| `road` | Highways, trade routes |
| `urban` | Cities, towns *(wilderness enc at gates — settlements use location gvars)* |
| `river` | Rivers, lakeshores |
| `sea` | Open ocean |
| `plains` | Grassland, farms |
| `desert` | Arid regions |
| `swamp` | Marshes, bayous |
| `sky` | Aerial / high altitude |
| `deep_seas` | Deep underwater |
| `underdark` | Subterranean realms |
| `tundra` | Arctic wastes |
| `jungle` | Tropical forest |
| `volcanic` | Lava fields, calderas |
| `astral` | Spelljammer / wildspace |

## Body shape

Each `.gvar.json` body is a raw **JSON row list**. Rows are `[pool_tags_or_null, "template_name", ...args]`, where pool tags look like `enc.gather` or `forage.gather`. See [data-shapes.md § Biome gvar body](../../../../docs/internal/projects/westmarch-statement/data-shapes.md#biome-gvar-body-separate-workshop-module).

Baseline presets include entries for generic wilderness activity pools: **`enc.combat`**, **`enc.gather`**, **`forage.gather`**, **`fish.gather`**, **`mine.gather`**, and **`lumber.gather`**. Quest hooks belong on named locations through location encounter pools so they can carry stable quest IDs and source-specific context.

## westmarch port notes

Reference westmarch `src/gvars/utils/encounters/biomes/*.gvar` for flavour and encounter ideas. When porting:

- Split legacy **`encounters`** + **`combat_encounters`** into compact rows tagged **`enc.combat`** / **`enc.gather`**
- Route **generic wilderness** beats to biome rows; **named-place** hints (merchants, libraries, jobs) to **location encounter gvars** — see [biome-data-shape-investigation.md §4–5](../../../../docs/internal/projects/westmarch-statement/biome-data-shape-investigation.md)
- Drop d100 list-builder weights — kind mix comes from **`subsystems.exploration.config.distribution`**
- **`enc_encounters`** in westmarch is often empty; **`encounters`** was the real pool — do not copy that structure literally

## Forgotten Realms source notes

The non-forest baseline rows use the [Realms Helps Faerunian Random Encounters by Region and Locale](https://www.realmshelps.net/adventuring/faerun_encounters.shtml) index as broad inspiration for terrain coverage only. Keep copied prose, table weights, and location-specific rows out of these biome presets. The same index is useful later for location encounter modules because it breaks Forgotten Realms encounters out by named regions, roads, marshes, mountains, caves, aquatic zones, frostfell, wastes, and Underdark locales.

Do not add quest-hook rows to biome presets. Broad adventure structure may be referenced by location encounter pools, but keep copied adventure text, boxed text, maps, room keys, NPC blocks, and sequence-specific encounter details out of engine presets.

## Related

- [gvars/biomes.md](../../../../docs/internal/projects/westmarch-statement/gvars/biomes.md) — runtime loader
- [gvars/location_encounters.md](../../../../docs/internal/projects/westmarch-statement/gvars/location_encounters.md) — place-specific pools
- [configs/README.md](../README.md) — example server configs that wire these presets
