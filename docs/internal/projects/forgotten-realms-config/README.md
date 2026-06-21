# Forgotten Realms config project

Design notes for turning `src/gvars/configs/forgotten_realms_2014.gvar` from a tiny example into a usable Forgotten Realms starter preset.

## Documents

- [problem-statement.md](problem-statement.md) - why the current starter config is not enough.
- [solution-statement.md](solution-statement.md) - target config shape, seed data scope, map usage, transport modes, and rollout plan.
- [implementation-plan.md](implementation-plan.md) - phased implementation checklist and acceptance criteria.

## Map assets

The map assets are reference inputs for the config authoring pass, not runtime Avrae assets.

| Asset | Role |
|-------|------|
| `assets/Sword-Coast-Map_HighRes.jpg` | Highest-detail reference for final route checks and small labels |
| `assets/Sword-Coast-Map_MedRes.jpg` | Working copy when the high-res file is too slow |
| `assets/Sword-Coast-Map_LowRes.jpg` | Fast broad-route reference |

The map covers the Sword Coast and nearby northwest Faerun. It is a strong starter scope, but it is not the full Forgotten Realms world.
