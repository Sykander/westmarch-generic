You previously generated content for the westmarch-generic Avrae bot config. The output had errors. Fix **only** what is listed — do not redesign unrelated entries.

### Errors to fix

```
[PASTE: e.g. "Used biome code 'coast' — not in allowed list", "ids have spaces", "included paths when asked for locations only"]
```

### Previous output

```text
[PASTE ChatGPT's previous output here]
```

### Rules (still apply)

1. Output **only** a single fenced code block — no explanation before or after.
2. Use fenced `json` for raw biome JSON rows. Use fenced `python` for Python config structures.
3. Keep the same number of entries unless asked to add/remove.
4. **`id`** keys: `snake_case`, lowercase, ASCII letters/numbers/underscore only.
5. **Biome codes** must be from the allowed list in the original prompt — do not invent new codes.
6. Do not add fields that were not in the schema (no `npcs`, `quests`, `encounters`, etc.).
7. For raw biome rows, keep rows as `[pool_tags_or_null, "template_name", ...args]`; descriptions should feel like notable half-day travel events and stay under 400 characters.
8. For raw biome `flavour` rows, use only `name` and `description`; branch routing comes from row pool tags.

### Corrected output

Produce the full corrected structure again (not a diff).
