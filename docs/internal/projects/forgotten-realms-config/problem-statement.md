# Forgotten Realms config problem statement

## Background

`westmarch-generic` is meant to ship reusable Avrae game systems while server-owned world data lives in config gvars. The current Forgotten Realms starter preset follows that architecture, but it is intentionally skeletal: it exposes the setting identity and a single `frontier_camp` location so owners can start from a valid file.

That was useful for proving the config loader. It is not enough for a server that wants to run a real Forgotten Realms westmarch.

The project folder now includes D&D Beyond Sword Coast map assets:

- `assets/Sword-Coast-Map_HighRes.jpg`
- `assets/Sword-Coast-Map_MedRes.jpg`
- `assets/Sword-Coast-Map_LowRes.jpg`

Those maps should guide the first serious geography pass: major cities, roads, forests, mountains, lakes, rivers, seas, islands, and the practical paths that connect them.

## Problem

The Forgotten Realms starter config does not yet represent the setting as a playable travel, exploration, and economy surface.

Today it has:

- one placeholder location, `frontier_camp`;
- no route graph in `world_data.paths`;
- no Forgotten Realms transport catalogue;
- travel disabled;
- economy/content/crafting mostly disabled;
- no starter shops, services, location jobs, libraries, docks, stables, or ship routes;
- no clear image/media policy for location embeds;
- no documented boundary between "Sword Coast starter scope" and "all of Faerun later".

The result is that a server can load the config, but players cannot meaningfully travel from Waterdeep to Neverwinter, take the Trade Way toward Baldur's Gate, cross the Chionthar, book passage to the Moonshaes, explore the High Forest, or buy a horse, cart, boat, or ship passage in a location-aware way.

## Users

| User | Needs |
|------|-------|
| Server owner | A starter preset that feels like Forgotten Realms without hand-authoring a full atlas |
| Player | Familiar places, readable travel choices, and location-gated activities |
| GM/content author | A clear seed list they can extend without editing engine code |
| Maintainer | A config-only implementation that preserves the generic engine contract |
| Reviewer | Traceable source notes and a map-driven path model that can be checked |

## Scope tension

"Forgotten Realms" can mean all of Toril, all of Faerun, or the 5e-adventure-heavy Sword Coast. The checked-in map asset is the Sword Coast and nearby northwest Faerun, not every Realms region.

The first implementation should therefore be honest about scope:

1. Replace `frontier_camp` with a Sword Coast/North starter atlas.
2. Include the map-visible major settlements, roads, forests, mountains, rivers, lakes, seas, islands, and adjacent regions.
3. Keep the config extensible for future Chult, Calimshan, Thay, Moonsea, Dalelands, Cormyr, and other Faerun expansion passes.

## Constraints

- Server-specific data must remain in config, not engine aliases.
- Location lookup should keep using the standard `lists.search_list` 0 / 1 / many behavior through `locations.search_locations`.
- Paths are directed route edges in `world_data.paths`; bidirectional travel needs two entries.
- `!travel` should accept a route flag for any valid configured `world_data.transport` id. If the current runtime only selects `horse` and `boat`, that is an implementation gap to fix, not the intended behavior.
- `time` and `weather` commands are implemented, but enabling them requires matching `world_data.calendars` and `world_data.weather.by_area` data so Editor Check passes.
- Location images must use redistributable, owned, generated, or user-provided URLs. Do not hotlink wiki art or copyrighted sourcebook art into runtime config.
- Map assets are internal reference material unless the maintainer confirms hosting/licensing for runtime display.

## Required outcomes

The Forgotten Realms starter preset needs enough data to make these flows possible once implemented:

- `!location` defaults to a recognizable hub such as Waterdeep.
- `!travel Neverwinter` can find a route from Waterdeep through High Road locations.
- `!travel Baldur's Gate` can route south by Trade Way/Coast Way.
- Road travel uses road, forest, swamp, plains, mountain, or urban encounter steps as appropriate.
- River/lake/ocean routes require boat/ship-style transport or a crossing step.
- Bridges and ferries are represented explicitly when a road crosses a river.
- Locations show command availability for exploration, jobs, shops, crafting services, and libraries.
- Shops provide mundane supplies, stables, docks, and settlement-appropriate stock without pretending every village sells everything.
- Transport modes cover normal 2014 mounts and vehicles plus rare Realms-appropriate special travel such as flying mounts, swimming mounts, portals, and ship passage.
- `!time` and `!weather` work from the starter once its calendar and weather-area data are seeded.
- Documentation names the source and map basis for the initial data.

## Non-goals

- Full lore gazetteer detail for every place.
- Exact mile-by-mile travel simulation.
- Copying copyrighted sourcebook text into config descriptions.
- Exhaustive image collection before the first data pass.
- Engine changes in this documentation-only step.

## Source basis

Use the local map assets as the route reference. Use public sources only for high-level confirmation and authoring prompts, then write original short descriptions in the config.

Useful starting references:

- [D&D Beyond Basic Rules 2014: Mounts and Vehicles](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment#MountsandVehicles)
- [Forgotten Realms Wiki: Sword Coast](https://forgottenrealms.fandom.com/wiki/Sword_Coast)
- [Forgotten Realms Wiki: High Road](https://forgottenrealms.fandom.com/wiki/High_Road)
- [Forgotten Realms Wiki: Trade Way](https://forgottenrealms.fandom.com/wiki/Trade_Way)
- [Forgotten Realms Wiki: Long Road](https://forgottenrealms.fandom.com/wiki/Long_Road)
- [Forgotten Realms Wiki: Triboar Trail](https://forgottenrealms.fandom.com/wiki/Triboar_Trail)
