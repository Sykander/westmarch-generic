# Agent notes — westmarch-generic

Avrae Drac2 workshop bootstrap: **`*.gvar`**, **`*.alias`**, **`*.alias-test`**, **`*.snippet`**, plus **`docs/`**, **`README.md`**, **`DEVELOPMENT.md`**.

This repo is a **generic westmarch** — server-specific data should load via **svars → config gvar ids**, not hard-coded constants in aliases.

## Cursor rules

Rules are copied from **westmarch** and **drac2-tools**:

- **westmarch:** `drac2-alias-help.mdc`, `drac2-alias-args.mdc`, `drac2-subset.mdc`, `drac2-avrae-and-avrae-ls.mdc`
- **drac2-tools:** `drac2-avrae-sources.mdc`, `drac2-tools-maintainer.mdc`, `python-drac2-style.mdc`, `gvar-perf-boundaries.mdc`

For full upstream reference caches and perf probe scripts, see the **drac2-tools** repo (`.cursor/avrae-reference/`, `.cursor/scripts/`).

## What to do when changing behavior

1. Update implementation under `src/`.
2. Update **`docs/`** when the public model or API changes.
3. Update **`.alias-test`** files when CI should cover new behavior.
4. After sourcemap edits: **`make rebuild`**, then **`make test`**.

## Tooling

- **Sourcemap tests:** `npm run test-sourcemaps`
- **Drac2 tests:** `avrae-ls --run-tests src` (see `.github/workflows/test.yaml`)
- **Generated files:** `src/gvars/env.*.gvar`, `.varfile.json` — from `make rebuild`; do not hand-edit
- **Workshop UUIDs:** take from **`unused_gvars.md`**; never invent ids (`drac2-tools-maintainer.mdc`)

Template sourcemaps use **placeholder UUIDs** until real Avrae workshop slots are allocated.
