# westmarch — setup hub command

**Subsystem:** admin *(not in config)* · **Phase:** 0–1

**Parent alias** for the branded westmarch entry point. Before **`westmarch_config`** is wired it shows setup help. After wiring, bare **`!westmarch`** is player-facing and reports whether the selected character satisfies server-configured setup checks. Admin inspection lives under **`setup`** and **`show`**.

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
| `!westmarch` | *(parent)* | this file | Unwired setup help; wired character setup status |
| `!westmarch setup` | `setup` | [setup.md](setup.md) | Onboarding — create gvar, wire svar, recommendations |
| `!westmarch show [section]` | `show` | [show.md](show.md) | Summarize loaded config with field glossary |

**Who may run:** anyone may run bare **`!westmarch`**. **`setup`** and **`show`** require **`Dragonspeaker`** or **`Server Aliaser`**. See [README.md](README.md).

### Explicit non-goals (MVP)

- **No in-Discord config editing** — aliases cannot write svars or gvars. **`setup`** prints copy-paste **`!gvar`** / **`!svar`** instructions; someone with aliasing permissions runs those manually.
- **No `stats`** — see [README.md](README.md).

## Parent alias behaviour

```
!westmarch
!westmarch help
!westmarch ?
```

When **`westmarch_config`** is unset, the default embed:

- One-line product description
- **New server?** → **`!westmarch setup`** for a Dragonspeaker or Server Aliaser
- Supporting workshop recommendations

When **`westmarch_config`** is set and loadable, the default embed:

- Checks the selected character against **`policies.player_setup`**.
- Shows missing setup actions and passed checks.
- Lists enabled player commands.
- Points server configurers to **`!westmarch show`**.

## Access

Bare **`!westmarch`** is open. **`setup`** and **`show`** are enforced through their explicit **`auth.is_allowed("setup")`** / **`auth.is_allowed("show")`** gates with the configured admin roles.

## Sourcemap layout (planned)

```
src/aliases/westmarch/
  westmarch.alias      # parent — setup help or player setup status
  setup.alias          # sub-alias
  show.alias           # sub-alias
```

Shared logic in **[gvars/config.md](../../gvars/config.md)** and **[gvars/auth.md](../../gvars/auth.md)**. Starter template: [src/gvars/configs/starter.gvar](../../../../../src/gvars/configs/starter.gvar).

## Related

- [README.md](README.md) — config storage model (svar → gvar), access control
- [setup.md](setup.md) · [show.md](show.md)
- [solution-statement.md](../../solution-statement.md) — Option A + C config architecture
