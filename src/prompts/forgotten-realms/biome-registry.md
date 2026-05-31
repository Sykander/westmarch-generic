# Forgotten Realms — biome registry

**Prompt:** [`biome-registry.prompt.md`](biome-registry.prompt.md)

**Goal:** One-shot **`world_data.biomes`** registry mapping codes → biome gvar ids.

**Schema:** [Biome registry](../../../docs/internal/projects/westmarch-statement/data-shapes.md#biome-registry)

## When to run

After locations (and ideally paths) exist — collect all biome codes from exploration commands and path encounter steps.

## Validation

- [ ] Every pasted code appears exactly once
- [ ] No codes outside allowed list
- [ ] Standard entries use `engine:configs/biomes/<code>`
- [ ] Placeholders only for codes marked custom

## Integration

> Set `world_data.biomes` in preset config. Replace `PLACEHOLDER_*` after publishing custom biome gvars.

## Next step

Custom codes → [`biome-pools-batch`](biome-pools-batch.md) one chat per code. Engine presets need no pool prompt for smoke tests.
