# westmarch-generic

A **configurable Avrae workshop** derived from [westmarch](../westmarch), but designed so server-specific data, areas, and logic are **not baked into the codebase**. Instead, each Discord server configures the bot through **svars** that reference **gvar ids**; loading that gvar loads the corresponding server setup.

This repo is the **generic engine**. Per-server content lives in workshop gvars that server owners maintain (or import from templates).

## Project outline

### Goals

- Ship a reusable westmarch-style ruleset without hard-coded server identity.
- Let server owners opt in via svars (unset = feature off; set to a gvar id = load that server's config).
- Keep the same Avrae / Drac2 tooling patterns as westmarch and [drac2-tools](../drac2-tools).

### Repository layout

| Path | Purpose |
|------|---------|
| `src/aliases/` | Player-facing commands |
| `src/snippets/` | Snippet expansions |
| `src/gvars/` | Workshop globals (`env`, shared utils, per-server config gvars) |
| `utils/sourcemap.*.json` | Deploy source of truth (aliases, snippets, gvar ids) |
| `utils/*.js` | Env/var generation, sourcemap tests, deploy |
| `public/assets/` | TSV catalogues (monsters, items, spells, books) for config generation |
| `docs/` | Design and consumer documentation |
| `.cursor/rules/` | Cursor agent rules (from westmarch + drac2-tools) |

### Configuration model (planned)

1. **Svar** on the Avrae server — either unset or holding a **gvar UUID**.
2. **Gvar** at that UUID — contains server-specific tables (areas, loot, encounters, branding, etc.).
3. **Aliases** read the svar at runtime; if unset, show a sensible default or help; if set, `get_gvar` / `using` loads the config.

### Current status

Bootstrap only: example alias (with sub-alias), snippet, gvar, template sourcemaps with placeholder UUIDs, and basic CI tests. Game systems from westmarch are **not** ported yet. Planned first port: the [MVP command set](docs/internal/projects/westmarch-statement/mvp-commands.md) (23 commands — see doc for full list).

## Documentation

- [docs/README.md](docs/README.md) — concept and configuration model
- [DEVELOPMENT.md](DEVELOPMENT.md) — local setup, sourcemaps, deploy workflow
- [unused_gvars.md](unused_gvars.md) — spare workshop gvar UUIDs (empty until you allocate real ids)

## Related projects

- **westmarch** — original server-specific implementation
- **drac2-tools** — shared Drac2 utility libraries and Avrae project patterns
