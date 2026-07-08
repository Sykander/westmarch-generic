# Locations and Travel

Use this guide when you want players to move between named places in your westmarch-generic world.

Locations are specific places. Paths connect them. Transport options and route requirements decide how players can travel between them.

## Minimum Travel Setup

A useful first travel setup needs:

| Data | Why it matters |
|------|----------------|
| At least two locations | Players need a start and destination |
| A path between them | Travel commands need a route |
| Display names and descriptions | Embeds should be readable and setting-specific |
| Optional services | Shops, jobs, or other commands can discover what exists at the location |
| Optional biome or encounter pools | Exploration and travel events need local context |

Start small. Two connected locations are enough to validate travel before building a full map.

## Location Entries

Each location should answer:

- What is this place called?
- What should players see when they run a location command?
- Which services are available here?
- Which paths leave from here?
- Which biome or encounter context applies nearby?

Use stable ids for config references and readable names for players.

Example concept:

```text
id: waterdeep
name: Waterdeep
services: shops, jobs, travel
nearby biome: coastal-city
paths: triboar-trail, long-road
```

## Paths

A path is the connection between locations. It should describe:

- origin and destination
- travel time or distance
- route name
- allowed transport options
- optional requirements or risks
- optional encounter or weather context

Prefer a few intentional routes over a dense graph that is hard to maintain.

## One-Way And Two-Way Routes

Decide whether each route should work both ways.

Most roads should be two-way. Some routes may be one-way because of story logic, terrain, portals, toll gates, or seasonal access.

If players should be able to return, make sure the reverse route is configured or the path model explicitly supports bidirectional travel.

## Travel Requirements

Requirements should explain what a character needs before starting travel.

Common examples:

- enough coin for a coach, ship, guide, or caravan
- a minimum party size
- a specific item, mount, document, or faction permission
- a weather or season condition
- staff approval for dangerous routes

Keep requirements visible in location or route output where possible. Hidden requirements are harder for players to diagnose.

## Services At Locations

Location services connect travel to other subsystems.

Examples:

- shops for `!buy` and `!sell`
- jobs or contracts for economy loops
- temples, healers, taverns, or stables as configured services
- quest boards or local hooks
- library or recipe access if content commands are enabled

If a service appears in text, configure the backing data or make clear that it is roleplay-only.

## Smoke Tests

After adding locations and paths, test from the server:

```text
!location
!location <start-location>
!location <destination>
!travel <destination>
!westmarch show
```

If economy or exploration depends on the location, also test:

```text
!buy
!sell
!enc
```

Use exact location names first. Then test partial names to make sure lookup behavior is clear.

## Related Guides

- [World data](world-data.md)
- [Biomes](biomes.md)
- [Encounters](encounters.md)
- [Economy](economy.md)
- [Validation](validation.md)
