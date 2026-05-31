You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python list data** for **library books** (`!library` / `!read`).

### Setting

Forgotten Realms — in-world texts players might find in Sword Coast libraries.

### Topics to cover (align with location `library_topics`)

```
[PASTE e.g. history, north, mines, religion, nature, trade]
```

### Existing book titles (do NOT duplicate)

```
[PASTE titles or "none"]
```

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
config_books = [
    { ... },
    # 5–8 books
]
```

3. Double quotes. **Forgotten Realms in-universe works only** — no real-world novels, no copyrighted FR novel excerpts. Output targets `books-forgotten-realms.tsv`.

### Book shape

```python
{
    "name": "A Brief History of the Dessarin",
    "description": "Paragraph one.\\n\\nParagraph two.",
    "author": "Anonymous scribe",
    "written": "1480 DR",
    "rarity": "common",
    "language": "Common",
    "type": "original",
    "base_work": "",
    "tags": ["history", "dessarin", "trade"],
    "read_bonus": 0,
    "image": "",
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `name` | yes | Unique title |
| `description` | yes | Body text; use `\\n\\n` between paragraphs |
| `author` | yes | |
| `written` | yes | In-world date string |
| `rarity` | yes | `common`, `uncommon`, `rare`, `very rare`, `legendary`, `ancient` |
| `language` | yes | Usually `Common` |
| `type` | yes | `original` or `commentary` |
| `base_work` | yes | Empty string for original; title if commentary |
| `tags` | yes | Lowercase topic tokens for `!library` search |
| `read_bonus` | yes | Usually `0` |
| `image` | yes | Empty string — URLs added later |

### Content rules

- 2–4 paragraphs per book; ~400–800 characters total in `description`.
- Scholarly or adventure gazetteer tone — facts and hooks, not plot summaries.
- Each book should match **1–3 tags** from the pasted topic list.
- Include at least one **rare** or **ancient** entry if batch size ≥6.

### Your task

Generate **5–8** books covering the pasted topics for a frontier westmarch library.
