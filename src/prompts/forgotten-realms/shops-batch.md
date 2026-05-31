# Forgotten Realms — shops (batch)

**Prompt:** [`shops-batch.prompt.md`](shops-batch.prompt.md)

**Goal:** **5–10** shop dicts per chat, wired to location `services`.

**Schema:** [Shop](../../../docs/internal/projects/westmarch-statement/data-shapes.md#shop)

## Before you send

Paste location → service id mapping from integrated `world_data.locations`.

## Validation

- [ ] `config_shops` dict; keys match inner `id`
- [ ] Every `location_id` exists in config
- [ ] Non-empty `stock`; items use `{ "gold": N }` prices
- [ ] No duplicate shop ids vs pasted existing list
- [ ] Library service skipped unless selling goods

## Integration

> Merge into top-level `shops` in `forgotten_realms_2014.gvar`. Enable `subsystems.economy.commands.buy` and `sell`.

## Note

Item names should eventually match engine [items.tsv](../../../../public/assets/items.tsv) — flag unknown names for a later items pass.
