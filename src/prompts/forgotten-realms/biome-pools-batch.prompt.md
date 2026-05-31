You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python dict data** for **biome encounter pools** — static encounter dicts only (no functions).

### Setting

Forgotten Realms — **[BIOME_CODE]** biome (`[BIOME_DISPLAY_NAME]`).

### Biome code for this module

```
[BIOME_CODE]
```

Replace `[BIOME_CODE]` above with one allowed code before sending.

### Activities to populate

```
[PASTE e.g. enc, forage, lumber, hunt — or "enc, forage" only]
```

Always include **`enc`** with all three kinds unless brief says otherwise.

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
biome_pools = {
    "enc": {
        "combat": [ ... ],
        "gather": [ ... ],
        "quest": [ ... ],
    },
    "forage": {
        "gather": [ ... ],
    },
}
```

3. **Static data only** — strings and numbers; no `def`, no lambdas.
4. Double quotes.

### Encounter dict (minimal — use for every entry)

```python
{
    "name": "Short title",
    "description": "2–4 sentences, second person, gameplay tone.",
    "kind": "combat",
}
```

| `kind` | Pool branch | Extra fields |
|--------|-------------|--------------|
| `combat` | `enc.combat` | `"cr": 1` or `"0.25"` — number or string |
| `gather` | `enc.gather`, `forage.gather`, etc. | optional `"outcomes": [{"type": "item", "name": "Herbs", "total": 1}]` |
| `quest` | `enc.quest` | hook only — no quest id wiring |

**Activity keys** (top level under `biome_pools`): `enc`, `forage`, `fish`, `mine`, `lumber`, `hunt`, `loot` — only include activities from the paste list. Non-`enc` activities use **`gather`** kind only.

### Optional roll (simple checks only)

```python
"rolls": [
    { "type": "check", "name": "Wisdom (Survival)", "ability": "wis", "dc": "12" },
],
```

Use rolls on ~30% of gather/quest entries max.

### Volume targets (this chat)

| Pool | Count |
|------|-------|
| `enc.combat` | 6–8 |
| `enc.gather` | 5–7 |
| `enc.quest` | 4–6 |
| each other activity `.gather` | 5–8 |

### Content rules

- FR Sword Coast tone; no named NPCs from published adventures.
- Descriptions ≤400 characters.
- Combat CR mostly 0–2 for frontier; one 3–4 entry allowed.
- Gather outcomes use generic items (Herbs, Timber, Iron ore, Trout, …).

### Example gather entry

```python
{
    "name": "Wild berries",
    "description": "You find a patch of ripe berries among the undergrowth.",
    "kind": "gather",
    "outcomes": [{ "type": "item", "name": "Berries", "total": 1 }],
}
```

### Your task

Generate **`biome_pools`** for biome **`[BIOME_CODE]`** with the activity list above.
