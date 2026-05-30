# weather.gvar

**Path:** `src/gvars/world/weather.gvar` · **Phase:** 1 (Tier C)

Regional **weather display** for **`!weather`** — lookup by area code + optional season from [clock.md](clock.md).

## API

```py
def resolve_area_code(config, character, args):
    """From arg or [journeys.md](journeys.md) location → biome/area code."""

def pick_weather(config, area_code, season="default"):
    """Choose line from config WEATHER tables (deterministic per day+area recommended)."""

def format_embed(config, area_code, weather_text, season=None):
    """Embed body for !weather."""
```

**MVP recommendation:** deterministic pick from **`hash(world_day_index, area_code)`** so weather is stable for the in-world day (testable, no spam rerolls).

Config: **`weather.by_area`** — nested by area code then season (or **`default`**).

## Dependencies

- [journeys.md](journeys.md) / [locations.md](locations.md) — no-arg area resolution
- [clock.md](clock.md) — **`season()`** when **`!time`** enabled; else **`"default"`**

## Related

- [aliases/travel/weather.md](../aliases/travel/weather.md)
