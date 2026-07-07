# Admin — MVP implementation docs

**Not in `subsystems`** — setup/show commands are **Avrae aliasing role-gated only** ([gvars/auth.md](../../gvars/auth.md)). Bare **`!westmarch`** is player-facing once **`westmarch_config`** is wired. Phase 0–1 (with config loader).

Server setup tooling under **`!westmarch`**. Uses engine [gvars/config.md](../../gvars/config.md) and [gvars/auth.md](../../gvars/auth.md).

## Avrae aliasing roles

**`Dragonspeaker`** and **`Server Aliaser`** are the roles required to run **`!westmarch setup`** and **`!westmarch show`**.

## Config storage (validated architecture)

**Svar pointer → config gvar body** — see [gvars/config.md](../../gvars/config.md). **`!westmarch setup`** prints onboarding steps; aliases do not write svars or gvars.

## Setup command hub

| Invocation | Doc | Purpose |
|------------|-----|---------|
| **`!westmarch`** | [westmarch.md](westmarch.md) | Unwired setup help; wired player character setup status |
| **`!westmarch setup`** | [setup.md](setup.md) | Onboarding — `!gvar create` / editor, starter body, `!svar westmarch_config` |
| **`!westmarch show`** | [show.md](show.md) | Summarize loaded config |

Planned sourcemap: `src/aliases/westmarch/`.

## Access control

Via explicit **`auth.is_allowed("setup")`** / **`auth.is_allowed("show")`** gates — **`setup`** and **`show`** require **`Dragonspeaker`** or **`Server Aliaser`**. Bare **`!westmarch`** is intentionally open so players can see setup status for their selected character. No **`subsystems.admin`** toggle.

## Implementation order

1. [gvars/config.md](../../gvars/config.md) + [gvars/auth.md](../../gvars/auth.md)
2. **`!westmarch setup`**
3. **`show`** · bare **`!westmarch`** player setup status

## Related

- [../../mvp-commands.md](../../mvp-commands.md)
- [../../gvars/README.md](../../gvars/README.md)
