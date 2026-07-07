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
| `src/aliases/` | Player-facing commands and their deployed Markdown help docs |
| `src/snippets/` | Snippet expansions |
| `src/gvars/` | Workshop globals (`env`, shared utils, per-server config gvars) |
| `editor/` | React/Vite web config editor source |
| `utils/sourcemap.*.json` | Deploy source of truth (aliases, snippets, gvar ids) |
| `utils/*.js` | Env/var generation and TSV → catalogue shards ([utils/README.md](utils/README.md)); sourcemap checks/deploys use the `publish-avrae` CLI |
| `assets/` | TSV catalogues - input to **`utils/generate-*`** ([content-pipeline](docs/internal/projects/westmarch-statement/content-pipeline.md)) |
| `public/` | Generated static GitHub Pages output for the editor |
| `docs/` | Design and consumer documentation |
| `.cursor/` | Agent rules, cached Avrae/avrae-ls docs, refresh and perf scripts |

### Configuration model

1. **Svar** on the Avrae server — either unset or holding a **gvar UUID**.
2. **Gvar** at that UUID — contains server-specific tables (areas, loot, encounters, branding, etc.).
3. **Aliases** read the svar at runtime; if unset, show a sensible default or help; if set, `get_gvar` / `using` loads the config.

### Current status

Workshop layout includes player aliases plus **`westmarch setup`** and **`westmarch show`** admin subcommands, dev/prod sourcemaps with UUIDs from **`unused_gvars.md`**, and source-adjacent workshop help docs. The web config editor at <https://sykander.github.io/westmarch-generic/> is the config validation surface.

## Documentation

- [docs/setup.md](docs/setup.md) — server-owner adoption guide
- [docs/guides/initial-channel-texts.md](docs/guides/initial-channel-texts.md) — initial Discord channel text templates
- [docs/README.md](docs/README.md) — concept and configuration model
- [DEVELOPMENT.md](DEVELOPMENT.md) — local setup, sourcemaps, deploy workflow
- [unused_gvars.md](unused_gvars.md) — spare workshop gvar UUIDs (empty until you allocate real ids)

## Related projects

- **westmarch** — original server-specific implementation
- **drac2-tools** — shared Drac2 utility libraries and Avrae project patterns
