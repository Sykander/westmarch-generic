# Forgotten Realms config project

Design notes for turning `src/gvars/configs/forgotten_realms_2014.gvar` from a tiny example into a usable Forgotten Realms starter preset.

## Documents

- [problem-statement.md](problem-statement.md) - why the current starter config is not enough.
- [solution-statement.md](solution-statement.md) - target config shape, seed data scope, map usage, transport modes, and rollout plan.
- [implementation-plan.md](implementation-plan.md) - phased implementation checklist and acceptance criteria.
- [baseline-audit.md](baseline-audit.md) - slice 0 runtime/editor audit plus updated slice 2-3 runtime notes.
- [location-art-resources.md](location-art-resources.md) - D&D Beyond image candidates for future location image enrichment.
- [dndbeyond-image-catalog.md](dndbeyond-image-catalog.md) - exhaustive categorized image catalog from the D&D Beyond Forgotten Realms/location archive pass.

## Map assets

The map assets are reference inputs for the config authoring pass, not runtime Avrae assets.

| Asset | Role |
|-------|------|
| `assets/Sword-Coast-Map_HighRes.jpg` | Highest-detail reference for final route checks and small labels |
| `assets/Sword-Coast-Map_MedRes.jpg` | Working copy when the high-res file is too slow |
| `assets/Sword-Coast-Map_LowRes.jpg` | Fast broad-route reference |

The map covers the Sword Coast and nearby northwest Faerun. It is a strong starter scope, but it is not the full Forgotten Realms world.

## Reference resources

- [Realms Helps: Faerunian Random Encounters by Region and Locale](https://www.realmshelps.net/adventuring/faerun_encounters.shtml) - used as broad inspiration for engine biome baseline coverage. Save this for a later location encounter pass because it is organized by named Forgotten Realms regions and locales as well as generic aquatic, dungeon, frostfell, wastes, and Underdark pages.
