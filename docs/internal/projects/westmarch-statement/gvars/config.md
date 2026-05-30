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
    """Resolved 2014 | 2024 — Avrae server settings when available, else "2014". Not on owner config."""

def get_policies():
    """Return merged policies object (cfg.policies after defaults). Convenience for aliases."""
```

No `key` argument — always the full config module (or `None`).

### Defaults at load time

Owner gvars may omit keys. On first load, **`_apply_defaults(cfg)`** fills in any missing top-level fields (and nested **`subsystems`** shape) from engine **`DEFAULTS`**, so later access does not hit missing attributes:

```py
cfg = config.get_config()
cfg.subsystems.exploration.enabled
```

**`DEFAULTS`** lives in **`config.gvar`** — keep in sync with [templates/config/starter.gvar](../../../../templates/config/starter.gvar) and [server-config.md](../server-config.md). Owner values win when set; only **missing** keys are filled.

Shallow + nested merge for MVP:

| Key | Default when omitted |
|-----|----------------------|
| `subsystems` | player-facing subsystems only (exploration, travel, … — **not** admin); nested **`config`** per subsystem |
| `policies` | conservative defaults — manual time/downtime, no auto path costs ([data-shapes.md](../data-shapes.md#server-policies)) |
| `admin_roles` | `None` *(auth uses `DEFAULT_ADMIN_ROLES`)* |
| `channel_policy` | `{ "admin_any_channel": True, "mode": "any", … }` *(see [auth.md](auth.md))* |

### Engine-resolved (not on owner config)

| Concern | Resolution |
|---------|------------|
| **Rules edition** | `get_rules_edition()` — Avrae server settings when exposed in Drac2 (Phase 0 spike); else `"2014"` |
| **Display name** | `ctx.guild.name` (or generic fallback in DMs) for embed footers / admin copy |
| **Schema compatibility** | Structural validation in `!westmarch check`; breaking changes documented per engine release |

World data (`areas`, catalogues, …) stays absent until the owner adds it — defaults cover **schema**, not content tables.

### Why a function, not `config.subsystems` on this gvar?

| Module | What it is |
|--------|------------|
| **Engine `config.gvar`** | Loader + `DEFAULTS` |
| **Server config gvar** | Owner’s workshop module (loaded by UUID) |

**Idiom:**

```py
cfg = config.get_config()
cfg.subsystems.exploration.enabled
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

`_apply_defaults` implementation: iterate `DEFAULTS`; for dict values (e.g. `subsystems`, `policies`), deep-merge missing keys including nested **`config`** objects.

| State | `get_config()` |
|-------|----------------|
| Svar unset | `None` (cached) |
| Svar set, gvar loads | merged config module (cached) |
| Svar set, gvar missing | `None` (cached) |

## Usage

**Gate first** — [auth.is_allowed()](auth.md) (config missing → message there).

```py
using(config = env.gvars.config, auth = env.gvars.auth)

ok, msg = auth.is_allowed()
if not ok:
    return embed(title="…", desc=msg)

cfg = config.get_config()
enabled = cfg.subsystems.exploration.commands.enc
edition = config.get_rules_edition()  # not on cfg module
```

**auth.gvar** calls **`get_config()`** — same cache, same merged object.

**`!westmarch check`** may still **warn** when optional world data is missing even though schema defaults exist.

## Not in this module

- Permission / channel checks → [auth.md](auth.md)
- Validation embeds → [aliases/admin/check.md](../aliases/admin/check.md)

## Tests

- Second `get_config()` returns identical object.
- Partial fixture gvar (empty body except comment) → `get_config().subsystems.exploration` present after defaults merge.

## Related

- [auth.md](auth.md)
- [templates/config/starter.gvar](../../../../templates/config/starter.gvar)
- [mvp-commands.md](../mvp-commands.md)
- [server-config.md](../server-config.md)
