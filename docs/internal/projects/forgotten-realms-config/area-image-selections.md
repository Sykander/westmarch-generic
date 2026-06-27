# Forgotten Realms area image selections

Selection pass used to populate `world_data.locations.*.image` in `src/gvars/configs/forgotten_realms_2014_locations.gvar.json`.

Selection priority: exact artistic representation of the area first, then direct map if that is all we have, then people or encounters visibly in a fitting place, then regional or biome fallback art. User review notes in [dndbeyond-image-catalog.md](dndbeyond-image-catalog.md) are treated as the main signal.

## Fit Labels

- `direct-art`: the selected image depicts the named area or city as art.
- `direct-map`: the selected image is an exact map of the named area, used because no better scenic art was found.
- `direct-source`: the image comes from a named-area article/source but needs one more visual confirmation.
- `direct-regional-art`: the image depicts the named region, a route anchor, or a very close named feature.
- `regional-art` / `regional-map`: the image is regionally close but not exact.
- `biome-fallback`: the image matches terrain, settlement type, or mood rather than the exact place.
- `weak-placeholder`: only a rough fit; keep searching before committing it to config.

## Selected Image Assets

### waterdeep_skyline

![Waterdeep skyline](https://www.dndbeyond.com/attachments/10/458/waterdeep.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/458/waterdeep.jpg`
- Catalog entry: 034
- Used by: `waterdeep`
- Notes: Exact Waterdeep skyline/coastal city art with griffon riders.

### neverwinter_map

![Neverwinter map](https://www.dndbeyond.com/attachments/10/457/neverwinter.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/457/neverwinter.jpg`
- Catalog entry: 058
- Used by: `neverwinter`
- Notes: Exact Neverwinter map; best current exact image, but still wants scenic art later.

### luskan_map

![Luskan map](https://www.dndbeyond.com/attachments/thumbnails/8/74/850/692/scag02-29.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/8/74/850/692/scag02-29.png`
- Catalog entry: 020
- Used by: `luskan`
- Notes: Exact Luskan top-down city map; best current exact image.

### baldurs_gate_skyline

![Baldur's Gate skyline](https://www.dndbeyond.com/attachments/10/452/baldurs-gate.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/452/baldurs-gate.jpg`
- Catalog entry: 002
- Used by: `baldurs_gate`
- Notes: Exact Baldur's Gate skyline; reviewed as ideal for the city.

### daggerford_key

![Daggerford key art](https://www.dndbeyond.com/attachments/thumbnails/5/711/850/425/daggerford-key.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/5/711/850/425/daggerford-key.png`
- Catalog entry: 267
- Used by: `daggerford`
- Notes: Exact-source Daggerford key image from the Daggerford encounter article; unreviewed but strongest direct candidate.

### candlekeep_towers

![Candlekeep towers](https://www.dndbeyond.com/attachments/thumbnails/6/309/850/556/why5x-01-05.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/6/309/850/556/why5x-01-05.png`
- Catalog entry: 161
- Used by: `candlekeep`, `way_of_the_lion`
- Notes: Exact Candlekeep scenic image with walls, gates, and towers; stronger runtime pick than the overhead map.

### rural_road_houses

![Roadside houses in wooded mud road](https://www.dndbeyond.com/attachments/thumbnails/5/911/300/657/c1-04.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/5/911/300/657/c1-04.png`
- Catalog entry: 365
- Used by: `leilon`, `amphail`, `rassalantar`, `red_larch`, `trollclaws`, `high_road`, `trade_way`, `triboar_trail`
- Notes: Useful rural settlement and road-stop fallback.

### river_smuggler

![Barrels rowed toward a river town](https://www.dndbeyond.com/attachments/thumbnails/5/942/850/583/poa06-15.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/5/942/850/583/poa06-15.png`
- Catalog entry: 344
- Used by: `port_llast`, `yartar`, `orlumbor`, `river_dessarin`, `river_delimbiyr`, `river_mirar`, `delimbiyr_route`
- Notes: Strong river/port trade fallback with boat, cargo, and town approach.

### phandalin_town

![Phandalin town scene](https://www.dndbeyond.com/attachments/10/610/phandalin.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/610/phandalin.jpg`
- Catalog entry: 022
- Used by: `phandalin`
- Notes: Exact Phandalin town art; reviewed as the best full version of the rural town scene.

### city_merchants

![Merchant city with carts](https://www.dndbeyond.com/attachments/thumbnails/2/488/850/583/poa06-09.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/2/488/850/583/poa06-09.png`
- Catalog entry: 403
- Used by: `triboar`, `mirabar`, `everlund`, `scornubel`, `iriaebor`, `arabel`
- Notes: Good generic caravan/trade-city image with carts, towers, and city density.

### green_hobbit_house

![Green hillside house](https://www.dndbeyond.com/attachments/thumbnails/0/628/850/209/halflingintro.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/0/628/850/209/halflingintro.png`
- Catalog entry: 275
- Used by: `longsaddle`
- Notes: Quirky settlement fallback; fits odd, homely, inland places better than a city skyline.

### elf_forest_town

![Sprawling forest town](https://www.dndbeyond.com/attachments/thumbnails/0/621/850/191/elfintro.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/0/621/850/191/elfintro.png`
- Catalog entry: 274
- Used by: `silverymoon`
- Notes: Reviewed as a big town in/near forest; useful for magical or forest-adjacent cities.

### dwarf_stairs

![Imposing stone stairs](https://www.dndbeyond.com/attachments/thumbnails/0/619/850/190/dwarfintro.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/0/619/850/190/dwarfintro.png`
- Catalog entry: 273
- Used by: `sundabar`, `citadel_felbarr`, `citadel_adbar`
- Notes: Good fortress/stonehold fallback for dwarven or fortified mountain locations.

### bruenor_party

![Bruenor and companions under icy arch](https://www.dndbeyond.com/attachments/12/244/bruenor-battlehammer.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/244/bruenor-battlehammer.jpg`
- Catalog entry: 356
- Used by: `mithral_hall`
- Notes: Strong Mithral Hall thematic image because of Bruenor and the cold stone arch.

### icewind_ten_towns

![Ten-Towns settlement on frozen lake](https://www.dndbeyond.com/attachments/10/451/icewind-dale.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/451/icewind-dale.jpg`
- Catalog entry: 009
- Used by: `bryn_shander`, `maer_dualdon`
- Notes: Direct Ten-Towns/Icewind Dale settlement image; best fit for Bryn Shander and lake towns.

### elturel_town

![Elturel town street](https://www.dndbeyond.com/attachments/thumbnails/6/196/850/583/9008.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/6/196/850/583/9008.png`
- Catalog entry: 016
- Used by: `elturel`
- Notes: Exact-source Elturel article scene; reviewed as a very good town image.

### manor_garden

![Manor garden scene](https://www.dndbeyond.com/attachments/thumbnails/4/795/850/548/6004.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/4/795/850/548/6004.png`
- Catalog entry: 049
- Used by: `berdusk`
- Notes: Cultured urban/manor fallback; good for refined inland cities.

### coastal_walled_city

![Walled coastal city](https://www.dndbeyond.com/attachments/11/171/dot-your-environments-with-hidden-stuff.jpg)

- URL: `https://www.dndbeyond.com/attachments/11/171/dot-your-environments-with-hidden-stuff.jpg`
- Catalog entry: 422
- Used by: `suzail`
- Notes: Generic walled coastal city fallback; not exact Suzail but visually suitable.

### dalelands_village

![Dalelands farms and Cormanthor edge](https://www.dndbeyond.com/attachments/12/447/dalelands.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/447/dalelands.jpg`
- Catalog entry: 013
- Used by: `shadowdale`
- Notes: Direct Dalelands region art; reviewed as a strong town/vale image.

### forest_canopy

![Fey Wanderer in forest canopy](https://www.dndbeyond.com/attachments/10/187/fey-wanderer.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/187/fey-wanderer.jpg`
- Catalog entry: 073
- Used by: `neverwinter_wood`
- Notes: Reviewed as a strong forest-area image with a person visibly in the canopy.

### ancient_forest_pool

![Ancient forest pool](https://www.dndbeyond.com/attachments/thumbnails/8/384/850/566/04-015.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/8/384/850/566/04-015.png`
- Catalog entry: 115
- Used by: `high_forest`, `forest_of_tethir`
- Notes: Excellent ancient forest area image with pool, animals, huge trees, and carved face.

### phandalin_wilds

![Sunlit forest wilds](https://www.dndbeyond.com/attachments/10/786/phandalin-wilds.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/786/phandalin-wilds.jpg`
- Catalog entry: 024
- Used by: `lurkwood`
- Notes: Clean forest fallback with light shafts through trees.

### goblinoid_forest

![Goblinoids in the woods](https://www.dndbeyond.com/attachments/10/701/goblinoids.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/701/goblinoids.jpg`
- Catalog entry: 038
- Used by: `trollbark_forest`, `wood_of_sharp_teeth`
- Notes: Encounter-heavy forest image; good for dangerous wooded areas.

### hag_hut_swamp

![Hag's walking hut in swamp](https://www.dndbeyond.com/attachments/8/465/spooky6.jpg)

- URL: `https://www.dndbeyond.com/attachments/8/465/spooky6.jpg`
- Catalog entry: 165
- Used by: `cloak_wood`, `mere_of_dead_men`
- Notes: Awesome swamp/haunted-wood image; best spooky wetland fallback.

### misty_forest_mage

![Mage in misty forest](https://www.dndbeyond.com/attachments/10/776/how-to-use-these-items-as-a-dm.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/776/how-to-use-these-items-as-a-dm.jpg`
- Catalog entry: 194
- Used by: `misty_forest`
- Notes: Reviewed as cool art in a misty forest; good for the named Misty Forest.

### spirit_dragon_forest

![Spirit dragon over forest and river](https://www.dndbeyond.com/attachments/12/540/spirit-dragon.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/540/spirit-dragon.jpg`
- Catalog entry: 092
- Used by: `forest_of_wyrms`, `serpent_hills`
- Notes: Magical forest/river image with dragon; strong for wyrm-haunted woods.

### druid_grove

![Moonlit Druid's Grove](https://www.dndbeyond.com/attachments/12/458/circle-magic.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/458/circle-magic.jpg`
- Catalog entry: 189
- Used by: `reaching_woods`
- Notes: Magical forest clearing with standing stones and blue energy.

### myth_drannor_arch

![Myth Drannor arch](https://www.dndbeyond.com/attachments/12/560/myth-drannor.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/560/myth-drannor.jpg`
- Catalog entry: 028
- Used by: `cormanthor`
- Notes: Zoomed Myth Drannor/Cormanthor ruin image; strongest Cormanthor-specific area candidate.

### feywild_swamp

![Adventurers caught in swamp water](https://www.dndbeyond.com/attachments/10/191/building-a-fey-wanderer.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/191/building-a-fey-wanderer.jpg`
- Catalog entry: 163
- Used by: `evermoors`, `marsh_of_chelimber`, `evermoor_way`
- Notes: Strong swamp scene with people in visibly dangerous marsh terrain.

### lake_valley

![Mountain lake valley](https://www.dndbeyond.com/attachments/12/287/forgotten-realms.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/287/forgotten-realms.jpg`
- Catalog entry: 018
- Used by: `high_moor`, `lake_of_dragons`, `wyvernwater`
- Notes: Broad Realms wilderness fallback with lake and mountains.

### calimshan_desert

![Calimshan dunes and Calimport](https://www.dndbeyond.com/attachments/12/445/calimshan.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/445/calimshan.jpg`
- Catalog entry: 160
- Used by: `anauroch`, `black_road`
- Notes: Excellent desert-city art; not Anauroch, but the strongest desert visual found.

### tundra_plain

![Frozen tundra plain](https://www.dndbeyond.com/attachments/12/565/tundra-1.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/565/tundra-1.jpg`
- Catalog entry: 242
- Used by: `high_ice`
- Notes: Generic frozen plain with ice and distant peaks; best broad tundra fallback.

### icewind_landscape

![Icewind Dale mountains and frozen lakes](https://www.dndbeyond.com/attachments/12/444/icewind-dale.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/444/icewind-dale.jpg`
- Catalog entry: 307
- Used by: `spine_of_the_world`, `lac_dinneshere`, `redwaters`
- Notes: Broad Icewind Dale landscape; good for northern mountains and lakes.

### mountain_vista

![Adventurers overlooking mountains](https://www.dndbeyond.com/attachments/11/168/be-open-to-most-problems-having-multiple-solutions.jpg)

- URL: `https://www.dndbeyond.com/attachments/11/168/be-open-to-most-problems-having-multiple-solutions.jpg`
- Catalog entry: 346
- Used by: `sword_mountains`, `star_mounts`, `sunset_mountains`, `storm_horns`, `greycloak_hills`
- Notes: Generic mountain vista fallback; source is BG3-advice art, so replace if better Realms mountain art appears.

### moonshae_coast

![Moonshae coasts and standing stones](https://www.dndbeyond.com/attachments/12/446/moonshae.jpg)

- URL: `https://www.dndbeyond.com/attachments/12/446/moonshae.jpg`
- Catalog entry: 021
- Used by: `sea_of_swords`, `trackless_sea`, `moonshae_isles`, `nelanther_isles`
- Notes: Direct Moonshae area art; reviewed as really good landscape/island art.

### icy_shipwreck

![Icy sea shipwreck](https://www.dndbeyond.com/attachments/thumbnails/1/960/850/594/skt03-19.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/1/960/850/594/skt03-19.png`
- Catalog entry: 360
- Used by: `ruathym`, `gundarlun`, `purple_rocks`
- Notes: Cold sea and shipwreck image; useful for northern islands and icy voyages.

### volcanic_lava

![Lava valley monster](https://www.dndbeyond.com/attachments/thumbnails/2/476/350/916/poa05-12.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/2/476/350/916/poa05-12.png`
- Catalog entry: 142
- Used by: `tuern`
- Notes: Monster-forward, but the best volcanic/lava terrain fallback found.

### wyrms_crossing

![Wyrm's Crossing bridge](https://www.dndbeyond.com/attachments/10/781/wyrms-crossing.jpg)

- URL: `https://www.dndbeyond.com/attachments/10/781/wyrms-crossing.jpg`
- Catalog entry: 093
- Used by: `river_chionthar`, `coast_way`
- Notes: Minimalist bridge art from Baldur's Gate; useful for Chionthar and Coast Way bridge context.

### boareskyr_bridge

![Boareskyr Bridge at red sunset](https://www.dndbeyond.com/attachments/thumbnails/5/956/850/389/boareskyr-bridge-as-it-appears-in-baldurs-gate.jpg)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/5/956/850/389/boareskyr-bridge-as-it-appears-in-baldurs-gate.jpg`
- Catalog entry: 382
- Used by: `winding_water`, `risen_road`
- Notes: Strong river/bridge/Heartlands route image; reviewed as a cool area image.

### sea_of_moving_ice_iceberg

![Iceberg settlement and ship](https://www.dndbeyond.com/attachments/thumbnails/1/993/850/594/skt07-01.png)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/1/993/850/594/skt07-01.png`
- Catalog entry: 410
- Used by: `sea_of_moving_ice`
- Notes: Best Sea of Moving Ice area image; ship approaching settlement on an iceberg.

### north_map

![North paper map](https://www.dndbeyond.com/attachments/thumbnails/8/87/850/556/map-of-the-north-final-will-be-zoomed-in.jpg)

- URL: `https://www.dndbeyond.com/attachments/thumbnails/8/87/850/556/map-of-the-north-final-will-be-zoomed-in.jpg`
- Catalog entry: 048
- Used by: `long_road`
- Notes: Reviewed as a really cool paper map of the northwest/north; useful for long northern routes.

## Area Selection Table

| Config id | Location | Fit | Image key | Rationale |
|-----------|----------|-----|-----------|-----------|
| `waterdeep` | Waterdeep | `direct-art` | `waterdeep_skyline` | Actual Waterdeep city art. |
| `neverwinter` | Neverwinter | `direct-map` | `neverwinter_map` | Exact city map; no better scenic art found. |
| `luskan` | Luskan | `direct-map` | `luskan_map` | Exact city map; no better scenic art found. |
| `baldurs_gate` | Baldur's Gate | `direct-art` | `baldurs_gate_skyline` | Reviewed as ideal for Baldur's Gate. |
| `daggerford` | Daggerford | `direct-source` | `daggerford_key` | Exact-source Daggerford key art; needs visual confirmation but beats generic fallback. |
| `candlekeep` | Candlekeep | `direct-art` | `candlekeep_towers` | Exact Candlekeep towers and walls. |
| `leilon` | Leilon | `biome-fallback` | `rural_road_houses` | Rebuilt High Road settlement; rural road houses fit the frontier road-stop feel. |
| `port_llast` | Port Llast | `biome-fallback` | `river_smuggler` | Small coastal/river port feel with boat and cargo approaching town. |
| `phandalin` | Phandalin | `direct-art` | `phandalin_town` | Exact Phandalin town art. |
| `triboar` | Triboar | `biome-fallback` | `city_merchants` | Caravan town; merchant carts and dense trade-city scene fit well. |
| `yartar` | Yartar | `biome-fallback` | `river_smuggler` | River trade town; boat and cargo scene fits. |
| `longsaddle` | Longsaddle | `biome-fallback` | `green_hobbit_house` | Odd inland settlement; quirky homely house is the best tonal fit. |
| `amphail` | Amphail | `biome-fallback` | `rural_road_houses` | Horse-road settlement; rural road-stop art is closest available. |
| `rassalantar` | Rassalantar | `biome-fallback` | `rural_road_houses` | Small road stop north of Waterdeep. |
| `red_larch` | Red Larch | `biome-fallback` | `rural_road_houses` | Practical quarry/caravan settlement; rural road houses fit better than city art. |
| `mirabar` | Mirabar | `biome-fallback` | `city_merchants` | Mining trade city; merchant-city fallback is closest. |
| `silverymoon` | Silverymoon | `biome-fallback` | `elf_forest_town` | Magical/forested city feel; needs true Silverymoon art later. |
| `everlund` | Everlund | `biome-fallback` | `city_merchants` | Walled trade city; merchant carts and towers fit. |
| `sundabar` | Sundabar | `biome-fallback` | `dwarf_stairs` | Fortified northern craft city; imposing stone architecture is the closest available. |
| `citadel_felbarr` | Citadel Felbarr | `biome-fallback` | `dwarf_stairs` | Dwarven mountain stronghold; stone stairs/gatehouse fit. |
| `citadel_adbar` | Citadel Adbar | `biome-fallback` | `dwarf_stairs` | Dwarven fortress city; stone stairs/gatehouse fit. |
| `mithral_hall` | Mithral Hall | `regional-art` | `bruenor_party` | Bruenor/Mithral Hall thematic image with cold stone arch. |
| `bryn_shander` | Bryn Shander | `direct-regional-art` | `icewind_ten_towns` | Ten-Towns settlement on a frozen lake; best Bryn Shander fit. |
| `elturel` | Elturel | `direct-source-art` | `elturel_town` | Exact-source Elturel escape article town scene. |
| `scornubel` | Scornubel | `biome-fallback` | `city_merchants` | Caravan city; merchant carts fit better than the strip-map. |
| `berdusk` | Berdusk | `biome-fallback` | `manor_garden` | Cultured inland city; refined manor scene works as fallback. |
| `iriaebor` | Iriaebor | `biome-fallback` | `city_merchants` | Steep merchant city; trade-city fallback. |
| `suzail` | Suzail | `biome-fallback` | `coastal_walled_city` | Coastal capital; walled coastal city fallback. |
| `arabel` | Arabel | `biome-fallback` | `city_merchants` | Caravan city; merchant carts and towers fit. |
| `shadowdale` | Shadowdale | `direct-regional-art` | `dalelands_village` | Direct Dalelands village/vale art near Cormanthor. |
| `neverwinter_wood` | Neverwinter Wood | `biome-fallback` | `forest_canopy` | Deep forest with person in canopy; strong forest mood. |
| `high_forest` | High Forest | `biome-fallback` | `ancient_forest_pool` | Ancient forest pool is the best old-forest image. |
| `lurkwood` | Lurkwood | `biome-fallback` | `phandalin_wilds` | Clean northern forest fallback. |
| `trollbark_forest` | Trollbark Forest | `biome-fallback` | `goblinoid_forest` | Dangerous forest feel with hostile goblinoids. |
| `cloak_wood` | Cloak Wood | `biome-fallback` | `hag_hut_swamp` | Eerie wet forest/swamp image fits Cloak Wood tone. |
| `misty_forest` | Misty Forest | `biome-fallback` | `misty_forest_mage` | Reviewed as misty forest art; best named-forest match. |
| `wood_of_sharp_teeth` | Wood of Sharp Teeth | `biome-fallback` | `goblinoid_forest` | Dangerous woods; goblinoid forest encounter fits. |
| `forest_of_wyrms` | Forest of Wyrms | `biome-fallback` | `spirit_dragon_forest` | Dragon over forest and river fits the name and mood. |
| `reaching_woods` | The Reaching Woods | `biome-fallback` | `druid_grove` | Actual Reaching Woods candidate was NPC-only, so use magical forest clearing. |
| `forest_of_tethir` | Forest of Tethir | `biome-fallback` | `ancient_forest_pool` | Large old forest fallback. |
| `cormanthor` | Cormanthor | `direct-regional-art` | `myth_drannor_arch` | Myth Drannor/Cormanthor ruin focus. |
| `evermoors` | The Evermoors | `biome-fallback` | `feywild_swamp` | Dangerous marsh/moor terrain with people in the scene. |
| `mere_of_dead_men` | Mere of Dead Men | `biome-fallback` | `hag_hut_swamp` | Best haunted swamp image. |
| `marsh_of_chelimber` | Marsh of Chelimber | `biome-fallback` | `feywild_swamp` | Broad marsh/swamp fallback. |
| `high_moor` | The High Moor | `weak-placeholder` | `lake_valley` | Broad wild landscape; needs a better moor image later. |
| `anauroch` | Anauroch | `biome-fallback` | `calimshan_desert` | Strong desert art; not exact Anauroch. |
| `high_ice` | The High Ice | `biome-fallback` | `tundra_plain` | Frozen plain and ice glare fit the High Ice. |
| `spine_of_the_world` | Spine of the World | `regional-art` | `icewind_landscape` | Icewind mountains and frozen lakes fit the far northern mountain wall. |
| `sword_mountains` | Sword Mountains | `biome-fallback` | `mountain_vista` | Generic mountain vista; needs better Sword Coast mountain art. |
| `star_mounts` | Star Mounts | `biome-fallback` | `mountain_vista` | Generic mountain vista; replace if a High Forest peaks image appears. |
| `sunset_mountains` | Sunset Mountains | `biome-fallback` | `mountain_vista` | Generic mountain vista. |
| `storm_horns` | Storm Horns | `biome-fallback` | `mountain_vista` | Generic mountain vista. |
| `trollclaws` | The Trollclaws | `biome-fallback` | `rural_road_houses` | Rugged wild-road fallback from Dragonspear/Trollclaws context. |
| `serpent_hills` | Serpent Hills | `biome-fallback` | `spirit_dragon_forest` | Snake/Najara map exists but is map-only; use dangerous magical wilds for now. |
| `greycloak_hills` | Greycloak Hills | `biome-fallback` | `mountain_vista` | Generic hill/mountain vista. |
| `sea_of_swords` | Sea of Swords | `regional-art` | `moonshae_coast` | Western sea/coast art; useful broad sea fallback. |
| `trackless_sea` | Trackless Sea | `regional-art` | `moonshae_coast` | Western ocean/island art from the Moonshaes. |
| `moonshae_isles` | Moonshae Isles | `direct-art` | `moonshae_coast` | Direct Moonshae landscape. |
| `ruathym` | Ruathym | `biome-fallback` | `icy_shipwreck` | Cold northern sea/island fallback. |
| `gundarlun` | Gundarlun | `biome-fallback` | `icy_shipwreck` | Cold northern sea/island fallback. |
| `purple_rocks` | Purple Rocks | `biome-fallback` | `icy_shipwreck` | Remote cold island fallback. |
| `tuern` | Tuern | `biome-fallback` | `volcanic_lava` | Volcanic terrain fallback; monster-forward but strongest volcanic visual. |
| `orlumbor` | Orlumbor | `biome-fallback` | `river_smuggler` | Shipwork island/port feel with cargo boat approaching town. |
| `nelanther_isles` | Nelanther Isles | `regional-art` | `moonshae_coast` | Island/coast art; better than cold northern shipwreck for southern islands. |
| `river_chionthar` | River Chionthar | `regional-art` | `wyrms_crossing` | Baldur's Gate bridge/river image; good Chionthar anchor. |
| `river_dessarin` | River Dessarin | `biome-fallback` | `river_smuggler` | Cargo boat and river-town approach. |
| `river_delimbiyr` | River Delimbiyr | `biome-fallback` | `river_smuggler` | River route fallback with boat and cargo. |
| `river_mirar` | River Mirar | `biome-fallback` | `river_smuggler` | River-to-port trade fallback. |
| `winding_water` | Winding Water | `direct-regional-art` | `boareskyr_bridge` | Boareskyr Bridge/Winding Water context; strong river-crossing art. |
| `sea_of_moving_ice` | Sea of Moving Ice | `direct-regional-art` | `sea_of_moving_ice_iceberg` | Iceberg settlement and ship; best exact-region image. |
| `maer_dualdon` | Maer Dualdon | `regional-art` | `icewind_ten_towns` | Frozen lake settlement image fits Icewind Dale lakes. |
| `lac_dinneshere` | Lac Dinneshere | `regional-art` | `icewind_landscape` | Frozen lakes and mountains. |
| `redwaters` | Redwaters | `regional-art` | `icewind_landscape` | Frozen lakes and mountains. |
| `lake_of_dragons` | Lake of Dragons | `biome-fallback` | `lake_valley` | Large lake fallback. |
| `wyvernwater` | Wyvernwater | `biome-fallback` | `lake_valley` | Large lake fallback. |
| `high_road` | High Road | `biome-fallback` | `rural_road_houses` | Roadside settlement image for High Road travel. |
| `trade_way` | Trade Way | `biome-fallback` | `rural_road_houses` | Long overland trade-road fallback. |
| `coast_way` | Coast Way | `regional-art` | `wyrms_crossing` | Bridge and coastal-road feel near Baldur's Gate. |
| `long_road` | Long Road | `regional-map` | `north_map` | Best broad northern route map. |
| `triboar_trail` | Triboar Trail | `biome-fallback` | `rural_road_houses` | Wooded rural road fallback. |
| `evermoor_way` | Evermoor Way | `biome-fallback` | `feywild_swamp` | Dangerous wet crossing feel for the Evermoors. |
| `risen_road` | Risen Road | `regional-art` | `boareskyr_bridge` | Heartlands road/river-crossing image. |
| `way_of_the_lion` | Way of the Lion | `direct-regional-art` | `candlekeep_towers` | Road exists to reach Candlekeep; use destination fortress art. |
| `delimbiyr_route` | Delimbiyr Route | `biome-fallback` | `river_smuggler` | River-valley travel fallback. |
| `black_road` | Black Road | `biome-fallback` | `calimshan_desert` | Desert-road fallback; not exact Anauroch. |

## Highest Priority Replacements

- Scenic city art for `neverwinter` and `luskan`; current selections are exact maps.
- Stronger exact art for Silver Marches and Cormyr cities: `silverymoon`, `everlund`, `sundabar`, `suzail`, and `arabel`.
- Better non-map/non-generic art for roads and routes: `trade_way`, `high_road`, `long_road`, `triboar_trail`, and `black_road`.
- Better exact wilderness art for `high_moor`, `greycloak_hills`, `serpent_hills`, and `trollclaws`.
