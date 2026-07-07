# Development

## Environments

| Environment | Sourcemap                   | Purpose                                       |
| ----------- | --------------------------- | --------------------------------------------- |
| Local       | —                           | Edit and test on your machine with `avrae-ls` |
| Development | `utils/sourcemap.dev.json`  | Deploy target for dev workshop                |
| Production  | `utils/sourcemap.prod.json` | Deploy target for production workshop         |

Template sourcemaps use **real workshop UUIDs** from `unused_gvars.md`. The **`workshop.environment`** field must always match the **`env`** gvar slot id in that sourcemap (`env.dev.gvar` in dev, `env.prod.gvar` in prod). Aliases `using(env="…")` reference the **dev** env id for local work.

## Local setup

Install:

- [Node.js 24](https://nodejs.org/)
- [uv](https://docs.astral.sh/uv/) (for `avrae-ls`)
- [Make](https://www.gnu.org/software/make/) (optional convenience)

Environment variables:

- `AVRAE_TOKEN` — required for deploy and for gvar fetch in tests; see [publish-avrae](https://www.npmjs.com/package/publish-avrae#avrae-token)

```bash
npm ci
make test
```

## Development workflow (outline)

### 1. Plan a change

- **Engine code** (aliases, snippets, shared gvars) → edit under `src/`.
- **Server-specific config** → belongs in a config gvar loaded via svar, not hard-coded in aliases.
- **Workshop layout** (new alias, snippet, docs file, or gvar slot) → edit both `utils/sourcemap.dev.json` and `utils/sourcemap.prod.json`.

### 2. Implement

- Follow `.cursor/rules/` (Drac2 conventions; cached Avrae docs in `.cursor/avrae-reference/`).
- **Core helpers** — copy from drac2-tools into `src/gvars/utils/core/` when needed ([core.md](docs/internal/projects/westmarch-statement/gvars/core.md)); **domain gvars** (e.g. `pc`) port from westmarch and/or drac2-tools and adapt to engine contracts.
- Pair behavior changes with **`.alias-test`** or **`.gvar-test`** files where applicable.
- For new gvars, take UUIDs from `unused_gvars.md` (never invent ids).

### 3. Regenerate generated files

After sourcemap changes:

```bash
make build
```

After **TSV catalogue** changes:

```bash
make build
```

This writes `src/gvars/env.dev.gvar`, `src/gvars/env.prod.gvar`, and `.varfile.json`. Do not hand-edit those outputs. Shard bodies under `src/gvars/utils/catalogues/` are **committed JSON** produced by generate scripts — see [content-pipeline.md](docs/internal/projects/westmarch-statement/content-pipeline.md).

### 4. Verify

```bash
make test
```

- `npm run lint` — ESLint/Prettier checks for the repo, including the editor.
- `make sourcemap-test` — runs dev/prod sourcemap validation plus `compare-config`.
- `npm run types` and `npm run editor:test` — editor typecheck and component/domain tests.
- `npm run avrae:test-utils:config`, `catalogues`, `gameplay`, `systems`, plus `npm run avrae:test-aliases:{content,crafting,economy,exploration,travel,westmarch}` — the Avrae test shards used by CI.

### Refresh cached Avrae / avrae-ls docs

When upstream behaviour changes or docs look stale:

```bash
./.cursor/avrae-reference/refresh-avrae-docs.sh
./.cursor/avrae-ls-reference/refresh-avrae-ls-docs.sh
```

See **`.cursor/README.md`** and **`.cursor/reference-cache.json`**. After validating a new `avrae-ls` release, bump **`tracked_avrae_ls_version`** in the JSON.

### 5. Deploy

Uses [publish-avrae](https://www.npmjs.com/package/publish-avrae) through CLI scripts:

```bash
make deploy      # Development
npm run deploy:prod
```

Before first deploy:

1. Create Avrae workshop slots and paste real UUIDs into sourcemaps.
2. Run `make build`.
3. Confirm `make test` passes.

## Versioning and releases

This project uses SemVer-style `MAJOR.MINOR.PATCH` versions from `package.json`.

| Version line          | Meaning                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `1.0.0`               | First public release baseline                                                   |
| `1.0.x`               | Public patch releases: bug fixes, docs, validation fixes, and safe data updates |
| `1.x.0` where `x > 0` | Additive feature releases after the public baseline                             |
| `2.0.0`               | Reserved for breaking config or command contract changes                        |

Release planning lives in `docs/internal/releases/`. Keep the next concrete release doc updated as work lands. Version-specific release docs must follow the template in `docs/internal/releases/README.md`: release tag/link, overview, upgrade steps, breaking changes, new features, bug fixes, performance improvements, and other changes.

Release notes are for server owners, config maintainers, and developers adopting a release. Maintainer-only runbook steps belong in `DEVELOPMENT.md`, not in release-note `Upgrade Steps`.

Backwards compatibility starts at `1.0.0`. Patch and minor releases in the `1.x` line should preserve documented command names, documented argument layouts, and documented config keys. Breaking changes should be held for `2.0.0` unless the old behavior continues to work with a deprecation notice.

CI creates a GitHub Release only when the production tag has a matching `docs/internal/releases/<tag>.md` file. Tags without a matching release doc remain tag-only.

## CI release flow

The unified CI workflow (`.github/workflows/ci.yml`) runs on pushes to `main` only. It does not expose a manual `workflow_dispatch` trigger.

CI runs lint, sourcemap checks, editor typecheck/tests, `avrae-ls` shards, and a live version check against the dev/prod `env` gvars. If checks pass, CI deploys Development.

If `package.json` is higher than the deployed Production `version`, CI then:

1. Deploys Production through `npm run deploy:prod`.
2. Builds and deploys the editor to GitHub Pages.
3. Tags the commit with the package version.
4. Creates a GitHub Release from `docs/internal/releases/<version>.md` when that file exists.

Before tagging a release, run `make build`, run `make test`, and commit generated files only from the build pipeline.

## Sourcemaps

Publish-avrae reads sourcemaps to know which files map to which aliases, snippets, docs, and gvars.

Use `docs_file` for Avrae help text. Alias docs live beside their alias sources under `src/aliases/` and are deployed for aliases and subaliases. Snippet docs should follow the same source-adjacent pattern when snippets are added.

**Hand-edit:** `utils/sourcemap.dev.json`, `utils/sourcemap.prod.json`, sources under `src/`, `unused_gvars.md`, docs, tests.

**Generated (do not hand-edit):**

| Output                                              | Command                 |
| --------------------------------------------------- | ----------------------- |
| `src/gvars/env.dev.gvar`, `src/gvars/env.prod.gvar` | `npm run generate-env`  |
| `.varfile.json`                                     | `npm run generate-vars` from both dev/prod sourcemaps |

See `.cursor/rules/drac2-tools-maintainer.mdc` for UUID hygiene, doc sync, and `.cursor/` reference refresh.

## Project roadmap

Use `docs/internal/releases/` for public release planning, `docs/internal/projects/` for larger design tracks, and `docs/internal/research/` for compatibility reviews and implementation audits. The current next-major roadmap is `docs/internal/releases/2.x.md`.
