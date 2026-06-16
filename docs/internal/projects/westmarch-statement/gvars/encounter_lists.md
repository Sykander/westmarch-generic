# encounter_lists.gvar

**Path:** `src/gvars/utils/encounters/encounter_lists.gvar` · **Phase:** 0–1

Pick **one encounter** for an activity command. Resolves **biome** JSON row tags + optional **location** pools ([location_encounters.gvar](location_encounters.md)).

## Dependencies

```py
using(
    biomes = env.gvars.biomes,
    location_encounters = env.gvars.location_encounters,  # Phase 1
)
```

## API *(planned)*

```py
def get_encounter(biome, activity, character, config, location_id=None):
    """
    biome — resolved code from biomes.resolve_biome (not raw args).
    activity — "enc" | "forage" | "mine" | "fish" | "lumber" | "hunt" | "job" | …
    location_id — character location when inferring location encounter module

    1. Choose kind (combat | quest | gather) from exploration.config distribution
       — exploration activities only; service commands skip to step 2 with kind gather
    2. entries = biomes.get_pool_entries(biome, activity, kind)
       + location_encounters.get_pool_entries(location_id, activity, kind)
    3. Uniform random choice within combined list
    4. Return encounter dict for encounters.process_encounter
    """
```

## Kind selection *(first)*

Reads **`config.subsystems.exploration.config`**:

| Key | Role |
|-----|------|
| **`distribution_policy`** | `"random"` — weighted PRNG per roll; `"balanced"` — per-character kind history |
| **`distribution`** | `{ "combat": int, "quest": int, "gather": int }` — must sum to **100** |

**After** kind is chosen, build the candidate list:

- **Exploration & gathering** — **`biomes.get_pool_entries`** ∪ **`location_encounters.get_pool_entries`**
- **Service commands** (`job`, `buy`, `library`, …) — location module only

Pick one entry at random. Error if list empty.

**Does not** build westmarch-style d100 tables. Does **not** resolve biome source policy — caller uses **`biomes.resolve_biome`** first.

**Balanced mode:** reads per-command **`kinds`** counters from **[stats.gvar](stats.md)** **`wg_stats`**; selection favours kinds under target **`distribution`**.

## Pool shape

**Biome gvar** — raw JSON row list for exploration activities only ([data-shapes § Biome gvar body](../data-shapes.md#biome-gvar-body-separate-workshop-module)). Candidate rows match the selected `activity.kind` tag, or `null` when the expanded template kind is compatible.

**Location encounter gvar** — any activity enabled on that place ([data-shapes § Location encounter module](../data-shapes.md#location-encounter-module-separate-workshop-gvar)).

## westmarch differences

| westmarch | westmarch-generic |
|-----------|-------------------|
| **`get_encounter_list`** → 100 mixed entries | **Dropped** |
| Random from d100 | **Kind first**, then random in kind bucket |
| **`encounters`** + **`combat_encounters`** mix | Compact rows tagged with **`activity.kind`** |

## Combat scaling

**`policies.combat.scale_encounters_to_level`** — **post-MVP**. MVP uses fixed **`cr`** from pool entries. See [data-shapes § combat policy](../data-shapes.md#combat-post-mvp-scaling--schema-reserved).

## Repeat encounter avoidance

When **`policies.exploration.avoid_repeat_encounters`** is not **`off`**:

1. Read recent **`encounter_id`** (or stable encounter name) from **[stats.gvar](stats.md)** log extras for the character — window **`exploration.config.repeat_exclude_window`** (default **5**).
2. **`same_biome`** — exclude ids seen in this biome + activity only.
3. **`global`** — exclude ids seen for this activity across all biomes.
4. Filter the kind bucket before uniform random; if the pool would be empty, fall back to unfiltered random and log a dev warning.

Requires **`stats.add_log`** to record **`encounter_id`** on successful picks. **`!westmarch check`** warns when policy is on but stats subsystem path is unavailable.

## Monster HP in combat embeds

**`policies.combat.roll_monster_hp`** — when **`True`** *(default)*, **[encounters.gvar](encounters.md)** may include rolled/average HP in combat blocks when monster catalogue is loaded. When **`False`**, omit HP — GM rolls or uses fixed stat blocks off-bot.

## Related

- [biomes.md](biomes.md) — **`resolve_biome`**, lazy load
- [location_encounters.md](location_encounters.md) — place-specific pools
- [stats.md](stats.md) — kind history for balanced mode; **`add_log`** after encounter
- [encounters.md](encounters.md) — run chosen encounter
- [data-shapes.md § exploration.config](../data-shapes.md#explorationconfig)
- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
