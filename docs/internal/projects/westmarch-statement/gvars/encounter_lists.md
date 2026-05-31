# encounter_lists.gvar

**Path:** `src/gvars/utils/encounters/encounter_lists.gvar` · **Phase:** 0–1

Pick **one encounter** for an activity command (**enc**, **forage**, …). Expects a **resolved biome code** from **[biomes.gvar](biomes.md)** **`resolve_biome`** — this module does **not** resolve biome source policy.

**Does not** build westmarch-style d100 tables.

## Dependencies

```py
using(biomes = env.gvars.biomes)
```

## API *(planned)*

```py
def get_encounter(biome, activity, character, config):
    """
    biome — resolved code from biomes.resolve_biome (not raw args).
    activity — "enc" | "forage" | "mine" | "fish" | "lumber" | …

    1. Choose kind (combat | quest | gather) from exploration.config distribution
    2. Load entries via biomes.get_pool_entries(biome, activity, kind)
    3. Uniform random choice within that list
    4. Return encounter dict for encounters.process_encounter
    """
```

## Kind selection *(first)*

Reads **`config.subsystems.exploration.config`**:

| Key | Role |
|-----|------|
| **`distribution_policy`** | `"random"` — weighted PRNG per roll; `"balanced"` — per-character kind history |
| **`distribution`** | `{ "combat": int, "quest": int, "gather": int }` — must sum to **100** |

**After** kind is chosen, load **`pools[activity][kind]`** from the biome gvar ([data-shapes § Biome gvar body](../data-shapes.md#biome-gvar-body-separate-workshop-module)). Pick one entry at random. Error if subset empty.

**Balanced mode:** reads per-command **`kinds`** counters from **[stats.gvar](stats.md)** **`wg_stats`**; selection favours kinds under target **`distribution`**.

## Pool shape *(biome gvar — not owner config inline)*

```py
pools = {
    "enc": {
        "combat": [ encounter, … ],
        "quest": [ encounter, … ],
        "gather": [ encounter, … ],
    },
    "mine": { "gather": [ … ] },
}
```

Each entry is an [encounter](../data-shapes.md#encounter-input) dict; set **`kind`** when inference is ambiguous.

## westmarch differences

| westmarch | westmarch-generic |
|-----------|-------------------|
| **`get_encounter_list`** → 100 mixed entries | **Dropped** |
| Random from d100 | **Kind first**, then random in kind bucket |
| **`encounters`** + **`combat_encounters`** mix | **`pools.<activity>.<kind>`** only |

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
- [stats.md](stats.md) — kind history for balanced mode; **`add_log`** after encounter
- [encounters.md](encounters.md) — run chosen encounter
- [data-shapes.md § exploration.config](../data-shapes.md#explorationconfig)
- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
