# Utils — build scripts

Node scripts at repo root for **workshop layout** and **catalogue generation**. Run from repository root (`westmarch-generic/`).

Architecture: [docs/internal/projects/westmarch-statement/content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md).

---

## Existing scripts

| Script | npm command | Purpose |
|--------|-------------|---------|
| [generate-env.js](generate-env.js) | `npm run generate-env` | Write `src/gvars/env.{dev,prod}.gvar` from sourcemaps |
| [generate-vars.js](generate-vars.js) | `npm run generate-vars` | Write `.varfile.json` for alias-tests |
| [sourcemap-test.js](sourcemap-test.js) | `npm run test-sourcemaps` | Dev/prod sourcemap parity |
| [deploy.js](deploy.js) | `npm run deploy` | Publish workshop via publish-avrae |

```bash
make rebuild   # generate-env + generate-vars (both envs for dev target)
make test      # sourcemap tests + avrae-ls alias tests
```

---

## Planned — catalogue generators *(TSV → gvar shards)*

Port from [westmarch `utils/`](https://github.com/Sykander/westmarch/tree/main/utils) with updated paths:

| Script | Input | Output directory |
|--------|-------|------------------|
| **`generate-monsters.js`** | [public/assets/monsters.tsv](../public/assets/monsters.tsv) | `src/gvars/catalogues/monsters/{a-z}_monsters.gvar` |
| **`generate-items.js`** | [public/assets/items.tsv](../public/assets/items.tsv) | `src/gvars/catalogues/items/{items,potions,magic_items}_list.gvar` |
| **`generate-spells.js`** | [public/assets/spells.tsv](../public/assets/spells.tsv) | `src/gvars/catalogues/spells/spells_list.gvar` |
| **`generate-books.js`** | [books-fiction.tsv](../public/assets/books-fiction.tsv), [books-real.tsv](../public/assets/books-real.tsv) | `src/gvars/catalogues/books/*.gvar` |
| **`generate-recipes.js`** | [public/assets/recipes.tsv](../public/assets/recipes.tsv) | Snippet for config presets / optional `catalogues/recipes.gvar` |

**Planned aggregate:**

```bash
npm run generate:catalogues
```

### Shared library — `utils/lib/` *(planned)*

| File | Responsibility |
|------|----------------|
| **`read-tsv.js`** | Parse header + rows; normalize `\r`; warn on column mismatch |
| **`write-json-gvar.js`** | Write JSON array body; optional row validator hook |
| **`shard-by.js`** | `groupBy(rows, keyFn)` for letter / type splits |
| **`manifest.js`** | Log row counts per shard; exit non-zero on empty required shards |

### Output format

Shard files are **raw JSON arrays** (westmarch pattern) — loaded at runtime with `load_json(get_gvar(uuid))`. Facade gvars ([monsters.gvar](../docs/internal/projects/westmarch-statement/gvars/monsters.md), etc.) map shard keys to **`env.gvars.*`** and **lazy-load** only the shard needed for the current lookup.

**Do not** concatenate all shards into one generated file — that defeats the split.

---

## Adding a new generator

1. **TSV schema** — document columns in [public/assets/README.md](../public/assets/README.md).
2. **Shard rule** — letter, type, or separate file per corpus; document in [content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md).
3. **Implement** `utils/generate-<name>.js` using **`utils/lib/read-tsv.js`** + **`write-json-gvar.js`**.
4. **Output paths** under `src/gvars/catalogues/` (or `src/gvars/configs/biomes/` for encounter pools).
5. **Sourcemap** — one UUID per new `.gvar` from **`unused_gvars.md`**; run **`make rebuild`**.
6. **Facade** — engine gvar with lazy cache; document API in `docs/internal/projects/westmarch-statement/gvars/`.
7. **npm script** — add to `package.json`; wire optional **`generate:catalogues`** bundle.

---

## Porting from westmarch

Reference implementations:

| westmarch | Notes |
|-----------|--------|
| `utils/generate-monsters.js` | 26 letter shards; filter `name.toLowerCase().startsWith(letter)` |
| `utils/generate-items.js` | Split on **`type`**: Item / Potion / Magic Item |
| `utils/generate-spells.js` | Single list; coerce **`level`** to number |
| `utils/generate-books.js` | Row shape for library; adapt to fiction + real TSVs |

Path renames:

- `public/*.tsv` → **`public/assets/*.tsv`**
- `src/gvars/utils/monsters/` → **`src/gvars/catalogues/monsters/`**
- `src/gvars/utils/items/` → **`src/gvars/catalogues/items/`**

Runtime improvement: westmarch **`items.gvar`** loads all three lists at import — generic facades should **lazy-load** per type (see content-pipeline).

---

## UUID hygiene

Same rules as `.cursor/rules/drac2-tools-maintainer.mdc`:

- Never invent UUIDs
- New gvar slot → **`unused_gvars.md`** → sourcemap → **`make rebuild`**
- Do not hand-edit **`env.*.gvar`**

---

## Related

- [content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md)
- [DEVELOPMENT.md](../DEVELOPMENT.md)
- [public/assets/README.md](../public/assets/README.md)
