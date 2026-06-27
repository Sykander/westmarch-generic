# Forgotten Realms economy seed

First runtime economy slice for `src/gvars/configs/forgotten_realms_2014.gvar`.

## Scope

- Economy subsystem enabled for `job`, `buy`, and `sell`.
- `wallet` remains disabled because this preset currently uses Avrae gp only.
- 37 top-level shops are configured across 31 settled locations.
- Matching locations in `forgotten_realms_2014_locations.gvar.json` now expose `commands.job`, `commands.buy`, `commands.sell`, and `services`.
- Crafting remains disabled, but `subsystems.crafting.config.catalogues.items` includes a small service-item overlay because the economy shop resolver checks that catalogue source before `world_data.items`.

## Service Items

The item overlay adds non-equipment services that shops can sell as bag-tracked tickets or receipts:

- `Ship Passage`
- `River Passage`
- `Small Boat Hire`
- `Keelboat Passage`
- `Caravan Passage`
- `Stabling (1 day)`
- `Common Lodging`

## Shop Locations

| Location id | Services |
|-------------|----------|
| `waterdeep` | `waterdeep_general_market`, `waterdeep_stables`, `waterdeep_docks`, `waterdeep_healers` |
| `neverwinter` | `neverwinter_market`, `neverwinter_alchemist`, `neverwinter_docks` |
| `luskan` | `luskan_docks` |
| `baldurs_gate` | `baldurs_gate_markets`, `baldurs_gate_docks` |
| `daggerford` | `daggerford_tradehouse` |
| `candlekeep` | `candlekeep_scribes` |
| `leilon` | `leilon_outfitter` |
| `port_llast` | `port_llast_docks` |
| `phandalin` | `phandalin_outfitter` |
| `triboar` | `triboar_caravan_yard` |
| `yartar` | `yartar_river_market` |
| `longsaddle` | `longsaddle_oddments` |
| `amphail` | `amphail_stables` |
| `rassalantar` | `rassalantar_roadstop` |
| `red_larch` | `red_larch_outfitter` |
| `mirabar` | `mirabar_smiths` |
| `silverymoon` | `silverymoon_scribes` |
| `everlund` | `everlund_market` |
| `sundabar` | `sundabar_smiths` |
| `citadel_felbarr` | `citadel_felbarr_smiths` |
| `citadel_adbar` | `citadel_adbar_smiths` |
| `mithral_hall` | `mithral_hall_smiths` |
| `bryn_shander` | `bryn_shander_outfitter` |
| `elturel` | `elturel_market` |
| `scornubel` | `scornubel_caravan_yard` |
| `berdusk` | `berdusk_market` |
| `iriaebor` | `iriaebor_market` |
| `suzail` | `suzail_market` |
| `arabel` | `arabel_market` |
| `shadowdale` | `shadowdale_tradehouse` |
| `orlumbor` | `orlumbor_shipwrights` |

## Next Pass

- Add remaining regional ports and island markets where gameplay needs them.
- Add first-class browse/list shop command support if `!buy help` is not enough.
- Consider wallet currencies only if the campaign needs non-gp tokens such as faction scrip, trade bars, or renown.
- Add location encounter prose for named job boards, market trouble, and local service complications.
