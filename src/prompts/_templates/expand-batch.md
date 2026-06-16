# Expand / fix batch

**Prompt:** [`expand-batch.prompt.md`](expand-batch.prompt.md)

Use **in the same ChatGPT chat** after a successful batch when you need:

- More locations/paths/shops/recipes/books in the same style
- More raw biome JSON rows without repeating the existing biome file
- A full dict/list output after partial fixes (never ask for diffs)

Fill the `[PASTE …]` section with your concrete task before sending.

For biome rows, paste the existing titles or the current JSON file excerpt and ask for **only new rows** unless you intentionally want a full replacement.

For schema-breaking failures, prefer [`revision.prompt.md`](revision.prompt.md) with explicit error list + bad output attached.
