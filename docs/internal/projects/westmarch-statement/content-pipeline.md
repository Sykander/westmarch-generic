# Content pipeline — TSV → gvars

How **reference catalogues** in [public/assets/](../../../public/assets/README.md) become **workshop gvar bodies** under `src/gvars/`, and how **runtime** loads only the shards it needs.

Maintainer scripts live in **[utils/README.md](../../../utils/README.md)**. This doc is the architecture; that file is the command reference.

---

## Goals

| Goal | Approach |
|------|----------|
| Editors use spreadsheets | TSV in **`public/assets/`** (Google Sheets → export) |
| Gvars stay under size limits | **Split shards** — same strategy as [westmarch](https://github.com/Sykander/westmarch) (`a_monsters`, `items_list`, …) |
| Lookups stay fast | **Lazy load** one shard per search — do not import every catalogue at alias start |
| Server owners customize | Engine presets + optional owner overrides via config **`extensions.*`** or duplicated shards |
| Reproducible builds | **`npm run generate:*`** from TSV — committed outputs, CI diff optional later |

**Not in scope for generate utils:** owner **`world_data`** (locations, paths, …) — authored in config gvar or example presets; biomes are separate lazy gvars ([biomes.md](gvars/biomes.md)), not inlined from TSV in MVP.

---

## Pipeline overview

```mermaid
flowchart LR
  TSV["public/assets/*.tsv"]
  GEN["utils/generate-*.js"]
  SHARD["src/gvars/catalogues/**.gvar"]
  SM["sourcemap + unused_gvars UUIDs"]
  WS["Avrae workshop"]
  FACADE["Engine facade gvar e.g. monsters.gvar"]
  ALIAS["Alias / engine gvar lookup"]

  TSV --> GEN --> SHARD --> SM --> WS
  SHARD --> FACADE --> ALIAS
```

1. **Edit** TSV (or copy from westmarch — see [public/assets/README.md](../../../public/assets/README.md)).
2. **Run** generate script(s) — writes shard **bodies** to `src/gvars/`.
3. **Register** new shard files in **`utils/sourcemap.*.json`** with UUIDs from **`unused_gvars.md`**; **`make rebuild`**.
4. **Deploy** workshop — facades resolve shards via **`env.gvars.*`** at runtime.

Generate scripts are **Node** (repo root), same toolchain as **`generate-env.js`**. They do **not** run inside Avrae.

---

## Shard layout *(westmarch-aligned, improved runtime)*

Large lists are **never** one monolithic gvar. Split rules:

| Source TSV | Shard files *(planned)* | Split key | Facade module |
|------------|-------------------------|-----------|---------------|
| [monsters.tsv](../../../public/assets/monsters.tsv) | `catalogues/monsters/{a-z}_monsters.gvar` | First letter of **`name`** | [monsters.gvar](gvars/monsters.md) |
| [items.tsv](../../../public/assets/items.tsv) | `items_list`, `potions_list`, `magic_items_list` | **`type`** column | [items.gvar](gvars/items.md) |
| [spells.tsv](../../../public/assets/spells.tsv) | `spells/spells_list.gvar` *(split by level later if size requires)* | — | [spells.gvar](gvars/spells.md) |
| [books-fiction.tsv](../../../public/assets/books-fiction.tsv) | `books/fiction_{a-z}.gvar` or single file until count grows | First letter of **`name`** | [library.gvar](gvars/library.md) |
| [books-real.tsv](../../../public/assets/books-real.tsv) | `books/real_{a-z}.gvar` | Same | library |
| [recipes.tsv](../../../public/assets/recipes.tsv) | Usually **config `recipes`** on owner gvar; optional `catalogues/recipes.gvar` for engine preset | **`kind`** or single file | [recipe.gvar](gvars/recipe.md) |

**Biomes** — not TSV-driven for MVP; hand-authored or ported **`pools`** modules under [src/gvars/configs/biomes/](../../../src/gvars/configs/biomes/README.md), referenced from **`world_data.biomes.*.gvar_id`**.

### westmarch vs westmarch-generic runtime

| | westmarch | westmarch-generic *(target)* |
|---|-----------|-------------------------------|
| Monster lookup | Load **one letter** shard via `get_gvar` | Same |
| Item lookup | **Eager** load all three lists at import | **Lazy** — load **`items_list` / `potions_list` / `magic_items_list`** only when search scope needs that type (or after type filter) |
| Book lookup | Single large `books.gvar` | Split by corpus + letter; load one shard per search prefix |
| Data in shard file | Raw **JSON** body (`JSON.stringify(rows)`) | Same for generated shards — `load_json(get_gvar(uuid))` in facade |

Facades keep a **per-invocation cache** `{ shard_id: parsed_rows }` — second lookup in the same alias reuses memory without re-fetching the gvar.

---

## Shard file format

Generated catalogue shards use **JSON array** as the gvar body (westmarch convention):

```json
[
  {"name": "Aboleth", "cr": 10, "source": "MM", ...},
  ...
]
```

Draconic **facade** modules map shard keys → workshop UUIDs and implement search:

```py
# monsters.gvar (sketch)
LETTER_GVARS = { "a": env.gvars.a_monsters, ... }
_cache = {}

def _load_letter(letter):
    if letter not in _cache:
        _cache[letter] = load_json(get_gvar(LETTER_GVARS[letter]))
    return _cache[letter]

def search(query):
    letter = query.lower()[0]
    if letter in LETTER_GVARS:
        return _filter(_load_letter(letter), query)
    # fallback: widen search only when exact shard miss — document in monsters.gvar
```

Row shapes match [data-shapes.md](data-shapes.md) and column docs in [public/assets/README.md](../../../public/assets/README.md).

**Alternative (later):** emit Draconic `ROWS = [...]` for Drac2-native modules — generators would share the same TSV → row-object step; only the writer differs.

---

## Generate utils *(planned)*

Location: **`utils/`** at repo root.

| Script | Input | Output |
|--------|-------|--------|
| **`generate-monsters.js`** | `public/assets/monsters.tsv` | `src/gvars/catalogues/monsters/{a-z}_monsters.gvar` |
| **`generate-items.js`** | `public/assets/items.tsv` | `items_list`, `potions_list`, `magic_items_list` |
| **`generate-spells.js`** | `public/assets/spells.tsv` | `spells/spells_list.gvar` |
| **`generate-books.js`** | `books-fiction.tsv`, `books-real.tsv` | `books/*.gvar` shards |
| **`generate-recipes.js`** | `public/assets/recipes.tsv` | `src/gvars/configs/recipes_snippet.gvar` or inject into preset configs |

Shared library *(planned)* **`utils/lib/`**:

| Module | Role |
|--------|------|
| **`read-tsv.js`** | Header row, `\t` delimiter, `\r` strip, skip blank lines |
| **`write-json-gvar.js`** | `JSON.stringify(rows, null, 0)` + optional validation |
| **`shard-by.js`** | Group rows by key function (letter, type, …) |
| **`manifest.js`** | Print shard counts / warn empty shards for CI |

**npm scripts** *(to add to `package.json`)*:

```json
"generate:monsters": "node utils/generate-monsters.js",
"generate:items": "node utils/generate-items.js",
"generate:spells": "node utils/generate-spells.js",
"generate:books": "node utils/generate-books.js",
"generate:recipes": "node utils/generate-recipes.js",
"generate:catalogues": "npm run generate:monsters && npm run generate:items && npm run generate:spells && npm run generate:books && npm run generate:recipes"
```

Port logic from westmarch **`utils/generate-*.js`** — paths updated to `public/assets/` and `src/gvars/catalogues/`.

---

## Sourcemaps and UUIDs

Every **new shard file** needs a slot in **`utils/sourcemap.dev.json`** and **`utils/sourcemap.prod.json`**:

1. Take UUID from top of **`unused_gvars.md`**
2. Add `{ "name": "a_monsters", "file": "src/gvars/catalogues/monsters/a_monsters.gvar", "id": "…" }`
3. Delete used line from **`unused_gvars.md`**
4. **`make rebuild`**

Generate scripts should **list** any output paths not yet in sourcemap (maintainer checklist). Automating sourcemap append is **post-MVP** — easy to get UUID wrong.

---

## Config vs engine catalogues

| Data | Where it lives after generate |
|------|-------------------------------|
| **Engine defaults** | Shards in workshop; facades in **`env.gvars`** |
| **Example presets** | [src/gvars/configs/](gvars/configs.md) may **`extensions.monsters`** → engine shard set, or embed a **subset** for tests |
| **Owner server** | Config gvar **`extensions.*`** UUIDs pointing at owner copies of shards, or inline small lists |

Generate utils **do not** replace owner config — they refresh **engine reference data**. Preset configs reference engine UUIDs or `engine:…` slugs where documented.

---

## When to run generators

| Change | Action |
|--------|--------|
| Updated TSV in **`public/assets/`** | Run affected **`npm run generate:*`**, commit shard outputs |
| New shard file | Sourcemap + **`unused_gvars.md`**, **`make rebuild`** |
| Facade search logic only | Edit Draconic facade; no regenerate |
| Owner-specific catalogue | Edit owner workshop gvar — **no** repo generate |

**CI *(future)*:** fail PR if TSV hash changed but generated JSON shards were not regenerated (`npm run generate:catalogues && git diff --exit-code`).

---

## Related

- [utils/README.md](../../../utils/README.md) — commands and porting checklist
- [public/assets/README.md](../../../public/assets/README.md) — TSV columns
- [gvars/core.md](gvars/core.md) — runtime helpers vs catalogue data
- [DEVELOPMENT.md](../../../DEVELOPMENT.md) — local workflow
- [solution-statement.md § Option C](solution-statement.md) — extension gvars for oversized tables
