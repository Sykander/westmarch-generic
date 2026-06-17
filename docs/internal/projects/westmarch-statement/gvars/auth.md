# auth.gvar

**Path:** `src/gvars/utils/auth/auth.gvar` · **Phase:** 0

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
    return embed(desc=msg)
```

## Module setup

```py
using(config = env.gvars.config)

ADMIN_ROLES = ["Dragonspeaker", "Server Aliaser"]
# Avrae aliasing permissions — not in-game GM/DM roles.

COMMAND_MAP = {
    "enc": ("exploration", "enc", False),
    "forage": ("exploration", "forage", False),
    # … all MVP player aliases (incl. wallet) …
    "westmarch": ("admin", None, False),  # player-facing setup status
    "setup": ("admin", "setup", True),
    "show": ("admin", "show", True),
}
```

**Setup hub entries:** **`setup`** and **`show`** use **`requires_admin=True`** — Avrae aliasing role check only; **`_check_command_enabled`** is **skipped**. Bare **`westmarch`** is not admin-gated and handles its own configured player setup checks.

**`ADMIN_ROLES`:** **`Dragonspeaker`** and **`Server Aliaser`** — Discord roles for editing Avrae workshop aliases, gvars, and svars. Not campaign GM/DM authority.

**Post-MVP `COMMAND_MAP` entries:** **`diary`**, **`journal`**, and hub routing for **`journal` + subcommand** → target misc command toggle.

## `is_allowed()` — check order

Each step: on failure **return `(False, message)`**; on pass, continue. Final step **return `(True, success_message)`**.

| Step | What | Failure example |
|------|------|-----------------|
| 1 | **`_resolve_invocation()`** — map `ctx.alias` → subsystem, command, `requires_admin` | `(False, "Unknown command.")` |
| 2 | **Guild** — player commands need a guild (`ctx.guild`); admin same | `(False, "This command cannot be run in DMs.")` |
| 3 | **Avrae aliasing roles** *(only if `requires_admin`)* — engine **`ADMIN_ROLES`** only | `(False, "You need Dragonspeaker or Server Aliaser (Avrae aliasing permissions — not a GM/DM role).")` |
| 4 | **Config** — `get_config()` (cached); `subsystems[subsystem].enabled`; command toggle *(player commands only — skipped for admin subsystem entries)* | `(False, "This server is not configured yet. …")` / disabled messages |
| 5 | **Character** *(player commands when **`policies.auth.require_character`**)* — active Avrae character selected | `(False, "Select a character first.")` |
| 6 | **Channel** — `_check_channel(cfg, …)` using `ctx.channel` | `(False, "Run bot commands in #commands, not in RP channels.")` |
| 7 | **Success** | `(True, "Command allowed.")` |

Admin commands skip step 6 when `cfg.channel_policy.admin_any_channel` is true (default **true**).

**Policy:** **`policies.auth.require_character`** (default **`True`**) — step 5 skipped when **`False`** (narrative / GM-proxy tables only).

### Internal helpers *(not exported to aliases)*

- `_resolve_invocation()` — `ctx.alias` (+ hub arg fallback)
- `_check_admin_roles()` — step 3; **`ADMIN_ROLES`** (`Dragonspeaker`, `Server Aliaser`) via **`ctx.author.get_roles()`** (Avrae) / **`ctx.author.roles`** (avrae-ls mock)
- `_check_command_enabled(subsystem, command)` — step 4; calls `get_config()` internally
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
    elif subsystem != "admin":
        ok, msg = _check_command_enabled(subsystem, command)
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

Nested Avrae subaliases whose runtime ctx still resolves to the parent command pass an explicit command key:

```py
ok, msg = auth.is_allowed("setup")
```

Use this for **`westmarch setup`** and **`westmarch show`** so the admin role gate is enforced even when Avrae reports the parent alias name.

**`COMMAND_MAP`** is shared with [display.gvar](display.md) for **`get_display()`** ctx resolution.

No other auth calls needed.

## Tests

Assert `(success, message)` for fixtures: role denied, config off, wrong channel, happy path. Mock `ctx.channel`, `ctx.guild`, `ctx.author` roles.

## Related

- [config.md](config.md) — loader + defaults merge; optional `channel_policy`, world data
- [display.md](display.md) — embed branding after gate passes
- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
- [mvp-commands.md](../mvp-commands.md)
