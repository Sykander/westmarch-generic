# Forgotten Realms config baseline audit

Status: completed for slice 0; runtime notes updated through slice 5.

## Runtime support checked

- `src/gvars/configs/forgotten_realms_2014.gvar` previously used a generic one-location baseline with travel disabled.
- `src/gvars/utils/world/locations.gvar` already resolves location ids and names through `lists.search_list`, returning the standard no match / one match / many matches shape for aliases.
- `src/gvars/utils/world/paths.gvar` supports directed path edges, `requirements.transport`, configured transport aliases, step display, transport icons, and safe encounter-step rendering when a biome is absent.
- `src/gvars/utils/world/journeys.gvar` stores character location, active journey state, selected transport id, route progress, and Dijkstra route planning over configured paths.
- `src/gvars/utils/world/weather.gvar`, `src/aliases/travel/time.alias`, and `src/aliases/travel/weather.alias` are implemented and read `world_data.calendars` plus `world_data.weather.by_area`.
- `src/gvars/utils/economy/shops.gvar`, `src/aliases/economy/job.alias`, `src/aliases/economy/buy.alias`, and `src/aliases/economy/sell.alias` are implemented, but economy commands remain disabled in the Forgotten Realms preset until shops/services are seeded.
- The editor validates calendar ids, weather areas, biome registry entries, travel default locations, path shape, path transport requirements, and required transport icon keys in `editor/src/lib/config.ts`.

## Runtime limits

- `!travel` accepts configured `world_data.transport` ids and aliases, preserving `horse` / `boat` compatibility through config aliases or ids.
- The Forgotten Realms starter now has a transport catalogue, location atlas, biome registry, and directed route graph. `world_data.paths` includes land, river, and sea starter routes with explicit transport requirements.
- The `job` command is skill/payout based; it does not consume a named job catalogue. Starter job flavor should live in location/shop text until a job schema exists.
- Location images should not be added from wiki/sourcebook hotlinks. The checked-in Sword Coast map assets remain internal reference material unless a hosted/licensed runtime asset set is approved.

## Editor/schema notes

- Slice 1 added data to existing config paths only: `display`, `subsystems.travel.config.transport_icons`, `world_data.calendars`, `world_data.weather.by_area`, and location `calendar_id` / `weather_area`.
- Slice 2 added `world_data.transport` and editor validation for `world_data.paths.*.requirements.transport`.
- Slice 3 expanded `world_data.locations`; shops/services remain deferred, so no location references missing shop ids.
- Slice 4 reused the existing engine biome registry through `world_data.biomes`.
- Slice 5 seeded `world_data.paths` without adding new schema fields.
