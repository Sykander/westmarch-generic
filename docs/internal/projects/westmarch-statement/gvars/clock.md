# clock.gvar

**Path:** `src/gvars/utils/world/clock.gvar` · **Phase:** 1 (Tier C)

Shared **in-world calendar and clock** for **`!time`**. Reads **`world_data.calendars`** on the owner config gvar ([data-shapes.md § Calendar](../data-shapes.md#calendar)).

**Do not** export a Drac2 symbol named **`time`** — Avrae provides **`time()`** builtin ([drac2-avrae-sources](../../../../.cursor/rules/drac2-avrae-sources.mdc)).

## API

```py
def now(config, calendar_id=None):
    """Current in-world instant from unix + calendar tick_rate. Default calendar: primary or sole entry."""

def format_instant(config, instant, calendar_id=None):
    """Player-facing date/time string using calendar.display_format."""

def season(config, instant=None, calendar_id=None):
    """Season name for [weather.md](weather.md); uses calendar.seasons table."""
```

## Calendar source

```py
cfg.world_data.calendars["primary"]
# or location.calendar_id → calendars[that_id]
```

**MVP calculation** — map real unix time to in-world date:

```text
elapsed = time() - calendar.epoch_unix
in_world_seconds = elapsed * calendar.tick_rate
day_index = floor(in_world_seconds / calendar.seconds_per_day)
→ year, month, day, hour, minute from days_per_year + months table
```

| `tick_rate` | Effect |
|-------------|--------|
| **`1.0`** | Real-time clock (1 real second = 1 in-world second) |
| **`86400.0`** | 1 real second = 1 in-world **day** (common table default) |

Multiple calendars — e.g. surface **`primary`** + wildspace **`spelljammer`** — locations set **`calendar_id`** when needed.

Manual-only / GM-set instant without unix mapping — **post-MVP**.

## Policy

| `policies.time.mode` | Behaviour |
|----------------------|-----------|
| **`world_clock`** | **`!time`** uses this module + **`world_data.calendars`** |
| **`manual`** / **`none`** | Alias shows help / narrative-only message |

**`!westmarch check`** warns when **`world_clock`** mode is on but **`world_data.calendars`** is missing.

## Related

- [world_data.md](world_data.md)
- [aliases/travel/time.md](../aliases/travel/time.md)
- [weather.md](weather.md)
