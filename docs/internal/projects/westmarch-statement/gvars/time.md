# time

**Path:** `src/gvars/utils/core/time_utils.gvar` · **Env key:** `env.gvars.time`

Vendored timestamp helpers from drac2-tools, adapted for westmarch-generic.

## Public API

| Function | Purpose |
|----------|---------|
| `get_unix_timestamp(ts=None)` | Supplied timestamp floored to whole Unix seconds, or current Unix timestamp when omitted |
| `get_time(ts=None)` | Duration-style breakdown into `days`, `hours`, `minutes`, `seconds` |
| `get_readable_time(ts=None)` | Human-readable duration text |
| `get_discord_timestamp(ts=None)` | Absolute Discord marker: `<t:unix>` |
| `get_discord_relative_timestamp(ts=None)` | Relative Discord marker: `<t:unix:R>` |
| `get_discord_date_timestamp(ts=None)` | Short-date Discord marker: `<t:unix:d>` |
| `utc_midnight(ts=None)` | Unix timestamp for midnight UTC at the start of `ts`'s day |
| `elapsed_utc_days(start_ts, end_ts=None)` | Whole UTC days elapsed between two timestamps |

Use the explicit Discord helpers instead of hand-building `<t:...>` strings in aliases or domain gvars.
