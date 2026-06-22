# travel — MVP implementation

**Subsystem:** travel · **Toggle:** `subsystems.travel.commands.travel` · **Phase:** 1 (Tier C)

westmarch **travel** manages character location, journey planning, route display, and manual step progression. Powers **`journeys.gvar`**, which [location.md](location.md) and **enc** journey hooks depend on.

## Player-facing behaviour

```
!travel                          # current location + active journey progress
!travel <location> [transport...] [journey|track]  # route to area; optional set journey
!travel next                     # advance journey step manually
!travel reset                    # clear journey progress
!travel set <location>           # GM-style set location (reset journey)
```

Optional transport flags are configured ids or aliases from `world_data.transport`
such as `horse`, `cart`, `boat`, `ship`, `fly`, or `portal`. They add to the
default transport, and players can set persistent defaults with
`!cvar westmarch_travel_transport ["fly", "walk", "swim"]`.

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
  A[!travel alias] --> B{get_config}
  B --> C{travel.commands.travel?}
  C --> D[locations + paths + journeys]
  D --> E{subcommand}
  E -->|none| F[display_location + journey]
  E -->|route| G[journeys.find_journey / set journey cvar]
  E -->|next/set/reset| H[mutate cvars]
```

### Engine vs config split

| Data | Owner |
|------|-------|
| Location lookup + display | **Engine** [locations.gvar](../../gvars/locations.md) |
| Path edges + routing + journey cvars | **Engine** [paths.gvar](../../gvars/paths.md) + [journeys.gvar](../../gvars/journeys.md) |
| Journey cvars, `next_step` | **Engine** `journeys.gvar` *(planned)* |
| `locations`, `paths`, `default_location` | **Config** — [data-shapes.md](../../data-shapes.md) |
| Activity codes per location | **Config** `locations.*.activities` — feeds travel help table |

### Integration points

- [location.md](location.md) — read-only subset
- [exploration/enc.md](../exploration/enc.md) — `journeys.next_step()` on matching enc step
- [economy/buy.md](../economy/buy.md) — optional shop location gates

## Implementation checklist

### Minimum shippable

- [x] Port **`locations.gvar`** — [gvars/locations.md](../../gvars/locations.md)
- [x] Port **[paths.gvar](../../gvars/paths.md)** + **[journeys.gvar](../../gvars/journeys.md)** — `find_journey` Dijkstra parity for config paths
- [x] Port **`journeys.gvar`** — config defaults, get/set location/journey cvars
- [x] **`travel.alias`** — loader, toggle, `!travel` status view + `set` + `reset`
- [x] Template config — 2 locations, 1 path ([data-shapes.md](../../data-shapes.md))
- [x] **`travel.alias-test`** — help, location display, lookup, route, set/reset/next smoke
- [x] Unblocks **location** status command
- [x] Automatic **`!enc`** journey-step completion hook

### Current slice notes

- Shipped cvars use generic names: **`wg_location`**, **`wg_journey`**, **`wg_locations_data`**.
- Runtime accepts generic path shape plus westmarch import shorthand (**`encs`**, **`horse`**, **`boat`**, **`gold`**) to ease migration.
- Runtime accepts multiple generic transport ids from **`world_data.transport`**, combines them with default/cvar transport availability, and stores the available set on the active journey.
- Path transport icons render once per path from **`requirements.transport`**, not on every step.
- Automated path costs / rations remain deferred; cost steps are displayed but not deducted.
- Successful `!enc <biome>` completes the active journey step when the next step is a matching encounter step.

### MVP deferrals

- Gold-cost path steps with coinpurse debit
- Ration consumption and item/wallet path costs

## Exit criteria

| Criterion | Verification |
|-----------|----------------|
| Set location → persists in cvar | Alias-test |
| Bare `!travel` shows location name | Alias-test |
| Toggle off / unset svar | Alias-test |

## Related

- [README.md](README.md) — travel subsystem
- [downtime/downtime.md](../downtime/downtime.md) — Tier D (separate subsystem)
