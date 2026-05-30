# Development

## Environments

| Environment | Sourcemap | Purpose |
|-------------|-----------|---------|
| Local | — | Edit and test on your machine with `avrae-ls` |
| Development | `utils/sourcemap.dev.json` | Deploy target for dev workshop |
| Production | `utils/sourcemap.prod.json` | Deploy target for production workshop |

Template sourcemaps ship with **placeholder UUIDs** (`00000000-…`, `11111111-…`). Replace these with real Avrae workshop ids before deploying.

## Local setup

Install:

- [Node.js](https://nodejs.org/)
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
- **Workshop layout** (new alias, snippet, or gvar slot) → edit both `utils/sourcemap.dev.json` and `utils/sourcemap.prod.json`.

### 2. Implement

- Follow `.cursor/rules/` (Drac2 conventions from westmarch and drac2-tools).
- **Core helpers** — copy from drac2-tools into `src/gvars/core/` when needed ([core.md](docs/internal/projects/westmarch-statement/gvars/core.md)); **domain gvars** (e.g. `pc`) port from westmarch and/or drac2-tools and adapt to engine contracts.
- Pair behavior changes with `.alias-test` files where applicable.
- For new gvars, take UUIDs from `unused_gvars.md` (never invent ids).

### 3. Regenerate generated files

After sourcemap changes:

```bash
make rebuild
```

This writes `src/gvars/env.dev.gvar`, `src/gvars/env.prod.gvar`, and `.varfile.json`. Do not hand-edit those outputs.

### 4. Verify

```bash
make test
```

- `npm run test-sourcemaps` — dev/prod sourcemaps stay aligned (names, files, distinct ids).
- `avrae-ls --run-tests src` — alias tests under `src/`.

### 5. Deploy

Uses [publish-avrae](https://www.npmjs.com/package/publish-avrae) via the Deploy GitHub Action (`.github/workflows/deploy.yaml`) and `npm run deploy` with `ENVIRONMENT=Development|Production`.

Before first deploy:

1. Create Avrae workshop slots and paste real UUIDs into sourcemaps.
2. Run `make rebuild`.
3. Confirm `make test` passes.

## Sourcemaps

Publish-avrae reads sourcemaps to know which files map to which aliases, snippets, and gvars.

**Hand-edit:** `utils/sourcemap.dev.json`, `utils/sourcemap.prod.json`, sources under `src/`, `unused_gvars.md`, docs, tests.

**Generated (do not hand-edit):**

| Output | Command |
|--------|---------|
| `src/gvars/env.dev.gvar`, `src/gvars/env.prod.gvar` | `npm run generate-env` |
| `.varfile.json` | `npm run generate-vars` |

See `.cursor/rules/drac2-tools-maintainer.mdc` for UUID hygiene and doc sync expectations (adapted for this repo in future maintainer rule).

## Pull requests

CI runs sourcemap tests and `avrae-ls --run-tests src` (see `.github/workflows/test.yaml`). Fix failures before merge.

## Next steps (project roadmap)

- [ ] Define standard svar names and config gvar schema
- [ ] Port westmarch systems behind svar-gated config loading
- [ ] Document server-owner setup in `docs/`
- [ ] Replace placeholder sourcemap UUIDs with real workshop ids
