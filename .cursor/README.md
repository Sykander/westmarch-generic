# `.cursor/` — Cursor rules, scripts, and cached upstream docs

Not shipped product documentation (`docs/` is for library consumers). This folder holds **Cursor rules** (`.mdc`), **scripts** (perf probe, reference refresh), and **cached upstream** Avrae / avrae-ls sources for agents editing Drac2 without guessing engine behavior.

## Upstream URL and version metadata

**`.cursor/reference-cache.json`** — single source: RST / raw GitHub **download URLs**, **canonical HTML** (Avrae) or **blob links** (avrae-ls), **`last_fetch`** (ISO date, updated by refresh), and **`tracked_avrae_ls_version`** (bump manually when you validate a new `avrae-ls` release).

Refresh (also rewrites the cached files from those URLs):

```bash
./.cursor/avrae-reference/refresh-avrae-docs.sh
./.cursor/avrae-ls-reference/refresh-avrae-ls-docs.sh
```

Implementation: **`.cursor/scripts/refresh_upstream_reference_cache.py`** (reads/writes `reference-cache.json`). Requirements: **Python 3** (stdlib only).

## Cached docs layout

| Path | Contents |
|------|----------|
| **`.cursor/avrae-reference/aliasing-api.rst.txt`** | Avrae Drac2 / aliasing API (Read the Docs RST mirror) |
| **`.cursor/avrae-reference/automation-reference.rst.txt`** | Avrae automation reference (RST mirror) |
| **`.cursor/avrae-ls-reference/upstream/docs/alias-tests.md`** | `.alias-test` format and CI |
| **`.cursor/avrae-ls-reference/upstream/docs/configuration.md`** | `.avraels.json`, var files, gvar fetch |
| **`.cursor/avrae-ls-reference/upstream/README.md`** | avrae-ls overview (includes **`.gvar-test`**) |

## Perf boundary probing

`python3 .cursor/scripts/probe_perf_boundaries.py` shells to `avrae-ls --run-tests` to binary-search max **`-loops`** / **`-compiles`** one testcase at a time via a gitignored `_probe.*.alias-test`. See **`--help`** and the epilog.

- **Presets:** **`--preset regex`**, **`--preset rolls`**, **`--preset performance_examples`** — dimensions in **`PRESETS`** inside the script; paths still target the drac2-tools **`src/gvars/utils/<name>/`** layout. Use **`--alias-dir`** / **`--stress-alias`** for this repo until local `*-perf` harnesses exist under **`src/gvars/utils/core/`**.
- **Ad hoc:** repeatable **`--dimension 'testcase,param,low,cap[,extra]'`** or **`--dimensions-file`**.

```bash
python3 .cursor/scripts/probe_perf_boundaries.py --preset performance_examples --max-binary 20
python3 .cursor/scripts/probe_perf_boundaries.py --alias-dir src/gvars/utils/core/regex --stress-alias regex-perf --dimension '…'
```

Workflow: **`.cursor/rules/gvar-perf-boundaries.mdc`**.
