# World data

`world_data` is the map and shared world layer used by travel, location, exploration, weather, time, and some content/economy features.

## Core pieces

| Key | Use |
|-----|-----|
| `default_location` | Starting location id |
| `locations` | Specific places players can visit |
| `paths` | One-way routes between locations |
| `transport` | Walk, horse, ship, portal, and other route methods |
| `calendars` | World time for `!time` |
| `weather` | Weather areas for `!weather` |
| `biomes` | Reusable exploration content sources |
| `book_gvar_ids` / `books` | Library/read content |

Other top-level data such as `shops`, `currencies`, and `recipes` also affects world behavior, but it is not always nested under `world_data`.

## Location mental model

A location is a specific place:

```py
"waterdeep": {
    "name": "Waterdeep",
    "description": "A crowded city of coin, guilds, and secrets.",
    "biome": "urban",
    "commands": {"buy": True, "sell": True, "job": True},
    "services": ["general_store"],
}
```

Locations can define descriptions, service availability, library topics, activities, and encounter supplements.

## Path mental model

A path is one directed route edge:

```py
{
    "from": "waterdeep",
    "to": "triboar",
    "travel_hours": 72,
    "requirements": {"transport": "horse"},
    "steps": [{"type": "encounter", "activity": "enc", "biome": "road"}],
}
```

Add the reverse path separately if travel should work both ways.

## When to split into gvars

Inline world data is fine for small servers. Split into related gvars when:

- location lists become hard to edit;
- paths are large;
- biome encounter rows are numerous;
- multiple maintainers edit different areas;
- the editor warns about size or source structure.

## Smoke commands

```text
!location
!location <place>
!travel <destination>
!time
!weather
```

Use only commands enabled in your config.

## Next guides

- [Locations and travel](locations-and-travel.md)
- [Biomes](biomes.md)
- [Economy](economy.md)
- [Validation](validation.md)
