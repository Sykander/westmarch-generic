# Forgotten Realms config solution statement

## Recommendation

Create a richer `forgotten_realms_2014.gvar` starter preset that treats the Sword Coast map as the first playable atlas for Forgotten Realms.

The preset should stay config-only:

- no hard-coded Forgotten Realms constants in aliases;
- no generated gvar ids invented by hand;
- no server-specific Discord channel ids;
- no copyrighted prose copied into descriptions.

Use the project map assets for geography, public references for high-level fact checks, and original concise descriptions for runtime text.

## Target identity

Update the preset display intent from "Forgotten Realms Westmarch" to a cleaner setting identity:

```py
display = {
    "name": "Forgotten Realms",
    "description": "A Faerun campaign starter for travel, exploration, trade, and downtime across the Sword Coast and the North.",
    "footer": "Forgotten Realms",
    "colour": "#2F6B4F",
}
```

Use `rules_version = "2014"` for this preset until a separate 2024 config is created.

## Subsystem defaults

Start with useful but safe command coverage.

| Subsystem | Target | Notes |
|-----------|--------|-------|
| `exploration` | enabled | `enc`, `forage`, `fish`, `mine`, `lumber` on; keep `hunt` and `loot` off until combat/loot tuning is reviewed |
| `travel` | enabled | `travel`, `location`, `time`, and `weather` on once calendar and weather-area data are seeded |
| `economy` | enabled | `job`, `buy`, `sell` on when shops and services are seeded; `wallet` off unless custom currencies are added |
| `content` | enabled | `library` and `read` on once book catalogue source ids are wired |
| `crafting` | disabled by default | Seed location services now; enable commands after recipe/catalogue validation |
| `downtime` | disabled by default | Keep until downtime acquisition policy is finalized |
| `misc` | disabled by default | Quest/recipe commands can be enabled after content pass |

For `subsystems.travel.config.transport_icons`, use the canonical transport category ids: `walk`, `horse`, `cart`, `boat`, `ship`, `fly`, `swim`, `portal`, and `teleportation_circle`. `!travel` should accept any configured `world_data.transport` id or alias as a route flag, resolve it consistently, store the canonical transport on the active journey, and filter/display paths using that id.

## Map usage

Use `assets/Sword-Coast-Map_LowRes.jpg` for route sketching and broad region coverage. Use `assets/Sword-Coast-Map_HighRes.jpg` or `assets/Sword-Coast-Map_MedRes.jpg` when reading small labels.

The initial map-derived starter scope is:

- the Sword Coast from Icewind Dale and Luskan south through Waterdeep, Daggerford, Candlekeep, and Baldur's Gate;
- the North and Silver Marches, including Mirabar, Silverymoon, Everlund, Sundabar, and nearby dwarf holds;
- inland road networks such as the Long Road, Triboar Trail, Evermoor Way, and Black Road;
- major wilderness regions shown on the map, including High Forest, Neverwinter Wood, Lurkwood, Evermoors, High Moor, Anauroch, Cormanthor, and the Dalelands edge;
- sea routes to nearby islands such as Moonshae Isles, Ruathym, Gundarlun, the Purple Rocks, Orlumbor, and the Nelanther.

Do not claim this is "all Forgotten Realms" in the config description. It is the first Sword Coast/Faerun starter atlas.

## Runtime data placement

Use these config placements:

| Data | Config path |
|------|-------------|
| Locations and named regions | `world_data.locations_gvar_id` → `forgotten_realms_2014_locations.gvar.json` |
| Route graph | `world_data.paths_gvar_id` → `forgotten_realms_2014_paths.gvar.json` |
| Transport modes | `world_data.transport` |
| Biome registry | `world_data.biomes` |
| Calendar data | `world_data.calendars` |
| Weather areas | `world_data.weather.by_area` |
| Shops/vendors/services | top-level `shops` |
| Books/libraries | top-level `books`, `world_data.books`, or future book gvar ids |
| Job tuning | `subsystems.economy.command_config.job` |
| Location job availability | location entry `<id>.commands.job = True` |

Current `!job` is skill-based, not named-job-based. The starter can list plausible local jobs in descriptions and location encounter prose, but it should not invent a new `jobs` schema until the economy command supports it.

## Calendar and weather

`!time` and `!weather` are implemented command surfaces. The Forgotten Realms starter should enable them only alongside the data they require:

- seed at least one setting-appropriate calendar under `world_data.calendars`;
- seed broad regional weather areas under `world_data.weather.by_area`;
- assign `weather_area` to locations where a biome fallback would be too vague;
- keep forecast text original and concise, like location descriptions.

Editor Check should report missing calendar or weather data as a config issue, not as an unimplemented-command warning.

## Location seed list

Use stable snake_case ids. Every entry should have at minimum `name`, `description`, `biome`, and `commands`.

### Cities and settlements

| id | Name | Biome | Starter description |
|----|------|-------|---------------------|
| `waterdeep` | Waterdeep | `urban` | The City of Splendors, a vast port, trade hub, and natural default location for Sword Coast travel. |
| `neverwinter` | Neverwinter | `urban` | A northern coastal city rebuilding around warm river waters, crafts, politics, and frontier ambition. |
| `luskan` | Luskan | `urban` | A hard-edged port at the mouth of the River Mirar, useful for northern sea travel and rough jobs. |
| `baldurs_gate` | Baldur's Gate | `urban` | A powerful southern port on the Chionthar where trade, soldiers, refugees, and schemes collide. |
| `daggerford` | Daggerford | `urban` | A fortified ducal town on the Trade Way and Delimbiyr River, ideal as a road and river stop. |
| `candlekeep` | Candlekeep | `urban` | A library fortress on the coast, focused on books, sages, and guarded access to knowledge. |
| `leilon` | Leilon | `urban` | A rebuilt High Road settlement between the Mere of Dead Men and Neverwinter. |
| `port_llast` | Port Llast | `urban` | A small coastal settlement north of Neverwinter and south of Luskan. |
| `phandalin` | Phandalin | `urban` | A mining village south of the Triboar Trail, good for starter jobs, ruins, and nearby caves. |
| `triboar` | Triboar | `urban` | A caravan town where inland roads meet, serving mounts, wagons, and overland trade. |
| `yartar` | Yartar | `urban` | A fortified river trade town on the Dessarin and Surbrin routes. |
| `longsaddle` | Longsaddle | `urban` | A strange inland settlement on the Long Road, useful for road travel and odd services. |
| `amphail` | Amphail | `urban` | A horse town north of Waterdeep, suitable for stables, mounts, and road jobs. |
| `rassalantar` | Rassalantar | `urban` | A small road stop just north of Waterdeep, good for simple lodging and patrol work. |
| `red_larch` | Red Larch | `urban` | A quarry and caravan settlement on the Long Road in the Dessarin Valley. |
| `mirabar` | Mirabar | `urban` | A wealthy mining city and northern terminus of major inland trade roads. |
| `silverymoon` | Silverymoon | `urban` | A magical city of learning and alliance in the Silver Marches. |
| `everlund` | Everlund | `urban` | A walled trade city near the Rauvin, linking the Silver Marches and eastern roads. |
| `sundabar` | Sundabar | `urban` | A fortified northern city tied to mines, craft, and harsh frontier defense. |
| `citadel_felbarr` | Citadel Felbarr | `mountain` | A dwarven stronghold in the northern mountains with smithing and mine access. |
| `citadel_adbar` | Citadel Adbar | `mountain` | A dwarven fortress city in the far north, suited to deep mines and military jobs. |
| `mithral_hall` | Mithral Hall | `mountain` | A famed dwarven hold near the northern mountains and Underdark routes. |
| `bryn_shander` | Bryn Shander | `tundra` | The largest Ten Towns settlement in Icewind Dale, a cold-weather hub. |
| `elturel` | Elturel | `urban` | A city on the Chionthar and Risen Road, anchoring Elturgard travel. |
| `scornubel` | Scornubel | `urban` | A caravan city where river and road trade meet in the western Heartlands. |
| `berdusk` | Berdusk | `urban` | A cultured inland city on the Chionthar route. |
| `iriaebor` | Iriaebor | `urban` | A steep, merchant-heavy city inland from the Sword Coast. |
| `suzail` | Suzail | `urban` | Cormyr's coastal capital, a later eastern anchor for the map edge. |
| `arabel` | Arabel | `urban` | A Cormyrean caravan city and eastern road node. |
| `shadowdale` | Shadowdale | `forest` | A famous Dalelands valley settlement near Cormanthor. |

### Wilderness and regions

| id | Name | Biome | Starter description |
|----|------|-------|---------------------|
| `neverwinter_wood` | Neverwinter Wood | `forest` | A deep northern forest east of Neverwinter, useful for forest exploration and lumber. |
| `high_forest` | High Forest | `forest` | One of the greatest old forests of the North, dense with ruins, fey traces, and hidden powers. |
| `lurkwood` | Lurkwood | `forest` | A dangerous northern woodland between mountain roads and old orc territory. |
| `trollbark_forest` | Trollbark Forest | `forest` | A thick, hazardous forest south of the High Moor and near the Sword Coast routes. |
| `cloak_wood` | Cloak Wood | `forest` | An old coastal forest south of Baldur's Gate, fit for eerie ruins and hidden threats. |
| `misty_forest` | Misty Forest | `forest` | A mist-shrouded forest near the Delimbiyr and Trade Way corridor. |
| `wood_of_sharp_teeth` | Wood of Sharp Teeth | `forest` | A forested wildland east of Baldur's Gate and south of Elturgard. |
| `forest_of_wyrms` | Forest of Wyrms | `forest` | A dangerous forest north of Elturgard and near the Serpent Hills. |
| `reaching_woods` | The Reaching Woods | `forest` | A central western forest between Elturgard and the Sunset Mountains. |
| `forest_of_tethir` | Forest of Tethir | `forest` | A large southern forest on the Trade Way beyond the first starter coast. |
| `cormanthor` | Cormanthor | `forest` | A vast eastern forest surrounding the Dalelands and old elven ruins. |
| `evermoors` | The Evermoors | `swamp` | Trackless moors and wetlands east of the Long Road. |
| `mere_of_dead_men` | Mere of Dead Men | `swamp` | A coastal swamp that complicates the High Road north of Waterdeep. |
| `marsh_of_chelimber` | Marsh of Chelimber | `swamp` | A southern marsh near the Greycloak Hills and Heartlands routes. |
| `high_moor` | The High Moor | `plains` | A wide, haunted moor between the Delimbiyr route and the western Heartlands. |
| `anauroch` | Anauroch | `desert` | A vast desert east of the North, crossed by rare and dangerous trade routes. |
| `high_ice` | The High Ice | `tundra` | A frozen expanse north of Anauroch and the map's eastern icebound edge. |
| `spine_of_the_world` | Spine of the World | `mountain` | The far northern mountain wall above Icewind Dale. |
| `sword_mountains` | Sword Mountains | `mountain` | Coastal mountains between Waterdeep and Neverwinter. |
| `star_mounts` | Star Mounts | `mountain` | Peaks rising from the High Forest. |
| `sunset_mountains` | Sunset Mountains | `mountain` | Mountains between the Heartlands and Cormyr. |
| `storm_horns` | Storm Horns | `mountain` | Cormyr's western mountain barrier. |
| `trollclaws` | The Trollclaws | `mountain` | Rugged hills and monster-haunted country north of the Chionthar. |
| `serpent_hills` | Serpent Hills | `mountain` | Broken hill country near Najara and the Forest of Wyrms. |
| `greycloak_hills` | Greycloak Hills | `mountain` | Hill country between Anauroch, the Heartlands, and southern routes. |

### Water, coasts, and islands

| id | Name | Biome | Starter description |
|----|------|-------|---------------------|
| `sea_of_swords` | Sea of Swords | `sea` | The coastal sea along the Sword Coast, used for ship routes between ports. |
| `trackless_sea` | Trackless Sea | `deep_seas` | The vast western ocean beyond the Sea of Swords. |
| `moonshae_isles` | Moonshae Isles | `beach` | A large island realm west of the Sword Coast, reached by ship. |
| `ruathym` | Ruathym | `beach` | A northern island in the Trackless Sea, suitable for longship and sea encounters. |
| `gundarlun` | Gundarlun | `beach` | An island between the coast and the Trackless Sea lanes. |
| `purple_rocks` | Purple Rocks | `beach` | Remote northern islands west of the Sword Coast. |
| `tuern` | Tuern | `volcanic` | A far northwestern volcanic island. |
| `orlumbor` | Orlumbor | `beach` | An island settlement near the Sword Coast known for ship work. |
| `nelanther_isles` | Nelanther Isles | `beach` | Pirate-haunted islands south of the Moonshaes and west of Amn. |
| `river_chionthar` | River Chionthar | `river` | The key river from Baldur's Gate inland through Elturel and Scornubel. |
| `river_dessarin` | River Dessarin | `river` | A major northern river tied to Waterdeep, Yartar, and Dessarin Valley travel. |
| `river_delimbiyr` | River Delimbiyr | `river` | A river route from Daggerford inland through the Delimbiyr Vale. |
| `river_mirar` | River Mirar | `river` | The river route from Luskan inland toward Mirabar. |
| `winding_water` | Winding Water | `river` | A twisting waterway near the Trollclaws and Boareskyr Bridge. |
| `sea_of_moving_ice` | Sea of Moving Ice | `sea` | Ice-choked northern waters beyond Icewind Dale. |
| `maer_dualdon` | Maer Dualdon | `river` | One of Icewind Dale's cold lakes; use river biome until lake biome exists. |
| `lac_dinneshere` | Lac Dinneshere | `river` | A cold Icewind Dale lake; use river biome until lake biome exists. |
| `redwaters` | Redwaters | `river` | A smaller Icewind Dale lake; use river biome until lake biome exists. |
| `lake_of_dragons` | Lake of Dragons | `river` | Cormyr's large lake; use river biome until lake biome exists. |
| `wyvernwater` | Wyvernwater | `river` | A Cormyrean lake connected to eastern routes; use river biome until lake biome exists. |

### Roads as location nodes

Model roads both as path labels and, where useful, as travel nodes for road encounters.

| id | Name | Biome | Starter description |
|----|------|-------|---------------------|
| `high_road` | High Road | `road` | The inland coastal route from Waterdeep north through Leilon, Neverwinter, Port Llast, and Luskan. |
| `trade_way` | Trade Way | `road` | The great western trade artery running south from Waterdeep toward Baldur's Gate, Amn, Tethyr, and Calimshan. |
| `coast_way` | Coast Way | `road` | The Sword Coast section of the Trade Way around Baldur's Gate and Candlekeep. |
| `long_road` | Long Road | `road` | The inland route from Waterdeep north through Amphail, Red Larch, Triboar, Longsaddle, and Mirabar. |
| `triboar_trail` | Triboar Trail | `road` | The trail between Triboar, Conyberry, Phandalin's spur, and the High Road. |
| `evermoor_way` | Evermoor Way | `road` | The road linking Triboar/Yartar toward Everlund through dangerous moor country. |
| `risen_road` | Risen Road | `road` | The road from Baldur's Gate east toward Elturel. |
| `way_of_the_lion` | Way of the Lion | `road` | The road from the Coast Way to Candlekeep. |
| `delimbiyr_route` | Delimbiyr Route | `road` | The river-valley route from Daggerford and Secomber toward the interior. |
| `black_road` | Black Road | `desert` | A dangerous trade route crossing Anauroch toward Llorkh and eastern nodes. |

## Location command conventions

For every location:

- exploration commands list biome codes;
- service commands are booleans;
- road/wilderness locations should usually expose `enc`;
- forests should expose `enc`, `forage`, and `lumber`;
- rivers/lakes/coasts should expose `fish`;
- mountains/caves should expose `mine`;
- towns/cities should expose `job`, `buy`, and `sell` only when shops/services are seeded;
- library locations such as Waterdeep, Candlekeep, Silverymoon, and major cities should expose `library` and `read`.

Example:

```py
"waterdeep": {
    "name": "Waterdeep",
    "description": "The City of Splendors, a vast port and trade hub on the Sword Coast.",
    "biome": "urban",
    "commands": {
        "enc": ["urban", "road", "sea"],
        "fish": ["sea"],
        "job": True,
        "buy": True,
        "sell": True,
        "craft": True,
        "brew": True,
        "enchant": True,
        "scribe": True,
        "library": True,
        "read": True,
    },
    "services": ["waterdeep_general_market", "waterdeep_stables", "waterdeep_docks", "waterdeep_scribes"],
    "library_topics": ["sword_coast", "history", "magic", "trade", "nobility"],
}
```

## Path modelling

Every travel connection should be a directed path. Add reverse paths when travel should be bidirectional.

Use one step list per path. If walking, riding, cart travel, and boat travel differ materially, create separate path entries with different `requirements.transport`.

Path steps should be player-actionable:

- `{"type": "encounter", "activity": "enc", "biome": "road"}` for travel checks;
- `{"type": "encounter", "activity": "forage", "biome": "forest"}` for required forage-style legs;
- `{"type": "proceed", "description": "Cross the River Chionthar at Wyrm's Crossing."}` for bridge/ferry/narrative steps;
- `{"type": "cost", "gold": 1}` for tolls or passage fees when the economy policy eventually applies path costs.

### River and water crossings

Follow these rules:

- if a named bridge exists, use a proceed step that names the bridge;
- if a ferry is the normal crossing, use `requirements.transport: "boat"` or a cost/proceed ferry step;
- if the path expects swimming, use `requirements.transport: "swim"` and describe it as a dangerous crossing;
- if the route crosses open sea, require `ship`;
- if the route follows a river or lake, allow `boat`, or `ship` only when geography makes sense.

Example road route:

```py
{
    "from": "baldurs_gate",
    "to": "elturel",
    "label": "Risen Road",
    "requirements": {"transport": ["walk", "horse", "cart"]},
    "steps": [
        {"type": "proceed", "description": "Leave Baldur's Gate by Wyrm's Crossing over the River Chionthar."},
        {"type": "encounter", "activity": "enc", "biome": "road"},
        {"type": "proceed", "description": "Follow the Risen Road east toward Elturel."},
    ],
}
```

Example river route:

```py
{
    "from": "baldurs_gate",
    "to": "elturel",
    "label": "River Chionthar passage",
    "requirements": {"transport": "boat"},
    "steps": [
        {"type": "encounter", "activity": "fish", "biome": "river"},
        {"type": "proceed", "description": "Travel upriver along the Chionthar by boat."},
    ],
}
```

## Route batches

Seed paths in batches so review stays possible.

### Batch 1: core Sword Coast roads

- Waterdeep <-> Daggerford <-> Way Inn/Dragonspear area <-> Baldur's Gate.
- Baldur's Gate <-> Candlekeep via Way of the Lion/Coast Way spur.
- Waterdeep <-> Leilon <-> Neverwinter <-> Port Llast <-> Luskan.
- Waterdeep <-> Amphail <-> Red Larch <-> Triboar <-> Longsaddle <-> Mirabar.
- Triboar <-> Conyberry/Phandalin spur <-> High Road.

### Batch 2: river and bridge routes

- Baldur's Gate <-> Elturel <-> Scornubel <-> Berdusk/Iriaebor along the Chionthar.
- Daggerford <-> Secomber/Delimbiyr Vale along the Delimbiyr.
- Waterdeep/Zundbridge <-> Yartar via Dessarin-linked routes.
- Luskan <-> Mirabar along the River Mirar corridor.

### Batch 3: northern and Silver Marches routes

- Mirabar <-> Luskan.
- Mirabar <-> Silverymoon <-> Everlund <-> Sundabar.
- Silverymoon/Everlund <-> Citadel Felbarr, Citadel Adbar, and Mithral Hall.
- Icewind Dale/Ten Towns <-> Luskan/Mirabar through high-risk tundra and mountain legs.

### Batch 4: wilderness regions

- Neverwinter <-> Neverwinter Wood.
- Long Road/Triboar <-> Evermoors.
- High Forest nodes from Secomber, Yartar, Everlund, and Silverymoon.
- Baldur's Gate <-> Cloak Wood and Wood of Sharp Teeth.
- Elturgard/Scornubel <-> Reaching Woods, Forest of Wyrms, Serpent Hills, and Trollclaws.
- Eastern expansion toward Cormyr, Cormanthor, and the Dalelands.

### Batch 5: sea routes

- Waterdeep <-> Neverwinter <-> Luskan by ship.
- Waterdeep <-> Baldur's Gate by ship.
- Waterdeep/Baldur's Gate <-> Moonshae Isles.
- Luskan <-> Ruathym/Gundarlun/Purple Rocks/Tuern.
- Waterdeep/Baldur's Gate <-> Orlumbor and Nelanther Isles.

## Transport catalogue

Use `world_data.transport` as the owner-facing transport catalogue. Keep path requirements as broad transport category ids. The `!travel` command must treat those ids and their aliases as valid transport flags, not as display-only metadata.

| id | Name | Use | Typical aliases |
|----|------|-----|-----------------|
| `walk` | Walking | Default for ordinary paths | `walking`, `foot`, `on_foot` |
| `horse` | Horse or mount | Rideable land mounts | `riding_horse`, `warhorse`, `pony`, `mule`, `camel`, `elephant`, `mastiff` |
| `cart` | Cart or wagon | Drawn land vehicles and draft animals | `draft_horse`, `wagon`, `carriage`, `chariot`, `sled` |
| `boat` | Boat | Rivers, lakes, ferries, and short protected crossings | `rowboat`, `keelboat`, `small_boat` |
| `ship` | Ship | Coastal, island, and open sea routes | `longship`, `sailing_ship`, `galley`, `warship` |
| `fly` | Flying | Flight or flying mounts | `flying`, `flight`, `flying_mount`, `griffon`, `pegasus` |
| `swim` | Swimming | Dangerous water crossings or aquatic mounts | `swimming`, `swimming_mount`, `aquatic_mount` |
| `portal` | Portal | Fixed magical gate routes | `gate`, `magical_gate` |
| `teleportation_circle` | Teleportation circle | High-magic city-to-city travel, gated by cost/story | `teleport_circle`, `teleport`, `circle` |

The 2014 Basic Rules list common mounts and ordinary drawn/waterborne vehicles, but route requirements should not model every variant separately. Reflect specific availability in shops/services later; keep travel paths grouped by the broad categories above.

## Shops and services

Seed shops as reusable location-specific vendors. Stock item names should match the generated item catalogue where possible.

| Shop archetype | Example ids | Typical locations | Stock intent |
|----------------|-------------|-------------------|--------------|
| General market | `waterdeep_general_market`, `baldurs_gate_general_market` | Major cities | rope, rations, torches, tools, packs |
| Frontier outfitter | `phandalin_outfitter`, `red_larch_outfitter` | Towns and villages | travel gear, mining gear, healing basics |
| Stable | `amphail_stables`, `triboar_stables`, `waterdeep_stables` | Road towns/cities | riding horse, draft horse, pony, mule, feed, saddles |
| Caravan yard | `triboar_caravan_yard`, `scornubel_caravan_yard` | Trade hubs | cart, wagon, carriage service, hirelings |
| Dockmaster | `waterdeep_docks`, `baldurs_gate_docks`, `luskan_docks` | Ports | rowboat passage, ship passage, fishing gear |
| Shipwright | `orlumbor_shipwrights`, `luskan_shipwrights` | Ship towns/ports | repair service, ship hire, water vehicles |
| Smith | `mirabar_smiths`, `citadel_felbarr_smiths` | Dwarven/mining cities | weapons, armor, tools, mining gear |
| Scribes/library | `candlekeep_scribes`, `silverymoon_scribes` | Libraries/magic cities | paper, ink, books, scribing supplies |
| Alchemist/healer | `neverwinter_alchemist`, `waterdeep_healers` | Major cities | healing potions if enabled, kits, herbs |

Not every location needs shops. A wilderness region may have no `buy` or `sell`; a road node may only provide job/encounter steps; a village may have a single outfitter.

## Jobs

Current runtime job behavior:

- command is `!job <skill> [bonuses]`;
- payout is controlled by job payout bands;
- there is no location-specific named job registry yet.

Starter config should therefore:

- enable `commands.job` only in settlements where work makes sense;
- tune `subsystems.economy.command_config.job.allowed_skills` broadly enough for Forgotten Realms work;
- describe local job flavor in the location description or future location encounter gvar;
- avoid adding top-level `jobs` until the economy command is designed for it.

Suggested job skill flavor:

| Area type | Plausible skills |
|-----------|------------------|
| Port city | Athletics, Persuasion, Investigation, Perception, Performance |
| Trade road town | Animal Handling, Survival, Persuasion, Athletics |
| Mining/dwarf hold | Athletics, Investigation, Nature, History |
| Library/magic city | Arcana, History, Religion, Investigation |
| Forest/wilderness | Survival, Nature, Perception, Animal Handling |
| River/lake settlement | Athletics, Survival, Perception, Nature |

## Media and images

For this starter, use `image` fields only when the image URL is safe to redistribute or was generated/owned for this project.

Recommended policy:

1. Keep the D&D Beyond map assets as internal documentation references unless publishing rights are confirmed.
2. Do not hotlink Forgotten Realms Wiki or D&D Beyond art into config.
3. If location images are desired, generate a neutral illustration set later under `public/westmarch-assets/forgotten-realms/locations/`.
4. Use map crops only if the maintainer explicitly approves hosting those crops.
5. Leave `image` absent on locations until a safe URL exists.

## Travel command behavior

`!travel` should accept any valid means of transport defined in `world_data.transport`.

Required behavior:

- exact transport id matches work, such as `!travel Neverwinter horse`;
- configured aliases resolve to their canonical category, such as `!travel Neverwinter riding_horse` storing `horse`;
- transport names or aliases may be resolved through the standard 0 / 1 / many lookup shape where practical;
- invalid transport flags produce a clear "unknown transport" message;
- ambiguous transport flags ask the user to be more specific;
- active journeys store the selected transport id, not only `horse`/`boat` booleans;
- path filtering uses `requirements.transport` against that selected id;
- route and journey display use the selected id's configured icon/name when available.

Alias compatibility:

- Specific names such as `riding_horse`, `rowboat`, `sailing_ship`, `walk`, `fly`, `swim`, and `teleport_circle` should remain as aliases of the broad categories.
- Configured path requirements should use canonical category ids, though aliases are accepted when validating and resolving routes.

## Validation and editor follow-ups

When implementing the config, update:

- `src/gvars/configs/forgotten_realms_2014.gvar`;
- docs/setup examples if the Forgotten Realms preset becomes the recommended starter;
- `westmarch show` only if new config fields are introduced;
- editor validation only if `world_data.transport` or richer transport modes become structurally edited;
- `.alias-test` coverage for at least one route, one location search, one shop, and one job-enabled location.

Engine/editor follow-ups for the transport contract:

- update `!travel` to accept any configured `world_data.transport` id as a route flag;
- store active journey transport id instead of only `horse`/`boat` booleans;
- show richer transport choices in the editor path builder;
- optionally validate that every `requirements.transport` id exists in `world_data.transport`.

## Implementation order

1. Update the display and subsystem defaults.
2. Replace `frontier_camp` with `waterdeep` as `default_location`.
3. Add the biome registry if missing, reusing engine preset biomes.
4. Add the location seed list in batches: cities, wilderness, water/islands, roads.
5. Add common shops for the first city/town batch.
6. Add Batch 1 and Batch 2 paths with reverse edges.
7. Add transport catalogue and make route requirements refer to its ids.
8. Run editor Check and `make build`, then `make test`.
9. Add tests for route lookup, ambiguous location search, and visible shop behavior.
