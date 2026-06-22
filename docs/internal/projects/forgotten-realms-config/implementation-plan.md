# Forgotten Realms config implementation plan

Goal: turn `src/gvars/configs/forgotten_realms_2014.gvar` into a playable Sword Coast/Forgotten Realms starter config while keeping all setting data in config and leaving the generic engine reusable.

This plan follows the solution statement and keeps work split into reviewable slices. Each slice should update config, docs, editor validation/UI, and tests together when the public config shape or behavior changes.

## Status

Slices 0-3 are implemented.

- Slice 0 audit: [baseline-audit.md](baseline-audit.md)
- Slice 1 preset identity/defaults: `src/gvars/configs/forgotten_realms_2014.gvar`
- Slice 2 transport catalogue: `world_data.transport` plus generic `!travel <transport-id>` runtime support.
- Slice 3 location atlas: Sword Coast/North locations with Waterdeep as the default.
- Remaining work starts with the biome registry/path graph follow-up slices.

## Phase 0 - Baseline audit

Inventory the current runtime and editor support before changing the config.

- Read `src/gvars/configs/forgotten_realms_2014.gvar`.
- Confirm current world data helpers:
  - `src/gvars/utils/world/locations.gvar`
  - `src/gvars/utils/world/paths.gvar`
  - `src/gvars/utils/world/journeys.gvar`
- Confirm economy helpers:
  - `src/gvars/utils/economy/shops.gvar`
  - `src/aliases/economy/job.alias`
  - `src/aliases/economy/buy.alias`
  - `src/aliases/economy/sell.alias`
- Confirm implemented time/weather helpers:
  - `src/aliases/travel/time.alias`
  - `src/aliases/travel/weather.alias`
  - `src/gvars/utils/world/weather.gvar`
- Confirm editor validation for locations, paths, shops, and transport icons in `editor/src/lib/config.ts`.
- Check current `!travel` flag behavior in `src/aliases/travel/travel.alias`.

Acceptance:

- Document any runtime limits that affect config authoring.
- Capture any current horse/boat-only behavior as a runtime gap: the required behavior is that `!travel` accepts any valid configured `world_data.transport` id as a transport flag.
- Identify whether any new fields require editor validation before config data lands.

## Phase 1 - Starter identity and subsystem defaults

Update the preset's high-level identity and enabled command set.

- Change display to:
  - `name`: `Forgotten Realms`
  - `description`: Sword Coast/Faerun starter wording
  - `footer`: `Forgotten Realms`
  - `colour`: keep current green unless design review chooses another colour
- Keep `rules_version = "2014"`.
- Enable `travel.commands.travel`, `travel.commands.location`, `travel.commands.time`, and `travel.commands.weather` in the final preset.
- Seed calendar and weather-area data before or alongside enabling `travel.commands.time` and `travel.commands.weather`.
- Enable `economy.commands.job`, `economy.commands.buy`, and `economy.commands.sell` only once shops are seeded.
- Keep `economy.commands.wallet` disabled unless custom currencies are added.
- Keep `crafting`, `downtime`, and `misc` disabled unless the implementation slice wires enough data to make them useful.
- Add or update `subsystems.travel.config.transport_icons` for common display keys.

Acceptance:

- `!westmarch show display` reports the Forgotten Realms identity.
- Editor Check reports no `world.calendars.empty` or `world.weather.empty` issues once `time` and `weather` are enabled.
- The config still parses in the editor after serialization.

## Phase 1a - Calendar and weather baseline

Seed the data required by the implemented `!time` and `!weather` commands.

- Add at least one Forgotten Realms calendar under `world_data.calendars`.
- Add broad weather areas under `world_data.weather.by_area`, such as coast, forest, mountain, plains, swamp, desert, tundra, ocean, and urban.
- Assign `weather_area` on major locations when regional weather should differ from biome fallback.
- Enable `subsystems.travel.commands.time` and `subsystems.travel.commands.weather` after this data exists.

Acceptance:

- `!time` can format the configured calendar.
- `!weather` can choose a forecast for the current/default location and for a named configured area.
- Editor Check does not emit `world.calendars.empty` or `world.weather.empty`.

## Phase 2 - Transport catalogue

Add `world_data.transport` as the owner-facing mode catalogue.

Seed these groups:

- Common land modes: `walk`, `riding_horse`, `draft_horse`, `warhorse`, `pony`, `mule`, `camel`, `elephant`, `mastiff`.
- Drawn vehicles: `cart`, `wagon`, `carriage`, `chariot`, `sled`.
- Water modes: `boat`, `rowboat`, `keelboat`, `longship`, `sailing_ship`, `galley`, `warship`, `ship`.
- Special modes: `fly`, `flying_mount`, `swim`, `swimming_mount`, `portal`, `teleport_circle`.

Recommended transport entry shape:

```py
"riding_horse": {
    "name": "Riding horse",
    "description": "Common road mount for overland travel.",
    "category": "mount",
    "terrain": ["road", "plains"],
}
```

Acceptance:

- `world_data.transport.walk.default` or equivalent default behavior is clear.
- Every transport id used by `world_data.paths.*.requirements.transport` exists in `world_data.transport`.
- `!travel` treats every configured `world_data.transport` id or alias as a valid route flag.

Runtime requirement:

- Make `!travel <destination> <transport-id>` work for all configured transport ids.
- Preserve compatibility for `horse` and `boat` by keeping those ids or aliases available.
- Store the selected transport id on active journeys and route previews.

## Phase 3 - Location atlas

Replace `frontier_camp` with a Sword Coast/North atlas and set `world_data.default_location = "waterdeep"`.

Implement locations in batches so review is manageable:

1. Core cities and settlements:
   - `waterdeep`, `neverwinter`, `luskan`, `baldurs_gate`, `daggerford`, `candlekeep`, `leilon`, `port_llast`, `phandalin`, `triboar`, `yartar`, `longsaddle`, `amphail`, `rassalantar`, `red_larch`.
2. Northern/Silver Marches:
   - `mirabar`, `silverymoon`, `everlund`, `sundabar`, `citadel_felbarr`, `citadel_adbar`, `mithral_hall`, `bryn_shander`.
3. Heartlands/eastern anchors:
   - `elturel`, `scornubel`, `berdusk`, `iriaebor`, `suzail`, `arabel`, `shadowdale`.
4. Wilderness:
   - forests, moors, marshes, mountains, hills, desert, tundra, and ice nodes from the solution statement.
5. Water/coasts/islands:
   - `sea_of_swords`, `trackless_sea`, key rivers, lakes using `river` biome for now, Moonshaes, northern islands, Orlumbor, and Nelanther.
6. Roads as optional location nodes:
   - `high_road`, `trade_way`, `coast_way`, `long_road`, `triboar_trail`, `evermoor_way`, `risen_road`, `way_of_the_lion`, `delimbiyr_route`, `black_road`.

Location authoring rules:

- Use stable snake_case ids.
- Use original one- or two-sentence descriptions.
- Add `biome` for every location.
- Add `commands` based on actual utility:
  - forests: `enc`, `forage`, `lumber`;
  - water: `fish`;
  - mountains/caves: `mine`;
  - settlements: `job`, `buy`, `sell` only when shops/services exist;
  - libraries/cities: `library`, `read` where appropriate.
- Use `services` to point at shop ids.
- Do not add runtime `image` URLs until a safe hosted asset set exists.

Acceptance:

- `locations.search_locations` can resolve major names and produces 0 / 1 / many behavior for ambiguous terms.
- `!location` at a new character's default location shows Waterdeep.
- Editor Check reports no invalid biome references.
- No location references a shop id that is absent from `shops`, unless the service is intentionally future/planned and documented.

## Phase 4 - Biome registry

Keep the starter simple by reusing existing engine preset biomes.

- Preserve existing engine biome registry entries.
- Add no Forgotten Realms-specific biome gvars in the first implementation unless a location needs a missing biome.
- Use `forest` for all forest variants for now, as requested.
- Use `river` for lakes until a lake biome exists.
- Use `beach` for islands and coast nodes where a specific sea route is not being run.
- Use `sea` for Sea of Swords/coastal ship routes.
- Use `deep_seas` for Trackless Sea/open-ocean travel.

Acceptance:

- Every biome code used in locations and paths exists in `world_data.biomes`.
- No new workshop UUIDs are invented.
- If real gvar ids are needed later, take them from `unused_gvars.md`.

## Phase 5 - Path graph

Build `world_data.paths` as directed route edges.

Implementation order:

1. Add core land routes with both directions:
   - Waterdeep <-> Daggerford <-> Way Inn/Dragonspear area <-> Baldur's Gate.
   - Baldur's Gate <-> Candlekeep spur.
   - Waterdeep <-> Leilon <-> Neverwinter <-> Port Llast <-> Luskan.
   - Waterdeep <-> Amphail <-> Red Larch <-> Triboar <-> Longsaddle <-> Mirabar.
   - Triboar <-> Phandalin/Conyberry <-> High Road.
2. Add river and bridge routes:
   - Chionthar: Baldur's Gate <-> Elturel <-> Scornubel <-> Berdusk/Iriaebor.
   - Delimbiyr: Daggerford <-> Secomber/Delimbiyr route.
   - Dessarin: Waterdeep/Zundbridge <-> Yartar.
   - Mirar: Luskan <-> Mirabar.
3. Add northern and Silver Marches routes.
4. Add wilderness spokes.
5. Add sea routes.

Path authoring rules:

- Every bidirectional route gets two path entries.
- Use `label` for the named route or road.
- Use `requirements.transport` when a route requires a mode.
- Use one step list per path entry.
- Add explicit bridge/ferry/crossing steps for rivers.
- Open sea routes require `ship`, `sailing_ship`, `longship`, `galley`, or `warship`.
- River/lake routes allow `boat`, `rowboat`, and `keelboat`.
- If swimming is intended, require `swim` or `swimming_mount` and describe the danger.

Acceptance:

- `!travel Neverwinter` from Waterdeep returns a route.
- `!travel "Baldur's Gate"` from Waterdeep returns a route.
- `!travel Phandalin` from Waterdeep can route through High Road/Triboar Trail nodes.
- `!travel Neverwinter riding_horse` and another configured non-horse transport flag both resolve through the same transport selection path.
- Boat/ship paths do not appear for ordinary walking unless their requirements allow it.
- Route display never renders blank encounter commands such as `!enc `.
- At least one route includes an explicit river crossing step.

## Phase 5a - Generic travel transport selection

Update the runtime so configured transport ids are first-class travel flags.

- Add a transport lookup helper that reads `world_data.transport`.
- Resolve transport flags by exact id first, then by configured name/alias where practical.
- Use the standard 0 / 1 / many lookup shape for no match, one match, and ambiguous matches.
- Update `!travel` route planning to pass the selected transport id into `journeys.find_journey`.
- Update `journeys.build_journey`, `journeys.display_journey`, `journeys.next_step`, and `journeys.get_next_step` to persist/read a generic `transport` id.
- Keep reading legacy journey `horse`/`boat` booleans during migration.
- Keep `horse` and `boat` compatibility behavior available.
- Add tests for `riding_horse`, `cart`, `rowboat`, `ship`, and an invalid/ambiguous transport flag.

Acceptance:

- Any id in `world_data.transport` can be used as a `!travel` flag.
- Invalid transport ids fail before route planning with a clear message.
- Ambiguous transport names ask the user to be more specific.
- Existing `!travel Neverwinter horse` and `!travel Neverwinter boat` behavior still works.

## Phase 6 - Shops and service data

Seed top-level `shops` after the first city/town batch lands.

Priority shops:

- `waterdeep_general_market`
- `waterdeep_stables`
- `waterdeep_docks`
- `baldurs_gate_general_market`
- `baldurs_gate_docks`
- `neverwinter_general_market`
- `luskan_docks`
- `phandalin_outfitter`
- `red_larch_outfitter`
- `amphail_stables`
- `triboar_stables`
- `triboar_caravan_yard`
- `scornubel_caravan_yard`
- `candlekeep_scribes`
- `silverymoon_scribes`
- `mirabar_smiths`

Shop authoring rules:

- Keep stock mundane and broadly useful.
- Use item names that resolve through generated item catalogues where possible.
- Use `location_id` for location-gated shops.
- Use `accepts_sells: True` only where resale makes sense.
- Avoid finite `qty` until stock ledger behavior is implemented.
- Do not model service-only travel tickets as purchasable stock unless `!buy` can resolve the item and the server wants manual ticket handling.

Acceptance:

- `!buy rope` works in at least one major city with a configured general market.
- `!sell rope` has at least one accepting shop in a major city.
- `!buy` in a wilderness-only location explains missing visible shops cleanly.
- Editor Check reports no invalid shop `location_id`.

## Phase 7 - Jobs and economy tuning

Make `!job` useful without inventing a new named-job schema.

- Enable `commands.job` on settlements with plausible work.
- Add `subsystems.economy.command_config.job.allowed_skills` only if the default all-skills behavior is too broad.
- Add location descriptions or future location encounter prose that hints at local work.
- Tune payout bands only if the current defaults feel wrong for the starter.
- Keep custom wallet currencies out of the first pass unless a Realms-specific currency policy is agreed.

Acceptance:

- `!job athletics` still works when economy is enabled.
- Job cooldown policy remains explicit.
- The docs explain that named location jobs are flavor for now, not a separate runtime registry.

## Phase 8 - Content and libraries

Enable content commands only when catalogue wiring is clear.

- Keep the generated Forgotten Realms book shards under `src/gvars/configs/books/` as the likely source.
- Decide whether the starter config points at book shard ids, inline `books`, or a future book gvar list.
- Enable `library` and `read` at Waterdeep, Candlekeep, Silverymoon, and other major knowledge centers.
- Add `library_topics` to locations where topic inference should be useful.

Acceptance:

- `!library` and `!read` are not enabled against an empty or unreachable catalogue.
- Location topic inference has meaningful topics on library-enabled locations.
- No copyrighted long text is copied into config.

## Phase 9 - Images and visual assets

Keep runtime config image-safe.

- Leave location `image` fields absent during the first data implementation.
- If images are needed, generate or add owned/redistributable location images under a public asset path.
- Do not hotlink D&D Beyond or Forgotten Realms Wiki art into config.
- Do not use the map assets in runtime config unless hosting/licensing has been explicitly approved.

Acceptance:

- No runtime `image` field points at a questionable external asset.
- Any added image asset has a clear repo path and usage note.

## Phase 10 - Editor and validation

Update the editor only where the config shape changes or validation needs to catch new risks.

- Validate `world_data.transport` if the editor gains first-class transport awareness.
- Validate each `requirements.transport` id against `world_data.transport`.
- Ensure path builder can preserve transport arrays and labels.
- Ensure world raw JSON remains usable for large location/path batches.
- Add or update tests in `editor/src/lib/config.test.ts`.

Acceptance:

- Editor Check passes for the updated Forgotten Realms preset.
- Invalid transport ids produce a useful warning or error.
- Existing starter config tests still pass.

## Phase 11 - Admin display and docs

Update admin-facing and public docs.

- Update `docs/setup.md` if the Forgotten Realms preset becomes the recommended starter example.
- Update `src/aliases/westmarch/show.alias` only if new config fields need summarizing.
- Add notes to this project folder for any deliberate deferrals.
- Link the implementation result back to this plan.

Acceptance:

- `!westmarch show` remains useful and does not misrepresent the larger config.
- Setup docs do not show obsolete `frontier_camp` assumptions if the starter changes.

## Phase 12 - Tests and build

Run verification after the config and editor changes.

Minimum focused checks:

- `avrae-ls --run-tests src` or `make test`.
- `make build` if generated gvar/env files or sourcemaps change.
- Editor tests if `editor/src/` changes.

Suggested new coverage:

- Location lookup:
  - exact match for Waterdeep;
  - partial ambiguous match where applicable;
  - missing location message.
- Travel:
  - Waterdeep to Neverwinter;
  - Waterdeep to Baldur's Gate;
  - a route containing a river crossing;
  - a route requiring boat/ship.
- Economy:
  - visible shop buy;
  - visible accepting shop sell;
  - location with no visible shop.

Acceptance:

- Full available test suite passes or failures are documented with cause.
- Generated files are updated only through the build pipeline.
- No unrelated dirty worktree changes are reverted.

## Risk register

| Risk | Mitigation |
|------|------------|
| Starter scope balloons into all Faerun | Keep the first implementation map-scoped to Sword Coast/North and document future expansion regions |
| Generic transport selection is not implemented before rich route data lands | Treat that as a runtime bug: implement generic `!travel` transport selection before relying on rich route requirements |
| Config becomes too large for one gvar | Move large catalogues and future custom biome/location encounter bodies to separate gvars |
| Shops stock names do not match catalogues | Prefer known generated item names and add tests for representative stock |
| Images introduce licensing problems | Leave image fields empty until owned/generated/static assets exist |
| Location services imply unsupported mechanics | Enable only commands that currently work; keep service prose distinct from runtime behavior |

## Definition of done

- `forgotten_realms_2014.gvar` has a Forgotten Realms identity, Waterdeep default, rich location atlas, transport catalogue, initial route graph, and starter shops.
- `!location`, `!travel`, `!buy`, `!sell`, and `!job` have at least smoke-tested happy paths against the preset.
- Editor Check can load and validate the preset without blocking errors.
- Docs explain the map-scoped starter boundary and known follow-ups.
- No Forgotten Realms data is hard-coded into generic aliases or utility gvars.
