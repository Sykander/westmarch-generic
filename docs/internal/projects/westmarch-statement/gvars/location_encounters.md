# location_encounters.gvar

**Path:** `src/gvars/utils/world/location_encounters.gvar` · **Phase:** 1

Lazy-loaded **place-specific encounter pools** referenced from **`world_data.locations[id].encounters_gvar_id`** or embedded inline as **`world_data.locations[id].encounters`**. Biome gvars hold **generic wilderness** pools; this module holds **named-place** content such as quest hooks and optional exploration supplements.

See [biome-data-shape-investigation.md §4–5](../biome-data-shape-investigation.md) for why service activities are **not** on biomes.

## Dependencies

```py
using(
    config = env.gvars.config,
    locations = env.gvars.locations,
)
```

## API

```py
def get_location_encounters(location_id, config=None):
    """
    Load and merge encounter pools for location_id.
    Reads locations[id].encounters_gvar_id and locations[id].encounters.
    Returns a pools dict, or {} if unset / unloadable.
    """

def get_pool_entries(location_id, activity, kind, config=None):
    """
    List of encounter dicts for activity + kind from loaded location pools.
    activity: "enc" | "job" | "buy" | "library" | "craft" | …
    kind: "combat" | "quest" | "gather"
    Returns [] when no module or missing pool key.
    """
```

## Merge with biome rows

[encounter_lists.gvar](encounter_lists.md) combines sources at roll time:

| Activity | Candidate entries |
|----------|-------------------|
| **Exploration & gathering** (`enc`, `forage`, …) | **`biomes.get_pool_entries`** ∪ **`location_encounters.get_pool_entries`** |
| **Service commands** (`job`, `buy`, `library`, …) | Location module only (+ config mechanics — shops, recipes, catalogue) |

Uniform random pick after union. For `quest` rolls, location quest entries replace biome quest entries when present so named quest hooks with stable IDs take priority. Empty combined list falls back through the normal encounter kind order, then returns a player-facing error when no encounter beat exists.

## Body shape

Location encounter gvars may export a Drac2 **`pools`** tree, contain JSON with a top-level `pools` object, or contain a raw JSON row list using normal pool tags such as `enc.quest`. Inline location data uses the pools tree under `encounters`. Biome gvars use raw JSON row lists too, but should remain generic combat/gather terrain content ([biome gvar body](../data-shapes.md#biome-gvar-body-separate-workshop-module)).

```py
pools = {
    "enc": { "gather": [ … ] },
    "job": { "gather": [ … ] },
    "buy": { "gather": [ … ] },
    "library": { "gather": [ … ] },
}
```

For Drac2 module bodies, do not wrap the file in `<drac2>`; export `pools` directly. JSON row-list bodies should be plain JSON.

External JSON row-list example:

```json
[
  [
    ["enc.quest"],
    "raw",
    {
      "kind": "quest",
      "name": "Waterdeep: Dragon Heist: Fireball Investigation",
      "description": "A blast in the streets leaves witnesses and rival factions racing for the same answer.",
      "reward_hint": "City Watch notice or faction favor",
      "outcomes": [
        {
          "type": "quest",
          "quest_id": "wdh-fireball-investigation",
          "title": "Fireball Investigation",
          "category": "Waterdeep: Dragon Heist"
        }
      ]
    }
  ]
]
```

Inline location example:

```py
"waterdeep": {
    "name": "Waterdeep",
    "biome": "urban",
    "commands": {"enc": ["urban"]},
    "encounters": {
        "enc": {
            "quest": [
                {
                    "name": "Waterdeep: Dragon Heist: Fireball Investigation",
                    "description": "A blast in the streets leaves witnesses and rival factions racing for the same answer.",
                    "reward_hint": "City Watch notice or faction favor",
                    "outcomes": [
                        {
                            "type": "quest",
                            "quest_id": "wdh-fireball-investigation",
                            "title": "Fireball Investigation",
                            "category": "Waterdeep: Dragon Heist",
                        },
                    ],
                },
            ],
        },
    },
}
```

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
- [biomes.md](biomes.md) — biome row-list loader
- [encounter_lists.md](encounter_lists.md) — selection + merge
- [data-shapes.md § Location](../data-shapes.md#location)
- [data-shapes.md § Location encounter module](../data-shapes.md#location-encounter-module-separate-workshop-gvar)
