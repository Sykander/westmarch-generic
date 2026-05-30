# Asset lists (TSV)

Tab-separated value (`.tsv`) catalogues used to build config gvars and seed server workshops. Format matches [westmarch](https://github.com/Sykander/westmarch) `public/*.tsv` exports (Google Sheets → **Download → Tab-separated values**).

**Build pipeline:** [content-pipeline.md](../../docs/internal/projects/westmarch-statement/content-pipeline.md) · **Scripts:** [utils/README.md](../../utils/README.md) — `npm run generate:*` *(planned)* reads TSV and writes **split JSON shard** gvars under `src/gvars/catalogues/` (letter shards for monsters, type splits for items, etc.). Runtime facades lazy-load one shard per lookup.

## Files

| File | Source | Used by (MVP) | Notes |
|------|--------|---------------|-------|
| [monsters.tsv](monsters.tsv) | Copied from westmarch | hunt, loot | `Name`, `Source`, `CR`, `Type`, `Size`, … |
| [items.tsv](items.tsv) | Copied from westmarch | craft, brew, enchant, buy, sell | Single file; `type` column splits Item / Magic Item / Potion at build time |
| [recipes.tsv](recipes.tsv) | **Examples** in repo | brew, enchant, craft, **recipe** | Explicit recipes; `consumed` vs `required` materials — links to [items.tsv](items.tsv) `name` |
| [spells.tsv](spells.tsv) | Copied from westmarch | scribe | `name`, `level`, `school` |
| [books-fiction.tsv](books-fiction.tsv) | **Empty** (headers only) | library, read | Forgotten Realms–style fiction; **not** westmarch corpus |
| [books-real.tsv](books-real.tsv) | **Empty** (headers only) | library, read | Real-world / pop-fiction works (e.g. *Harry Potter*, *Twilight*) — populate later |

## Book columns

Both book files share the westmarch book schema:

| Column | Purpose |
|--------|---------|
| `name` | Title |
| `description` | Body text; use literal `\n` in TSV for paragraph breaks |
| `author` | Author display name |
| `written` | In-world or publication date string |
| `rarity` | e.g. common, rare, ancient |
| `language` | Script/language for comprehension |
| `type` | `original` or `commentary` |
| `base_work` | For commentaries: title of work referenced |
| `tags` | Comma-separated topic tags for `!library` search |
| `read_bonus` | Optional numeric bonus (usually `0`) |
| `image` | Optional image URL |

At config/build time, server owners may merge fiction + real lists, use one only, or keep them in separate extension gvars.

## Items `type` values

From [westmarch `generate-items.js`](https://github.com/Sykander/westmarch/blob/main/utils/generate-items.js):

- `Item` → mundane crafting catalogue
- `Magic Item` → enchant catalogue
- `Potion` → brew catalogue

## Recipes columns

Structured crafting recipes for **`!brew`**, **`!craft`**, **`!enchant`**, and **`!recipe`**. Multiple rows may share the same **`name`** (output item) with different **`id`** variants.

| Column | Purpose |
|--------|---------|
| `id` | Stable slug — unique per variant |
| `name` | Output item — should match a row in [items.tsv](items.tsv) |
| `kind` | `brew` \| `enchant` \| `craft` \| `scribe` |
| `workdays` | Downtime / workdays required |
| `consumed` | Semicolon-separated `item:qty` — materials **used up** (`Arnica:2;Crystal vial:1`) |
| `required` | Semicolon-separated `item:qty` — items that must be present but **not consumed** (e.g. `Cloak:1` for enchant); empty when none |
| `spells` | Comma-separated spell names that must be **cast** to complete; empty when none |
| `tags` | Comma-separated — `!recipe` search |
| `description` | Player-facing process prose — the recipe as written; quantities and workdays belong in other columns |

The repo ships three **example** rows (one per `brew` / `craft` / `enchant`). Owners add server-specific recipes in their config gvar or by extending this TSV at build time.

**`craft`** mundane items may also use gp value bands from config ([CRAFT_PRICE_BANDS](../../docs/internal/projects/westmarch-statement/aliases/crafting/craft.md)) without a **`recipes.tsv`** row.

At config/build time, load **`recipes.tsv`** into config **`recipes`** (list or dict by `id`) alongside catalogues from **`items.tsv`**. Use **`npm run generate:recipes`** when the script lands — see [content-pipeline.md](../../docs/internal/projects/westmarch-statement/content-pipeline.md).

## Updating from westmarch

To refresh reference data (monsters, items, spells):

```bash
cp ../westmarch/public/monsters.tsv public/assets/
cp ../westmarch/public/items.tsv public/assets/
cp ../westmarch/public/spells.tsv public/assets/
```

Do **not** copy `westmarch/public/books.tsv` into this repo — use `books-fiction.tsv` and `books-real.tsv` instead.

**Recipes** are owner-defined — edit [recipes.tsv](recipes.tsv) or load recipes directly into the config gvar; there is no westmarch export.

## Related

- [content-pipeline.md](../../docs/internal/projects/westmarch-statement/content-pipeline.md) — TSV → shard gvars
- [mvp-commands.md](../../docs/internal/projects/westmarch-statement/mvp-commands.md) — which commands consume each catalogue
- [westmarch library architecture](https://github.com/Sykander/westmarch/blob/main/docs/library/library-architecture.md) — book engine behaviour
