# Forgotten Realms location art resources

Candidate D&D Beyond-hosted images for future `world_data.locations` image enrichment.

These are research notes only. Do not add image URLs to the runtime config until the hosted asset set and usage policy are reviewed.

Full archive companion: [dndbeyond-image-catalog.md](dndbeyond-image-catalog.md) contains all 491 distinct image URLs extracted from the Forgotten Realms/location candidate pass, categorized as locations, maps, monsters, NPCs/player options, items, products, UI/tooling, encounter art, and review-needed images.

## Selection notes

- Prefer direct D&D Beyond image URLs under `https://www.dndbeyond.com/attachments/...`.
- Keep the article source URL with each candidate so we can trace context later.
- Favor location, city, region, or map art over character, creature, product, or tool UI screenshots.
- Some images are maps rather than scenic art. They may still be useful for docs, admin preview, or map-specific UI, but should be reviewed separately before player-facing embeds.

## Archive pass coverage

- Scanned numeric D&D Beyond posts listing pages 1-57; pages 58 and 59 repeated page 57, so page 57 was the archive end at the time of the pass.
- Checked 1,533 listing entries and selected 164 Forgotten Realms/location candidate posts or resources.
- Fetched 152 candidate pages, found images on 144 of them, and extracted 676 image occurrences.
- Collapsed those occurrences to 491 distinct D&D Beyond-hosted image URLs in the full catalog.

## Recommended first pass

| Config id | Location | Best first candidate | Notes |
|-----------|----------|----------------------|-------|
| `baldurs_gate` | Baldur's Gate | `attachments/12/442/baldurs-gate-1.jpg` | Strong scenic city/harbor establishing art. |
| `waterdeep` | Waterdeep | `attachments/10/458/waterdeep.jpg` | Clear skyline image from the popular-locations tour. |
| `candlekeep` | Candlekeep | `attachments/10/453/candlekeep.jpg` | Strong overhead fortress/library view. |
| `phandalin` | Phandalin | `attachments/10/610/phandalin.jpg` | Strong town scene; use map image separately if map support lands. |
| `bryn_shander` / Icewind Dale nodes | Icewind Dale | `attachments/12/444/icewind-dale.jpg` | Broad regional landscape; `attachments/10/451/icewind-dale.jpg` is more settlement-facing. |
| `shadowdale`, `cormanthor` | Dalelands / Cormanthor edge | `attachments/12/545/dalelands-vista.jpg` | The user-provided Dalelands vista; strong broad-region image. |
| `moonshae_isles` | Moonshae Isles | `attachments/12/587/katerina-moonshae.jpg` | Strong scenic/action region image; `attachments/12/446/moonshae.jpg` is the simpler landscape. |
| `underdark`-adjacent nodes | Underdark | `attachments/10/456/the-underdark.jpg` | Not a location id today, but useful for Mithral Hall / Underdark-adjacent exploration. |

## Core City Candidates

### Baldur's Gate

Source: [From Icewind Dale to Calimport: A Sandbox of Adventure in the Forgotten Realms](https://www.dndbeyond.com/posts/2079-from-icewind-dale-to-calimport-a-sandbox-of)

Candidate for: `baldurs_gate`, `river_chionthar`, `coast_way`, `risen_road`

![Baldur's Gate harbor and city walls](https://www.dndbeyond.com/attachments/12/442/baldurs-gate-1.jpg)

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: `baldurs_gate`

![Baldur's Gate skyline](https://www.dndbeyond.com/attachments/10/452/baldurs-gate.jpg)

Source: [Baldur's Gate: A Dark Tour Through Its Dangerous Streets](https://www.dndbeyond.com/posts/1556-baldurs-gate-a-dark-tour-through-its-dangerous)

Candidate for: `baldurs_gate` map/reference variant

![Baldur's Gate tour map](https://www.dndbeyond.com/attachments/10/778/baldurs-gate-tour-map.jpg)

Candidate for: `baldurs_gate`, `risen_road`, `river_chionthar`

![Wyrm's Crossing](https://www.dndbeyond.com/attachments/10/781/wyrms-crossing.jpg)

Candidate for: `baldurs_gate`

![Lower City gate](https://www.dndbeyond.com/attachments/10/782/lower-city.jpg)

Candidate for: `baldurs_gate`

![Upper City street scene](https://www.dndbeyond.com/attachments/10/780/upper-city.jpg)

Lower-priority source: [Ghosts of Saltmarsh and Baldur's Gate: Descent into Avernus Now Available in Maps](https://www.dndbeyond.com/posts/1634-ghosts-of-saltmarsh-and-baldurs-gate-descent-into)

Candidate for: `baldurs_gate` only if we want a catastrophe/Avernus variant, not the default city image.

![Baldur's Gate under infernal disaster](https://www.dndbeyond.com/attachments/11/51/baldurs-gate_-descent-into-avernus.jpg)

### Waterdeep

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: `waterdeep`

![Waterdeep skyline](https://www.dndbeyond.com/attachments/10/458/waterdeep.jpg)

Lower-priority source: [Waterdeep: Dragon Heist and Journeys through the Radiant Citadel Now Available in Maps](https://www.dndbeyond.com/posts/1655-waterdeep-dragon-heist-and-journeys-through-the)

Candidate for: Waterdeep undercity/lair context, not default `waterdeep`.

![Xanathar's lair Maps preview](https://www.dndbeyond.com/attachments/11/174/xanathars-lair.gif)

Lower-priority source: [Waterdeep: Dungeon of the Mad Mage Now in Maps!](https://www.dndbeyond.com/posts/1682-waterdeep-dungeon-of-the-mad-mage-now-in-maps)

Candidate for: Undermountain / dungeon context, not default `waterdeep`.

![Dungeon of the Mad Mage Maps preview](https://www.dndbeyond.com/attachments/11/227/dungeon-of-the-mad-mage-in-maps.jpg)

### Neverwinter

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: `neverwinter` map/reference variant

![Neverwinter map](https://www.dndbeyond.com/attachments/10/457/neverwinter.jpg)

Note: this is useful, but it appears to be map-style reference rather than scenic city art. Keep looking for a stronger default image.

### Candlekeep

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: `candlekeep`, `way_of_the_lion`, `coast_way`

![Candlekeep overhead view](https://www.dndbeyond.com/attachments/10/453/candlekeep.jpg)

### Phandalin

Source: [Visit Phandalin, D&D's Most Popular Starter Town!](https://www.dndbeyond.com/posts/1515-visit-phandalin-d-ds-most-popular-starter-town)

Candidate for: `phandalin`

![Phandalin town scene](https://www.dndbeyond.com/attachments/10/610/phandalin.jpg)

Candidate for: `phandalin` map/reference variant

![Phandalin map](https://www.dndbeyond.com/attachments/10/609/phandalin-map.jpg)

Lower-priority source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: `phandalin` alternate map/reference variant

![Phandalin map alternate](https://www.dndbeyond.com/attachments/10/454/phandalin.jpg)

## Region And Wilderness Candidates

### Icewind Dale

Source: [From Icewind Dale to Calimport: A Sandbox of Adventure in the Forgotten Realms](https://www.dndbeyond.com/posts/2079-from-icewind-dale-to-calimport-a-sandbox-of)

Candidate for: `bryn_shander`, `spine_of_the_world`, `sea_of_moving_ice`, `maer_dualdon`, `lac_dinneshere`, `redwaters`

![Icewind Dale mountains and frozen lakes](https://www.dndbeyond.com/attachments/12/444/icewind-dale.jpg)

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: `bryn_shander` / Ten Towns settlement feel

![Icewind Dale settlement](https://www.dndbeyond.com/attachments/10/451/icewind-dale.jpg)

Source: [Bringing Auril the Frostmaiden to Life in Your Icewind Dale Campaign](https://www.dndbeyond.com/posts/1139-bringing-auril-the-frostmaiden-to-life-in-your)

Candidate for: ancient Netherese ruin / Ythryn-style future node; not a current config id.

![Ythryn ruin](https://www.dndbeyond.com/attachments/9/317/ythyrn.jpg)

### Dalelands, Shadowdale, And Cormanthor

Source: [From Icewind Dale to Calimport: A Sandbox of Adventure in the Forgotten Realms](https://www.dndbeyond.com/posts/2079-from-icewind-dale-to-calimport-a-sandbox-of)

Candidate for: `shadowdale`, `cormanthor`

![Dalelands farms and Cormanthor edge](https://www.dndbeyond.com/attachments/12/447/dalelands.jpg)

Source: [Art of the Forgotten Realms: The Dalelands](https://www.dndbeyond.com/posts/2101-art-of-the-forgotten-realms-the-dalelands)

Candidate for: `shadowdale`, `cormanthor`

![Dalelands vista](https://www.dndbeyond.com/attachments/12/545/dalelands-vista.jpg)

Candidate for: Myth Drannor / Cormanthor future node; optional alternate for `cormanthor`

![Myth Drannor forest ruin](https://www.dndbeyond.com/attachments/12/560/myth-drannor.jpg)

Candidate for: Myth Drannor map/reference variant

![Myth Drannor map](https://www.dndbeyond.com/attachments/12/546/myth-drannor-1.jpg)

Candidate for: Myth Drannor design/reference variant

![Myth Drannor behind-the-scenes map](https://www.dndbeyond.com/attachments/12/544/myth-drannor.jpg)

### Moonshae Isles

Source: [From Icewind Dale to Calimport: A Sandbox of Adventure in the Forgotten Realms](https://www.dndbeyond.com/posts/2079-from-icewind-dale-to-calimport-a-sandbox-of)

Candidate for: `moonshae_isles`, `sea_of_swords`, `trackless_sea`

![Moonshae Isles coasts and standing stones](https://www.dndbeyond.com/attachments/12/446/moonshae.jpg)

Source: [Art of the Forgotten Realms: Moonshae Isles](https://www.dndbeyond.com/posts/2108-art-of-the-forgotten-realms-moonshae-isles)

Candidate for: `moonshae_isles`

![Moonshae opener](https://www.dndbeyond.com/attachments/12/598/moonshae-opener.jpg)

Candidate for: `moonshae_isles`

![Moonshae windskiff over waterfalls](https://www.dndbeyond.com/attachments/12/587/katerina-moonshae.jpg)

Candidate for: `moonshae_isles` concept/reference variant

![Moonshae island concept art](https://www.dndbeyond.com/attachments/12/589/moonshae-island-concept-art.jpg)

Candidate for: `moonshae_isles` forest/Feywild-flavored variant

![Moonshae Fey-touched forest concepts](https://www.dndbeyond.com/attachments/12/590/mooneshae-alex-o.jpg)

### Underdark

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: Underdark-adjacent use on `mithral_hall` or future Underdark location ids.

![Underdark cavern](https://www.dndbeyond.com/attachments/10/456/the-underdark.jpg)

### Savage Frontier / The North

Source: [Adventure in a Faerunian Sandbox: Storm King's Thunder is Now on Maps](https://www.dndbeyond.com/posts/1699-adventure-in-a-faerunian-sandbox-storm-kings)

Candidate for: broad route/dungeon-master reference for The North, not a default location image.

![Savage Frontier Maps preview](https://www.dndbeyond.com/attachments/11/283/storm-kings-thunder.gif)

## Future Scope Candidates

### Calimshan / Calimport

Source: [From Icewind Dale to Calimport: A Sandbox of Adventure in the Forgotten Realms](https://www.dndbeyond.com/posts/2079-from-icewind-dale-to-calimport-a-sandbox-of)

Candidate for: future `calimshan` / `calimport` expansion. Not currently in the starter config.

![Calimshan and Calimport](https://www.dndbeyond.com/attachments/12/445/calimshan.jpg)

### Stormwreck Isle

Source: [Take a Tour of These Popular Locations in the Forgotten Realms](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)

Candidate for: future island starter content, not currently in the starter config.

![Stormwreck Isle](https://www.dndbeyond.com/attachments/10/455/stormwreck-isle.jpg)

## Posts Checked But Not Prioritized

These posts were checked and either had product art, character/creature art, VTT screenshots, or images that do not map cleanly to the current location atlas.

| Post | Reason |
|------|--------|
| [Everything You Need to Know About the New Forgotten Realms Books](https://www.dndbeyond.com/posts/2032-everything-you-need-to-know-about-the-new) | Product/bundle art rather than location art. |
| [Dungeon Masters Campaign 2: Experience the Magic of Arcana Unleashed](https://www.dndbeyond.com/posts/2198-dungeon-masters-campaign-2-experience-the-magic-of) | Article mentions Anauroch, but images found were cast/group art, not location art. |
| [Art of the Forgotten Realms: The Horrid Zlan and Regal Spirit Dragons](https://www.dndbeyond.com/posts/2104-art-of-the-forgotten-realms-the-horrid-zlan-and) | Creature-focused art. |
| [Waterdeep: Dragon Heist and Journeys through the Radiant Citadel Now Available in Maps](https://www.dndbeyond.com/posts/1655-waterdeep-dragon-heist-and-journeys-through-the) | Useful for Waterdeep lair context, but not a default city image. |
| [Waterdeep: Dungeon of the Mad Mage Now in Maps!](https://www.dndbeyond.com/posts/1682-waterdeep-dungeon-of-the-mad-mage-now-in-maps) | Useful for Undermountain context, but not a default city image. |
| [Ghosts of Saltmarsh and Baldur's Gate: Descent into Avernus Now Available in Maps](https://www.dndbeyond.com/posts/1634-ghosts-of-saltmarsh-and-baldurs-gate-descent-into) | Baldur's Gate image is a disaster/Avernus variant, not the default city state. |

## Follow-up Search Targets

- Stronger scenic images for `neverwinter`, `luskan`, `silverymoon`, `bryn_shander`, `elturel`, and `candlekeep` alternates.
- More wilderness images for `neverwinter_wood`, `high_forest`, `evermoors`, `high_moor`, `anauroch`, `spine_of_the_world`, and the major rivers.
- Decide whether maps and VTT GIFs should be allowed as runtime `image` values, or only as documentation/reference images.
