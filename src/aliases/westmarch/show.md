Shows the loaded `westmarch_config` summary for server configurers.

Usage:

```text
!westmarch show
!westmarch show <section>
!westmarch show -page <section>
```

Sections: `wiring`, `subsystems`, `policies`, `crafting`, `display`, `runtime`, `data`, `biomes`, `player_setup`.

Bare `show` is a compact runtime status card: gvar wiring, load status, rules
edition, world name, enabled subsystem/command counts, high-level data counts,
editor/dashboard links, and the available detail sections.

The `data` section summarizes `world_data` counts, including locations, paths,
transport modes, and biome registry entries. The subsystem summary includes
travel display toggles and economy job-location config.

The `crafting` section shows the resolved crafting rules override, recipe mode, known-spell scribing gate, catalogue sources, checks/tools, and item-output bag policy. Validation still lives in the web editor Check page.
