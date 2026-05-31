You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python dict data** for **shops** (`!buy` / `!sell`).

### Setting

Forgotten Realms Sword Coast — vendors at settled locations.

### Locations with economy (paste from config)

For each line: `location_id` → service ids to implement as shops

```
[PASTE e.g.
phandalin_frontier: general_store, inn, blacksmith, brewery, scribe, library
high_road_milepost: roadside_inn, general_store
]
```

### Existing shop ids (do NOT reuse)

```
[PASTE existing shop ids or "none"]
```

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
config_shops = {
    "shop_id": { ... },
    # 5–10 shops
}
```

3. **`shop_id`** = snake_case; **prefer the service id from the location** as the shop id.
4. Double quotes throughout.

### Shop shape

```python
{
    "id": "general_store",
    "name": "Player-facing shop name",
    "location_id": "phandalin_frontier",
    "accepts_sells": True,
    "buyback": 0.5,
    "stock": [
        { "item": "Rope", "price": { "gold": 1 } },
        { "item": "Rations", "price": { "gold": 5 } },
        { "item": "Potion of Healing", "price": { "gold": 50 }, "qty": 6 },
    ],
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Same as dict key |
| `name` | yes | Flavour + type (“Amphail General Goods”) |
| `location_id` | yes | Must match a pasted location id |
| `accepts_sells` | no | Default True for general stores |
| `buyback` | no | Default 0.5 |
| `stock` | yes | Non-empty list |

**Stock `item` names** must be plausible D&D 5e item names (Rope, Rations, Potion of Healing, Lantern, Backpack, …). Use **gold** in `price` unless brief says otherwise.

### Shop type guidance

| Service id | Stock flavour |
|------------|----------------|
| `general_store` | Rope, rations, torches, basic tools |
| `inn` | Rations, ale, room-flavour items (no magic) |
| `blacksmith` | Weapons/armor names appropriate to tier (Dagger, Shortsword, Chain Shirt) |
| `brewery` | Ale, basic potions if alchemist-adjacent |
| `library` | No stock — **omit** unless selling maps/scrolls; skip library service as shop |
| `scribe` | Ink, parchment, minor scrolls |

Skip **`library`** as a shop unless selling physical goods. One shop per **service id** in the paste list (except library).

### Your task

Generate **5–10** shops covering the pasted location/service pairs not already in existing shop ids.
