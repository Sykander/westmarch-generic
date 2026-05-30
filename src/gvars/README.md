# Engine gvars (`src/gvars/`)

Workshop **global modules** deployed with the westmarch-generic engine. Aliases import them via `env.gvars.*`.

**Status:** Placeholder modules wired in [utils/sourcemap.dev.json](../../utils/sourcemap.dev.json) / [sourcemap.prod.json](../../utils/sourcemap.prod.json). API contracts: [docs/internal/projects/westmarch-statement/gvars/](../../docs/internal/projects/westmarch-statement/gvars/README.md).

| Path | Purpose |
|------|---------|
| `env.dev.gvar` / `env.prod.gvar` | Generated UUID map — run `make rebuild` after sourcemap changes |
| `core/` | Vendored drac2-tools helpers |
| `config/`, `display/`, `auth/`, … | Engine domain modules (placeholders) |
| `configs/starter.gvar` | Minimal server config template (not in engine sourcemap) |
| `configs/biomes/` | Preset biome pool modules |

## Layout

```
src/gvars/
  env.*.gvar
  core/                   # commands, embeds, rolls, …
  config/config.gvar
  display/display.gvar
  check_config/check_config.gvar
  auth/auth.gvar
  pc/pc.gvar, pc/stats.gvar
  encounters/
  world/                  # biomes, locations, paths, journeys, clock, weather
  catalogues/monsters/, items/, spells/
  exploration/loot.gvar
  economy/shops.gvar
  crafting/crafting.gvar
  content/library.gvar
  misc/quests.gvar, recipe.gvar
  configs/                # owner templates — not engine env slots
```

**Engine loader:** `config/config.gvar` · **Owner data:** separate workshop gvar → `westmarch_config` svar. See [docs/setup.md](../../docs/setup.md).
