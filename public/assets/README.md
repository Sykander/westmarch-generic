# Asset lists (TSV)

Tab-separated value (`.tsv`) catalogues used to build config gvars and seed server workshops. Format matches [westmarch](https://github.com/Sykander/westmarch) `public/*.tsv` exports (Google Sheets → **Download → Tab-separated values**).

Future tooling (e.g. `utils/generate-*.js`) will read these files and emit gvar JSON or config modules under `src/gvars/`.

## Files

| File | Source | Used by (MVP) | Notes |
|------|--------|---------------|-------|
| [monsters.tsv](monsters.tsv) | Copied from westmarch | hunt, loot | `Name`, `Source`, `CR`, `Type`, `Size`, … |
| [items.tsv](items.tsv) | Copied from westmarch | craft, brew, enchant, buy, sell, recipe | Single file; `type` column splits Item / Magic Item / Potion at build time |
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

## Updating from westmarch

To refresh reference data (monsters, items, spells):

```bash
cp ../westmarch/public/monsters.tsv public/assets/
cp ../westmarch/public/items.tsv public/assets/
cp ../westmarch/public/spells.tsv public/assets/
```

Do **not** copy `westmarch/public/books.tsv` into this repo — use `books-fiction.tsv` and `books-real.tsv` instead.

## Related

- [mvp-commands.md](../../docs/internal/projects/westmarch-statement/mvp-commands.md) — which commands consume each catalogue
- [westmarch library architecture](https://github.com/Sykander/westmarch/blob/main/docs/library/library-architecture.md) — book engine behaviour
