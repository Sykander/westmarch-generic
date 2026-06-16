# Engine gvars (`src/gvars/`)

Workshop layout for the westmarch-generic engine:

| Path | Purpose |
|------|---------|
| `env.dev.gvar` / `env.prod.gvar` | Generated UUID map — run `npm run generate-env` after sourcemap changes |
| `configs/` | Server preset templates (`starter.gvar`, books, recipes) plus engine biome presets sourcemapped as `biome_<code>` |
| `utils/` | Engine modules deployed via `env.gvars.*` (auth, catalogues, world, core, …) |

**Status:** Module contracts — [docs/internal/projects/westmarch-statement/gvars/](../../docs/internal/projects/westmarch-statement/gvars/README.md). Sourcemap — [utils/sourcemap.dev.json](../../utils/sourcemap.dev.json).

## Layout

```
src/gvars/
  env.dev.gvar
  env.prod.gvar
  configs/                 # owner presets plus sourcemapped engine biome presets
    starter.gvar
    biomes/                # biome_<code>.gvar.json -> env.gvars.biome_<code>
    books/                 # generate-books.js — setting-specific library corpora
    recipes/               # generate-recipes.js — setting-specific crafting list
  utils/                   # engine modules (sourcemap-registered)
    core/                  # commands, embeds, rolls, …
    config/config.gvar     # server config loader
    auth/auth.gvar
    check_config/
    catalogues/            # monsters, items, spells
    world/                 # biomes, locations, paths, journeys, clock, weather
    pc/, encounters/, exploration/, economy/, crafting/, content/, display/, misc/
```

**Engine loader:** `utils/config/config.gvar` · **Owner data:** separate workshop gvar → `westmarch_config` svar. See [docs/setup.md](../../docs/setup.md).
