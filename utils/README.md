# Utils — build scripts

Node scripts at repo root for **workshop layout** and **catalogue generation**. Run from repository root (`westmarch-generic/`).

Architecture: [docs/internal/projects/westmarch-statement/content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md).

---

## Existing scripts

| Script                                          | Nx target                                                                 | Purpose                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `publish-avrae generate-env`                    | `npx nx run avrae-sourcemaps:generate-env`                                | Write `src/gvars/env.dev.gvar` from the dev sourcemap                                         |
| `publish-avrae generate-env`                    | `npx nx run avrae-sourcemaps:generate-env-prod`                           | Write `src/gvars/env.prod.gvar` from the prod sourcemap                                       |
| [generate-vars.js](generate-vars.js)            | `npx nx run avrae-sourcemaps:generate-vars`                               | Write `.varfile.json` for alias-tests                                                         |
| `publish-avrae check-config` / `compare-config` | `npx nx run avrae-sourcemaps:test`                                        | Dev/prod sourcemap validation and parity                                                      |
| `publish-avrae deploy`                          | `npx nx run avrae-sourcemaps:deploy-dev`, `npx nx run avrae-sourcemaps:deploy-prod` | Publish workshop via sourcemap                                                                |
| [minify-gvar-json.js](minify-gvar-json.js)      | `npm run lint:fix`                                                        | Compact `src/gvars/**/*.gvar.json` after JSON lint/fix so Avrae bodies stay under size limits |

```bash
make build     # run all generators, lint/fix, minify gvar JSON, build env gvars, and refresh .varfile.json
make test      # lint + Nx test targets; Avrae test targets build ignored generated inputs first
```

---

## Catalogue generators _(TSV → gvar shards)_

| Script                                       | Nx target                                             | Input                                  | Output                                                                                                   |
| -------------------------------------------- | ----------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [generate-monsters.js](generate-monsters.js) | `avrae-sourcemaps:generate-monsters`                  | [monsters.tsv](../assets/monsters.tsv) | `monsters_{a-z}.gvar.json`                                                                               |
| [generate-items.js](generate-items.js)       | `avrae-sourcemaps:generate-items`                     | [items.tsv](../assets/items.tsv)       | `items_list.gvar.json`, `potions_list.gvar.json`, `magic_items_list.gvar.json`                           |
| [generate-spells.js](generate-spells.js)     | `avrae-sourcemaps:generate-spells`                    | [spells.tsv](../assets/spells.tsv)     | `spells_list.gvar.json`                                                                                  |
| **`generate-books.js`**                      | `avrae-sourcemaps:generate-books`                     | books-forgotten-realms/real.tsv        | `configs/books/forgotten_realms_{a-o,pq,r-t,v,w}.gvar.json`, plus corpus `*_all`/letter shards as needed |
| [generate-recipes.js](generate-recipes.js)   | `avrae-sourcemaps:generate-recipes`                   | [recipes.tsv](../assets/recipes.tsv)   | `configs/recipes/recipes_list.gvar.json`                                                                 |

```bash
make build     # run all generators, build env gvars, and refresh .varfile.json
```

### Shared library — [utils/lib/](lib/)

| Module                                         | Role                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| [read-tsv.js](lib/read-tsv.js)                 | Parse TSV; skip blanks; warn on column mismatch |
| [write-json-gvar.js](lib/write-json-gvar.js)   | Write JSON array shard body                     |
| [shard-by.js](lib/shard-by.js)                 | Letter / group helpers                          |
| [manifest.js](lib/manifest.js)                 | Log row counts per shard                        |
| [sourcemap-shards.js](lib/sourcemap-shards.js) | Verify generated shards already have dev/prod sourcemap slots |

Generators never allocate UUIDs or edit sourcemaps. New generated shards must be registered manually in both sourcemaps before `make build`.

### Output format

Shard files are **raw JSON arrays** — loaded at runtime with `load_json(get_gvar(uuid))`. Facade gvars map shard keys to **`env.gvars.*`** and lazy-load per lookup.

Generated shard `*.gvar.json` files are ignored and rebuilt from tracked TSV/generator sources. `npm run lint:fix` minifies JSON gvar bodies instead of applying Prettier formatting because whitespace counts against the workshop payload size.

---

## Adding a new generator

1. **TSV schema** — document columns in [assets/README.md](../assets/README.md).
2. **Shard rule** — letter, type, or separate file per corpus; document in [content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md).
3. **Implement** `utils/generate-<name>.js` using **`utils/lib/read-tsv.js`** + **`write-json-gvar.js`**.
4. **Output paths** under `src/gvars/utils/catalogues/` for engine catalogues, or `src/gvars/configs/` for setting-specific data (biomes, books, recipes).
5. **Sourcemap** — manually register engine catalogue shards, deployable split preset JSON gvars, and Forgotten Realms book shards in both sourcemaps using UUIDs from **`unused_gvars.md`**. Generators only verify those slots; they do not edit sourcemaps or consume UUIDs.
6. **Facade** — engine gvar with lazy cache; document API in `docs/internal/projects/westmarch-statement/gvars/`.
7. **Nx target** — add a target to the owning `project.json`; add a matching Make generate target and aggregate `build` target when tests or deploys need the generated output.

---

## Porting from westmarch

Reference implementations:

| westmarch                    | Notes                                                            |
| ---------------------------- | ---------------------------------------------------------------- |
| `utils/generate-monsters.js` | 26 letter shards; filter `name.toLowerCase().startsWith(letter)` |
| `utils/generate-items.js`    | Split on **`type`**: Item / Potion / Magic Item                  |
| `utils/generate-spells.js`   | Single list; coerce **`level`** to number                        |
| `utils/generate-books.js`    | Row shape for library; adapt to forgotten-realms + real TSVs     |

Path layout:

- `public/*.tsv` → **`assets/*.tsv`**
- Engine modules → **`src/gvars/utils/`** (auth, catalogues, world, core, …)
- Server presets → **`src/gvars/configs/`**; engine biome presets are sourcemapped as `biome_<code>`, split preset data gvars may be sourcemapped by name, Forgotten Realms book shards are sourcemapped as `forgotten_realms_*`, and other setting-specific books/recipes stay owner data

Runtime improvement: westmarch **`items.gvar`** loads all three lists at import — generic facades should **lazy-load** per type (see content-pipeline).

---

## UUID hygiene

Same rules as `.cursor/rules/drac2-tools-maintainer.mdc`:

- Never invent UUIDs
- New gvar slot → **`unused_gvars.md`** → sourcemap → **`make build`**
- Do not hand-edit ignored generated outputs such as **`env.*.gvar`**, `.varfile.json`, generated catalogue/book/recipe shards, or `public/`

---

## Related

- [content-pipeline.md](../docs/internal/projects/westmarch-statement/content-pipeline.md)
- [DEVELOPMENT.md](../DEVELOPMENT.md)
- [assets/README.md](../assets/README.md)
