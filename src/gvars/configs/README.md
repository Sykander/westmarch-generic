# Example server configs

Prefab **config gvar** bodies for tests and onboarding. Full spec: [docs/internal/projects/westmarch-statement/gvars/configs.md](../../../docs/internal/projects/westmarch-statement/gvars/configs.md).

| File / folder | Purpose |
|---------------|---------|
| **`starter.gvar`** | Minimal schema — all subsystems off, no world data |
| **`biomes/`** | Preset biome **JSON row-list** bodies — **`engine:configs/biomes/<code>`** |
| **`books/`** | Library corpora from TSV — Forgotten Realms shards are engine-registered as **`engine:configs/books/forgotten_realms_*`** / runtime UUIDs; **`real_*`** remains owner data (`npm run generate:books`) |
| **`recipes/`** | Crafting catalogue — **`recipes_list.gvar.json`** (`npm run generate:recipes`) |
| **`forgotten_realms_2014.gvar`** | Forgotten Realms · 2014 — Sword Coast starter baseline with travel, location, time, weather, economy, content, engine biome registry, and Forgotten Realms book shard UUIDs |
| **`forgotten_realms_2014_locations.gvar.json`** | Location map referenced by **`forgotten_realms_2014.gvar`** via **`world_data.locations_gvar_id`**; includes starter location encounter quest hooks with stable quest IDs; the editor displays the shipped UUID as **`engine:configs/forgotten_realms_2014_locations`** |
| **`forgotten_realms_2014_paths.gvar.json`** | Origin-indexed path graph referenced by **`forgotten_realms_2014.gvar`** via **`world_data.paths_gvar_id`**; the editor displays the shipped UUID as **`engine:configs/forgotten_realms_2014_paths`** |
| **`westmarch_2014.gvar`** | Westmarch · 2014 — reference server starter baseline with Nexus, Base Camp, Oakwood, Four Bridges, Mistcloak Mountain, migrated economy seed, and `wm-*` engine biome registry |
| **`westmarch_2014_locations.gvar.json`** | Location map referenced by **`westmarch_2014.gvar`** via **`world_data.locations_gvar_id`**; the editor displays the shipped UUID as **`engine:configs/westmarch_2014_locations`** |
| **`westmarch_2014_paths.gvar.json`** | Origin-indexed path graph referenced by **`westmarch_2014.gvar`** via **`world_data.paths_gvar_id`**; includes copied horse/boat route variants from the reference server; the editor displays the shipped UUID as **`engine:configs/westmarch_2014_paths`** |
| `forgotten_realms_2024.gvar` | Planned: Forgotten Realms · 2024 |
| `generic_fantasy_2014.gvar` | Planned: generic fantasy · 2014 |
| `generic_fantasy_2024.gvar` | Planned: generic fantasy · 2024 |
| `spelljammer_2014.gvar` | Planned: Spelljammer · 2014 |

Not to be confused with **`config/`** (engine `get_config()` loader at `src/gvars/utils/config/`).

**Content prompts:** [`src/prompts/`](../../prompts/README.md) · [Full build guide](../../../docs/internal/projects/prompt-generation/README.md)
