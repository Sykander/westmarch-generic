# Admin — MVP implementation docs

**Not in `subsystems`** — GM hub commands are **role-gated only** ([gvars/auth.md](../../gvars/auth.md)). Phase 0–1 (with config loader).

Server-owner tooling under **`!westmarch`**. Uses engine [gvars/config.md](../../gvars/config.md) and [gvars/auth.md](../../gvars/auth.md).

## Config storage (validated architecture)

**Svar pointer → config gvar body** — see [gvars/config.md](../../gvars/config.md). **`!westmarch setup`** prints onboarding steps; aliases do not write svars or gvars.

## GM command hub

| Invocation | Doc | Purpose |
|------------|-----|---------|
| **`!westmarch`** | [westmarch.md](westmarch.md) | Help + subcommand list |
| **`!westmarch setup`** | [setup.md](setup.md) | Onboarding — `!gvar create` / editor, starter body, `!svar westmarch_config` |
| **`!westmarch check`** | [check.md](check.md) | Validate setup |
| **`!westmarch show`** | [show.md](show.md) | Summarize loaded config |

Planned sourcemap: `src/aliases/westmarch/`.

## Access control

Via **`auth.is_allowed()`** — Discord **Administrator** or roles in **`admin_roles`** / engine defaults. No **`subsystems.admin`** toggle — GMs can always run the hub when the engine workshop is subscribed.

## Implementation order

1. [gvars/config.md](../../gvars/config.md) + [gvars/auth.md](../../gvars/auth.md)
2. **`!westmarch setup`**
3. **`check`** · **`show`**

## Related

- [../../mvp-commands.md](../../mvp-commands.md)
- [../../gvars/README.md](../../gvars/README.md)
