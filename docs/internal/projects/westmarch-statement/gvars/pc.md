# pc.gvar

**Path:** `src/gvars/pc/pc.gvar` · **Phase:** 0–1

**Player character state** — read and modify sheet-adjacent data: Avrae **gp**, config **wallet** currencies, **bags**, **downtime**, cooldown cvars, and related helpers.

Named **`pc`** (player character), not **`character`** — Drac2 exposes **`character()`** as a builtin; do not use that name for a gvar module ([drac2-avrae-sources](../../../../../.cursor/rules/drac2-avrae-sources.mdc)).

Consolidates westmarch **`bags.gvar`** (downtime, cooldowns, `modify_bag` wrapper) and planned **`wallet.gvar`** into one **write path** with consistent **`(success, message)`** returns on mutations.

**Port strategy:** copy relevant logic from westmarch and drac2-tools, adapt to this engine — see [core.md](core.md) § Domain engine modules. Low-level bag ops delegate to vendored **`core/bags.gvar`**; aliases never import **`bags`** directly.

## API contract

### Return shape

| Kind | Return | Notes |
|------|--------|-------|
| **Modify** | `(success, message)` | **`success`** — `True` if the change was applied; **`message`** — player-facing explanation (failure reason or summary of what changed) |
| **Get** | value or dict | Read-only; no side effects except lazy cvar init where documented (e.g. downtime epoch) |

```py
ok, msg = pc.modify_gold(ch, -10)
if not ok:
    return embed(title="Cannot pay", description=msg)
```

Failure messages should be specific — e.g. *Could not remove 10 gp — Alice only has 5 gp.*

Aliases and **`encounters.process_encounter`** call **`pc`** for sheet changes — not raw **`coinpurse`**, **`set_cvar`**, or **`core/bags`** except inside this module.

### First argument

Every function takes the Avrae **character object** as the first argument (alias convention: resolve with **`character()`** into a variable such as **`ch`**, then pass **`ch`**):

```py
try:
    ch = character()
except:
    return embed(title="No character", description="Select a character first.")

ok, msg = pc.modify_wallet(ch, "shards", 2)
```

---

## Mutators *(success, message)*

| Function | Purpose |
|----------|---------|
| **`modify_gold(ch, gp)`** | Add/remove Avrae **gp** via coinpurse. Fails if debit would go negative. |
| **`modify_wallet(ch, currency_id, delta)`** | Add/remove a config **wallet** currency. Validates **`currency_id`** against **`get_config().currencies`**. When **`policies.economy.enforce_wallet_caps`**, rejects grants above **`currencies[id].max_balance`**. |
| **`modify_bag(ch, item, count, bag="Equipment")`** | Add/remove item stacks. Wraps **`core/bags`** **`modify_bag`**; same failure semantics when removal exceeds stock. |
| **`modify_downtime(ch, workdays)`** | Add (positive) or spend (negative) workdays when **`policies.downtime.mode == "tracked"`**. Fails if spend would go negative or exceed **`policies.downtime.max_workdays`** cap on grant. |
| **`modify_hp(ch, delta)`** | Optional wrapper around **`ch.modify_hp`** for consistent messaging in encounter outcomes. |

### Examples

```py
using(pc = env.gvars.pc)

ok, msg = pc.modify_gold(ch, -25)
# False, "Could not remove 25 gp — Elara only has 10 gp."

ok, msg = pc.modify_wallet(ch, "favour", -1)
# False, "Could not remove 1 Temple Favour — Elara has 0."

ok, msg = pc.modify_bag(ch, "Potion of Healing", 1, "Potions")
# True, "Elara gained Potion of Healing (Potions)."

ok, msg = pc.modify_downtime(ch, -3)
# True, "Elara used 3 workdays. 12 → 9 workdays available."
```

---

## Readers

| Function | Returns |
|----------|---------|
| **`get_gold(ch)`** | Current gp (int) |
| **`get_wallet_balance(ch, currency_id)`** | Balance for one currency id |
| **`get_wallet_balances(ch, config=None)`** | `{ currency_id: balance, … }` for all configured currencies |
| **`get_downtime(ch)`** | Available workdays (int); may init epoch cvars on first read |
| **`get_bag_count(ch, item, bag="Equipment")`** | Stack count (via **`core/bags`** / sheet) |
| **`format_wallet_embed(ch, config)`** | Embed-ready string for **`!wallet`** — display only |

Command usage and exploration cooldowns — **[stats.gvar](stats.md)** stores **`wg_stats`**; **`pc`** reads **`last_used_at`** for cooldown gates:

| Function | Purpose |
|----------|---------|
| **`check_cooldown(ch, command_key, config=None)`** | `(allowed, seconds_remaining)` — reads **`wg_stats[command_key].last_used_at`**; duration from **`command_config[command_key].cooldown_seconds`** (see [Command config](../data-shapes.md#command-config)) |
| **`cooldown_seconds(command_key, config=None)`** | Resolved seconds for command — **`command_config`** override, else engine default map (exploration activities → **120**, **`job`** → **28800**) |

Aliases call **`stats.add_log(ch, …)`** after success to update **`last_used_at`** — no separate cooldown cvar per command.

Cvar keys for non-stats sheet state:

```py
CVAR_DOWNTIME_START = "wg_downtime_start"
CVAR_DOWNTIME_USED = "wg_downtime_used"
CVAR_WALLET_PREFIX = "wg_wallet_"   # + currency id
CVAR_TOOL_PROF = "wg_ptools"
CVAR_TOOL_EXP = "wg_etools"
# Command usage + cooldown timestamps → stats.gvar CVAR_STATS = "wg_stats"
```

---

## Dependencies

- **`config.get_config()`** — validate wallet currency ids; optional downtime caps from policy
- **`core/bags.gvar`** — inventory mutations (vendored from drac2-tools; see [core.md](core.md))
- Avrae character — **`coinpurse`**, **`modify_hp`**, **`get_cvar`** / **`set_cvar`**

## Usage in encounters

**`encounters.gvar`** **`_apply_outcomes`** delegates here:

| Outcome `type` | Call |
|----------------|------|
| `gold` | **`pc.modify_gold(ch, total)`** |
| `currency` | **`pc.modify_wallet(ch, id, total)`** |
| `item` | **`pc.modify_bag(ch, name, total, bag)`** |
| `damage` / `healing` | **`pc.modify_hp(ch, ±total)`** |

Append successful **`message`** strings to **`encounter_result["outcome_text"]`**. On failure, still append **`message`** (or collect for embed footer — TBD in port).

## Usage in aliases

```py
using(pc = env.gvars.pc)

ok, msg = pc.modify_gold(ch, payout)
if not ok:
    return embed(title="Payment failed", description=msg)
```

**`!wallet`** — read-only; uses **`get_wallet_balances`** + **`format_wallet_embed`**.  
**`!downtime`** — **`get_downtime`** / **`modify_downtime`**.  
Crafting success paths — **`modify_bag`** (when **`policies.crafting.auto_deduct_*`** ships).

## Not in this module

- Permission / config gates → [auth.md](auth.md)
- Command usage writes → [stats.md](stats.md) **`add_log`**
- World location / journey cvars → **`journeys.gvar`** (planned)
- Quest notebook storage → **`quests.gvar`** (planned)

## Tests

Fixtures with character + cvars in **`.varfile.json`**: insufficient gp, insufficient wallet balance, bag removal failure, downtime spend failure, happy-path messages.

## Related

- [encounters.md](encounters.md) — outcome application
- [aliases/economy/wallet.md](../aliases/economy/wallet.md) — **`!wallet`** command
- [aliases/downtime/downtime.md](../aliases/downtime/downtime.md)
- westmarch: `src/gvars/utils/bags.gvar`
- drac2-tools: `src/gvars/utils/bags/bags.gvar` (→ **`core/bags.gvar`**)
- [core.md](core.md) — vendoring policy
