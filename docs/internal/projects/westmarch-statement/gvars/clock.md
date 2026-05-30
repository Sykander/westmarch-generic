# clock.gvar

**Path:** `src/gvars/world/clock.gvar` · **Phase:** 1 (Tier C)

Shared **in-world calendar and clock** for **`!time`**. Config **`world_clock`** (or **`WORLD_CLOCK`**) supplies epoch and calendar names.

**Do not** export a Drac2 symbol named **`time`** — Avrae provides **`time()`** builtin ([drac2-avrae-sources](../../../../.cursor/rules/drac2-avrae-sources.mdc)).

## API

```py
def now(config):
    """Current in-world instant (derived from real unix + config tick rate)."""

def format_instant(config, instant):
    """Player-facing date/time string."""

def season(config, instant=None):
    """Season name for [weather.md](weather.md); instant defaults to now(config)."""
```

Computation sketch:

```text
elapsed = floor(time()) - config.world_clock.epoch_unix
in_world_seconds = elapsed * tick_rate
→ day_index → year, month, day, hour, minute
```

MVP default: 1 real day = 1 in-world day unless config says otherwise.

## Policy

| `policies.time.mode` | Behaviour |
|----------------------|-----------|
| **`world_clock`** | **`!time`** uses this module + config data |
| **`manual`** / **`none`** | Alias shows help / narrative-only message |

**`!westmarch check`** warns when **`world_clock`** mode is on but config data is missing.

## Related

- [aliases/travel/time.md](../aliases/travel/time.md)
- [weather.md](weather.md)
