# config.gvar

**Path:** `src/gvars/config/config.gvar` · **Phase:** 0

Load the server’s config gvar via svar **once per alias invocation**, **merge schema defaults**, cache, return the same object on every call.

## Svar

| Name | Value |
|------|-------|
| `westmarch_config` | Gvar UUID string, or unset |

**`SVAR_NAME = "westmarch_config"`**

## API

```py
def get_config():
    """
    Lazy-load server config on first call; apply defaults; return cached module.
    None if svar unset or gvar unloadable.
    """

def get_rules_edition():
    """
    Resolved "2014" | "2024":
    1. cfg.rules_version when set on owner config
    2. Avrae guild/server rules when exposed in Drac2
    3. "2014"
    """

def get_policies():
    """Return merged policies object (cfg.policies after defaults). Convenience for aliases."""
```

Embed branding → [display.gvar](display.md) — **`display.get_display()`** returns **`embeds.configure_get_embed(...)`** for the running command.

No `key` argument — always the full config module (or `None`) from **`get_config()`**.

### Defaults at load time

Owner gvars may omit keys. On first load, **`_apply_defaults(cfg)`** fills in any missing top-level fields (and nested **`subsystems`** shape) from engine **`DEFAULTS`**, so later access does not hit missing attributes:

```py
cfg = config.get_config()
cfg.subsystems.exploration.enabled
cfg.display.name                    # raw owner value; title fallbacks applied inside display.get_display()
cfg.rules_version                   # None → Avrae / 2014 via get_rules_edition()
cfg.policies.languages.allowed      # [] → no language restriction
```

**`DEFAULTS`** lives in **`config.gvar`** — keep in sync with [src/gvars/configs/starter.gvar](../../../../src/gvars/configs/starter.gvar) and [server-config.md](../server-config.md). Example full worlds: [configs.md](configs.md) (`src/gvars/configs/`). Owner values win when set; only **missing** keys are filled.

Shallow + nested merge for MVP:

| Key | Default when omitted |
|-----|----------------------|
| `config_version` | `None` |
| `rules_version` | `None` |
| `display` | `{}` — base layer only; subsystem **`display`** / **`command_display`** optional per [data-shapes § Embed display inheritance](../data-shapes.md#embed-display-inheritance) |
| `subsystems` | player-facing subsystems only (exploration, travel, … — **not** admin); nested **`config`**, optional **`display`** / **`command_display`** per subsystem |
| `policies` | conservative defaults — manual time/downtime, no auto path costs, **`languages.allowed`** `[]`, **`display.footer_behaviour`** `"balanced"` ([data-shapes.md](../data-shapes.md#server-policies)) |
| `admin_roles` | `None` *(auth uses `DEFAULT_ADMIN_ROLES`)* |
| `channel_policy` | `{ "admin_any_channel": True, "mode": "any", … }` *(see [auth.md](auth.md))* |

Top-level field shapes: [data-shapes.md § Top-level config fields](../data-shapes.md#top-level-config-fields).

World data (`areas`, catalogues, …) stays absent until the owner adds it — defaults cover **schema**, not content tables.

### Why a function, not `config.subsystems` on this gvar?

| Module | What it is |
|--------|------------|
| **Engine `config.gvar`** | Loader + `DEFAULTS` |
| **Server config gvar** | Owner’s workshop module (loaded by UUID) |

**Idiom:**

```py
using(config = env.gvars.config, display = env.gvars.display)

cfg = config.get_config()
cfg.subsystems.exploration.enabled
edition = config.get_rules_edition()
get_embed = display.get_display()
```

### Per-invocation cache

```py
SVAR_NAME = "westmarch_config"
_state = {"cfg": None, "loaded": False}

def get_config():
    if not _state["loaded"]:
        _state["loaded"] = True
        uuid = get_svar(SVAR_NAME)
        if uuid:
            raw = _load_config_gvar(uuid)
            _state["cfg"] = _apply_defaults(raw) if raw else None
        else:
            _state["cfg"] = None
    return _state["cfg"]
```

`_apply_defaults` implementation: iterate `DEFAULTS`; for dict values (e.g. `subsystems`, `policies`, `display`), deep-merge missing keys including nested **`config`** objects.

| State | `get_config()` |
|-------|----------------|
| Svar unset | `None` (cached) |
| Svar set, gvar loads | merged config module (cached) |
| Svar set, gvar missing | `None` (cached) |

## Usage

**Gate first** — [auth.is_allowed()](auth.md) (config missing → message there).

```py
using(config = env.gvars.config, auth = env.gvars.auth, display = env.gvars.display)

ok, msg = auth.is_allowed()
if not ok:
    return embed(title="…", desc=msg)

cfg = config.get_config()
enabled = cfg.subsystems.exploration.commands.enc
edition = config.get_rules_edition()
get_embed = display.get_display()
```

**auth.gvar** calls **`get_config()`** — same cache, same merged object.

**`!westmarch check`** ([check_config.gvar](check_config.md)) may still **warn** when optional world data is missing even though schema defaults exist.

## Not in this module

- Permission / channel checks → [auth.md](auth.md)
- Embed display merge, footer policy, Avrae colour normalisation → [display.md](display.md)
- Validation rules → [check_config.md](check_config.md) · [aliases/admin/check.md](../aliases/admin/check.md)

## Tests

- Second `get_config()` returns identical object.
- Partial fixture gvar (empty body except comment) → `get_config().subsystems.exploration` present after defaults merge.
- `rules_version = "2024"` on fixture → `get_rules_edition()` returns `"2024"`.

## Related

- [display.md](display.md) — embed branding for aliases
- [check_config.md](check_config.md)
- [auth.md](auth.md)
- [data-shapes.md](../data-shapes.md) — `display`, embed inheritance, `policies.display`, `rules_version`, `policies.languages`
- [src/gvars/configs/starter.gvar](../../../../src/gvars/configs/starter.gvar)
- [mvp-commands.md](../mvp-commands.md)
- [server-config.md](../server-config.md)
