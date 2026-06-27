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
| `distance_miles` | no | Approximate route distance used for pathfinding weight |
| `travel_hours` | no | Approximate travel time; overrides distance-derived pathfinding weight |
| `steps` | yes* | Ordered player-facing actions — at least one meaningful step (*or `cost`-only / engine fallback for edge cases) |
| `requirements` | no | `"boat"` / `"ship"` / `"fly"` / `"swim"` / `"portal"` / `"teleportation_circle"` — omit for ordinary overland routes |
| `cost` | no | e.g. `{ "gold": 5, "rations": 1 }` — toll or ferry |
| `label` | no | Player-facing gate hint |

### Journey step types

```python
{ "type": "encounter", "biome": "forest" }
{ "type": "proceed", "description": "Edge-case narrative hop for !travel next." }
{ "type": "cost", "gold": 5 }
```

**Biome codes for encounter steps:** `beach`, `forest`, `mountain`, `cave`, `ruins`, `road`, `urban`, `river`, `sea`, `plains`, `desert`, `swamp`, `sky`, `deep_seas`, `underdark`, `tundra`, `jungle`, `volcanic`, `astral`

### Design rules

- **Hub first:** if a hub is named, connect it to 4–8 nearby locations in this batch.
- **Wild routes:** 1–3 encounter steps; **road/urban** routes: 0–1 encounter steps, often `road` or `urban` biome.
- **Steps are not clock ticks:** use `distance_miles` / `travel_hours` for route length. Use `steps` only for meaningful player-resolved actions such as encounters, costs, hazards, or special activities.
- **No duplicate edges:** same `from`, `to`, and `requirements.transport` (or both omitted) only once.
- **Transport requirements:** omit requirements for normal roads and trails. Add a second path with `requirements.transport` only when a specific capability is actually required or makes a genuinely different route.

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
