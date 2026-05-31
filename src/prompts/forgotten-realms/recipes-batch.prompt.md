You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python list data** for **crafting recipes**.

### Setting

Forgotten Realms — regional crafting knowledge (Sword Coast / North).

### Existing recipe ids (do NOT reuse)

```
[PASTE ids or "none"]
```

### Focus for this batch

```
[PASTE e.g. "herbal potions and frontier gear" or "brew only"]
```

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
config_recipes = [
    { "id": "recipe_slug", ... },
    # 8–12 recipes
]
```

3. **`id`**: unique snake_case slug.
4. Double quotes.

### Recipe shape

```python
{
    "id": "north_healing_draught",
    "name": "Potion of Healing",
    "kind": "brew",
    "workdays": 2,
    "consumed": [
        { "name": "Arnica", "qty": 2 },
        { "name": "Crystal vial", "qty": 1 },
    ],
    "required": [],
    "spells": None,
    "tags": ["potion", "healing"],
    "description": "Process prose only — how to brew, not quantities.",
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Unique |
| `name` | yes | Output item name |
| `kind` | yes | `brew` \| `craft` \| `enchant` \| `scribe` |
| `workdays` | yes | Integer ≥1 |
| `consumed` | no | Materials used up |
| `required` | no | Items needed but not consumed (enchant bases) |
| `spells` | no | `None` or comma-free single spell name string |
| `tags` | no | Search tags for `!recipe` |
| `description` | yes | In-world instructions; no DC/qty in prose |

**Material `name`** values should match plausible items from a D&D crafting catalogue (Arnica, Iron ingot, Leather, Holy water, …).

### Kind mix (unless focus says otherwise)

- 4–5 `brew`
- 2–3 `craft`
- 1–2 `enchant`
- 1 `scribe`

### Your task

Generate **8–12** recipes with FR-flavoured descriptions, varied difficulty (`workdays` 1–5).
