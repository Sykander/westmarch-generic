# Web config editor problem statement

## Background

westmarch-generic is designed so one reusable Avrae workshop can serve many Discord servers. Server-specific settings live in a `westmarch_config` gvar referenced by server svars. This keeps aliases generic, but it leaves server owners editing a large Drac2/Python-like config body by hand.

That edit surface is powerful but brittle. A typo in a biome id, display colour, command toggle, encounter row, or world-data reference can make commands fail later in Discord. The browser editor is now the source of truth for config validation before a gvar body is exported or published.

## Problem

Server owners need a browser-based way to load, inspect, edit, validate, export, and optionally publish their config gvar without installing local tooling or understanding the whole repository.

The editor must be safe for GitHub Pages static hosting. There is no backend to hide tokens, run server code, or poll deployments. All parsing, editing, validation, export, and optional Avrae API calls must run in the browser.

## Users

| User | Needs |
|------|-------|
| Server owner | Create or update `westmarch_config`, understand errors, export or publish changes |
| Content author | Add encounters, biomes, locations, shops, recipes, and display copy without touching engine aliases |
| Maintainer | Keep the browser validator aligned with the documented config model and avoid duplicating server-specific constants in `src/` |
| Reviewer/deployer | Receive exported gvar bodies and publish them when an author lacks Avrae permissions |

## User goals

- Open a shared link with a `westmarch_config` id prefilled.
- Paste config contents when no token is available.
- Enter an `AVRAE_TOKEN` only when they want browser-side Avrae read or publish.
- See what the config currently contains in a structured, readable UI.
- Switch between guided controls and raw gvar editing for complex sections.
- Build encounters using the compact JSON row format and clear field labels.
- Create and manage biome registry entries and biome gvar bodies.
- Run config checks before export or publish.
- See errors, warnings, and suggested fixes with links back to the relevant fields.
- Export final gvar body or multiple gvar bodies for someone else to deploy.
- Publish back to Avrae when the user has a valid token and update permission.

## Constraints

- GitHub Pages hosts static files only.
- The editor cannot rely on a backend, server env vars, or Node-only packages at runtime.
- `AVRAE_TOKEN` must not be placed in query params, generated links, exports, status logs, or downloadable reports.
- Browser-side Avrae API calls must degrade to paste/export if CORS, auth, or permissions fail.
- Config gvars are Drac2/Python-like source, not guaranteed JSON.
- Browser parsing must be conservative and must not execute arbitrary Drac2.
- Editor source should not live under `src/`, which is reserved for Avrae aliases, snippets, and gvars.
- TSV catalogues now live under root `assets/`; root `public/` is reserved for static web output.

## Non-goals

- Replacing Avrae's ownership or permission model.
- Providing a backend proxy for user tokens.
- Executing arbitrary Drac2 in the browser.
- Publishing engine aliases, snippets, or sourcemapped workshop code from the editor.
- Making every possible custom config callable structurally editable in the first version.

## Success criteria

- A user can load or paste a config, edit common sections, run validation, export a valid gvar body, and understand what remains risky.
- The validation view is the authoritative config-checking surface and gives richer browser guidance than Discord embeds can.
- Raw editor mode preserves unsupported source and makes the structural editor's limitations clear.
- A tokenless user can still inspect pasted content, edit locally, and export.
- A tokened user gets clear read/publish progress and actionable failure messages.
