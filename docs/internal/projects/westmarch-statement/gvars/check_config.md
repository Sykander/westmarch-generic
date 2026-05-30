# check_config.gvar

**Path:** `src/gvars/check_config/check_config.gvar` · **Phase:** 0–1

**Config validation** for **`!westmarch check`** — svar wiring, schema shape, cross-subsystem rules, and enabled-subsystem data requirements.

Lives here — **not** in [config.gvar](config.md) (load + defaults only) and **not** inline in [check.alias](../aliases/admin/check.md) (thin embed wrapper).

## API

```py
def validate():
    """
    Run all validation rules.

    Returns (errors, warnings) — each a list of player-facing message strings.
    errors block "OK" status; warnings are advisory.
    """
```

Optional helpers *(internal or exported if alias-tests need them)*:

```py
def check_svar():
    """Return (errors, warnings) for westmarch_config svar only — unset, bad UUID, unloadable gvar."""

def check_subsystems(cfg):
    """Shape + toggle consistency on merged config module."""

def check_cross_subsystem(cfg):
    """Policy and subsystem wiring (e.g. enc location mode requires travel)."""
```

**Single public entry for the alias:** **`validate()`** — calls svar checks, then config rules when load succeeds.

## Behaviour

| Input state | `validate()` behaviour |
|-------------|------------------------|
| Svar unset | **errors** — svar not set; skip config body rules |
| Svar set, gvar missing | **errors** — UUID not found |
| Svar set, gvar loads | Run full rule set on **`config.get_config()`** merged module |
| Partial / empty owner body | Defaults already merged by loader — validate merged result |

Uses **`config.get_config()`** with no args — same cache as player aliases. For svar diagnostics, read **`westmarch_config`** directly when distinguishing “unset” vs “set but unloadable” ([config.md](config.md) **`SVAR_NAME`**).

Does **not** mutate svars, gvars, or config.

## Rule ownership

Add new checks in **`check_config.gvar`** (one function or section per subsystem vertical). Keep [aliases/admin/check.md](../aliases/admin/check.md) as the **rule table** and UX spec; implementation lives here.

| Check category | Examples | Doc |
|----------------|----------|-----|
| Svar / load | unset, bad UUID | [check.md](../aliases/admin/check.md) |
| `subsystems` shape | malformed keys, command vs parent off | check.md |
| `exploration.config` | distribution sum, enc_biome_source | [data-shapes.md § exploration.config](../data-shapes.md#explorationconfig) |
| `content.config` | library_topic_source, allowed_topics | [data-shapes.md § content.config](../data-shapes.md#contentconfig) |
| Top-level config | `config_version`, `rules_version`, `display`, embed **`display`** / **`command_display`**, `policies.languages`, `policies.display` | [data-shapes.md § Top-level config](data-shapes.md#top-level-config-fields) |
| Cross-subsystem | location enc without travel; **`world_data`** requirements | [data-shapes.md § Cross-subsystem validation](../data-shapes.md#cross-subsystem-validation) |
| **`world_data`** | locations, paths, transport, calendars, biomes registry | [data-shapes.md § World data](../data-shapes.md#world-data) |
| Policies | downtime tracked ↔ subsystem; crafting ↔ downtime; cooldown **`command_config`**; repeat encounters; combat scaling / roll HP | [data-shapes.md § Server policies](../data-shapes.md#server-policies), [§ Command config](../data-shapes.md#command-config) |
| Extensions | bad `extensions.*` UUID | [data-shapes.md § extensions](data-shapes.md#extensions) |
| **`shops`** | invalid shop/stock shape when economy buy/sell on | [data-shapes.md § Shop](data-shapes.md#shop) |
| Legacy | `subsystems.admin` present | check.md |

## Usage in `check.alias`

```py
using(
    auth = env.gvars.auth,
    check_config = env.gvars.check_config,
)

ok, msg = auth.is_allowed()
if not ok:
    return embed(title="Cannot run command", desc=msg)

errors, warnings = check_config.validate()

title = "Configuration OK" if not errors else "Configuration issues"
# format bullet lists into embed description
```

## Dependencies

- **`config.gvar`** — `get_config()`, `SVAR_NAME`
- **`core/embeds.gvar`** — **`get_embed`**, **`configure_get_embed`**; aliases use **`display.get_display()`** for branded defaults

## Not in this module

- Permission gate → [auth.md](auth.md)
- Config load / defaults merge → [config.md](config.md)
- Read-only config summary → **`!westmarch show`** ([show.md](../aliases/admin/show.md)) — separate gvar or helper TBD

## Tests

- **`.alias-test`** on **`check`** sub-alias — OK fixture, broken fixture, permission denied
- **`check_config.alias`** + **`.alias-test`** *(optional)* — unit branches per rule without full admin alias

## Related

- [aliases/admin/check.md](../aliases/admin/check.md) — command UX and rule table
- [config.md](config.md) — loader only
- [server-config.md](../server-config.md) — validation overview
