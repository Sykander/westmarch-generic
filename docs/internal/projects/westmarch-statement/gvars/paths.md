# paths.gvar

**Path:** `src/gvars/world/paths.gvar` · **Phase:** 1 (Tier C)

Look up [paths](../data-shapes.md#path) from server config and resolve **per-edge** costs and steps. Config owns the **`paths`** list; this module owns edge helpers used by [journeys.md](journeys.md) routing and display.

**Shortest-path search** lives in **`journeys.gvar`** — not here.

## API

```py
def get_edge(config, from_id, to_id):
    """Single directed path dict from → to, or None."""

def get_edges_from(config, from_id):
    """All path dicts where path.from == from_id."""

def get_path_cost(path, horse=False, boat=False):
    """Numeric cost for one edge — used by journeys.find_journey (lower = cheaper)."""

def get_path_steps(path, horse=False, boat=False):
    """Resolved step list for one edge."""

def display_path(path, config, mode="short", horse=False, boat=False, prefix="!"):
    """One leg — markdown string (linked names via [locations.md](locations.md))."""
```

## Edge cost (`get_path_cost`)

westmarch compares the **cheapest travel mode** available on the edge:

| Source on path | Cost formula *(westmarch)* | Generic target |
|----------------|---------------------------|----------------|
| Encounter steps | `len(steps)` | `len(get_path_steps(...))` |
| Horse variant | shorter horse step list when `horse=True` | `steps_horse` or tagged steps |
| Boat variant | shorter boat step list when `boat=True` | `steps_boat` or tagged steps |
| Gold only | `gold / 25` | `cost.gold / 25` |
| Free hop | `0` | no steps and no cost |

Return **`min(...)`** of applicable costs; use a large sentinel when a mode does not apply (westmarch used `999`).

## Steps (`get_path_steps`)

1. `horse=True` and path has horse-specific steps → use those  
2. else `boat=True` and boat-specific steps → use those  
3. else generic **`path.steps`**  
4. else **`[{ "type": "proceed", "description": "Proceed to {to}" }]`**

## Display (`display_path`)

| Mode | Example |
|------|---------|
| **`short`** | `Oakwood Forest → Oakwood East` + step count |
| **`detailed`** | Linked from/to headers, optional `label`, bullet list of steps |

Multi-leg routes and progress strikethrough → **`journeys.display_journey`**.

## Usage

```py
using(paths = env.gvars.paths, journeys = env.gvars.journeys)

edge = paths.get_edge(cfg, "oakwood", "oakwood_east")
steps = paths.get_path_steps(edge, horse=True)
found, legs = journeys.find_journey(cfg, from_id, to_id, horse=horse, boat=boat)
```

## Not in this module

- **`find_journey`**, **`display_journey`**, journey/location cvars → [journeys.md](journeys.md)
- Location lookup → [locations.md](locations.md)

## westmarch reference

| westmarch | Generic |
|-----------|---------|
| `paths` list in engine gvar | Config **`paths`** |
| `get_path_cost` / `get_path_steps` | same names |
| `get_shortest_path` | **`journeys.find_journey`** |

## Related

- [journeys.md](journeys.md) · [locations.md](locations.md)
- [aliases/travel/travel.md](../aliases/travel/travel.md)
