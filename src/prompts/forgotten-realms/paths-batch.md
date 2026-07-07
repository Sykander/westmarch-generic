# Forgotten Realms — paths (batch)

**Prompt:** [`paths-batch.prompt.md`](paths-batch.prompt.md)

**Goal:** **15–25** one-way path edges per chat.

**Schema:** [Path](../../../docs/internal/projects/westmarch-statement/data-shapes.md#path)

## Before you send

Paste **all location ids** (or the subgraph ids for this region). Optionally name a **hub** to star-connect first.

## Validation

- [ ] Assigns to `world_data_paths` (list)
- [ ] Every `from` / `to` is in your pasted id list
- [ ] Every step `type` is `encounter`, `proceed`, or `cost`
- [ ] Only shortest/fastest routes have fewer than 2 encounter steps; ordinary routes have 2–3, and long routes can have 4+
- [ ] Encounter steps use allowed biome codes only
- [ ] No duplicate `(from, to, transport)` — missing `requirements.transport` means unrestricted
- [ ] Bidirectional routes have two entries if both directions are travelable
- [ ] Route length belongs in `distance_miles` / `travel_hours`; do not add repeated filler steps

## Integration

> Merge these entries into `forgotten_realms_2014_paths.gvar.json` under `paths_by_from`, grouped by each path's `from` id. Skip duplicates matching same `from`, `to`, and `requirements.transport`.

## Tips

- Connect trial hub to every wilderness node before adding wilderness-only edges.
- Ferry/toll: use top-level `cost` and/or a `cost` step with same gold amount.
