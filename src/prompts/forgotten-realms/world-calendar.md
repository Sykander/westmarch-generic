# Forgotten Realms — calendar

**Prompt:** [`world-calendar.prompt.md`](world-calendar.prompt.md)

**Schema:** [Calendar](../../../docs/internal/projects/westmarch-statement/data-shapes.md#calendar)

Use when `policies.time.mode` is `world_clock`.

## Validation

- [ ] Twelve months, 30 days each
- [ ] `primary` key present
- [ ] Four seasons with `start_day_of_year`

## Integration

> Set `world_data.calendars` and enable `subsystems.travel.commands.time`.
