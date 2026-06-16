Continue from the previous message in this chat. Use the **same rules and schema** as before.

### Task

[PASTE ONE OF:
- Add {N} more entries to `{VARIABLE_NAME}`. Output the **full** updated structure with **all** previous entries plus new ones — not a diff.
- Add {N} more raw biome JSON rows tagged `{POOL_TAG}`. Output **only the new rows** as a JSON array — not the full previous biome file.
- Fix only these validation errors: {paste errors}. Output the **full** corrected structure.
- Regenerate `{VARIABLE_NAME}` for region/biome: {brief}. Do not duplicate these ids: {paste ids}.
]

For biome rows, also follow this style target:

- Each row should feel like the most interesting thing likely to happen during roughly half a day of travel, not a tiny incidental find.
- Descriptions should usually be 180-350 characters with a compact scene: environmental setup, complication, and why adventurers must respond.
- Do not duplicate any pasted titles, examples, or seed rows.
- For `flavour`, the optional kind must be only `combat`, `quest`, or `gather`; omit it unless needed.

### Output format (unchanged)

1. **One** fenced code block only — no explanation.
2. Same output shape as the original prompt (`world_data_locations`, `world_data_paths`, `config_shops`, or raw biome JSON rows).
3. Use fenced `json` for raw biome JSON rows. Use fenced `python` for Python structures.
4. Double quotes. Valid JSON for biome rows; valid Python for Python structures.

Produce the requested structure now.
