# items.gvar

**Path:** `src/gvars/utils/catalogues/items/items.gvar`

Item catalogue facade for mundane items, potions, and magic items. Engine defaults come from the generated TSV shards:

- `items_list.gvar.json`
- `potions_list.gvar.json`
- `magic_items_list.gvar.json`

Server config can replace or extend each catalogue through `subsystems.crafting.config.catalogues`, `world_data.catalogues`, or `extensions`.

## API

```py
items.catalogue_entries(cfg, "items")
items.resolve(cfg, "potions", "Potion of Healing")
items.search(cfg, "magic_items", "Cloak of Protection")
items.name_matches(cfg, "items", "rope")
items.match_error("items", "rope", matches)
items.item_name(item)
items.item_rarity(item)
items.item_value_gp(item)
```

Resolution uses `lists.search_list_by_key` and follows the standard 0 / 1 / many result shape.

## Catalogue Config

```py
"catalogues": {
    "items": "engine:catalogues/items",
    "potions": "engine:catalogues/potions",
    "magic_items": "engine:catalogues/magic_items",
}
```

Values may be engine slugs, UUID strings, inline lists, or objects like `{"gvar_id": "...", "include_engine": True}`.
