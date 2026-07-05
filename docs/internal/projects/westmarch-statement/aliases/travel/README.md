# Travel — MVP implementation docs

**Config:** `subsystems.travel` · Tier C

Movement, place, and world-state commands. Matches [mvp-commands.md](../../mvp-commands.md) `travel` subsystem (not a separate “status” folder).

## Commands

| # | Command | Doc | Source |
|---|---------|-----|--------|
| 1 | **travel** | [travel.md](travel.md) | westmarch — journeys, areas, paths |
| 2 | **location** | [location.md](location.md) | **new** — read-only current place |
| 3 | **time** | [time.md](time.md) | in-world clock |
| 4 | **weather** | [weather.md](weather.md) | regional weather |

## Config

```py
"travel": {
    "enabled": True,
    "commands": {
        "travel": True,
        "location": True,
        "time": False,
        "weather": False,
    },
    "config": {
        "show_arrival_time": False,
        "show_arrival_weather": False,
        "show_shops_on_travel": True,
        "combat_add_prompt": "madd_commands",
        "route_priority": "least_encs",
        "transport_icons": {"walk": "🚶", "fly": "🪽", "horse": "🐎", "boat": "⛵"},
    },
},
```

Shared engine: **[journeys.gvar](../../gvars/journeys.md)**, **[locations.gvar](../../gvars/locations.md)**, **[paths.gvar](../../gvars/paths.md)**, **[clock.gvar](../../gvars/clock.md)**, **[weather.gvar](../../gvars/weather.gvar)**.

Enable `time` only with calendar data and `weather` only with weather-area data. Arrival notes are controlled by `show_arrival_time` and `show_arrival_weather`; local shop price tables in travel output are controlled by `show_shops_on_travel`.
Route choice is controlled by `route_priority`: `least_encs`, `least_travel_time`, `least_cost`, or `custom` with numeric `route_weights`.
Combat encounter follow-up is controlled by `combat_add_prompt`: `madd_commands`, `combat_hint`, or `off`.

## Implementation order

1. **travel** + journeys engine  
2. **location** (thin read-only view)  
3. **time** (can parallel once loader exists)  
4. **weather** (uses location + optional time season)

## Related

- [exploration/enc.md](../exploration/enc.md) — journey step completion  
- [economy/buy.md](../economy/buy.md) — optional shop location gates
