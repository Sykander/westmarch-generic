# westmarch show

Summarizes the loaded `westmarch_config` for server configurers.

```text
!westmarch show
!westmarch show <section>
```

Sections: `wiring`, `subsystems`, `policies`, `crafting`, `display`, `runtime`, `data`, `biomes`, `player_setup`.

The `data` section summarizes `world_data` counts, including locations, paths,
transport modes, and biome registry entries. The subsystem summary includes
travel display toggles and economy job-location config.

The `crafting` section shows the resolved crafting rules override, recipe mode, known-spell scribing gate, catalogue sources, checks/tools, and item-output bag policy. Validation still lives in the web editor Check page.
