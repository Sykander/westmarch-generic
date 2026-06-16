# Agent notes — westmarch-generic

Avrae Drac2 workshop bootstrap: **`*.gvar`**, **`*.alias`**, **`*.alias-test`**, **`*.snippet`**, plus **`docs/`**, **`README.md`**, **`DEVELOPMENT.md`**.

This repo is a **generic westmarch** — server-specific data should load via **svars → config gvar ids**, not hard-coded constants in aliases.

## Cursor rules

Rules are copied from **westmarch** and **drac2-tools**:

- **westmarch:** `drac2-alias-help.mdc`, `drac2-alias-args.mdc`, `drac2-subset.mdc`, `drac2-avrae-and-avrae-ls.mdc`
- **drac2-tools:** `drac2-avrae-sources.mdc`, `drac2-tools-maintainer.mdc`, `python-drac2-style.mdc`, `gvar-perf-boundaries.mdc`

Cached upstream Avrae / avrae-ls docs, refresh scripts, and perf probes live in **`.cursor/`** — see **`.cursor/README.md`** and **`.cursor/reference-cache.json`**.

```bash
./.cursor/avrae-reference/refresh-avrae-docs.sh
./.cursor/avrae-ls-reference/refresh-avrae-ls-docs.sh
```

## What to do when changing behavior

1. Update implementation under `src/`.
2. Update **`docs/`** when the public model or API changes.
3. Update **`.alias-test`** files when CI should cover new behavior.
4. After sourcemap edits: **`make build`**, then **`make test`**.

## What to do when changing config

1. Update the config implementation, fixtures, and validation gvars under `src/`.
2. Update admin-facing config commands that validate or display the shape, especially **`westmarch check`** and **`westmarch show`**.
3. Update the web editor under `editor/` so its model, validation, and UI match the new config shape.
4. Update **`docs/`** and relevant **`.alias-test`** / **`.gvar-test`** coverage for the new config behavior.

## Tooling

- **Sourcemap tests:** `make sourcemap-test` or `npm run sourcemap:dev-check`, `npm run sourcemap:prod-check`, and `npm run sourcemap:compare-check`
- **Drac2 tests:** `avrae-ls --run-tests src` (see `.github/workflows/test.yaml`)
- **Generated files:** `src/gvars/env.*.gvar`, `.varfile.json` — from `make build`; do not hand-edit
- **Workshop UUIDs:** take from **`unused_gvars.md`**; never invent ids (`drac2-tools-maintainer.mdc`)

Template sourcemaps use **placeholder UUIDs** until real Avrae workshop slots are allocated.
