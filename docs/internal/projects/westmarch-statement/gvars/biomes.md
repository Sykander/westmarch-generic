# biomes.gvar

**Path:** `src/gvars/utils/world/biomes.gvar` · **Phase:** 0–1

**Biome registry resolution**, lazy-loaded biome bodies, and **biome code selection** for exploration activity commands. Biome bodies are **large** — stored in separate workshop gvars referenced from **`world_data.biomes`**, not inline in server config.

**Scope:** Biome pools hold **generic wilderness** content only (`enc`, `forage`, `mine`, `fish`, `lumber`, `hunt`). Economy, crafting, content, and dungeons are **location-scoped** — see [location_encounters.gvar](location_encounters.md).

**[encounter_lists.gvar](encounter_lists.md)** calls **`get_pool_entries`** after choosing encounter **kind** — merges with location pools when present.

## Dependencies

```py
using(
    config = env.gvars.config,
    locations = env.gvars.locations,   # Phase 1 — location inference
    journeys = env.gvars.journeys,     # Phase 1 — character location cvar
)
```

**`locations`** / **`journeys`** used only when **`enc_biome_source`** resolves to **inferred** (location) mode.

## API

```py
def list_biomes(config=None):
    """
    Return sorted biome codes from world_data.biomes registry.
    Each entry is a code string (e.g. "forest", "cave").
    config defaults to config.get_config().
    """

def get_biome(code, config=None):
    """
    Load and cache biome module for code.
    Resolves world_data.biomes[code].gvar_id — workshop UUID or engine:configs/biomes/<code>.
    Returns biome module with .pools or None if missing / unloadable.
    """

def get_pool_entries(code, activity, kind, config=None):
    """
    List of encounter dicts for activity + kind from loaded biome.
    activity: "enc" | "mine" | "forage" | "fish" | "lumber" | "hunt"
    kind: "combat" | "quest" | "gather"
    """

def resolve_biome(activity, args, character, config=None):
    """
    Resolve biome code for an exploration activity command.

    activity — "enc" | "forage" | "mine" | "fish" | "lumber" | "hunt"
    args — alias args string (positional biome arg when in manual mode)
    character — Avrae character (location cvar for inferred mode)

    Reads exploration.config.enc_biome_source — applies to ALL exploration
    activity commands (not enc-only). See data-shapes § enc_biome_source.

    Returns (biome_code, error_message).
    biome_code is None when resolution fails; error_message is player-facing.
    """
```

### `resolve_biome` behaviour

Effective mode comes from **`enc_biome_source`** ([data-shapes § exploration.config](../data-shapes.md#explorationconfig)):

| Config value | Effective mode | Player UX |
|--------------|----------------|-----------|
| **`argument`** | Manual — player supplies biome code | `!enc forest`, `!forage forest`, … |
| **`location`** | Inferred — biome from character location | `!enc`, `!forage`, … (no biome arg) |
| **`auto`** *(default)* | Inferred when location data available; else manual | Adapts to server setup |

**`auto` resolution** — use **inferred** when **all** of:

- **`subsystems.travel.enabled`**
- **`travel.commands.location`** on
- **`world_data.locations`** non-empty
- Character has resolvable location (via **`journeys.gvar`**)

Otherwise use **manual** — first positional arg must be a registered biome code.

**Inferred path:**

1. Character location id → **`journeys.get_location(character)`** (or equivalent)
2. **`world_data.locations[id]`** → **`activities[activity]`** first entry, else **`location.biome`**
3. Validate code exists in **`world_data.biomes`**

**Manual path:**

1. Parse first token from **`args`** as biome code
2. Validate against **`world_data.biomes`**
3. Error with **`list_biomes()`** hint when missing/unknown

Activity aliases call **`resolve_biome("<activity>", args, ch, cfg)`** then **`encounter_lists.get_encounter(biome, activity, …)`**.

## Registry *(owner config)*

```py
world_data = {
    "biomes": {
        "forest": {
            "gvar_id": "engine:configs/biomes/forest",
            "name": "Forest",
        },
        "cave": {
            "gvar_id": "<owner-workshop-uuid>",
            "name": "Custom caves",
        },
    },
}
```

| `gvar_id` form | Resolution |
|----------------|------------|
| UUID string | Load owner workshop gvar |
| **`engine:configs/biomes/<code>`** | Engine preset under [src/gvars/configs/biomes/](../../../../src/gvars/configs/biomes/README.md) |

## Biome gvar body

```py
pools = {
    "enc": {
        "combat": [ { "kind": "combat", "name": "…", "cr": "1", "monsters": ["Wolf"], … }, … ],
        "quest": [ … ],
        "gather": [ … ],
    },
    "mine": { "gather": [ … ] },
    "forage": { "gather": [ … ] },
    "fish": { "gather": [ … ] },
    "lumber": { "gather": [ … ] },
    "hunt": { "combat": [ … ] },
}
```

See [data-shapes.md § Biome gvar body](../data-shapes.md#biome-gvar-body-separate-workshop-module).

westmarch **`encounters`** mega-pool + d100 **`get_encounter_list`** — **not** ported. Place-specific service content → [location encounter module](../data-shapes.md#location-encounter-module-separate-workshop-gvar).

## Cache

Per alias invocation — first **`get_biome("forest")`** loads once; subsequent calls reuse the module.

## Related

- [location_encounters.md](location_encounters.md) — place-specific pools
- [encounter_lists.md](encounter_lists.md) — kind selection + merge + random pick
- [encounters.md](encounters.md) — run chosen encounter
- [stats.md](stats.md) — command usage after encounter
- [locations.md](locations.md) — location lookup for inferred mode
- [journeys.md](journeys.md) — character location cvar
- [data-shapes.md § World data](../data-shapes.md#world-data)
- [biome-data-shape-investigation.md](../biome-data-shape-investigation.md)
- [src/gvars/configs/biomes/README.md](../../../../src/gvars/configs/biomes/README.md) — engine presets
