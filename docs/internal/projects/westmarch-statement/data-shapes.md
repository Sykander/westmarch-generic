# Data shapes

Canonical **dict / object shapes** reused across aliases, config pools, and engine gvars. How config stores them → [server-config.md](server-config.md).

**Related gvars:** [encounter_templates](gvars/encounter_templates.md) · [encounters](gvars/encounters.md)

---

## Encounter *(input)*

An **encounter** is the dict you pass to **`encounters.process_encounter(encounter, character, args)`**. Built inline in config pools, or via template factories.

Data only — no rolls, no sheet changes until processed.

```py
encounter = {
    # Display — str or callable(ectx)
    "name": str | callable,
    "description": str | callable,
    "thumb": str | callable,       # optional embed thumbnail URL
    "image": str | callable,       # optional embed image URL

    # Rolls — optional; run in order before callables resolve
    "rolls": [ roll_spec, ... ],

    # Combat — optional; used when cr > 0 (hunt tier)
    "cr": number | str | callable,
    "difficulty": str | callable,
    "monsters": list | callable,

    # Sheet effects — optional; static list or callable(ectx)
    "outcomes": [ outcome, ... ] | callable,

    # Exploration mix — optional; used when building enc / activity lists
    "kind": "combat" | "quest" | "gather",   # see exploration.config.distribution
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | Embed title |
| `description` | yes | Embed body (may include roll text appended by processor) |
| `rolls` | no | Empty / omitted → skip straight to static fields + outcomes |
| `outcomes` | no | Omitted → no sheet changes; see [Outcome](#outcome) |
| `kind` | no | **`combat`**, **`quest`**, or **`gather`** — category for [encounter mix](#explorationconfig); infer from template when omitted (e.g. `cr > 0` → combat) |
| `cr`, `monsters`, … | no | Combat block when `cr > 0` |

### Roll spec *(entry in `encounter["rolls"]`)*

Passed to drac2-tools **`rolls.get_roll(...)`**. Exact keys mirror westmarch / drac2-tools (port per roll type in Phase 0).

```py
{
    "type": "check",              # check | save | attack | …
    "name": "Dexterity (Acrobatics)",
    "ability": "dex",
    "dc": "12",                   # str or int — may be callable later
    # type-specific: skill, save, to_hit, damage, …
}
```

Alias **bonus args** (`guidance`, `adv`, `-b …`) flow via **`ectx.args`**, not duplicated on each roll spec.

---

## Encounter context — `ectx`

**Single argument** for every **callable** field on an encounter (`name`, `description`, `outcomes`, `cr`, …).

westmarch used `(character, rolls_list, args)`. westmarch-generic uses one dict so new context (area, activity, config) can be added without changing every signature.

```py
ectx = {
    "character": character,   # active Avrae character
    "rolls": rolls,           # list of resolved roll results (post get_roll)
    "args": args,             # alias invocation args / bonuses
    "encounter": encounter,   # original encounter dict (read-only)
}
```

**Callable convention:** `def field(ectx):` — always one parameter named **`ectx`**.

```py
def description(ectx):
    if ectx["rolls"] and ectx["rolls"][0]["success"]:
        return "You find a hidden cache."
    return "Nothing of note."

# Static str — no call; processor skips invocation
"name": "A quiet glade"
```

| Key | When populated |
|-----|----------------|
| `character` | Always |
| `args` | Always (may be empty) |
| `rolls` | After roll step; `[]` if encounter had no rolls |
| `encounter` | Always — reference to input dict |

**Future keys** (add to `ectx` only — do not add positional params): `config`, `area_code`, `activity`, journey state, etc.

---

## Outcome *(internal)*

Resolved from `encounter["outcomes"]` (static list or `callable(ectx)`). Applied to the sheet **inside** `encounters.process_encounter` — aliases do not handle outcome dicts directly.

```py
outcome = {
    "type": "damage" | "healing" | "gold" | "item" | ...,  # MVP types below
    # type-specific fields
}
```

### MVP outcome types

| `type` | Fields | Sheet effect |
|--------|--------|--------------|
| `damage` | `total` (dice str or int) | **`pc.modify_hp(ch, -total)`** |
| `healing` | `total` | **`pc.modify_hp(ch, +total)`** |
| `gold` | `total` | **`pc.modify_gold(ch, total)`** |
| `item` | `name`, `total`, optional `bag` | **`pc.modify_bag(ch, name, total, bag)`** |
| `currency` | `id`, `total` | **`pc.modify_wallet(ch, id, total)`** — `id` must exist in config `currencies` |

Later: `recipe`, `quest` (need notes/quests gvars).

---

## Currency

A **server-defined currency** — not Avrae gp. Owners declare currencies in config; players use **`!wallet`** for all of them.

```py
currency_def = {
    "name": "Arcane Shard",       # required — singular display name
    "plural": "Arcane Shards",    # required — list / balance labels
    "symbol": "◇",                # optional — embed prefix
    "description": str,           # optional — help text
}
```

Stored in config as **`currencies`** — dict keyed by stable **`id`** (snake_case slug):

```py
currencies = {
    "shards": {
        "name": "Arcane Shard",
        "plural": "Arcane Shards",
        "symbol": "◇",
    },
    "favour": {
        "name": "Temple Favour",
        "plural": "Temple Favour",
    },
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | implied | Dict key — used in outcomes, shop prices, path `cost`, `!wallet shards` |
| `name`, `plural` | yes | Player-facing strings |
| `symbol`, `description` | no | Embed / help polish |

**Balances** live in character cvars (engine **[pc.gvar](gvars/pc.md)** manages keys). **`gold`** / gp is **not** a wallet currency — use **`pc.modify_gold`**.

### Where currency ids appear

| Consumer | Example |
|----------|---------|
| **`!wallet`** | List all `currencies` + balances |
| Encounter outcome | `{ "type": "currency", "id": "shards", "total": 2 }` |
| Path **`cost`** | `{ "shards": 1, "gold": 5 }` — non-`gold` keys are wallet ids |
| Shops *(future)* | `{ "price": { "shards": 3 } }` or gp via coinpurse |

Owners may label a currency “Runes” in config; the engine never ships a **`!runes`** command.

---

## Recipe

Explicit **brew / enchant / craft / scribe** instructions for an output item. Source TSV: [public/assets/recipes.tsv](../../../../public/assets/recipes.tsv). Stored in config as **`recipes`** — list of recipe dicts, or dict keyed by **`id`**.

```py
recipe = {
    "id": "example_brew_healing",
    "name": "Potion of Healing",
    "kind": "brew",
    "workdays": 2,
    "consumed": [
        { "name": "Arnica", "qty": 2 },
        { "name": "Crystal vial", "qty": 1 },
    ],
    "required": [],
    "spells": None,
    "tags": ["potion", "healing"],
    "description": "Reduce the herbs in a clean vessel over a gentle heat, then seal the vial and agitate the infusion until it glows faintly red. The draught is finished when the colour holds at room temperature.",
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Multiple variants per output **`name`** |
| `name` | yes | Join to **`items`** / potion / magic item catalogues |
| `kind` | yes | Drives which crafting command applies |
| `workdays` | yes | |
| `consumed` | no | Empty when nothing is consumed (rare) |
| `required` | no | Base items for enchant, etc. — empty when none |
| `spells` | no | Empty when no spell must be cast |
| `description` | yes | In-world process text — what the recipe *says*; do not repeat quantities or workdays (those live in other columns) |

**`!recipe`** searches **`recipes`** + item metadata. **Recipe encounter** outcomes (`type: recipe`) store **`description`** in the notes cvar ([encounters.md](gvars/encounters.md)).

---

## Encounter result — `encounter_result`

Return value of **`encounters.process_encounter`**. Embed-ready; sheet already updated.

```py
encounter_result = {
    "name": str,
    "description": str,
    "thumb": str | None,
    "image": str | None,
    "outcome_text": str,          # footer lines from applied outcomes (may be "")
    # combat tier — optional
    "combat_block": str | None,   # monster list + !i madd snippet when cr > 0
}
```

Alias pattern:

```py
using(encounters = env.gvars.encounters)

encounter_result = encounters.process_encounter(enc, character, args)
return embed(
    title=encounter_result["name"],
    description=encounter_result["description"] + encounter_result["outcome_text"],
    thumbnail=encounter_result["thumb"],
    image=encounter_result["image"],
)
```

---

## Design note: one processor, not two public functions

westmarch’s `process_encounters.gvar` defines **`process_encounter`** and **`process_outcomes`** as separate functions in the **same file**. Aliases always call both back-to-back; nothing in MVP needs “roll only” or “apply outcomes without rolling” as a public API.

**Decision:** **`encounters.gvar`** exposes one public entry point (`process_encounter`). Outcome application is a **private helper** (`_apply_outcomes(outcomes, character)`) in that module — not a separate gvar or alias-facing function.

| Approach | Verdict |
|----------|---------|
| Separate outcomes gvar | Rejected — extra `using()`, no independent caller |
| Two public functions, one gvar | Rejected — same as above for alias authors |
| **`encounters.process_encounter` + internal `_apply_outcomes`** | **Chosen** — matches player-facing “one encounter resolution” |

westmarch reference: `process_encounters.gvar` lines 14–192 → one port file (`encounters.gvar`) with two internal steps.

---

## Location

An in-world place characters **travel to**, **view** via `!location`, and **run activities** at. Stored in config as **`locations`** — dict keyed by stable **`id`**. Lookup and display: [gvars/locations.md](gvars/locations.md).

```py
location = {
    "id": "oakwood",                    # dict key; slug for !enc oakwood when used as area arg
    "name": "Oakwood Forest",           # required — display name, cvar identity
    "description": str,                 # optional — general flavour for !location
    "travel_description": str,          # optional — extra text on !travel (westmarch travel_desc)
    "image": str,                       # optional — embed image URL
    "link": str,                        # optional — Discord channel URL for embed links
    "biome": str,                       # optional — primary biome code (forest, cave, river, …)
    "activities": {                     # optional — exploration commands available here
        "enc": ["forest"],              # biome pool codes for !enc
        "forage": ["forest"],
        "mine": ["forest"],
        "lumber": ["forest"],
        "fish": ["river"],
        "hunt": ["forest"],             # when combat vertical ships
    },
    "services": [ "general_store", "inn" ],  # optional — ids into shop/service config
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | Player-facing; matched against location cvar |
| `id` | implied | Key in `locations` dict; omit only in inline examples |
| `description` | no | Short flavour |
| `travel_description` | no | Rules text (extreme cold, maze encs, …) |
| `image`, `link` | no | Rich embeds on travel / location |
| `biome` | no | Default when an activity omits biome list |
| `activities` | no | Omit key → activity unavailable at this place |
| `services` | no | Logical service ids — vendors, crafting benches, … |

### Activities map

Each **activity** key matches an exploration command (`enc`, `forage`, `fish`, `mine`, `lumber`, `hunt`). Value is a **list of biome codes** — same codes used in encounter pool config (`forest`, `cave`, `river`, …).

westmarch used `encs` with emoji prefixes (`✅`, `❓`, `❌`) plus biome lists. westmarch-generic: **presence of the activity key = available**; absence = not offered. Uncertainty / rarity moves to encounter pool weights, not location display flags.

### Config example

```py
default_location = "nexus"

locations = {
    "nexus": {
        "name": "Nexus",
        "link": "https://discord.com/channels/…",
        "image": "https://…/nexus.png",
    },
    "oakwood": {
        "name": "Oakwood Forest",
        "biome": "forest",
        "activities": {
            "enc": ["forest"],
            "forage": ["forest"],
            "lumber": ["forest"],
            "mine": ["forest"],
        },
        "services": ["forest_guide"],
    },
}
```

### westmarch fields mapped

| westmarch `areas.gvar` | Generic |
|------------------------|---------|
| module variable name (`oakwood`) | `locations` dict key / `id` |
| `name` | `name` |
| `link`, `image` | same |
| `travel_desc` | `travel_description` |
| `encs.{activity}` | `activities.{activity}` (biome lists only) |

---

## Path

A **one-way route** from one location to another. Stored in config as **`paths`** — list of path dicts. Routing and display: [gvars/paths.md](gvars/paths.md).

```py
path = {
    "from": "oakwood",              # location id — origin
    "to": "oakwood_east",           # location id — destination
    "requirements": {               # optional — all must be satisfied to use this path
        "horse": True,              # e.g. need a mount for this route variant
        "boat": False,
    },
    "steps": [ journey_step, ... ], # ordered steps to complete the leg
    "cost": {                       # optional — lump cost to take this path (deducted on start or first step — TBD in journeys port)
        "gold": 25,
        "rations": 2,
    },
    "label": str,                   # optional — display hint (westmarch: "Monastery Acolytes Only")
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `from`, `to` | yes | Location **`id`** strings |
| `steps` | no* | *At least one of `steps`, `cost`-only free leg, or engine default “Proceed to {to}” |
| `requirements` | no | `str → bool` — player/state must satisfy `True` keys |
| `cost` | no | Resource dict — `gold` → coinpurse; other keys → wallet currency **ids** ([Currency](#currency)) |
| `label` | no | Shown in journey planning UI |

### Journey step

One entry in **`path["steps"]`** — what the player does before advancing (`!travel next` or activity hook).

```py
# Run an exploration encounter using a biome pool code
{ "type": "encounter", "biome": "forest" }

# Pay resources at this step
{ "type": "cost", "gold": 5 }

# No roll — narrative / auto advance
{ "type": "proceed", "description": "Follow the forest trail" }
```

**Encounter steps** map to `!enc <biome>` (or the matching activity when the journey was started with a flag). **Cost steps** deduct when the step completes. **Proceed** steps auto-complete on `!travel next`.

### Requirements and alternate step lists

When **`requirements.horse`** (or `boat`) is `True`, the player is expected to travel mounted. westmarch stored shorter parallel lists on `path.horse` / `path.boat`. Generic config may either:

- embed requirement on each step (`{ "type": "encounter", "biome": "forest", "requires": "horse" }`), or
- add optional **`steps_horse`** / **`steps_boat`** overrides on the path (port detail — pick one in journeys Phase 0 spike).

**`requirements`** on the path itself gates **whether the edge exists** for that traveller (mount, faction, item). Display **`label`** when access is narrative-only (not yet enforced).

### westmarch fields mapped

| westmarch `paths.gvar` | Generic |
|------------------------|---------|
| `from`, `to` (area names) | `from`, `to` (location **ids**) |
| `encs` list | `steps` with `{ "type": "encounter", "biome": … }` |
| `horse`, `boat` lists | `requirements` + alternate `steps_*` or tagged steps |
| `gold` | `cost.gold` and/or `{ "type": "cost", "gold": N }` step |
| `label` | `label` |

### Config example

```py
paths = [
    {
        "from": "oakwood",
        "to": "oakwood_east",
        "steps": [
            { "type": "encounter", "biome": "forest" },
            { "type": "encounter", "biome": "forest" },
            { "type": "encounter", "biome": "forest" },
        ],
        "requirements": { "horse": True },
    },
    {
        "from": "four_bridges",
        "to": "basecamp",
        "cost": { "gold": 5 },
        "steps": [ { "type": "cost", "gold": 5 } ],
    },
]
```

---

## Subsystem entry

Each key under **`subsystems`** matches a **player-facing** alias folder (`exploration`, `travel`, …). The GM hub (**`!westmarch`**) is **not** in **`subsystems`** — always available to admins via roles ([gvars/auth.md](gvars/auth.md)), not config toggles.

```py
"exploration": {
    "enabled": True,
    "commands": {
        "enc": True,
        "forage": True,
        # …
    },
    "config": {
        # subsystem-specific behaviour — see tables below
    },
}
```

| Property | Purpose |
|----------|---------|
| **`enabled`** | Master switch for the subsystem |
| **`commands`** | Per-command on/off (omit for `downtime`, which is a single toggle) |
| **`config`** | How commands in **this** subsystem interact with each other and with world data |

**`policies`** ([§ Server policies](#server-policies)) = cross-cutting house rules (rations, downtime mode, …). **`subsystems.*.config`** = subsystem wiring (e.g. where **`!enc`** gets its biome code). Both merge from engine defaults.

Access:

```py
cfg.subsystems.exploration.config.enc_biome_source
```

### `exploration.config`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enc_biome_source` | `"argument"` \| `"location"` | `"argument"` | How **`!enc`** picks the encounter pool biome code |
| `distribution_policy` | `"random"` \| `"balanced"` | `"random"` | How to pick **encounter kind** (combat / quest / gather) before rolling a specific encounter |
| `distribution` | `{ combat, quest, gather }` | see below | Target **percentages** for each kind — must sum to **100** |

Default **`distribution`**:

```py
"distribution": {
    "combat": 25,
    "quest": 25,
    "gather": 50,
}
```

#### `enc_biome_source`

| `enc_biome_source` | Player usage | Requirements |
|--------------------|--------------|--------------|
| **`argument`** | `!enc <biome> [bonuses]` — westmarch style (`forest`, `cave`, …) | Encounter pools in config |
| **`location`** | `!enc [bonuses]` — biome inferred from character location | **`subsystems.travel.enabled`**, **`travel.commands.location`** (and **`journeys.gvar`** + config **`locations`**) |

**Location inference:** read character location → config **`locations[id]`** → first biome in **`activities.enc`**, else **`biome`**. Error if location unset or no enc activity.

#### Encounter kind mix (`distribution_policy` + `distribution`)

Before picking a concrete encounter from a biome pool, **`encounter_lists`** (or equivalent) chooses a **kind**: **`combat`**, **`quest`**, or **`gather`**. Kinds map to pool entries tagged with **`encounter["kind"]`** (or inferred — combat when `cr > 0`, gather for skill-check templates, quest for quest hooks).

| `distribution_policy` | Behaviour |
|---------------------|-----------|
| **`random`** | Weighted pseudo-random draw each command — kind chosen independently using **`distribution`** percentages (PRNG). |
| **`balanced`** | Per-character rolling history (cvar) tracks recent kinds; next pick favours kinds **under** their target share so the session feels varied without streaks. Still uses **`distribution`** as the target mix — not uniform random. |

Both modes honour the same **`distribution`** percentages; only the selection algorithm differs.

**`!westmarch check`** errors when:

- Any **`distribution`** value is not a non-negative integer
- Unknown keys in **`distribution`** (only **`combat`**, **`quest`**, **`gather`** allowed)
- Sum of **`distribution`** values ≠ **100**
- Invalid **`distribution_policy`** value

Warning when a kind has **> 0%** but no pool entries of that kind exist for enabled activity commands.

Future activity clones (**forage**, **fish**, …) may share this block or add per-activity overrides — document when Tier B lands.

### `travel.config`

*(Stub — add keys as Tier C ships.)*

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| — | — | — | e.g. journey display defaults; defer until travel port |

### Other subsystems

Document **`config`** keys in each subsystem’s alias README when implemented. Empty **`config`** `{}` is valid; defaults fill missing keys only.

### Cross-subsystem validation

**`!westmarch check`** ([aliases/admin/check.md](../aliases/admin/check.md)) errors when **`config`** requires another subsystem that is off — e.g. `exploration.config.enc_biome_source == "location"` but **`travel.commands.location`** is disabled.

---

## Server policies

House rules and **what the engine enforces** vs what stays narrative/manual. Stored as top-level **`policies`** on the config gvar; merged from engine **`DEFAULTS`** like **`subsystems`** ([gvars/config.md](gvars/config.md)).

**Not** command on/off — use **`subsystems.commands`**. **Not** subsystem wiring — use **`subsystems.*.config`**. **Policies** answer table-wide enforcement ([US-3.4](user-stories.md)).

```py
policies = {
    "time": { "mode": "manual" },
    "travel": { "apply_path_costs": False, "consume_rations": False },
    "downtime": { "mode": "manual" },
    "crafting": { "require_downtime_before_roll": True, "auto_deduct_materials": False },
    "inventory": { "track_encumbrance": False, "attunement_limit": None },
    "exploration": { "enforce_cooldowns": True },
}
```

Access after load:

```py
cfg = config.get_config()
if cfg.policies.travel.consume_rations:
    ...
```

### `time`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `mode` | `"none"` \| `"world_clock"` \| `"manual"` | `"manual"` | How in-world time works |

| `mode` | Behaviour |
|--------|-------------|
| **`none`** | No shared clock — `!time` explains that the table does not track world time in bot (or stays off). |
| **`world_clock`** | Engine config **`world_clock`** + [clock.gvar](gvars/clock.md) drives `!time`; travel/journey may advance clock when that vertical ships. |
| **`manual`** | Players/GM decide duration narratively; engine does not advance a clock on travel. Optional flavour strings only. |

Requires **`world_clock`** config data when `mode == "world_clock"` — **`!westmarch check`** warns if missing.

### `travel`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `apply_path_costs` | bool | `False` | When `True`, deduct **`path.cost`** (gp → coinpurse, wallet ids → [wallet](../aliases/economy/wallet.md)) on journey start or step completion (TBD in journeys port). |
| `consume_rations` | bool | `False` | When `True`, deduct **`rations`** from **`path.cost`** or journey steps that specify them. |

When both `False`, routes are planning/display only — westmarch-style narrative travel without automated resource drain.

### `downtime`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `mode` | `"tracked"` \| `"manual"` \| `"off"` | `"manual"` | Workday tracking |

| `mode` | Behaviour |
|--------|-------------|
| **`tracked`** | `!downtime` cvars active; crafting aliases may validate balance. |
| **`manual`** | Help text tells players to adjust downtime on sheet / out of band; crafting does not block on cvar. |
| **`off`** | No downtime messaging or cvar use even if **`subsystems.downtime.enabled`**. |

Optional labels/rates stay in a separate **`downtime_labels`** config block ([downtime.md](../aliases/downtime/downtime.md)) — not policy flags.

### `crafting`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `require_downtime_before_roll` | bool | `True` | When `True` + `downtime.mode == tracked`, block or warn if insufficient workdays. |
| `auto_deduct_materials` | bool | `False` | Auto-remove recipe ingredients from bags on success. |
| `auto_deduct_gold` | bool | `False` | Auto-debit gp (and optional wallet costs) on craft/scribe success. |

westmarch reference: manual gp/downtime/material removal with messaging only.

### `inventory`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `track_encumbrance` | bool | `False` | When `True`, engine enforces carry weight where implemented (buy, loot, gather). **Deferred** for MVP except warnings in docs. |
| `attunement_limit` | int \| `None` | `None` | Max attuned magic items; `None` = do not enforce. Used by **buy** / **loot** when those verticals add checks. |
| `magic_items_carry_limit` | int \| `None` | `None` | Cap on carried magic items independent of attunement; `None` = no cap. |

### `exploration`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enforce_cooldowns` | bool | `True` | Per-activity cooldown cvars; skipped in Avrae Development env regardless. |

### Adding policy keys

New domains get a nested object under **`policies`**, documented here, with engine **`DEFAULTS`** and **`!westmarch show`** summary. Aliases **read policies** — they do not write them.

---

## Adding shapes

New shared shapes (journey state, shop listing, service, downtime block, …) get a section here with links from [server-config.md](server-config.md) and gvar/alias docs.
