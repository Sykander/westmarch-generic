# travel — MVP implementation

**Subsystem:** travel · **Toggle:** `SUBSYSTEMS.travel.commands.travel` · **Phase:** 1 (Tier C)

westmarch **travel** manages character location, journey planning, route display, and manual step progression. Powers **`journeys.gvar`**, which [location.md](location.md) and **enc** journey hooks depend on.

## Player-facing behaviour

```
!travel                          # current location + active journey progress
!travel <location> [journey|track]  # route to nearby area; optional set journey
!travel next                     # advance journey step manually
!travel reset                    # clear journey progress
!travel set <location>           # GM-style set location (reset journey)
```

Optional flags: `horse`, `boat` — affect path steps from config.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/misc/travel.alias` |
| Alias tests | `westmarch/src/aliases/misc/travel.alias-test` |
| Journeys | `westmarch/src/gvars/areas/journeys.gvar` |
| Areas | `westmarch/src/gvars/areas/areas.gvar` |
| Paths | `westmarch/src/gvars/areas/paths.gvar` |

Character cvars: `Westmarch_location`, `Westmarch_journey`, `Westmarch_locations_data`.

## Generic architecture

```mermaid
flowchart TD
  A[!travel alias] --> B{resolve_config}
  B --> C{travel.commands.travel?}
  C --> D[journeys + areas + paths from config]
  D --> E{subcommand}
  E -->|none| F[describe location + journey]
  E -->|route| G[plan path / set journey]
  E -->|next/set/reset| H[mutate cvars]
```

### Engine vs config split

| Data | Owner |
|------|-------|
| `journeys.gvar`, `paths.gvar` logic | **Engine** |
| `AREAS`, `PATHS`, journey templates | **Config** |
| Default start location | **Config** `DEFAULT_LOCATION` |
| Activity codes per area (`encs`, etc.) | **Config** — feeds travel help table |

### Integration points

- [location.md](location.md) — read-only subset
- [exploration/enc.md](../exploration/enc.md) — `journeys.next_step()` on matching enc step
- [economy/buy.md](../economy/buy.md) — optional shop location gates

## Implementation checklist

### Minimum shippable

- [ ] Port **`journeys.gvar`** — config defaults, get/set location/journey
- [ ] Port **`areas`** / **`paths`** loaders from config
- [ ] **`travel.alias`** — loader, toggle, `!travel` status view + `set` + `reset`
- [ ] Defer full multi-leg journey UI to Phase 1b if needed; prove location cvar + one route
- [ ] Template config — 2 areas, 1 path
- [ ] **`travel.alias-test`** — help, location display smoke
- [ ] Unblocks **location** status command

### MVP deferrals

- Full journey markdown with horse/boat branching parity
- Gold-cost path steps with coinpurse debit
- Area activity table in travel embed (link to exploration help)

## Exit criteria

| Criterion | Verification |
|-----------|----------------|
| Set location → persists in cvar | Alias-test |
| Bare `!travel` shows location name | Alias-test |
| Toggle off / unset svar | Alias-test |

## Related

- [README.md](README.md) — travel subsystem
- [downtime/downtime.md](../downtime/downtime.md) — Tier D (separate subsystem)
