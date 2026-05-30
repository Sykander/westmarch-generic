# westmarch — GM hub command

**Subsystem:** admin *(not in config)* · **Phase:** 0–1

**Parent alias** for server-owner tooling. Player game commands stay top-level (`!enc`, `!travel`, …); GM inspection lives under one branded entry point. Always available to admins — **not** toggled via **`subsystems`**.

## Why `!westmarch` (not `!config` / `westmarch_config`)

| Name | Verdict |
|------|---------|
| **`!westmarch`** | **Preferred** — short, branded, lowercase (matches `!enc`, `!forage`); distinct from the **`westmarch_config`** svar name |
| `!westmarch_config` | Accurate but long; reads like a storage key, not a command |
| `!westmarchConfig` | Non-standard on Avrae; avoid camelCase |
| `!config` | Too generic; may collide with other bots or future engine concepts |

The **svar** remains **`westmarch_config`** (Avrae storage). The **command** is **`!westmarch`** (Discord UX). They intentionally differ.

## Subcommands (sourcemap sub-aliases)

Avrae routes `!westmarch <sub>` to nested aliases in the workshop sourcemap. Aliases **cannot** invoke other aliases from Drac2 — sub-aliases are a deploy-time structure, not runtime calls.

| Invocation | Sub-alias | Doc | Purpose |
|------------|-----------|-----|---------|
| `!westmarch` | *(parent)* | this file | Help + subcommand list |
| `!westmarch setup` | `setup` | [setup.md](setup.md) | Onboarding — create gvar, wire svar, verify |
| `!westmarch check` | `check` | [check.md](check.md) | Validate wiring + schema; errors/warnings |
| `!westmarch show [section]` | `show` | [show.md](show.md) | Summarize loaded config with field glossary |

**Who may run:** Discord **Administrator**, or role in `admin_roles` / Avrae defaults (`Dragonspeaker`, `Server Aliaser`). See [README.md](README.md).

### Explicit non-goals (MVP)

- **No in-Discord config editing** — aliases cannot write svars or gvars. **`setup`** prints copy-paste **`!gvar`** / **`!svar`** instructions; the GM runs those manually.
- **No `stats`** — see [README.md](README.md).

## Parent alias behaviour

```
!westmarch
!westmarch help
!westmarch ?
```

Default embed:

- One-line product description
- **New server?** → **`!westmarch setup`**
- **Subcommands:** `setup`, `check`, `show` with one-line descriptions

## Access

**Who may run:** Discord **Administrator**, or role in **`admin_roles`** / Avrae defaults (`Dragonspeaker`, `Server Aliaser`). Enforced in **`auth.is_allowed()`** — no config toggle.

## Sourcemap layout (planned)

```
src/aliases/westmarch/
  westmarch.alias      # parent — help
  setup.alias          # sub-alias
  check.alias          # sub-alias
  show.alias           # sub-alias
```

Shared logic in **[gvars/config.md](../../gvars/config.md)** and **[gvars/auth.md](../../gvars/auth.md)**. Starter template: [src/gvars/configs/starter.gvar](../../../../../src/gvars/configs/starter.gvar).

## Related

- [README.md](README.md) — config storage model (svar → gvar), access control
- [setup.md](setup.md) · [check.md](check.md) · [show.md](show.md)
- [solution-statement.md](../../solution-statement.md) — Option A + C config architecture
