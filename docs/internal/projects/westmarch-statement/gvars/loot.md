# loot.gvar

**Path:** `src/gvars/utils/exploration/loot.gvar` · **Phase:** 1 (Tier C)

**Post-combat loot sessions** for **`!loot`** — not random encounter drops. After a fight (often following **`!hunt`**), players run a multi-step minigame: pick a creature, roll Investigation/Arcana/Religion/Nature (by lootable type) to extract items and gp from that corpse.

## What it is for

| Phase | Player action | Engine |
|-------|---------------|--------|
| **Start** | `!loot <creature>` | Look up monster → build **lootables** list (gp bands by CR, type-based skill checks) |
| **Extract** | `!loot <item>` | Roll vs DC → on success update the Loot bag or coinpurse from inside `loot.gvar` |
| **Status / clear** | `!loot` / `!loot clear` | Read or wipe session cvar |

This is **separate from**:

- **Encounter outcomes** (`encounters.gvar` **`type: item`**) — instant rewards from **`!enc`** rolls
- **Shop buy/sell** — transactional, not skill-based corpse looting

westmarch inlined ~100 lines in **`loot.alias`**; generic extracts table generation and session helpers here.

## API

```py
def build_lootables(monster, config):
    """From monster type + CR → list of { name, skill, dc, kind: item|gold, … }."""

def get_session(ch):
    """Active loot session dict or None."""

def set_session(ch, session):
    """Persist session — key via [pc.md](pc.md) `CVAR_LOOT_SESSION`."""

def clear_session(ch):

def attempt_loot(ch, config, lootable_id, args):
    """Roll skill check; on success apply via pc; return (success, message, updated_session)."""

def format_session(session, config):
    """Help player see remaining lootables."""
```

Display config lives under **`subsystems.exploration.config`**:

- **`monster_images.loot`**: **`thumbnail`** (default), **`image`**, or **`off`**
- **`show_check_dcs.loot`**: **`True`** by default; **`False`** hides numeric DC text while still rolling against the DC

Optional later: config **`LOOT_RULES`** overrides CR→gp bands and type→skill mapping.

## Dependencies

- [monsters.md](monsters.md) — creature lookup
- [core/bags.gvar](core.md) / Avrae coinpurse — sheet changes from inside the helper
- **`core/rolls.gvar`** via `env.gvars.rolls`

## Related

- [aliases/exploration/loot.md](../aliases/exploration/loot.md)
- [aliases/exploration/hunt.md](../aliases/exploration/hunt.md)
