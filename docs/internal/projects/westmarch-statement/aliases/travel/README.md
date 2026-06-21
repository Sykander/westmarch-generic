# Travel — MVP implementation docs

**Config:** `subsystems.travel` · Tier C

Movement, place, and world-state commands. Matches [mvp-commands.md](../../mvp-commands.md) `travel` subsystem (not a separate “status” folder).

## Commands

| # | Command | Doc | Source |
|---|---------|-----|--------|
| 1 | **travel** | [travel.md](travel.md) | westmarch — journeys, areas, paths |
| 2 | **location** | [location.md](location.md) | **new** — read-only current place |
| 3 | **time** | [time.md](time.md) | planned — in-world clock |
| 4 | **weather** | [weather.md](weather.md) | planned — regional weather |

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
        "transport_icons": {"walk": "🚶", "fly": "🪽", "horse": "🐎", "boat": "⛵"},
    },
},
```

Shared engine: **[journeys.gvar](../../gvars/journeys.md)**, **[locations.gvar](../../gvars/locations.md)**, **[paths.gvar](../../gvars/paths.md)**, **[clock.gvar](../../gvars/clock.md)**, **[weather.gvar](../../gvars/weather.gvar)**.

`time` and `weather` remain disabled for the initial release. The aliases return planned-feature setup copy if invoked, and the editor Check page reports an error if either command is enabled.

## Implementation order

1. **travel** + journeys engine  
2. **location** (thin read-only view)  
3. **time** (can parallel once loader exists)  
4. **weather** (uses location + optional time season)

## Related

- [exploration/enc.md](../exploration/enc.md) — journey step completion  
- [economy/buy.md](../economy/buy.md) — optional shop location gates
