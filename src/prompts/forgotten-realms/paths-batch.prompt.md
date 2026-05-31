You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python list data** for **travel paths** between existing locations.

### Setting

Forgotten Realms Sword Coast — paths connect locations already defined in config.

### Location ids available (use ONLY these for `from` and `to`)

```
[PASTE one location id per line]
```

### Hub / focus for this batch (optional)

```
[PASTE e.g. "phandalin_frontier — connect to all neighbors within one travel day"]
```

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
world_data_paths = [
    {
        "from": "origin_id",
        "to": "destination_id",
        "steps": [ ... ],
    },
    # 15–25 path entries
]
```

3. Double quotes; location ids must match the pasted list exactly.
4. **One-way paths** — travel from A→B is one entry; B→A needs a **separate** entry if bidirectional.
5. Do **not** include locations, shops, or encounters inline.

### Path shape

| Field | Required | Notes |
|-------|----------|--------|
| `from`, `to` | yes | Location id strings |
| `steps` | yes* | Ordered list — at least one step (*or `cost`-only with engine default proceed) |
| `requirements` | no | `{ "transport": "walk" }` or `"horse"` / `"boat"` — omit = any transport |
| `cost` | no | e.g. `{ "gold": 5, "rations": 1 }` — toll or ferry |
| `label` | no | Player-facing gate hint |

### Journey step types

```python
{ "type": "encounter", "biome": "forest" }
{ "type": "proceed", "description": "Short narrative for !travel next." }
{ "type": "cost", "gold": 5 }
```

**Biome codes for encounter steps:** `beach`, `forest`, `mountain`, `cave`, `ruins`, `road`, `urban`, `river`, `sea`, `plains`, `desert`, `swamp`, `sky`, `deep_seas`, `underdark`, `tundra`, `jungle`, `volcanic`, `astral`

### Design rules

- **Hub first:** if a hub is named, connect it to 4–8 nearby locations in this batch.
- **Wild routes:** 1–3 encounter steps; **road/urban** routes: 0–1 encounter steps, often `road` or `urban` biome.
- **Steps length:** 1–4 steps per path; use `proceed` for filler, `encounter` for danger.
- **No duplicate edges:** same `from`, `to`, and `requirements.transport` (or both omitted) only once.
- **Horse/boat:** only add a second path with `requirements.transport` when steps are **shorter or different** — not required for MVP.

### Example (structure only)

```python
world_data_paths = [
    {
        "from": "river_town",
        "to": "oakwood",
        "steps": [
            { "type": "encounter", "biome": "road" },
            { "type": "proceed", "description": "The trail leaves the fields and enters woodland shade." },
        ],
    },
]
```

### Your task

Generate **15–25** path entries connecting locations from the list, focused on the hub/focus if provided. Prefer a connected overland graph over isolated pairs.
