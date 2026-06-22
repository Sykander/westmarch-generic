# paths.gvar

**Path:** `src/gvars/utils/world/paths.gvar` · **Phase:** 1 (Tier C)

Look up [paths](../data-shapes.md#path) from inline **`world_data.paths`** and optional external **`world_data.paths_gvar_id`** JSON, then resolve **per-edge** costs and steps. Transport modes from **`world_data.transport`**. Edge helpers used by [journeys.md](journeys.md).

**Shortest-path search** lives in **`journeys.gvar`** — not here.

Each path dict is **one directed edge** with **one** `steps` list. Same `from`/`to` with different transport → **separate path entries** (see [data-shapes § Transport](../data-shapes.md#transport)).

Migration compatibility: runtime also accepts westmarch shorthand fields **`encs`**, **`horse`**, **`boat`**, and **`gold`**. New configs should prefer generic **`steps`**, **`requirements.transport`**, and **`cost`**.

## API

```py
def get_edge(config, from_id, to_id, transport_id="walk"):
    """Single directed path dict from → to matching transport, or None."""

def get_edges_from(config, from_id, transport_id="walk"):
    """All path dicts where path.from == from_id and requirements match transport."""

def get_path_cost(path, transport_id="walk"):
    """Numeric cost for one edge — used by journeys.find_journey (lower = cheaper)."""

def get_path_steps(path):
    """Step list for this path — always path.steps (see default proceed below)."""

def display_path(path, config, mode="short", transport_id="walk", prefix="!"):
    """One leg — markdown string (linked names via [locations.md](locations.md))."""
```

External path gvars are raw JSON arrays of path objects. A wrapper object with **`{"paths": [...]}`** is also accepted. Inline **`world_data.paths`** entries are appended after external entries so small owner additions can live directly on the config gvar.

## Edge cost (`get_path_cost`)

westmarch compares the **cheapest applicable path** between two locations (each path is already transport-specific):

| Source on path | Cost formula *(westmarch)* | Generic target |
|----------------|---------------------------|----------------|
| Encounter steps | `len(steps)` | `len(get_path_steps(path))` |
| Gold only | `gold / 25` | `cost.gold / 25` |
| Free hop | `0` | no steps and no cost |

Return **`min(...)`** across paths that match the traveller’s transport; use a large sentinel when no path applies (westmarch used `999`).

## Steps (`get_path_steps`)

1. If **`path.steps`** present → return it  
2. else **`[{ "type": "proceed", "description": "Proceed to {to}" }]`**

Transport selection happens when **choosing which path dict** applies — not by swapping step lists on one path.

Encounter display defaults to `!enc <biome>`. When a step sets `activity`, display uses that command instead, e.g. `{ "type": "encounter", "activity": "forage", "biome": "forest" }` renders `!forage forest`.

## Display (`display_path`)

| Mode | Example |
|------|---------|
| **`short`** | `Oakwood Forest → Oakwood East` + step count |
| **`detailed`** | Linked from/to headers, optional `label`, bullet list of steps |

Multi-leg routes and progress strikethrough → **`journeys.display_journey`**.

## Usage

```py
using(paths = env.gvars.paths, journeys = env.gvars.journeys)

edge = paths.get_edge(cfg, "oakwood", "oakwood_east", transport_id="horse")
steps = paths.get_path_steps(edge)
found, legs = journeys.find_journey(cfg, from_id, to_id, transport_id="horse")
```

## Not in this module

- **`find_journey`**, **`display_journey`**, journey/location cvars → [journeys.md](journeys.md)
- Location lookup → [locations.md](locations.md)

## westmarch reference

| westmarch | Generic |
|-----------|---------|
| `paths` list in engine gvar | Config **`world_data.paths`** or **`world_data.paths_gvar_id`** |
| `get_path_cost` / `get_path_steps` | same names |
| `path.horse` / `path.boat` on one edge | Separate path dicts per transport |
| `get_shortest_path` | **`journeys.find_journey`** |

## Related

- [journeys.md](journeys.md) · [locations.md](locations.md)
- [aliases/travel/travel.md](../aliases/travel/travel.md)
