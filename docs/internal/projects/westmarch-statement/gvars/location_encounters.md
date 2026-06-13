# location_encounters.gvar

**Path:** `src/gvars/utils/world/location_encounters.gvar` · **Phase:** 1 (Tier C+)

Lazy-loaded **place-specific encounter modules** referenced from **`world_data.locations[id].encounters_gvar_id`**. Biome gvars hold **generic wilderness** pools; this module holds **named-place** content — economy, crafting, content, and optional exploration supplements.

See [biome-data-shape-investigation.md §4–5](../biome-data-shape-investigation.md) for why service activities are **not** on biomes.

## Dependencies

```py
using(
    config = env.gvars.config,
    locations = env.gvars.locations,
)
```

## API *(planned)*

```py
def get_location_encounters(location_id, config=None):
    """
    Load and cache location encounter module for location_id.
    Reads locations[id].encounters_gvar_id — workshop UUID.
    Returns module with .pools or None if unset / unloadable.
    """

def get_pool_entries(location_id, activity, kind, config=None):
    """
    List of encounter dicts for activity + kind from loaded location module.
    activity: "enc" | "job" | "buy" | "library" | "craft" | …
    kind: "combat" | "quest" | "gather"
    Returns [] when no module or missing pool key.
    """
```

## Merge with biome pools

[encounter_lists.gvar](encounter_lists.md) combines sources at roll time:

| Activity | Candidate entries |
|----------|-------------------|
| **Exploration & gathering** (`enc`, `forage`, …) | **`biomes.get_pool_entries`** ∪ **`location_encounters.get_pool_entries`** |
| **Service commands** (`job`, `buy`, `library`, …) | Location module only (+ config mechanics — shops, recipes, catalogue) |

Uniform random pick after union. Empty combined list → player-facing error when command requires an encounter beat.

## Body shape

Same **`pools`** tree as [biome gvar body](../data-shapes.md#biome-gvar-body-separate-workshop-module), but **all activity keys** allowed — not limited to exploration.

```py
pools = {
    "enc": { "gather": [ … ] },
    "job": { "gather": [ … ] },
    "buy": { "gather": [ … ] },
    "library": { "gather": [ … ] },
}
```

No `<drac2>` wrapper in owner bodies — valid Draconic module export only.

## Config wiring

```py
"oakwood_settlement": {
    "name": "Oakwood Village",
    "biome": "forest",
    "commands": {
        "enc": ["forest"],
        "job": True,
        "buy": True,
        "library": True,
    },
    "services": ["oakwood_general_store"],
    "library_topics": ["nature", "history", "local"],
    "encounters_gvar_id": "<owner-workshop-uuid>",
}
```

Shops in config **`shops`** should set **`location_id`** to match this location **`id`**.

## Dungeons *(post-MVP)*

Dungeon **availability** is configured on the location (**`dungeon_ids`**) — not on biome or location encounter gvar. Instance combat/progression lives in the dungeon vertical (westmarch-style clears).

## Related

- [locations.md](locations.md) — location lookup
- [biomes.md](biomes.md) — biome pool loader
- [encounter_lists.md](encounter_lists.md) — selection + merge
- [data-shapes.md § Location](../data-shapes.md#location)
- [data-shapes.md § Location encounter module](../data-shapes.md#location-encounter-module-separate-workshop-gvar)
