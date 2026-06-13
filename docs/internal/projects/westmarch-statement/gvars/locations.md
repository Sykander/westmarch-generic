# locations.gvar

**Path:** `src/gvars/utils/world/locations.gvar` · **Phase:** 1 (Tier C)

Look up [locations](../data-shapes.md#location) from **`world_data.locations`**. Config owns **`world_data`**; this module owns resolution and display.

## API

```py
def get_location(config, location_id):
    """Return location dict for id, or None."""

def search_locations(config, query):
    """
    Match by id (exact) or name (case-insensitive substring).
    Returns list — empty, one, or many (caller handles ambiguity).
    """

def get_default_location(config):
    """Return location dict for config.default_location id, or None."""

def display_location(location, mode="full", character=None, include_activities=False):
    """
    Markdown string for embed body.
    mode: "short" | "full"
    """
```

### `display_location` modes

| Mode | Output |
|------|--------|
| **`short`** | Name (+ optional one-line `description`) — for compact `!location`, journey headers |
| **`full`** | Linked title (`link`), character line, `description`, optional `travel_description`, optional activities block when `include_activities=True` |

westmarch reference: `describe_location()` in `travel.alias` — linked `## [Name](link)`, “{character} is in {name}”, activities table when `include_activities`.

```py
using(locations = env.gvars.locations)

cfg = config.get_config()
loc = locations.get_location(cfg, "oakwood")
text = locations.display_location(loc, mode="full", character=character, include_activities=True)
```

## Lookup rules

1. **`get_location(config, location_id)`** — `config.locations.get(location_id)` (after loader merge); inject **`id`** on the returned dict if missing.
2. **`search_locations(config, query)`** — exact id match first; else filter `location.name` containing `query` (case-insensitive). Port `areas.search_for_area()` behaviour.
3. **`get_default_location(config)`** — `get_location(config, config.default_location)`.

Aliases pass **player input** through **`search_locations`**; engine internals use **ids** (paths, cvars keyed by id — TBD in journeys port).

## Not in this module

- Character location cvars / visit counts → **`journeys.gvar`** (planned)
- Path routing → [paths.md](paths.md)
- [location_encounters.md](location_encounters.md) — place-specific encounter modules
- Config load → [config.md](config.md)

## westmarch reference

| westmarch | Generic |
|-----------|---------|
| `areas.gvar` data | Config `locations` |
| `areas.search_for_area(name)` | `search_locations(config, query)` |
| `describe_location()` in alias | `display_location(...)` |

## Related

- [location_encounters.md](../gvars/location_encounters.md) — place-specific encounter modules
- [aliases/travel/location.md](../aliases/travel/location.md)
- [aliases/travel/travel.md](../aliases/travel/travel.md)
