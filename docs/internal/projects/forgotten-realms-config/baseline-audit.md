# Forgotten Realms config baseline audit

Status: completed for slices 0-1.

## Runtime support checked

- `src/gvars/configs/forgotten_realms_2014.gvar` previously used a generic one-location baseline with travel disabled.
- `src/gvars/utils/world/locations.gvar` already resolves location ids and names through `lists.search_list`, returning the standard no match / one match / many matches shape for aliases.
- `src/gvars/utils/world/paths.gvar` already supports directed path edges, `requirements.transport`, step display, transport icons, and safe encounter-step rendering when a biome is absent.
- `src/gvars/utils/world/journeys.gvar` already stores character location, active journey state, route progress, and Dijkstra route planning over configured paths.
- `src/gvars/utils/world/weather.gvar`, `src/aliases/travel/time.alias`, and `src/aliases/travel/weather.alias` are implemented and read `world_data.calendars` plus `world_data.weather.by_area`.
- `src/gvars/utils/economy/shops.gvar`, `src/aliases/economy/job.alias`, `src/aliases/economy/buy.alias`, and `src/aliases/economy/sell.alias` are implemented, but economy commands remain disabled in the Forgotten Realms preset until shops/services are seeded.
- The editor already validates calendar ids, weather areas, biome registry entries, travel default locations, path shape, and required transport icon keys in `editor/src/lib/config.ts`.

## Runtime limits

- `!travel` currently exposes only the legacy `horse` and `boat` route flags at the alias layer.
- `paths.gvar` can already filter by arbitrary transport ids internally, but `journeys.gvar` and `travel.alias` do not yet resolve every configured `world_data.transport` id from user input or persist a generic transport id on active journeys.
- Generic transport flag resolution is therefore still a runtime gap for the later transport slice. The required future behavior is `!travel <destination> <transport-id>` for any valid configured `world_data.transport` id, with `horse` and `boat` compatibility preserved.
- The `job` command is skill/payout based; it does not consume a named job catalogue. Starter job flavor should live in location/shop text until a job schema exists.
- Location images should not be added from wiki/sourcebook hotlinks. The checked-in Sword Coast map assets remain internal reference material unless a hosted/licensed runtime asset set is approved.

## Editor/schema notes

- Slice 1 adds data to existing config paths only: `display`, `subsystems.travel.config.transport_icons`, `world_data.calendars`, `world_data.weather.by_area`, and location `calendar_id` / `weather_area`.
- No new editor model or validation field was required before this data landed.
- `world_data.transport` remains planned for the transport catalogue slice; editor validation for references to that catalogue should land with the runtime transport work.
