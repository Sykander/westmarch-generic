# Engine preset biomes

**Path:** `src/gvars/configs/biomes/<code>.gvar` · **Phase:** 0–1 *(bodies land incrementally)*

Minimal **biome encounter modules** shipped with the westmarch-generic engine workshop. Example configs and new servers reference them via:

```py
world_data = {
    "biomes": {
        "forest": { "gvar_id": "engine:configs/biomes/forest", "name": "Forest" },
    },
}
```

After publish, **`engine:configs/biomes/forest`** resolves to this folder’s workshop UUID (sourcemap slot).

Not to be confused with **`src/gvars/config/`** — the engine **`config.gvar`** loader (`get_config()`).

## Preset codes

| Code | Typical use |
|------|-------------|
| `beach` | Coast, tidal zones |
| `forest` | Temperate woodland |
| `mountain` | Peaks, high trails |
| `cave` | Natural underground |
| `ruins` | Ruined structures, dungeons |
| `road` | Highways, trade routes |
| `urban` | Cities, towns |
| `river` | Rivers, lakeshores |
| `sea` | Open ocean |
| `plains` | Grassland, farms |
| `desert` | Arid regions |
| `swamp` | Marshes, bayous |
| `sky` | Aerial / high altitude |
| `deep_seas` | Deep underwater |
| `underdark` | Subterranean realms |
| `tundra` | Arctic wastes |
| `jungle` | Tropical forest |
| `volcanic` | Lava fields, calderas |
| `astral` | Wildspace, Spelljammer |

## Body shape

Each `.gvar` exports **`pools`** — activity → kind → encounter list. See [data-shapes.md § Biome gvar body](../../../../docs/internal/projects/westmarch-statement/data-shapes.md#biome-gvar-body-separate-workshop-module).

MVP presets include at least one **`gather`** entry per enabled activity for alias-test smoke; combat/quest entries grow with Tier B.

## westmarch port notes

Reference westmarch `src/gvars/encounters/biomes/*.gvar` for flavour and encounter ideas. When porting:

- Split legacy **`encounters`** + **`combat_encounters`** into **`pools.enc.combat`** / **`.gather`** / **`.quest`**
- Drop d100 list-builder weights — kind mix comes from **`subsystems.exploration.config.distribution`**
- **`enc_encounters`** in westmarch is often empty; **`encounters`** was the real pool — do not copy that structure literally

## Related

- [gvars/biomes.md](../../../../docs/internal/projects/westmarch-statement/gvars/biomes.md) — runtime loader
- [configs/README.md](../README.md) — example server configs that wire these presets
