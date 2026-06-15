# Prompt asset catalog

Every LLM-authored asset for westmarch-generic configs. Batch sizes tuned for ChatGPT free tier.

**Legend:** **Req** = must exist before this prompt · **Batch** = entries per chat · **Out** = Python assignment name

---

## Summary table

| # | Asset | Prompt pair | Batch | Out variable | Req |
|---|-------|-------------|-------|--------------|-----|
| 1 | Locations | `forgotten-realms/locations` | 10 bootstrap / 10–15 expand | `world_data_locations` | — |
| 2 | Biome registry | `forgotten-realms/biome-registry` | 1 shot | `world_data_biomes` | Location biome codes |
| 3 | Paths | `forgotten-realms/paths-batch` | 15–25 | `world_data_paths` | Location ids |
| 4 | Shops | `forgotten-realms/shops-batch` | 5–10 | `config_shops` | Locations + services |
| 5 | Biome pools | `forgotten-realms/biome-pools-batch` | 1 biome | `biome_pools` | Registry code |
| 6 | Recipes | `forgotten-realms/recipes-batch` | 8–12 | `config_recipes` | — |
| 7 | Books | `forgotten-realms/books-batch` | 5–8 | `config_books` | `library_topics` (optional) |
| 8 | Transport | `forgotten-realms/world-transport` | 1 shot | `world_data_transport` | — |
| 9 | Calendar | `forgotten-realms/world-calendar` | 1 shot | `world_data_calendars` | — |

**Templates:** `_templates/revision`, `_templates/expand-batch`

---

## Not prompted (use other pipelines)

| Asset | Where | Notes |
|-------|-------|-------|
| Monsters | `assets/monsters.tsv` → generate | Hunt/loot combat references CR |
| Items / potions / magic items | `assets/items.tsv` | Shop stock names must match |
| Spells | `assets/spells.tsv` | Scribe recipes |
| Subsystems / policies | `starter.gvar` | Human toggles |
| Display branding | config `display` dict | Short human edit or future prompt |
| Currencies | `currencies` dict | Only if custom wallet ids beyond gp — small enough to hand-author |
| Quests / diary / journal | Post-MVP | No prompts yet |

---

## Config placement

| Out variable | Integrate to |
|--------------|--------------|
| `world_data_locations` | `world_data.locations` |
| `world_data_paths` | `world_data.paths` (list, extend) |
| `world_data_biomes` | `world_data.biomes` |
| `world_data_transport` | `world_data.transport` |
| `world_data_calendars` | `world_data.calendars` |
| `config_shops` | top-level `shops` |
| `config_recipes` | top-level `recipes` |
| `config_books` | top-level `books` |
| `biome_pools` | separate biome `.gvar` body → publish → set `gvar_id` in registry |

Schema links: [Location](../westmarch-statement/data-shapes.md#location) · [Path](../westmarch-statement/data-shapes.md#path) · [Shop](../westmarch-statement/data-shapes.md#shop) · [Encounter](../westmarch-statement/data-shapes.md#encounter-input) · [Biome gvar body](../westmarch-statement/data-shapes.md#biome-gvar-body-separate-workshop-module) · [Recipe](../westmarch-statement/data-shapes.md#recipe)

---

## Biome codes (shared)

Used in locations, paths, and biome prompts:

`beach`, `forest`, `mountain`, `cave`, `ruins`, `road`, `urban`, `river`, `sea`, `plains`, `desert`, `swamp`, `sky`, `deep_seas`, `underdark`, `tundra`, `jungle`, `volcanic`, `astral`

Maintainer snippet: [`src/prompts/_shared/biome-codes.md`](../../../../src/prompts/_shared/biome-codes.md)

---

## Scaling patterns

### Locations (20 → 100+)

1. **`locations`** with `Mode: bootstrap` — hub + variety (~10).
2. Repeat **`locations`** with `Mode: expand`, pasted **existing ids** and a **region brief**.
3. Merge in Cursor; never ask ChatGPT for the full 100-key dict in one shot.

### Paths

- **Hub-and-spoke first:** hub ↔ each adjacent location (2 entries per undirected link if travel is bidirectional).
- **Wilderness loops:** 3–5 location chains with 1–2 encounter steps between nodes.
- **Transport variants:** duplicate `from`/`to` with different `requirements.transport` only when steps differ materially.

### Biome pools

- Start with **3–5 biomes** your locations actually use.
- Use **engine presets** for the rest until you need custom flavour.
- One biome chat ≈ 30–60 encounter dicts if you fill enc + one gather activity — split into two chats (“forest enc only”, “forest forage/lumber”) if output truncates.

### Shops

- Not every location needs a shop dict — only ids listed in location `services` where `buy`/`sell` is enabled.
- Generic stock can repeat (`Rope`, `Rations`, `Potion of Healing`); flavour names in shop `name` only.

---

## Setting forks

To author **generic fantasy** instead of FR:

1. Copy `forgotten-realms/*.prompt.md` → `generic-fantasy/`.
2. Replace **Setting** section (proper nouns, tone).
3. Keep schema blocks identical.

Spelljammer: emphasize `astral`, `sky`, `deep_seas` biomes and spelljammer transport in paths/registry prompts.
