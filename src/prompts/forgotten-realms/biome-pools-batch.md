# Forgotten Realms — biome pools (batch)

**Prompt:** [`biome-pools-batch.prompt.md`](biome-pools-batch.prompt.md)

**Goal:** One **biome gvar body** per chat (`biome_pools` export).

**Schema:** [Biome gvar body](../../../docs/internal/projects/westmarch-statement/data-shapes.md#biome-gvar-body-separate-workshop-module) · [Encounter](../../../docs/internal/projects/westmarch-statement/data-shapes.md#encounter-input)

## Before you send

1. Replace **`[BIOME_CODE]`** in the prompt (both places).
2. Paste which **activities** this biome needs (from locations using that code).

## One chat per biome

Do not combine forest + urban in one response — output will truncate.

If truncated, follow up: “Same rules — add 5 more to `enc.combat` only; full `biome_pools` dict.”

## Validation

- [ ] Assigns to `biome_pools`
- [ ] Every encounter has `name`, `description`, `kind`
- [ ] Combat entries have `cr`
- [ ] No Python functions
- [ ] Activities match paste list

## Integration

> Create `src/gvars/configs/biomes/<code>_fr.gvar` (or owner workshop module) exporting `biome_pools = …`. Publish; set registry `gvar_id` to UUID. Until then, keep `engine:configs/biomes/<code>` for tests.

## Scale

For 10+ biomes with custom flavour: prioritize codes used by most locations; leave rare codes on engine presets.
