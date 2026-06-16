You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python dict data** for the **`world_data.biomes` registry** — not biome encounter row bodies.

### Setting

Forgotten Realms Sword Coast westmarch.

### Biome codes used in this config

List every code appearing in location `commands` exploration lists and path encounter steps:

```
[PASTE e.g. forest, urban, road, river, beach, sea, ruins, cave, plains, swamp]
```

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
world_data_biomes = {
    "forest": {
        "gvar_id": "engine:configs/biomes/forest",
        "name": "Forest",
    },
}
```

3. **One entry per pasted code** — no extra codes.
4. For standard terrain, use **`gvar_id`: `"engine:configs/biomes/<code>"`** (repo ships preset modules).
5. Only use a placeholder UUID like `"CUSTOM_BIOME_GVAR_UUID"` when the brief below marks a code as custom.

### Allowed codes

`beach`, `forest`, `mountain`, `cave`, `ruins`, `road`, `urban`, `river`, `sea`, `plains`, `desert`, `swamp`, `sky`, `deep_seas`, `underdark`, `tundra`, `jungle`, `volcanic`, `astral`

### Custom row-body overrides (optional)

```
[PASTE codes that will get setting-specific encounter gvars later, or "none — all engine presets"]
```

For custom codes, set `"gvar_id": "PLACEHOLDER_<code>"` and `"name"` with FR flavour.

### Your task

Generate **`world_data_biomes`** covering exactly the pasted code list. Default to engine presets for all unless custom list says otherwise.
