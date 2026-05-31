You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python dict data** for **`world_data.transport`** travel modes.

### Setting

Forgotten Realms Sword Coast — overland westmarch (walk + horse MVP).

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
world_data_transport = {
    "walk": {
        "name": "On foot",
        "default": True,
    },
    "horse": {
        "name": "Riding horse",
        "description": "Short player-facing note.",
    },
}
```

3. Double quotes; snake_case mode ids.

### Rules

- **`walk`** must exist with `"default": True`.
- Include **`horse`** for frontier westmarch.
- Add **`boat`** only if pasted brief includes river/coastal routes needing it:

```
[PASTE "walk and horse only" or "include boat for river crossings"]
```

| Field | Required |
|-------|----------|
| `name` | yes |
| `description` | no |
| `default` | on exactly one mode |

Do not add spelljammer/sky modes unless brief requests Spelljammer.

### Your task

Generate **`world_data_transport`** for the brief above.
