# loot.gvar

**Path:** `src/gvars/utils/exploration/loot.gvar` · **Phase:** 1 (Tier C)

**Post-combat loot sessions** for **`!loot`** — not random encounter drops. After a fight (often following **`!hunt`**), players run a multi-step minigame: pick a creature, roll a generic westmarch-style check to extract generated items and gp from that corpse.

## What it is for

| Phase | Player action | Engine |
|-------|---------------|--------|
| **Start** | `!loot <creature>` | Look up monster → roll **lootables** from type, size, and CR |
| **Extract** | `!loot <item>` | Roll vs DC → on success update the Loot bag or coinpurse from inside `loot.gvar` |
| **Status / clear** | `!loot` / `!loot clear` | Read or wipe session cvar |

This is **separate from**:

- **Encounter outcomes** (`encounters.gvar` **`type: item`**) — instant rewards from **`!enc`** rolls
- **Shop buy/sell** — transactional, not skill-based corpse looting

westmarch inlined ~100 lines in **`loot.alias`**; generic extracts table generation and session helpers here.

## API

```py
def build_lootables(monster, config):
    """Roll generic westmarch-style entries from monster type, size, and CR."""

def possible_loot_categories(monster):
    """Return category ids this creature can roll: trophy, coins, ration."""

def get_session(ch):
    """Active loot session dict or None."""

def set_session(ch, session):
    """Persist session — key via [pc.md](pc.md) `CVAR_LOOT_SESSION`."""

def clear_session(ch):

def attempt_loot(ch, config, lootable_id, args):
    """Roll skill check; on success apply via pc; return (success, message, updated_session)."""

def format_session(session, config, prefix="!", command="loot"):
    """Help player see remaining lootables with the active alias prefix."""
```

Display config lives under **`subsystems.exploration.config`**:

- **`monster_images.loot`**: **`thumbnail`** (default), **`image`**, or **`off`** for the initial loot-session embed only
- **`show_check_dcs.loot`**: **`True`** by default; **`False`** hides numeric DC text while still rolling against the DC

Default opportunities mirror the westmarch alias:

- Person-like creatures can roll **Coins** using **Sleight of Hand**.
- Non-person creatures can roll **Trophies** using a type-based check.
- Edible non-person creatures can roll **Rations** using **Survival**.

Type-based checks are **Nature** for beast/plant, **Religion** for celestial/fiend/undead, **Arcana** for aberration/elemental/construct, and **Survival** otherwise.

Player-facing command references in help and session text accept the alias-provided prefix and command name, so non-`!` servers display the correct command examples.

Optional later: config **`LOOT_RULES`** overrides CR→gp bands and type→skill mapping.

## Dependencies

- [monsters.md](monsters.md) — creature lookup
- [core/bags.gvar](core.md) / Avrae coinpurse — sheet changes from inside the helper
- **`core/rolls.gvar`** via `env.gvars.rolls`

## Related

- [aliases/exploration/loot.md](../aliases/exploration/loot.md)
- [aliases/exploration/hunt.md](../aliases/exploration/hunt.md)
