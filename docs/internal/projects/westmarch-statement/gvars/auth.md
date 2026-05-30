# auth.gvar

**Path:** `src/gvars/auth/auth.gvar` · **Phase:** 0

Single gate: may the invoker run **this alias in this channel**? Reads **`ctx`** and server config via [config.md](config.md). No arguments.

## API

```py
def is_allowed():
    """(success, message) — full gate for the running alias."""
```

One public entry point. Role checks, config toggles, and channel rules run **inside** this function (private helpers only — not part of the alias contract).

## Return shape

| Part | Meaning |
|------|---------|
| **`success`** | Is the invocation allowed? |
| **`message`** | Always non-empty — failure reason to show the user, or a short success confirmation |

```py
using(auth = env.gvars.auth)

ok, msg = auth.is_allowed()
if not ok:
    return embed(title="Cannot run command", desc=msg)
```

## Module setup

```py
using(config = env.gvars.config)

DEFAULT_ADMIN_ROLES = ["Dragonspeaker", "Server Aliaser"]

COMMAND_MAP = {
    "enc": ("exploration", "enc", False),
    "forage": ("exploration", "forage", False),
    # … all MVP player aliases (incl. wallet) …
    "westmarch": ("admin", None, True),   # requires_admin — no subsystems toggle
    "setup": ("admin", "setup", True),
    "check": ("admin", "check", True),
    "show": ("admin", "show", True),
}
```

**Admin entries:** third tuple value **`requires_admin=True`** — role check only; **`_check_config_enabled`** is **skipped** (GM hub is not in **`subsystems`**).

**Phase 0 spike:** confirm `ctx.alias` for `!westmarch check`; adjust `_resolve_invocation()` if sub-alias name differs.

## `is_allowed()` — check order

Each step: on failure **return `(False, message)`**; on pass, continue. Final step **return `(True, success_message)`**.

| Step | What | Failure example |
|------|------|-----------------|
| 1 | **`_resolve_invocation()`** — map `ctx.alias` → subsystem, command, `requires_admin` | `(False, "Unknown command.")` |
| 2 | **Guild** — player commands need a guild (`ctx.guild`); admin same | `(False, "This command cannot be run in DMs.")` |
| 3 | **Admin roles** *(only if `requires_admin`)* — Administrator or `admin_roles` / defaults | `(False, "You need Administrator or an aliasing role (…).")` |
| 4 | **Config** — `get_config()` (cached); `subsystems[subsystem].enabled`; command toggle *(player commands only — skip when `requires_admin`)* | `(False, "This server is not configured yet. …")` / disabled messages |
| 5 | **Character** *(player commands when **`policies.auth.require_character`**)* — active Avrae character selected | `(False, "Select a character first.")` |
| 6 | **Channel** — `_check_channel(cfg, …)` using `ctx.channel` | `(False, "Run bot commands in #commands, not in RP channels.")` |
| 7 | **Success** | `(True, "Command allowed.")` |

Admin commands skip step 6 when `cfg.channel_policy.admin_any_channel` is true (default **true**).

**Policy:** **`policies.auth.require_character`** (default **`True`**) — step 5 skipped when **`False`** (narrative / GM-proxy tables only).

### Internal helpers *(not exported to aliases)*

- `_resolve_invocation()` — `ctx.alias` (+ hub arg fallback)
- `_check_admin_roles()` — step 3; calls `get_config()` internally
- `_check_config_enabled(subsystem, command)` — step 4; calls `get_config()` internally
- `_check_character()` — step 5; reads **`policies.auth.require_character`**
- `_check_channel(subsystem, requires_admin)` — step 6; calls `get_config()` internally

## Channel policy *(optional config)*

If **`channel_policy`** is omitted from the server config gvar, **any guild channel** is allowed (step 6 passes).

```py
channel_policy = {
    "admin_any_channel": True,
    "mode": "any",           # "any" | "whitelist" | "blocklist" | "rp_only_commands"
    "whitelist": [],         # channel ids — used when mode == "whitelist"
    "blocklist": [],         # channel ids — used when mode == "blocklist"
    "rp_channel_ids": [],    # for mode == "rp_only_commands"
    "rp_parent_ids": [],     # forum/category parent ids (ctx.channel.parent.id)
    "commands_channel_id": None,  # optional — linked in deny message
}
```

| `mode` | Behaviour |
|--------|-----------|
| **`any`** | Steps 1–4 only (default) |
| **`whitelist`** | `ctx.channel.id` must be in `whitelist` |
| **`blocklist`** | `ctx.channel.id` must not be in `blocklist` |
| **`rp_only_commands`** | If channel is RP (id or parent in RP lists), deny player commands; point to `commands_channel_id` if set *(westmarch-style)* |

Per-subsystem overrides (optional stretch): `channel_policy.by_subsystem.exploration.mode = "whitelist"`.

Uses **`ctx.channel.id`** and **`ctx.channel.parent.id`** when parent exists (forum threads).

## Implementation sketch

```py
def is_allowed():
    subsystem, command, requires_admin = _resolve_invocation()
    if subsystem is None:
        return False, "Unknown command."

    if ctx.guild is None:
        return False, "This command cannot be run in DMs."

    if requires_admin:
        ok, msg = _check_admin_roles()
        if not ok:
            return False, msg
    else:
        ok, msg = _check_config_enabled(subsystem, command)
        if not ok:
            return False, msg
        ok, msg = _check_character()
        if not ok:
            return False, msg

    ok, msg = _check_channel(subsystem, requires_admin)
    if not ok:
        return False, msg

    return True, "Command allowed."
```

## Usage in aliases

Every alias starts with:

```py
using(auth = env.gvars.auth, display = env.gvars.display)

ok, msg = auth.is_allowed()
if not ok:
    return embed(title="…", desc=msg)

get_embed = display.get_display()   # configured get_embed — see display.md
```

**`COMMAND_MAP`** is shared with [display.gvar](display.md) for **`get_display()`** ctx resolution.

No other auth calls needed.

## Tests

Assert `(success, message)` for fixtures: role denied, config off, wrong channel, happy path. Mock `ctx.channel`, `ctx.guild`, `ctx.author` roles.

## Related

- [config.md](config.md) — loader + defaults merge; optional `channel_policy`, `admin_roles`, world data
- [display.md](display.md) — embed branding after gate passes
- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
- [mvp-commands.md](../mvp-commands.md)
