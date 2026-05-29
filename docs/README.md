# Documentation

## What is westmarch-generic?

**westmarch-generic** is a configurable version of the [westmarch](../westmarch) Avrae ruleset. The original westmarch project encodes one server's areas, loot tables, encounters, and bespoke logic directly in the repository. This project separates:

- **Engine** — aliases, snippets, and shared libraries that implement game mechanics.
- **Configuration** — per-server data loaded at runtime from workshop gvars.

## Configuration via svars

Server owners configure their instance without forking the codebase.

### Flow

```mermaid
flowchart LR
  Svar["Server svar\n(unset or gvar UUID)"]
  Alias["Alias / snippet"]
  Gvar["Config gvar\n(server setup)"]
  Svar --> Alias
  Alias -->|"get_gvar / using"| Gvar
```

1. An **svar** on the Discord server holds either nothing (feature disabled / default) or a **gvar UUID**.
2. When a player runs a command, the alias reads the svar.
3. If set, the alias loads the **config gvar** and uses that server's areas, tables, strings, flags, and rules edition.

### Rules edition (2014 vs 2024)

Config gvars include **`RULES_EDITION`** (`"2014"` or `"2024"`) so the engine knows which D&D 5e revision your tables use (crafting DCs, skills, spells, etc.). If you omit it, the engine may infer from your Avrae server settings when possible; otherwise it defaults to **`"2014"`** (westmarch reference data). You do not need a separate westmarch svar for edition—set it once on your config gvar. Details: [westmarch-statement / solution](internal/projects/westmarch-statement/solution-statement.md#rules-edition-2014-vs-2024).

### Design principles

- **Unset svar** — safe default: help text, "not configured", or no-op.
- **Set svar** — load external config; no server-specific constants in engine code.
- **One gvar per server config** (or a small documented set) — keeps ownership clear for server admins.

## Repository areas

| Area | Role |
|------|------|
| `public/assets/` | TSV catalogues (monsters, items, spells, books) → config/gvar source data |
| `src/aliases/` | Commands players invoke in Discord |
| `src/snippets/` | Text expansion before alias logic runs |
| `src/gvars/example/` | Placeholder config gvar (bootstrap only) |
| `src/gvars/utils/` | Shared libraries (future; may pull from drac2-tools) |

## Example artifacts (bootstrap)

The repo includes minimal examples wired in the template sourcemaps:

- **`example` alias** with **`sub`** sub-alias — demonstrates sourcemap nesting.
- **`example` snippet** — minimal snippet expansion.
- **`example` gvar** — stand-in for a server config module (`SERVER_NAME`, `ENABLED`).

These are **not** production game content; they exist to validate tooling and document patterns.

## Further reading

- [README.md](../README.md) — project overview and outline
- [DEVELOPMENT.md](../DEVELOPMENT.md) — setup, tests, deploy
- [internal/](internal/) — developer-only docs (project framing, design notes)
- [westmarch](../westmarch) — reference implementation
- [drac2-tools](../drac2-tools) — Drac2 utilities and Avrae project conventions

## Planned documentation

- Svar naming convention and registry
- Config gvar schema (areas, encounters, economy, etc.) — see [westmarch-statement MVP](internal/projects/westmarch-statement/mvp-commands.md)
- Server-owner setup guide
- Migration notes from monolithic westmarch
