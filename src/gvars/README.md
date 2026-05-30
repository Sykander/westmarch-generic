# Engine gvars (`src/gvars/`)

Workshop **global modules** deployed with the westmarch-generic engine. Aliases import them via `env.gvars.*`.

**Status:** Layout and API contracts are documented under [docs/internal/projects/westmarch-statement/gvars/](../../docs/internal/projects/westmarch-statement/gvars/README.md). Implementation lands in **Phase 0** (config, auth, core helpers, encounter slice) and **Phase 1** (subsystem modules).

Only bootstrap artifacts exist in this tree today:

| Path | Purpose |
|------|---------|
| `env.dev.gvar` / `env.prod.gvar` | Generated UUID map — run `make rebuild` after sourcemap changes |
| `example/` | Bootstrap placeholder (not production engine) |
| `configs/starter.gvar` | Minimal server config template |
| `configs/biomes/` | Preset biome pool modules (planned bodies) |

## Planned layout

```
src/gvars/
  env.*.gvar              # generated
  core/                   # vendored helpers — see gvars/core.md
  config/config.gvar      # engine loader (get_config) — not configs/
  display/display.gvar
  check_config/check_config.gvar
  world/biomes.gvar       # runtime biome resolver (lazy load)
  configs/                # server config bodies + preset data
    starter.gvar
    biomes/               # preset pool modules
    generic_fantasy_2014.gvar
    …
  auth/auth.gvar
  pc/pc.gvar
  encounters/ …
  catalogues/ …
  economy/ …
  content/ …
  misc/ …
```

**Engine loader:** `config/config.gvar` · **Embed branding:** `display/display.gvar` · **Owner / example data:** owner workshop gvar, [configs/starter.gvar](configs/starter.gvar), or other presets under **`configs/`**.

Server **config** gvars normally live in the **owner’s** workshop. See [docs/setup.md](../../docs/setup.md).
