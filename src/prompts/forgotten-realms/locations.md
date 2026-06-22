# Forgotten Realms — locations

**Prompt:** [`locations.prompt.md`](locations.prompt.md) — copy the **entire file** into ChatGPT.

**Goal:** Author location entries for **`forgotten_realms_2014_locations.gvar.json`** — bootstrap (~10) or expand (10–15 per batch).

**Schema:** [Location](../../../docs/internal/projects/westmarch-statement/data-shapes.md#location)  
**Guide:** [prompt-generation/workflow.md](../../../docs/internal/projects/prompt-generation/workflow.md)

## Before you send

Edit the **Configuration** section at the top of the prompt:

| Mode | Set `Mode:` to | Fill in |
|------|----------------|---------|
| First locations for preset | `bootstrap` | Region brief (optional); leave existing ids as `none` |
| Adding more | `expand` | Paste **existing location ids** + **region brief** |

## Validation checklist

- [ ] One `python` block; assigns to `world_data_locations`
- [ ] Key count matches mode (10 bootstrap / 10–15 expand)
- [ ] Every location has `name` + `commands`
- [ ] Exploration → biome lists; economy/crafting/content → `True`
- [ ] Biome codes from allowed list only
- [ ] No global commands in `commands`
- [ ] `services` / `library_topics` where required
- [ ] **Bootstrap:** `# default_location: <hub_id>` comment present
- [ ] **Expand:** no duplicate ids vs pasted existing list
- [ ] Valid Python syntax

## Integration

**Bootstrap:**

> Integrate `world_data_locations` into `forgotten_realms_2014_locations.gvar.json`, set `world_data.default_location` in `forgotten_realms_2014.gvar` from the comment.

**Expand:**

> Merge into `forgotten_realms_2014_locations.gvar.json`. Skip keys that already exist; report collisions.

## Follow-up

Same chat: [`expand-batch.prompt.md`](../_templates/expand-batch.prompt.md) — “add 10 more, full dict.”

New region: new chat with `Mode: expand` and updated id list.

## Next prompts

| After locations | Prompt |
|-----------------|--------|
| Paths | [`paths-batch.prompt.md`](paths-batch.prompt.md) |
| Biome registry | [`biome-registry.prompt.md`](biome-registry.prompt.md) |
