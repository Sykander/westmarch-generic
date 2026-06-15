# Exploration — MVP implementation docs

**Config:** `subsystems.exploration` · Tier A–B (activities) + Tier C (**hunt**, **loot**)

Implementation plans for exploration commands. Scope and toggles: [mvp-commands.md](../../mvp-commands.md).

## Commands

| # | Command | Doc | Tier | Notes |
|---|---------|-----|------|-------|
| 1 | **enc** | [enc.md](enc.md) | A (Phase 0) | Reference port — encounter pipeline |
| 2 | **mine** | [mine.md](mine.md) | B | Activity clone |
| 3 | **lumber** | [lumber.md](lumber.md) | B | Activity clone |
| 4 | **forage** | [forage.md](forage.md) | B | Activity clone |
| 5 | **fish** | [fish.md](fish.md) | B | Activity clone |
| 6 | **hunt** | [hunt.md](hunt.md) | C | Monsters catalogue; after enc messaging |
| 7 | **loot** | [loot.md](loot.md) | C | Post-combat loot session |

## Shared activity pipeline

**enc**, **mine**, **lumber**, **forage**, **fish** share one pipeline:

```text
display.get_display()
  → auth.is_allowed()
  → pc.check_cooldown(ch, "<command>")
  → biomes.resolve_biome("<activity>", args, ch, cfg)
  → encounter_lists.get_encounter(biome, "<activity>", ch, cfg)
  → encounters.process_encounter(...)
  → stats.add_log(ch, extras={ biome, encounter_kind })
```

See [enc.md](enc.md) and [data-shapes.md](../../data-shapes.md).

**Biome source** — **`exploration.config.enc_biome_source`** applies to **all** activity commands (not **`enc`** only). Default **`auto`**: inferred from location when travel + **`world_data.locations`** exist; otherwise player enters biome code manually.

**Encounter data** — **`world_data.biomes`** registry on owner config; **`pools[activity][kind]`** on lazy-loaded biome gvars ([biomes.gvar](../../gvars/biomes.md)). No inline **`encounter_pools`** on config.

**hunt** → **loot** is the combat/loot loop (`!enc` before `!hunt` in westmarch help text).

## Standard alias opener

Every exploration alias starts with:

```py
using(auth = env.gvars.auth, display = env.gvars.display, embeds = env.gvars.embeds)

ok, msg = auth.is_allowed()
if not ok:
    return embeds.get_embed(desc=msg)

get_embed = display.get_display()
```

## Config

```py
"exploration": {
    "enabled": True,
    "commands": {
        "enc": True, "forage": True, "fish": True,
        "mine": True, "lumber": True, "hunt": True, "loot": True,
    },
    "config": {
        "enc_biome_source": "auto",
        "distribution_policy": "random",
        "distribution": {
            "combat": 25,
            "quest": 25,
            "gather": 50,
        },
    },
},
```

Subsystem **`config`**: [data-shapes.md § Subsystem entry](../../data-shapes.md#subsystem-entry).

Asset data: [assets/monsters.tsv](../../../../../../assets/monsters.tsv) (hunt, loot); biome **`pools`** in separate biome gvars ([src/gvars/configs/biomes/](../../../../src/gvars/configs/biomes/README.md)).

## Cooldowns

**[stats.gvar](../../gvars/stats.md)** stores **`last_used_at`** per command; **[pc.gvar](../../gvars/pc.md)** **`check_cooldown`** reads it. Duration from **`subsystems.exploration.command_config.<cmd>.cooldown_seconds`** (default **120** for activity clones). Not westmarch **`bags.*_cooldown_code`**.

## Related

- [gvars/biomes.md](../../gvars/biomes.md) — **`list_biomes`**, **`resolve_biome`**, lazy load
- [gvars/stats.md](../../gvars/stats.md) — **`add_log`**
- [travel/](../travel/README.md) — location inference for **`enc_biome_source`**
- [content/](../content/README.md) — **library** / **read** (separate subsystem)
