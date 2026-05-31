You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Your job is to write **Python dict data** for in-world **locations** — not stories, not DM advice, not JSON.

### Setting

- **Forgotten Realms**, **Sword Coast** region (Waterdeep periphery, Neverwinter Wood, High Road, Dessarin Valley, etc.).
- Tone: recognisable FR place names and factions where comfortable for a home game; avoid long copyrighted novel plot summaries.

### Configuration (edit before sending)

**Mode:** `bootstrap`

| Mode | When | Count | Extra |
|------|------|-------|--------|
| **`bootstrap`** | First locations for this preset — empty config | **Exactly 10** | `# default_location: <hub_id>` comment after dict |
| **`expand`** | Adding to locations already in config | **10–15 new** | Paste existing ids + region brief below; no duplicate ids |

**Existing location ids** *(expand mode only — leave as `none` for bootstrap)*

```
none
```

**Region brief** *(optional for bootstrap; required for expand)*

```
Sword Coast frontier sandbox — one hub, wild areas, one unusual spot
```

### Output format (strict)

1. Respond with **one** fenced code block tagged `python` and **nothing else** — no introduction, no bullet summary, no apologies.
2. The code must be a single assignment valid in a Draconic/Python module:

```python
world_data_locations = {
    "location_id_slug": {
        "name": "Display Name",
        # ... fields ...
    },
}
```

3. Use **double quotes** for all strings.
4. **`location_id_slug`** is the dict key — also the logical `id`. Use **`snake_case`**, lowercase, 2–4 words max (e.g. `neverwinter_outskirts`, `high_road_crossing`). No spaces, no hyphens, no FR apostrophes in keys.
5. Do **not** include `paths`, `shops`, `encounters`, `biomes` registry, or subsystem toggles.
6. Do **not** include `link` or `image` fields (Discord URLs added later by the repo maintainer).
7. **Bootstrap:** pick one location as the starting hub — richest `commands` and `services`; end with `# default_location: <hub_id>` on its own line after the dict.
8. **Expand:** output **new** entries only; do not repeat ids from the existing list.

### Allowed biome codes (use ONLY these strings)

Use these in `"biome"` and as values for **exploration** command keys inside `"commands"`:

`beach`, `forest`, `mountain`, `cave`, `ruins`, `road`, `urban`, `river`, `sea`, `plains`, `desert`, `swamp`, `sky`, `deep_seas`, `underdark`, `tundra`, `jungle`, `volcanic`, `astral`

Do **not** invent codes like `coast`, `woodland`, or `city`.

### Commands at each location (`"commands"`)

**Rule:** for every location, list **only** the player commands available **while a character is at that place**. If a command is not available there, **omit that key** — do not set empty lists or `False`.

| Value type | Used for |
|------------|----------|
| **List of biome codes** | Exploration commands (see table below) |
| **`True`** | Everything else in this table |

#### Exploration commands (value = biome list)

| Key | Command | Typical use |
|-----|---------|-------------|
| `enc` | `!enc` | Random encounter |
| `forage` | `!forage` | Foraging |
| `fish` | `!fish` | Fishing |
| `mine` | `!mine` | Mining |
| `lumber` | `!lumber` | Logging |
| `hunt` | `!hunt` | Hunting |
| `loot` | `!loot` | Looting / scavenging |

#### Economy & work (value = `True`)

| Key | Command | Typical use |
|-----|---------|-------------|
| `job` | `!job` | Paid work / employment |
| `buy` | `!buy` | Shopping |
| `sell` | `!sell` | Selling goods |

#### Crafting (value = `True` — usually only where a workshop or relevant service exists)

| Key | Command |
|-----|---------|
| `craft` | `!craft` |
| `brew` | `!brew` |
| `enchant` | `!enchant` |
| `scribe` | `!scribe` |

#### Content (value = `True`)

| Key | Command | Typical use |
|-----|---------|-------------|
| `library` | `!library` | Browse / search in-world texts |
| `read` | `!read` | Read a book or document |

#### Do NOT put these in `"commands"`

These are **global** or **travel-scoped**, not toggled per location: `travel`, `location`, `time`, `weather`, `wallet`, `downtime`, `quest`, `recipe`, `journal`, `diary`.

#### Placement guidance

- **Urban hub:** often `enc`, `job`, `buy`, `sell`, `library`, `read`; maybe `craft` / `brew` if services support it; rarely mine/lumber/hunt.
- **Wilderness:** exploration keys matching terrain; usually no `buy`/`sell`/`job` unless you justify a frontier post.
- **Road chokepoint:** `enc` with `road` (and maybe `urban` near a gate); `buy`/`sell` only if settled.
- **Consistency:** if `biome` is `forest`, exploration commands should use `forest` (or `river` for `fish` on a forest river) unless you have a reason.
- **Related biomes:** exploration values may use a **related** code when the activity happens in adjacent terrain — e.g. location `biome` `beach` with `"fish": ["sea"]`, or a ford with `"enc": ["river", "road"]`.

When `buy` or `sell` is in `commands`, add matching entries to `"services"`. When `library` is in `commands`, add `"library_topics"`. When a **crafting** command is in `commands`, include a matching service id:

| Command | Typical service id |
|---------|-------------------|
| `craft` | `blacksmith`, `crafting_workshop` |
| `brew` | `brewery`, `tavern` |
| `enchant` | `enchanter`, `magic_shop` |
| `scribe` | `scribe`, `temple` |

`library` in `services` covers **`library`** and often **`read`**; do not enable `read` without `library` unless the place has a standalone readable (rare).

### Optional fields per location

| Field | Required? | Rules |
|-------|-----------|--------|
| `name` | **yes** | Player-facing proper name |
| `description` | recommended | 1–3 sentences; max ~280 characters |
| `travel_description` | optional | 1 sentence for travel; max ~280 characters |
| `biome` | recommended | Single primary biome code |
| `commands` | **recommended** | Per-location command availability |
| `services` | optional | snake_case service ids when economy/crafting commands enabled. Hubs: **3–6**; wilderness: 0–1 |
| `library_topics` | optional | 1–4 tags when `library` in `commands` |

Do **not** add: `activities`, `npcs`, `quests`, `encounter_tables`, `weather`, `latitude`, `currency`, or any key not listed here.

### Content guidelines

- **Bootstrap variety:** at least 1 urban/settled, 2 forest/wilderness, 1 road chokepoint, 1 river or coastal, 1 ruins or cave edge, 1 unusual spot.
- **Expand:** match the region brief; at most **2–3** settled spots with `buy`/`sell` per batch unless the brief is urban-heavy.
- **Descriptions:** gameplay-usable, not novel prose.
- **Commands:** place-by-place — wilderness gets exploration only; market towns get `buy`, `sell`, `job`, and usually `library`.

### Example (structure only — do not copy)

```python
world_data_locations = {
    "river_town": {
        "name": "Amphail",
        "description": "A cattle town on the Long Road where ranchers trade and travellers rest before the wilder North.",
        "travel_description": "The smell of manure and hearth smoke marks the outskirts long before the palisade gates.",
        "biome": "urban",
        "commands": {
            "enc": ["urban", "road"],
            "job": True,
            "buy": True,
            "sell": True,
            "library": True,
            "read": True,
        },
        "services": ["general_store", "inn", "livestock_market", "library"],
        "library_topics": ["history", "north"],
    },
}
# default_location: river_town
```

### Your task

Follow **Mode** above:

- **`bootstrap`:** generate **exactly 10** distinct Sword Coast locations + `# default_location` comment.
- **`expand`:** generate **10–15 new** locations for the region brief; no id collisions with the existing list.
