# Utils — build scripts

Node scripts at repo root for **workshop layout** and **catalogue generation**. Run from repository root (`westmarch-generic/`).

Architecture: [docs/internal/projects/westmarch-statement/content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md).

---

## Existing scripts

| Script | npm command | Purpose |
|--------|-------------|---------|
| `publish-avrae generate-env` | `npm run generate-env` | Write `src/gvars/env.{dev,prod}.gvar` from sourcemaps |
| [generate-vars.js](generate-vars.js) | `npm run generate-vars` | Write `.varfile.json` for alias-tests |
| `publish-avrae check-config` / `compare-config` | `make sourcemap-test` | Dev/prod sourcemap validation and parity |
| `publish-avrae deploy` | `npm run deploy:dev`, `npm run deploy:prod` | Publish workshop via sourcemap |

```bash
make build     # run all generators, build env gvars, and refresh .varfile.json
make test      # lint + types + sourcemap checks + editor tests + avrae-ls alias tests
```

---

## Catalogue generators *(TSV → gvar shards)*

| Script | npm command | Input | Output |
|--------|-------------|-------|--------|
| [generate-monsters.js](generate-monsters.js) | `npm run generate:monsters` | [monsters.tsv](../assets/monsters.tsv) | `monsters_{a-z}.gvar.json` |
| [generate-items.js](generate-items.js) | `npm run generate:items` | [items.tsv](../assets/items.tsv) | `items_list.gvar.json`, `potions_list.gvar.json`, `magic_items_list.gvar.json` |
| [generate-spells.js](generate-spells.js) | `npm run generate:spells` | [spells.tsv](../assets/spells.tsv) | `spells_list.gvar.json` |
| **`generate-books.js`** | `npm run generate:books` | books-forgotten-realms/real.tsv | `configs/books/{forgotten_realms,real}_all.gvar.json` when empty; else `{corpus}_{a-z}.gvar.json` |
| [generate-recipes.js](generate-recipes.js) | `npm run generate:recipes` | [recipes.tsv](../assets/recipes.tsv) | `configs/recipes/recipes_list.gvar.json` |

```bash
make build     # run all generators, build env gvars, and refresh .varfile.json
```

### Shared library — [utils/lib/](lib/)

| Module | Role |
|--------|------|
| [read-tsv.js](lib/read-tsv.js) | Parse TSV; skip blanks; warn on column mismatch |
| [write-json-gvar.js](lib/write-json-gvar.js) | Write JSON array shard body |
| [shard-by.js](lib/shard-by.js) | Letter / group helpers |
| [manifest.js](lib/manifest.js) | Log row counts per shard |
| [sourcemap-shards.js](lib/sourcemap-shards.js) | Auto-register shards in dev/prod sourcemaps |

Generators register sourcemap slots automatically (two UUIDs per shard from **`unused_gvars.md`**). Then **`make build`**.

### Output format

Shard files are **raw JSON arrays** — loaded at runtime with `load_json(get_gvar(uuid))`. Facade gvars map shard keys to **`env.gvars.*`** and lazy-load per lookup.

---

## Adding a new generator

1. **TSV schema** — document columns in [assets/README.md](../assets/README.md).
2. **Shard rule** — letter, type, or separate file per corpus; document in [content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md).
3. **Implement** `utils/generate-<name>.js` using **`utils/lib/read-tsv.js`** + **`write-json-gvar.js`**.
4. **Output paths** under `src/gvars/utils/catalogues/` for engine catalogues, or `src/gvars/configs/` for setting-specific data (biomes, books, recipes).
5. **Sourcemap** — engine catalogue generators call **`lib/sourcemap-shards.js`**. Engine biome presets are registered manually as id-less `biome_<code>` slots for `publish-avrae create-assets`; setting-specific books and recipes are not registered. Ensure enough UUIDs in **`unused_gvars.md`** before generated shard changes, then **`make build`**.
6. **Facade** — engine gvar with lazy cache; document API in `docs/internal/projects/westmarch-statement/gvars/`.
7. **npm script** — add to `package.json`; add a matching target to the Makefile's Generates section.

---

## Porting from westmarch

Reference implementations:

| westmarch | Notes |
|-----------|--------|
| `utils/generate-monsters.js` | 26 letter shards; filter `name.toLowerCase().startsWith(letter)` |
| `utils/generate-items.js` | Split on **`type`**: Item / Potion / Magic Item |
| `utils/generate-spells.js` | Single list; coerce **`level`** to number |
| `utils/generate-books.js` | Row shape for library; adapt to forgotten-realms + real TSVs |

Path layout:

- `public/*.tsv` → **`assets/*.tsv`**
- Engine modules → **`src/gvars/utils/`** (auth, catalogues, world, core, …)
- Server presets → **`src/gvars/configs/`**; engine biome presets are sourcemapped as `biome_<code>`, while setting-specific books/recipes stay owner data

Runtime improvement: westmarch **`items.gvar`** loads all three lists at import — generic facades should **lazy-load** per type (see content-pipeline).

---

## UUID hygiene

Same rules as `.cursor/rules/drac2-tools-maintainer.mdc`:

- Never invent UUIDs
- New gvar slot → **`unused_gvars.md`** → sourcemap → **`make build`**
- Do not hand-edit **`env.*.gvar`**

---

## Related

- [content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md)
- [DEVELOPMENT.md](../DEVELOPMENT.md)
- [assets/README.md](../assets/README.md)
