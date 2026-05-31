# Example server configs *(planned)*

Prefab **config gvar** bodies for tests and onboarding. Full spec: [docs/internal/projects/westmarch-statement/gvars/configs.md](../../docs/internal/projects/westmarch-statement/gvars/configs.md).

| File / folder | Purpose |
|---------------|---------|
| **`starter.gvar`** | Minimal schema — all subsystems off, no world data |
| **`biomes/`** | Preset biome **`pools`** modules — **`engine:configs/biomes/<code>`** |
| **`books/`** | Library corpora from TSV — **`forgotten_realms_*`**, **`real_*`** (`npm run generate:books`) |
| **`recipes/`** | Crafting catalogue — **`recipes_list.gvar`** (`npm run generate:recipes`) |
| `forgotten_realms_2014.gvar` | Forgotten Realms · 2014 |
| `forgotten_realms_2024.gvar` | Forgotten Realms · 2024 |
| `generic_fantasy_2014.gvar` | Generic fantasy · 2014 |
| `generic_fantasy_2024.gvar` | Generic fantasy · 2024 |
| `spelljammer_2014.gvar` | Spelljammer · 2014 |

Not to be confused with **`config/`** (engine `get_config()` loader at `src/gvars/utils/config/`).

**Content prompts:** [`src/prompts/`](../../prompts/README.md) · [Full build guide](../../../docs/internal/projects/prompt-generation/README.md)
