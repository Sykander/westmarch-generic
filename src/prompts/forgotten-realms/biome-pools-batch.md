# Forgotten Realms — biome rows (batch)

**Prompt:** [`biome-pools-batch.prompt.md`](biome-pools-batch.prompt.md)

**Goal:** One **biome gvar body** per chat (raw JSON row list).

**Schema:** [Biome gvar body](../../../docs/internal/projects/westmarch-statement/data-shapes.md#biome-gvar-body-separate-workshop-module) · [Encounter](../../../docs/internal/projects/westmarch-statement/data-shapes.md#encounter-input)

## Before you send

1. Replace **`[BIOME_CODE]`** in the prompt (both places).
2. Replace **`[BIOME_DISPLAY_NAME]`** and the biome brief.
3. Paste which **activities** this biome needs (from locations using that code).

## One chat per biome

Do not combine forest + urban in one response — output will truncate.

If truncated or continuing an existing biome file, follow up:

> Same rules - add 5 more new rows tagged `enc.combat` only. Output only the new rows as a JSON array. Do not repeat existing titles.

## Validation

- [ ] Top-level JSON array only; no assignment
- [ ] Every row is `[pool_tags_or_null, "template_name", ...args]`
- [ ] Pool tags match requested activities, e.g. `enc.gather`, `forage.gather`
- [ ] No `enc.quest` rows; quest hooks belong in location encounter pools with stable quest IDs
- [ ] Combat rows include CR in the template args
- [ ] Rows feel like notable half-day travel events, not incidental finds
- [ ] Descriptions usually land around 180-350 characters and stay under 400 characters
- [ ] `flavour` kind is omitted or one of `combat`, `gather`
- [ ] No duplicate titles, copied examples, or repeated seed rows
- [ ] No Python syntax, comments, or trailing commas

## Integration

> Create `src/gvars/configs/biomes/<code>_fr.gvar.json` (or owner workshop module) whose entire body is the JSON array. Publish; set registry `gvar_id` to UUID. Until then, keep `engine:configs/biomes/<code>` for tests.

## Scale

For 10+ biomes with custom flavour: prioritize codes used by most locations; leave rare codes on engine presets.
