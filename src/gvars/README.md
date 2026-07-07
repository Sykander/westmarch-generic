# Engine gvars (`src/gvars/`)

Workshop layout for the westmarch-generic engine:

| Path                             | Purpose                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `env.dev.gvar` / `env.prod.gvar` | Ignored generated UUID map — run `npx nx run avrae-sourcemaps:generate-env` and `npx nx run avrae-sourcemaps:generate-env-prod` after sourcemap changes |
| `configs/`                       | Server preset templates (`starter.gvar`, split setting JSON gvars, books, recipes) plus engine biome presets sourcemapped as `biome_<code>` |
| `utils/`                         | Engine modules deployed via `env.gvars.*` (auth, catalogues, world, core, …)                                                                |

**Status:** Module contracts — [docs/internal/projects/westmarch-statement/gvars/](../../docs/internal/projects/westmarch-statement/gvars/README.md). Sourcemap — [utils/sourcemap.dev.json](../../utils/sourcemap.dev.json).

## Layout

```
src/gvars/
  env.dev.gvar               # generated, ignored
  env.prod.gvar              # generated, ignored
  configs/                 # owner presets plus sourcemapped engine biome presets
    starter.gvar
    forgotten_realms_2014.gvar
    forgotten_realms_2014_locations.gvar.json
    forgotten_realms_2014_paths.gvar.json
    westmarch_2014.gvar
    westmarch_2014_locations.gvar.json
    westmarch_2014_paths.gvar.json
    biomes/                # biome_<code>.gvar.json -> env.gvars.biome_<code>
    books/                 # generated, ignored — setting-specific library corpora
    recipes/               # generated, ignored — setting-specific crafting list
  utils/                   # engine modules (sourcemap-registered)
    core/                  # commands, embeds, rolls, …
    config/config.gvar     # server config loader
    auth/auth.gvar
    catalogues/            # generated catalogue shards plus facade gvars
    world/                 # biomes, locations, paths, journeys, clock, weather
    pc/, encounters/, exploration/, economy/, crafting/, content/, display/, misc/
```

**Engine loader:** `utils/config/config.gvar` · **Owner data:** separate workshop gvar → `westmarch_config` svar. See [docs/setup.md](../../docs/setup.md).
