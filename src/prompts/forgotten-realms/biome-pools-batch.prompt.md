You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **raw JSON** for a **biome gvar body** - compact encounter rows only.

### Setting

Forgotten Realms Sword Coast - **[BIOME_CODE]** biome (`[BIOME_DISPLAY_NAME]`).

### Biome brief

[PASTE terrain/climate notes, e.g. "temperate forest: mossy oak and pine woodland, game trails, old ruins, streams, light fey/undead hints; not jungle, swamp, or city"]

### Biome code for this module

`[BIOME_CODE]`

Replace `[BIOME_CODE]` above with one allowed code before sending.

### Activities to populate

[PASTE e.g. enc, forage, lumber - or "enc, forage" only]

Always include **`enc`** with all three kinds unless brief says otherwise.

### Output format (strict)

1. Respond with **one** fenced code block tagged `json` and **nothing else**.
2. The code must be a single top-level JSON array. No assignment, no comments, no trailing commas.
3. Each row shape:

        [pool_tags_or_null, "template_name", ...template_args]

4. Use JSON `null`, not Python `None`.
5. Static data only - strings, numbers, arrays, objects.

### Pool tags

Use exact pool tags such as:

- `enc.combat`
- `enc.gather`
- `enc.quest`
- `forage.gather`
- `fish.gather`
- `mine.gather`
- `lumber.gather`

First row value rules:

- A list of tags means the row can appear in those pools.
- `null` means every compatible pool. Compatibility still follows the template kind, so a `combat` row only appears in combat selections, a `quest` row only in quest selections, and a `gather` row only in gather selections.

Do **not** include `loot`; it uses the loot session engine, not biome pools. Do **not** include `hunt` unless the brief explicitly says this server branch has biome-backed hunt pools.

### Encounter templates

Use these templates:

| Template | Kind | Args |
|----------|------|------|
| `combat` | combat | name, description, cr, optional monster |
| `quest` | quest | name, description, optional reward_hint |
| `flavour` | gather by default | name, description, optional kind |
| `gather_item` | gather | name, description, check_name, dc, item_name, total, optional bag |
| `skill_check` | gather | name, description, check_name, dc, optional success_text, optional failure_text |
| `gold` | gather | name, description, total |

Prefer `gather_item` for forage/lumber finds with item outcomes. Use `flavour` for ambience or non-reward gather beats.

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
- Keep entries generally true of this biome and climate, not a named town, shop, library, or job site.
- Reuse rows across pools where sensible by listing multiple tags, e.g. one berry row can appear in both `enc.gather` and `forage.gather`.

### Example rows

    [["enc.gather", "forage.gather"], "gather_item", "Wild berries", "You find a patch of ripe berries among the undergrowth.", "Wisdom (Survival)", 12, "Berries", 1]
    [["enc.combat"], "combat", "Wolf sign", "Fresh tracks and a low growl warn you that a hungry pack is close.", 1, "Wolf"]
    [["enc.quest"], "quest", "Lost waymarker", "A weathered marker points toward a trail that is not on any current map."]

### Your task

Generate the complete JSON row array for biome **`[BIOME_CODE]`** with the activity list above.
