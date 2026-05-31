# stats.gvar

**Path:** `src/gvars/utils/pc/stats.gvar` · **Phase:** 0–1

**Per-character command usage** — counts, timestamps, last args, and command-specific aggregates stored on character cvars. Replaces westmarch **`bags.*_cooldown_code`** patterns; exploration cooldowns read **`last_used_at`** from here.

**One public entrypoint:** **`add_log()`**. All writes go through it. Reads for cooldown checks and library inference use private helpers or documented cvar shape — aliases do **not** call write helpers directly.

## Dependencies

```py
using(config = env.gvars.config)
```

Infers **command** and **subsystem** from **`ctx`** (same **`COMMAND_MAP`** as [auth.gvar](auth.md)). Parses positional args from alias **`args`** string where needed for **`last_used_args`**.

## API

```py
def add_log(ch, extras=None):
    """
    Record one successful command invocation.

    ch — Avrae character object.
    extras — optional dict of fields stats cannot infer from ctx/args alone.
             Merged into the command's stats bucket after standard fields update.

    Infers from ctx + args (no need to pass command name):
      - command key (e.g. "enc", "forage", "craft")
      - last_used_args — raw args string for this invocation

    Always updates on the command bucket:
      - count += 1
      - last_used_at — unix timestamp (now)
      - last_used_args — args string

    Returns (success, message). Failures are rare (cvar write errors); message is
    player-facing when returned.

    Call at end of alias after successful work (encounter resolved, purchase complete, …).
    For exploration, pass extras AFTER biome/kind are known — see below.
    """
```

**Only public function.** Aggregation, cvar load/save, and command-key resolution are private.

### Exploration `extras`

After **`biomes.resolve_biome`** and **`encounter_lists.get_encounter`**, activity aliases pass:

```py
stats.add_log(ch, extras={
    "biome": biome_code,
    "encounter_kind": kind,   # "combat" | "quest" | "gather" | "story" | …
})
```

**`add_log`** increments nested counters when **`extras`** includes recognized keys:

| Extra key | Effect on bucket |
|-----------|------------------|
| **`biome`** | **`biomes[code]`** count += 1 |
| **`encounter_kind`** | **`kinds[kind]`** count += 1 |

Other commands document their **`extras`** keys in alias READMEs when implemented (e.g. crafting: **`recipe_id`**, economy: **`shop_id`**).

## Cvar storage

```py
CVAR_STATS = "wg_stats"
```

```py
{
    "enc": {
        "count": 42,
        "last_used_at": 1717000000,
        "last_used_args": "forest +2",
        "biomes": {"forest": 30, "cave": 12},
        "kinds": {"combat": 10, "gather": 25, "quest": 7},
    },
    "forage": {
        "count": 8,
        "last_used_at": 1716999000,
        "last_used_args": "",
        "biomes": {"forest": 8},
        "kinds": {"gather": 8},
    },
    # … one bucket per command key that has been used at least once
}
```

Lazy-init: missing command bucket created on first **`add_log`**.

## Cooldowns

When the relevant **`policies.*.enforce_cooldowns`** flag is **`True`** (exploration, economy, content, …), aliases check cooldown **before** running command logic:

```py
using(pc = env.gvars.pc)

allowed, remaining = pc.check_cooldown(ch, "enc", config)
if not allowed:
    return get_embed(desc=f"Wait {remaining}s before using !enc again.")
```

**[pc.gvar](pc.md)** **`check_cooldown(ch, command, config)`** reads **`wg_stats[command].last_used_at`** (via private stats reader — not part of the public stats API). Duration comes from **`subsystems.<subsystem>.command_config[command].cooldown_seconds`**, merged with engine defaults ([data-shapes § Command config](../data-shapes.md#command-config)). **`0`** = no cooldown for that command.

On success, **`stats.add_log(ch, …)`** updates **`last_used_at`** — no separate cooldown cvar.

Skipped in Development env (same as westmarch).

## Repeat encounter history

When **`policies.exploration.avoid_repeat_encounters`** is **`same_biome`** or **`global`**, **[encounter_lists.gvar](encounter_lists.md)** reads recent **`encounter_id`** values from log extras (window: **`exploration.config.repeat_exclude_window`**, default **5**).

## Balanced distribution history

**`distribution_policy: balanced`** for exploration uses **`wg_stats.enc.kinds`** (or per-activity kind sub-buckets) as rolling kind history — see [encounter_lists.md](encounter_lists.md). No separate **`wg_enc_kind_history`** cvar; **`stats`** is the source of truth.

## Library inference

**[library.gvar](library.md)** **`infer_topics()`** reads recent exploration from **`wg_stats`** — recent **`enc`/`forage`/…** buckets, **`biomes`**, and **`kinds`** — for **`content.config.library_topic_source`** **`inferred`** / **`balanced`** modes.

## Usage *(exploration activity alias)*

```py
using(
    auth = env.gvars.auth,
    display = env.gvars.display,
    biomes = env.gvars.biomes,
    encounter_lists = env.gvars.encounter_lists,
    encounters = env.gvars.encounters,
    pc = env.gvars.pc,
    stats = env.gvars.stats,
)

ok, msg = auth.is_allowed()
if not ok:
    return embeds.get_embed(desc=msg)

get_embed = display.get_display()
cfg = config.get_config()
ch = character()

allowed, remaining = pc.check_cooldown(ch, "enc")
if not allowed:
    return get_embed(desc=f"Wait {remaining}s.")

biome, err = biomes.resolve_biome("enc", args, ch, cfg)
if err:
    return get_embed(desc=err)

encounter = encounter_lists.get_encounter(biome, "enc", ch, cfg)
result = encounters.process_encounter(encounter, ch, bonuses=…)

stats.add_log(ch, extras={
    "biome": biome,
    "encounter_kind": encounter.get("kind"),
})

return get_embed(desc=result["body"])
```

## Tests

- First **`add_log`** creates bucket with **`count: 1`**
- **`extras.biome`** / **`extras.encounter_kind`** increment nested maps
- **`pc.check_cooldown`** respects **`last_used_at`**
- Development env skips cooldown gate (alias-test fixture)

## Related

- [pc.md](pc.md) — **`check_cooldown`** reads stats cvar
- [biomes.md](biomes.md) — **`resolve_biome`**
- [encounter_lists.md](encounter_lists.md) — balanced kind selection
- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
- [data-shapes.md § exploration.config](../data-shapes.md#explorationconfig)
