# Biomes

A biome is a reusable exploration basis for one or more locations.

Use biomes for generic wilderness or environment content such as roads, forests, caves, rivers, mountains, coasts, and cities.

## Biome vs location

| Concept | Meaning |
|---------|---------|
| Location | A specific place with name, services, descriptions, paths, and optional local encounters |
| Biome | A reusable source of exploration rows that many locations can share |

Example:

- `waterdeep` is a location.
- `urban` is a biome.
- `triboar_road` might be a location or route stop.
- `road` is a biome.

## Registry

Register biomes in `world_data.biomes`:

```py
world_data = {
    "biomes": {
        "forest": {
            "name": "Forest",
            "gvar_id": "engine:configs/biomes/forest",
        },
        "custom_ruins": {
            "name": "Ancient Ruins",
            "gvar_id": "<owner-biome-gvar-id>",
        },
    },
}
```

## Choosing biome source mode

Exploration commands use `subsystems.exploration.config.enc_biome_source`.

| Value | Player experience |
|-------|-------------------|
| `argument` | Player types a biome: `!enc forest` |
| `location` | Command infers biome from character location: `!enc` |
| `auto` | Location mode when available, otherwise argument mode |

Use `auto` for most servers while building.

## Biome rows

Biome gvars contain compact encounter rows:

```json
[
  [["enc.gather", "forage.gather"], "gather_item", "Wild herbs", "You find useful herbs.", "Wisdom (Survival)", 12, "Herbs", 1]
]
```

The first item is pool tags, the second is the template id, and the rest are template arguments.

## When to use location encounters instead

Use location encounters for:

- named local quest hooks;
- content that should appear only in one settlement or dungeon;
- quest outcomes with stable quest ids;
- services or events tied to a specific place.

Use biome rows for content that can appear anywhere with that environment.

## Next guides

- [World data](world-data.md)
- [Encounters](encounters.md)
- [Encounter templates](encounter-templates.md)
