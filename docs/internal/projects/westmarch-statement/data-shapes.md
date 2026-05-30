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

Passed to **`core/rolls.gvar`** **`get_roll(...)`** via `env.gvars.rolls`. Exact keys mirror westmarch / drac2-tools upstream (port per roll type in Phase 0).

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
| `max_balance` | no | int cap per character when **`policies.economy.enforce_wallet_caps`** is **`True`** |

**Balances** live in character cvars (engine **[pc.gvar](gvars/pc.md)** manages keys). **`gold`** / gp is **not** a wallet currency — use **`pc.modify_gold`**.

### Where currency ids appear

| Consumer | Example |
|----------|---------|
| **`!wallet`** | List all `currencies` + balances |
| Encounter outcome | `{ "type": "currency", "id": "shards", "total": 2 }` |
| Path **`cost`** | `{ "shards": 1, "gold": 5 }` — non-`gold` keys are wallet ids |
| Shops *(see [Shop](#shop))* | `{ "price": { "gold": 1, "shards": 2 } }` — **`gold`** = gp via **`pc.modify_gold`** |

Owners may label a currency “Runes” in config; the engine never ships a **`!runes`** command.

---

## Shop

Vendor definitions for **`!buy`** and **`!sell`**. Stored as top-level **`shops`** — dict keyed by stable shop **`id`** (snake_case slug). Resolution: [shops.gvar](gvars/shops.md).

```py
shop = {
    "id": "general_store",           # required — same as dict key
    "name": "General Store",         # required — player-facing
    "location_id": "oakwood",        # optional — gate when travel + location on
    "accepts_sells": True,           # optional — default False; shop buys from players
    "buyback": 0.5,                  # optional — fraction of list price when selling; default 0.5
    "stock": [ stock_entry, … ],
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Dict key — used in `!buy general_store rope` |
| `name` | yes | Help / embed title |
| `location_id` | no | **`world_data.locations`** id — shop only visible at that place when travel on |
| `accepts_sells` | no | When `False`, **`!sell`** rejects even if item is in stock list |
| `buyback` | no | Shop-wide default sell multiplier; per-row **`sell_price`** overrides |
| `stock` | yes | Non-empty list of [StockEntry](#stockentry) |

### StockEntry

```py
stock_entry = {
    "item": "Rope",                  # required — Avrae sheet / items catalogue display name
    "price": { "gold": 1 },          # required — buy price; see price keys below
    "qty": 10,                       # optional — finite stock; omit = unlimited (MVP default)
    "sell_price": { "gold": 1 },     # optional — sell payout; default buyback × list **`price`**
}
```

**Price keys:**

| Key | Meaning | Debit/credit via |
|-----|---------|------------------|
| **`gold`** | Avrae gp | **`pc.modify_gold`** |
| *wallet id* | Config **`currencies`** slug (e.g. **`shards`**) | **`pc.modify_wallet`** |

**Transactions** — [shops.gvar](gvars/shops.md) **`buy`** / **`sell`** call **`pc`** mutators only; aliases do not touch coinpurse or bags directly.

Example:

```py
shops = {
    "general_store": {
        "id": "general_store",
        "name": "General Store",
        "location_id": "nexus",
        "accepts_sells": True,
        "buyback": 0.5,
        "stock": [
            { "item": "Rope", "price": { "gold": 1 } },
            { "item": "Potion of Healing", "price": { "gold": 50, "shards": 1 }, "qty": 5 },
        ],
    },
}
```

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

## World data

**Layer 2** campaign geography and world simulation — stored under top-level **`world_data`** on the owner config gvar ([server-config.md](server-config.md)). Not merged from engine **`DEFAULTS`**; absent until the owner adds it.

**Required when:**

| Subsystem / commands | Minimum **`world_data`** |
|----------------------|---------------------------|
| **`travel`**, **`location`** | **`locations`**, **`default_location`**, **`paths`** (for routing) |
| Exploration activities with **`enc_biome_source: location`** or **`auto`** (inferred) | **`locations`** + **`biomes`** registry + **`journeys.gvar`** |
| Exploration activity commands | **`biomes`** registry with resolvable **`gvar_id`** per referenced code |
| **`time`** with **`policies.time.mode: world_clock`** | **`calendars`** (at least one) |

Access after load:

```py
cfg = config.get_config()
cfg.world_data.locations
cfg.world_data.paths
cfg.world_data.transport
cfg.world_data.calendars
cfg.world_data.biomes.forest.gvar_id
```

**Legacy flat keys** — older docs/examples used top-level **`locations`**, **`paths`**, **`encounter_pools`**, **`world_clock`**. **`!westmarch check`** **warns** when those appear without **`world_data`**; loaders accept flat keys during migration only.

### `world_data` object

```py
world_data = {
    "default_location": "nexus",
    "locations": { "nexus": { … }, "oakwood": { … } },
    "paths": [ { "from": "nexus", "to": "oakwood", … }, … ],
    "transport": { "horse": { … }, "boat": { … } },
    "calendars": { "primary": { … } },
    "biomes": {
        "forest": { "gvar_id": "<uuid>", "name": "Forest" },
        "cave": { "gvar_id": "<uuid>", "name": "Cave" },
    },
}
```

| Key | Required | Notes |
|-----|----------|-------|
| **`default_location`** | when travel/location on | **`locations`** id slug |
| **`locations`** | when travel/location on | Dict keyed by stable **`id`** — [Location](#location) |
| **`paths`** | when **`travel`** routes journeys | List of [Path](#path) edges |
| **`transport`** | no | [Transport](#transport) modes — horse, boat, ship, … |
| **`calendars`** | when world clock on | [Calendar](#calendar) definitions |
| **`biomes`** | when exploration on | Registry only — [Biome registry](#biome-registry); encounter bodies in separate gvars |

Catalogues (**`items`**, **`shops`**, **`library`**, …) stay **outside** **`world_data`** for now — same config gvar layer 2, documented per vertical.

### Transport

**`transport`** replaces westmarch’s implicit **horse** / **boat** flags with named **transport modes** — mounts, vehicles, vessels, and other special travel (spelljammer helm, skyship, teleport circle as narrative gate, …).

```py
transport = {
    "walk": {
        "name": "On foot",
        "default": True,
    },
    "horse": {
        "name": "Riding horse",
        "description": "Land mount — shorter overland legs.",
    },
    "boat": {
        "name": "River boat",
        "description": "Required for water routes.",
    },
    "spelljammer": {
        "name": "Spelljammer",
        "description": "Wildspace vessel — see Spelljammer preset.",
    },
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | Player-facing label |
| `description` | no | Help / journey embed copy |
| `default` | no | **`walk`** (or first mode) when player has no active transport |

**Path requirements** reference transport **ids** (not booleans):

```py
path = {
    "from": "harbor",
    "to": "island",
    "requirements": { "transport": "boat" },
    "steps_by_transport": {
        "boat": [ { "type": "proceed", "description": "Sail across the bay" } ],
        "walk": [],  # edge unavailable — omit path or omit walk key
    },
}
```

| `requirements.transport` | Meaning |
|--------------------------|---------|
| **string** | Traveller must be using that mode |
| **list of strings** | Any listed mode satisfies the requirement |

**`journeys.gvar`** resolves active transport from character cvar (TBD in port) or journey start flags. **`paths.gvar`** uses **`steps_by_transport`** when present, else **`steps`**.

westmarch **`path.horse`** / **`path.boat`** parallel lists → **`steps_by_transport.horse`** / **`.boat`**.

### Calendar

In-world date/time derived from **real unix time** and calendar math — no separate ticking server required for MVP.

```py
calendars = {
    "primary": {
        "id": "primary",
        "name": "Faerûnian Calendar",
        "epoch_unix": 946684800,
        "tick_rate": 1.0,
        "seconds_per_day": 86400,
        "days_per_year": 365,
        "months": [
            { "name": "Hammer", "days": 30 },
            { "name": "Alturiak", "days": 30 },
        ],
        "weekdays": ["One-day", "Two-day", "Three-day", "Four-day", "Five-day", "Six-day", "Seven-day"],
        "display_format": "{weekday}, {day} {month} {year} DR",
        "seasons": [
            { "name": "Spring", "start_day_of_year": 60 },
            { "name": "Summer", "start_day_of_year": 152 },
            { "name": "Autumn", "start_day_of_year": 244 },
            { "name": "Winter", "start_day_of_year": 335 },
        ],
    },
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `epoch_unix` | yes | Unix timestamp when in-world day index **0** starts (or campaign epoch) |
| `tick_rate` | no | In-world seconds per real second — **`1.0`** = 1 real sec → 1 in-world sec; **`86400.0`** = 1 real sec → 1 in-world **day** |
| `seconds_per_day` | no | Default **86400** |
| `days_per_year` | no | Fixed length for MVP; leap rules deferred |
| `months` | no | Named months with **`days`** — if omitted, single month of **`days_per_year`** |
| `display_format` | no | Template for **`clock.format_instant`** — `{year}`, `{month}`, `{day}`, `{hour}`, `{minute}`, `{weekday}`, `{season}` |
| `seasons` | no | Used by **`!weather`** when location has no local season override |

**Multiple calendars** — locations may set **`calendar_id`** (optional on [Location](#location)) to use a non-**`primary`** entry. **`clock.gvar`** defaults to **`calendars.primary`** or the sole calendar when only one is defined.

**Calculation sketch** *(MVP)*:

```text
elapsed_real = time() - calendar.epoch_unix
in_world_seconds = elapsed_real * calendar.tick_rate
day_index = floor(in_world_seconds / calendar.seconds_per_day)
→ year, month, day, time-of-day from day_index + month table
```

Alternatives (manual GM-set instant only, narrative seasons with no unix mapping) — **post-MVP**; document in [clock.gvar](gvars/clock.md) when added.

**Policy link:** **`policies.time.mode == "world_clock"`** requires **`world_data.calendars`**.

### Biome registry

Biome **encounter tables are large** — they do not live inline in the owner config. **`world_data.biomes`** holds a **registry** of biome codes → lazy-loaded gvar UUIDs.

```py
biomes = {
    "forest": {
        "gvar_id": "a1b2c3d4-…",
        "name": "Forest",
    },
    "cave": {
        "gvar_id": "engine:configs/biomes/cave",
        "name": "Cave",
    },
}
```

| Field | Required | Notes |
|-------|----------|-------|
| **`gvar_id`** | yes | Workshop UUID string, or engine preset slug **`engine:configs/biomes/<code>`** resolving to shipped [src/gvars/configs/biomes/](../../../../src/gvars/configs/biomes/README.md) |
| `name` | no | Display name for help / errors; defaults to title-cased code |

**Lazy load** — [biomes.gvar](gvars/biomes.md) loads the biome module on first **`get_encounter(biome, …)`** for that code; caches per alias invocation. Unused biomes never load.

**Biome codes** in **`locations.activities.*`** and **`!enc <code>`** must exist in this registry.

#### Biome gvar body *(separate workshop module)*

Simplified vs westmarch — **no d100 synthetic lists**, **no mega-pool mixing** at runtime.

```py
# Loaded from biome gvar — pools keyed by activity, then by kind
pools = {
    "enc": {
        "combat": [ encounter, … ],
        "quest": [ encounter, … ],
        "gather": [ encounter, … ],
    },
    "mine": {
        "gather": [ encounter, … ],
    },
    "forage": { "gather": [ … ] },
    "fish": { "gather": [ … ] },
    "lumber": { "gather": [ … ] },
}
```

| westmarch | westmarch-generic |
|-----------|-------------------|
| **`encounters`** mega-list + random mix into 100 slots | Dropped — entries live under **`pools[activity][kind]`** |
| **`enc_encounters`**, **`mine_encounters`**, … as flat lists | **`pools.mine.gather`**, etc. |
| **`combat_encounters`** mixed into every roll | **`pools.<activity>.combat`** only |
| **`recipe_encounters`** mixed globally | Recipe-tagged **`gather`** entries or **`economy`** catalogues |
| d100 **`get_encounter_list`** | **Kind first** ([exploration.config](#explorationconfig) **`distribution`**) → uniform random within matching subset |

Each **`encounter`** dict matches [Encounter *(input)*](#encounter-input) with explicit **`kind`** when not inferrable.

**Selection algorithm** ([encounter_lists.gvar](gvars/encounter_lists.md)):

1. Resolve biome code → load biome gvar if needed
2. Choose **`kind`** ∈ **`{ combat, quest, gather }`** using **`distribution_policy`** + **`distribution`**
3. Filter **`pools[activity][kind]`** (empty subset → player-facing error)
4. Pick **one** entry at random — **not** a d100 table roll

Activity **`enc`** uses **`pools.enc`**; **`mine`** uses **`pools.mine`**, etc. Omit an activity key → that command is unavailable for the biome regardless of location flags.

#### Engine preset biomes

Placed at **`src/gvars/configs/biomes/`** (not under **`src/gvars/config/`**, which is reserved for the engine **`config.gvar`** loader).

| Code | Setting notes |
|------|----------------|
| **`beach`** | Coastal, shallow water |
| **`forest`** | Temperate woodland |
| **`mountain`** | Highlands, cliffs |
| **`cave`** | Underground natural |
| **`ruins`** | Structures, dungeons above ground |
| **`road`** | Trails, highways, caravans |
| **`urban`** | Towns, cities |
| **`river`** | Freshwater travel / banks |
| **`sea`** | Open ocean surface |
| **`plains`** | Grassland, farmland |
| **`desert`** | Arid wasteland |
| **`swamp`** | Wetlands, bayou |
| **`sky`** | High altitude, flying creatures |
| **`deep_seas`** | Deep underwater |
| **`underdark`** | Subterranean civilizations |
| **`tundra`** | Cold northern wastes |
| **`jungle`** | Tropical dense forest |
| **`volcanic`** | Lava, ash, fire elementals |
| **`astral`** | Spelljammer / wildspace |

Preset bodies start minimal (MVP smoke entries per kind) and grow with vertical ports. See [biomes/README.md](../../../../src/gvars/configs/biomes/README.md).

---

## Location

An in-world place characters **travel to**, **view** via `!location`, and **run activities** at. Stored in **`world_data.locations`** — dict keyed by stable **`id`**. Lookup and display: [gvars/locations.md](gvars/locations.md).

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
    "library_topics": [ "nature", "history" ],  # optional — topic hints for !library inference
    "calendar_id": "primary",                   # optional — override world_data.calendars key
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
| `library_topics` | no | Topic tags for **`!library`** when **`content.config.library_topic_source`** is **`inferred`** or **`balanced`** |

### Activities map

Each **activity** key matches an exploration command (`enc`, `forage`, `fish`, `mine`, `lumber`, `hunt`). Value is a **list of biome codes** — keys in **`world_data.biomes`** (lazy-loaded gvar per code).

westmarch used `encs` with emoji prefixes (`✅`, `❓`, `❌`) plus biome lists. westmarch-generic: **presence of the activity key = available**; absence = not offered. Uncertainty / rarity moves to encounter pool weights, not location display flags.

### Config example

```py
world_data = {
    "default_location": "nexus",
    "locations": {
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

A **one-way route** from one location to another. Stored in **`world_data.paths`** — list of path dicts. Routing and display: [gvars/paths.md](gvars/paths.md).

```py
path = {
    "from": "oakwood",              # location id — origin
    "to": "oakwood_east",           # location id — destination
    "requirements": {               # optional — transport / state gates
        "transport": "horse",       # or ["horse", "boat"] — see world_data.transport
    },
    "steps": [ journey_step, ... ],
    "steps_by_transport": {         # optional — alternate legs per transport mode
        "horse": [ journey_step, ... ],
        "boat": [ journey_step, ... ],
    }, # ordered steps to complete the leg
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

When a path requires non-default **transport**, use **`requirements.transport`** and optional **`steps_by_transport`** — see [Transport](#transport). **`journeys.gvar`** picks the step list for the traveller’s active transport mode.

**`requirements`** gates **whether the edge exists** for that traveller (transport mode, faction, item — item gates deferred). Display **`label`** when access is narrative-only (not yet enforced).

### westmarch fields mapped

| westmarch `paths.gvar` | Generic |
|------------------------|---------|
| `from`, `to` (area names) | `from`, `to` (location **ids**) |
| `encs` list | `steps` with `{ "type": "encounter", "biome": … }` |
| `horse`, `boat` lists | `steps_by_transport.horse`, `.boat` + `requirements.transport` |
| `gold` | `cost.gold` and/or `{ "type": "cost", "gold": N }` step |
| `label` | `label` |

### Config example

```py
world_data = {
    "paths": [
        {
            "from": "oakwood",
            "to": "oakwood_east",
            "steps": [
                { "type": "encounter", "biome": "forest" },
                { "type": "encounter", "biome": "forest" },
            ],
            "requirements": { "transport": "horse" },
            "steps_by_transport": {
                "horse": [ { "type": "proceed", "description": "Canter along the east trail" } ],
            },
        },
        {
            "from": "four_bridges",
            "to": "basecamp",
            "cost": { "gold": 5 },
            "steps": [ { "type": "cost", "gold": 5 } ],
        },
    ],
}
```

---

## Top-level config fields

Optional and core keys on the **owner config gvar** (merged with engine **`DEFAULTS`**). Access after load:

```py
cfg = config.get_config()
cfg.config_version
cfg.rules_version
cfg.display.name
cfg.policies.languages.allowed
```

### `config_version`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `config_version` | `str` | `None` | Owner-defined version label for this config module (e.g. `"1.0"`, `"2026-03-sword-coast"`) — **not** the engine release version |

Used in **`!westmarch show`**, embed footers, and migration notes. **`!westmarch check`** may **warn** when the engine documents a newer recommended schema and **`config_version`** is unset or below a documented minimum.

### `rules_version`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `rules_version` | `"2014"` \| `"2024"` | `None` | Optional **override** for which D&D 5e rules revision this config’s catalogues and mechanics assume |

**Resolution** — aliases call **`config.get_rules_edition()`**, not raw config:

1. **`rules_version`** on config gvar when set
2. Else Avrae guild/server rules when Drac2 exposes them
3. Else **`"2014"`**

When **`rules_version`** is set and differs from Avrae’s rules setting, **`!westmarch check`** emits a **warning** (config override wins at runtime).

Catalogues may be flat, edition-tagged, or nested by edition — see [Rules edition](#rules-edition) below.

### `extensions`

Optional **UUID pointers** to owner workshop gvars holding large catalogues ([server-config.md](server-config.md) § Extension gvars, [content-pipeline.md](content-pipeline.md)). Engine catalogue modules load presets by default; **`extensions.*`** overrides a slice when set.

```py
extensions = {
    "monsters": "<workshop-uuid>",
    "items": "<workshop-uuid>",
    "potions": "<workshop-uuid>",
    "magic_items": "<workshop-uuid>",
    "spells": "<workshop-uuid>",
    "books": "<workshop-uuid>",
}
```

| Key | Catalogue module | When to set |
|-----|------------------|-------------|
| **`monsters`** | [monsters.gvar](gvars/monsters.md) | Owner bestiary exceeds inline size |
| **`items`** | [items.gvar](gvars/items.md) | Custom item list |
| **`potions`** | items (potion shard) | Custom potion catalogue |
| **`magic_items`** | items (magic shard) | Custom magic item catalogue |
| **`spells`** | [spells.gvar](gvars/spells.md) | Custom spell list for scribe |
| **`books`** | [library.gvar](gvars/library.md) | Custom book catalogue |

Values are **36-character workshop gvar UUID strings** only. Unknown keys → **warning**; bad UUID → **error** ([check_config.gvar](gvars/check_config.md)).

Each catalogue **`*.gvar`** checks **`config.get_config().extensions.<key>`** on first load; if set, **`get_gvar(uuid)`** and cache; else engine preset shards ([content-pipeline.md](content-pipeline.md)).

### `display` *(base layer)*

Branding and player-facing identity for **this westmarch world** — the **base** layer in [embed display inheritance](#embed-display-inheritance). Not Discord server metadata alone.

```py
display = {
    "name": "The Sword Coast Westmarch",     # world / campaign name → embed title when title unset
    "description": "Frontier expeditions from Neverwinter to the High Forest.",
    "image": "https://…/banner.png",       # optional — hero / embed image URL
    "logo": "https://…/logo.png",            # optional — thumbnail / icon URL
    "footer": "Sword Coast Westmarch",       # optional — static footer when policies.display.footer_behaviour is string
    "link": "https://discord.com/channels/…", # optional — link button / “learn more” (base / admin embeds only)
    "colour": "#5865F2",                     # optional — hex embed accent colour
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | no | Used in help, **`!westmarch show`**, and as merged **`title`** when no subsystem/command title is set; fallback **`ctx.guild.name`**, then generic *Westmarch* |
| `description` | no | Short campaign blurb — setup/show embeds, optional embed body intro |
| `image` | no | Wide banner — inherited by subsystem/command embeds unless overridden |
| `logo` | no | Small image — embed thumbnail; inherited unless overridden |
| `footer` | no | Static footer text when **`policies.display.footer_behaviour`** is **`string`**; may include `{world}` placeholder *(TBD in port)* |
| `link` | no | Discord invite or wiki — optional “world info” link in admin/show embeds; **not** merged into player command embeds |
| `colour` | no | Hex accent — **`#RRGGBB`** or **`RRGGBB`** (6 hex digits). Inherited unless overridden; omit for engine default |

**`colour` format:** case-insensitive hex only — no `0x` prefix. **`!westmarch check`** errors on invalid length or non-hex characters at **any** display layer. Aliases call **`display.get_display()`** once, then use the returned **`get_embed`** — [display.gvar](gvars/display.md).

Aliases that support a per-invocation colour override (e.g. `-color` arg) should use the override when present, else merged **`colour`**, else engine default.

### Embed display inheritance

Player-facing aliases build embeds from a **three-layer merge**: **base** (top-level **`display`**) → **subsystem** (**`subsystems.<name>.display`**) → **command** (**`subsystems.<name>.command_display.<cmd>`**). Later layers override earlier ones **per field** (shallow merge at each step).

```py
# Resolved at runtime for !enc in exploration:
get_embed = display.get_display()
return get_embed(desc=body)   # title, footer, colour, image, thumb from merged config
```

#### Embed display fragment

Shared shape for subsystem and command overrides. Base **`display`** uses **`name`** instead of **`title`**; the loader maps **`name` → `title`** when building the base layer.

```py
embed_display = {
    "title": "Exploration",              # embed title
    "description": "…",                  # optional — short intro under title
    "image": "https://…/banner.png",     # optional — wide image
    "logo": "https://…/icon.png",        # optional — thumbnail
    "footer": "…",                       # optional — static footer (string policy mode)
    "colour": "#5865F2",                 # optional — hex accent
}
```

| Field | Subsystem | Command | Notes |
|-------|-----------|---------|-------|
| `title` | yes | yes | Base layer supplies via **`display.name`** |
| `description` | yes | yes | Inherited |
| `image` | yes | yes | Inherited |
| `logo` | yes | yes | Inherited |
| `footer` | yes | yes | Used when **`footer_behaviour`** is **`string`**; see [Display policy (footer)](#display-policy-footer) |
| `colour` | yes | yes | Same validation as base **`display.colour`** |

**`command_display`** keys must match keys in that subsystem’s **`commands`** map (e.g. **`enc`**, **`forage`**, **`library`**). Subsystems without a **`commands`** map (**`downtime`**) may still use **`command_display.downtime`** for the single **`!downtime`** command, or rely on subsystem **`display`** alone.

Example — exploration subsystem with command override:

```py
"exploration": {
    "enabled": True,
    "display": {
        "title": "Exploration",
        "image": "https://…/explore-banner.png",
        "colour": "#2ECC71",
    },
    "commands": {
        "enc": True,
        "forage": True,
    },
    "command_display": {
        "enc": {
            "title": "Encounter",
            "logo": "https://…/enc-icon.png",
        },
    },
    "config": { … },
},
```

#### Defaults when fields are unset

Applied **after** merge inside **`display.get_display()`** ([display.gvar](gvars/display.md)):

| Field | Fallback order |
|-------|----------------|
| **`title`** | Merged **`title`** → humanized command name (e.g. **`enc`** → *Encounter*) → humanized subsystem name → **`display.name`** → guild name → *Westmarch* |
| **`description`** | Merged value, else omit from embed |
| **`image`** / **`logo`** | Merged value, else omit |
| **`colour`** | Merged value, else engine embed default (Discord blurple integer in Avrae) |
| **`footer`** | Resolved from **`policies.display.footer_behaviour`** and passed to **`embeds.configure_get_embed`** |

Engine ships default **`helpful_tips`** and **`credits`** strings when the owner omits them — see **`policies.display`** below.

### Other top-level keys

| Key | Purpose |
|-----|---------|
| `subsystems` | Feature toggles — [Subsystem entry](#subsystem-entry) |
| `policies` | House rules — [Server policies](#server-policies) |
| `admin_roles` | GM hub role override — [auth.md](gvars/auth.md) |
| `channel_policy` | Channel whitelist — [auth.md](gvars/auth.md) |
| `world_data` | Campaign geography — [World data](#world-data) |

Other layer-2 catalogues (`items`, `shops`, `library`, …) — [server-config.md](server-config.md).

### Rules edition *(catalogues)*

When **`rules_version`** / **`get_rules_edition()`** is **`"2024"`**, prefer 2024-aligned catalogue slices. Config authors can structure data as:

- **Flat + edition tag** on entries
- **Nested by edition** — `crafting["2014"]`, `crafting["2024"]`
- **Separate extension gvars** per edition (Option C)

Prefer nested or tagged catalogues over hard-coded edition branches in aliases.

---

## Subsystem entry

Each key under **`subsystems`** matches a **player-facing** alias folder (`exploration`, `travel`, …). The GM hub (**`!westmarch`**) is **not** in **`subsystems`** — always available to admins via roles ([gvars/auth.md](gvars/auth.md)), not config toggles.

```py
"exploration": {
    "enabled": True,
    "display": {
        "title": "Exploration",
        "image": "https://…/explore-banner.png",
    },
    "commands": {
        "enc": True,
        "forage": True,
        # …
    },
    "command_display": {
        "enc": {"title": "Encounter", "logo": "https://…/enc.png"},
    },
    "config": {
        # subsystem-specific behaviour — see tables below
    },
}
```

| Property | Purpose |
|----------|---------|
| **`enabled`** | Master switch for the subsystem |
| **`display`** | Optional embed branding for **this subsystem** — [Embed display inheritance](#embed-display-inheritance) |
| **`commands`** | Per-command on/off (omit for `downtime`, which is a single toggle) |
| **`command_display`** | Optional per-command embed overrides — keys match **`commands`** |
| **`config`** | Subsystem wiring — biome source, distribution, library topics, … |
| **`command_config`** | Per-command **numeric knobs** — cooldowns, workday costs — see [Command config](#command-config) |

**`policies`** ([§ Server policies](#server-policies)) = table-wide **modes** (whether to enforce downtime, cooldowns globally, repeat avoidance, …). **`subsystems.*.config`** = wiring. **`command_config`** = per-command durations and costs. All three merge from engine defaults.

Access:

```py
cfg.subsystems.exploration.config.enc_biome_source
```

### `exploration.config`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enc_biome_source` | `"auto"` \| `"argument"` \| `"location"` | `"auto"` | How **all exploration activity commands** pick the biome code |
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

Applies to **every** exploration activity command (**`enc`**, **`forage`**, **`mine`**, **`fish`**, **`lumber`**, …) — not **`enc`** only. Resolution lives in **[biomes.gvar](gvars/biomes.md)** **`resolve_biome(activity, args, character, config)`**.

| Config value | Mode | Player usage | Requirements |
|--------------|------|--------------|--------------|
| **`auto`** *(default)* | Adapts | Manual biome arg when location inference unavailable; inferred when travel + locations configured | **`world_data.biomes`** always; locations optional |
| **`argument`** | Manual | `!<activity> <biome> [bonuses]` — e.g. `!enc forest`, `!forage forest` | **`world_data.biomes`** registry + resolvable gvars |
| **`location`** | Inferred | `!<activity> [bonuses]` — biome from character location | **`subsystems.travel.enabled`**, **`travel.commands.location`**, **`world_data.locations`**, **`journeys.gvar`** |

**`auto` effective mode:**

- **Inferred** when travel subsystem on, **`location`** command on, **`world_data.locations`** non-empty, and character has a resolvable location.
- **Manual** otherwise — first positional arg must be a registered biome code.

**Location inference:** character location → **`world_data.locations[id]`** → first biome in **`activities[activity]`**, else **`location.biome`**. Error if location unset or no biome for that activity.

**Manual inference:** first token of alias args → validate against **`world_data.biomes`**; help text lists codes from **`biomes.list_biomes(config)`**.

#### Encounter kind mix (`distribution_policy` + `distribution`)

Before picking a concrete encounter, **`encounter_lists`** + **[biomes.gvar](gvars/biomes.md)** choose a **kind**: **`combat`**, **`quest`**, or **`gather`**. **No d100 table** — kind is decided first from **`distribution`**, then one encounter is chosen uniformly at random from **`pools[activity][kind]`** on the loaded biome gvar.

| `distribution_policy` | Behaviour |
|---------------------|-----------|
| **`random`** | Weighted pseudo-random draw each command — kind chosen independently using **`distribution`** percentages (PRNG). |
| **`balanced`** | Per-character kind counters in **[stats.gvar](gvars/stats.md)** **`wg_stats[<command>].kinds`**; next pick favours kinds **under** their target share so the session feels varied without streaks. Still uses **`distribution`** as the target mix — not uniform random. |

Both modes honour the same **`distribution`** percentages; only the selection algorithm differs.

**`!westmarch check`** errors when:

- Any **`distribution`** value is not a non-negative integer
- Unknown keys in **`distribution`** (only **`combat`**, **`quest`**, **`gather`** allowed)
- Sum of **`distribution`** values ≠ **100**
- Invalid **`distribution_policy`** value

Warning when a kind has **> 0%** but no entries in **`pools[activity][kind]`** for any biome referenced by enabled commands/locations.

Future activity clones (**forage**, **fish**, …) share the same kind-first pick and **`enc_biome_source`** policy — see [aliases/exploration/README.md](aliases/exploration/README.md).

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `repeat_exclude_window` | int | `5` | When **`policies.exploration.avoid_repeat_encounters`** is on — how many recent picks from **[stats.gvar](gvars/stats.md)** to consider when excluding duplicates |

### `downtime.config`

Optional labels and copy — not enforcement flags ([policies.downtime](#downtime)).

```py
"downtime": {
    "enabled": True,
    "config": {
        "workday_hours": 8,
        "workweek_days": 5,
        "labels": { "singular": "workday", "plural": "workdays" },
    },
}
```

### `crafting.config` / `economy.config`

Subsystem-level defaults only when no per-command override exists. Prefer **`command_config`** for command-specific costs.

### `content.config`

Controls how **`!library`** builds **search topics** before matching the book catalogue. **`!read`** is unchanged — it searches by title/author, not topic policy.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `library_topic_source` | `"inferred"` \| `"balanced"` \| `"manual"` \| `"restricted"` | `"manual"` | How search topics are chosen for **`!library`** |
| `allowed_topics` | `[ str, … ]` | `[]` | Required when **`library_topic_source`** is **`restricted`** — whitelist of topic tokens players may search |

Access:

```py
cfg.subsystems.content.config.library_topic_source
cfg.subsystems.content.config.allowed_topics
```

#### `library_topic_source`

| Mode | Player usage | Topic resolution |
|------|--------------|------------------|
| **`inferred`** | `!library [comprehend] [bonuses]` — **no topic argument** | Engine builds topics from character/world signals only; user-entered topics are **ignored** if present |
| **`balanced`** | `!library [topics] [comprehend] [bonuses]` — topics **optional** | **Inferred topics** ∪ **user-entered topics** (deduped) |
| **`manual`** | `!library <topics> …` — topics **required** | **Only** user-entered topics; no inference |
| **`restricted`** | `!library <topics> …` — topics **required** | **Only** user-entered topics that match **`allowed_topics`** (after normalisation); no inference |

**Inferred signals** *(engine — [library.gvar](gvars/library.md) `infer_topics()`)*:

| Signal | Source |
|--------|--------|
| **Location** | Character location → config **`locations[id]`** — optional **`library_topics`**, **`biome`**, **`activities`** keys mapped to topic tags |
| **Recent exploration** | **[stats.gvar](gvars/stats.md)** **`wg_stats`** — recent activity commands, **`biomes`**, **`kinds`** counters |
| **Recent crafting** | Recent **`craft`** / **`brew`** / **`enchant`** / **`scribe`** item categories, tags, or recipe kinds from pc/cvar history |
| **Character profile** | Skills, proficiencies, languages, class — engine maps to catalogue topic tags (rules-edition aware via **`get_rules_edition()`**) |

When inference yields **no topics** (new character, sparse history):

| Mode | Behaviour |
|------|-----------|
| **`inferred`** | Player-facing error — e.g. *Not enough activity to suggest library topics yet.* |
| **`balanced`** | Use user topics only if provided; else same error as **`inferred`** |
| **`manual`** / **`restricted`** | Unaffected — player must supply topics |

**Restricted matching:** each user topic token must match at least one entry in **`allowed_topics`** (case-insensitive; prefix match on multi-word topics — finalize in port). Unmatched token → error listing permitted topics.

Optional location field for owner-driven inference:

```py
"oakwood": {
    "name": "Oakwood Forest",
    "library_topics": ["nature", "survival", "herbalism"],
    ...
}
```

Add **`library_topics`** to [Location](#location) when Tier G lands.

**`!westmarch check`** errors when:

- Invalid **`library_topic_source`** value
- **`library_topic_source == "restricted"`** and **`allowed_topics`** missing or empty
- Unknown keys in **`content.config`** beyond documented fields *(warning in MVP if lenient)*

Warnings when:

- **`library_topic_source`** is **`inferred`** or **`balanced`** but **`travel.commands.location`** is off and no locations define **`library_topics`** *(location signal weakened)*
- **`content.commands.library`** on but book catalogue empty

### `travel.config`

*(Stub — add keys as Tier C ships.)*

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| — | — | — | e.g. journey display defaults; defer until travel port |

### Other subsystems

Document **`config`** keys in each subsystem’s alias README when implemented. Empty **`config`** `{}` is valid; defaults fill missing keys only.

### Cross-subsystem validation

**`!westmarch check`** ([check_config.gvar](gvars/check_config.md)) errors when **`config`** requires another subsystem or **`world_data`** slice that is off or missing — e.g. `exploration.config.enc_biome_source == "location"` but **`travel.commands.location`** is disabled, or **`enc_biome_source == "auto"`** resolves to inferred at check time but locations/travel prerequisites missing *(warning only for auto — runtime falls back to manual)*.

Policy ↔ subsystem checks — [Policies MVP checklist](#policies-mvp-checklist) below.

---

## Command config

Per-command **durations and costs** live under **`subsystems.<subsystem>.command_config`**, keyed by command name (same keys as **`commands`**).

**Cooldowns** — seconds between successful uses; read by **`pc.check_cooldown(ch, command, config)`** from **[stats.gvar](gvars/stats.md)** **`last_used_at`**. **`0`** = no cooldown for that command (even when **`policies.*.enforce_cooldowns`** is **`True`**).

**Workday costs** — workdays spent on success when **`policies.downtime.mode == "tracked"`** and the command or recipe requires downtime.

```py
"exploration": {
    "enabled": True,
    "commands": { "enc": True, "forage": True, "mine": True },
    "command_config": {
        "enc":     { "cooldown_seconds": 120 },
        "forage":  { "cooldown_seconds": 120 },
        "mine":    { "cooldown_seconds": 120 },
        "fish":    { "cooldown_seconds": 120 },
        "lumber":  { "cooldown_seconds": 120 },
        "hunt":    { "cooldown_seconds": 0 },
        "loot":    { "cooldown_seconds": 0 },
    },
    "config": { … },
},
"economy": {
    "enabled": True,
    "commands": { "job": True, "buy": True, "sell": True },
    "command_config": {
        "job": { "cooldown_seconds": 28800, "workdays_cost": 0 },
    },
},
"crafting": {
    "enabled": True,
    "commands": { "craft": True, "brew": True },
    "command_config": {
        "craft":   { "cooldown_seconds": 0, "workdays_cost": 0 },
        "brew":    { "cooldown_seconds": 0, "workdays_cost": 0 },
        "scribe":  { "cooldown_seconds": 0, "workdays_cost": 0 },
        "enchant": { "cooldown_seconds": 0, "workdays_cost": 0 },
    },
},
"content": {
    "commands": { "library": True, "read": True },
    "command_config": {
        "library": { "cooldown_seconds": 120 },
        "read":    { "cooldown_seconds": 0 },
    },
},
"downtime": {
    "enabled": True,
    "command_config": {
        "downtime": { "cooldown_seconds": 0 },
    },
},
```

| Field | Type | Default | Meaning |
|-------|------|---------|---------|
| **`cooldown_seconds`** | int | engine default per command | Seconds before the same command can run again; **`0`** = off |
| **`workdays_cost`** | int | `0` | Workdays deducted on success when downtime is **tracked**; recipe **`workdays`** may add on top when crafting |

Engine default **`cooldown_seconds`** when omitted from **`command_config`**:

| Command group | Default |
|---------------|---------|
| **`enc`**, **`forage`**, **`fish`**, **`mine`**, **`lumber`** | **120** |
| **`library`** | **120** |
| **`job`** | **28800** (8 h) |
| **`read`** *(deep read)* | **0** *(owner sets e.g. 86400)* |
| Others | **0** |

**Global cooldown gate:** **`policies.exploration.enforce_cooldowns`**, **`policies.economy.enforce_cooldowns`**, **`policies.content.enforce_library_cooldowns`**, **`policies.content.enforce_read_cooldowns`**, etc. When **`False`**, aliases skip **`check_cooldown`** for that domain entirely.

Access:

```py
cfg.subsystems.exploration.command_config.enc.cooldown_seconds
```

---

## Server policies

House rules and **what the engine enforces** vs what stays narrative/manual. Stored as top-level **`policies`** on the config gvar; merged from engine **`DEFAULTS`** like **`subsystems`** ([gvars/config.md](gvars/config.md)).

**Not** command on/off — use **`subsystems.commands`**. **Not** per-command seconds/costs — use **`command_config`** ([Command config](#command-config)). **Not** subsystem wiring — use **`subsystems.*.config`**. **Policies** answer table-wide enforcement ([US-3.4](user-stories.md)).

### Policies vs `command_config` *(quick reference)*

| Question | Where |
|----------|--------|
| Is **`!downtime`** tracked in cvars? | **`policies.downtime.mode`** |
| Max workdays a PC can hold? | **`policies.downtime.max_workdays`** |
| Does **`!job`** use cooldown or workdays? | **`command_config.job`** — **`cooldown_seconds`** / **`workdays_cost`** |
| How long between **`!enc`** rolls? | **`command_config.enc.cooldown_seconds`** |
| Are cooldowns enforced at all for exploration? | **`policies.exploration.enforce_cooldowns`** |
| Avoid same encounter twice in a row? | **`policies.exploration.avoid_repeat_encounters`** |
| Roll monster HP in combat blocks? | **`policies.combat.roll_monster_hp`** |
| Must player have a character selected? | **`policies.auth.require_character`** |
| Can **`!enc`** quest outcomes auto-add to journal? | **`policies.quest.self_assign`** |
| Rations item name when travel consumes rations? | **`policies.travel.rations_item`** |
| Library search cooldown enforced? | **`policies.content.enforce_library_cooldowns`** |
| Wallet balance caps enforced? | **`policies.economy.enforce_wallet_caps`** + **`currencies.*.max_balance`** |

### Policies MVP checklist

| Policy domain | MVP | Keys | Check validates |
|---------------|-----|------|-----------------|
| **`auth`** | ✓ | `require_character` | — |
| **`time`** | ✓ | `mode` | `world_clock` → **`world_data.calendars`** |
| **`travel`** | ✓ | `apply_path_costs`, `consume_rations`, `rations_item` | rations item when consume on *(warn)* |
| **`downtime`** | ✓ | `mode`, `max_workdays`, `acquisition` | **`tracked`** → **`subsystems.downtime.enabled`** |
| **`crafting`** | ✓ | `require_downtime_before_roll`, `auto_deduct_*` | enforced roll → downtime **tracked** + subsystem on |
| **`economy`** | ✓ | `enforce_cooldowns`, `enforce_wallet_caps`, `starting_gold` | **`job`** cooldown; caps → **`currencies.*.max_balance`** |
| **`exploration`** | ✓ | `enforce_cooldowns`, `avoid_repeat_encounters` | repeat on → stats + encounter id in **`add_log`** |
| **`combat`** | ✓ | `scale_encounters_to_level` *(defer)*, `roll_monster_hp`, `scale_mode`, `max_cr_delta`, `min_cr` *(defer)* | scaling on → warn |
| **`quest`** | ✓ | `self_assign`, `max_active` | **`self_assign`** + quest encounters → **`misc.commands.quest`** on |
| **`inventory`** | schema | encumbrance, attunement, **`enforce_*`** | enforcement deferred; warn when enforce on |
| **`display`** | ✓ | `footer_behaviour`, tips, credits | invalid mode → error |
| **`languages`** | ✓ | `allowed` | unknown names → warn |
| **`content`** | partial | `enforce_read_cooldowns`, `enforce_library_cooldowns` | uses **`command_config.read`** / **`library`** |

**Deferred post-MVP (schema reserved):** downtime **`acquisition: world_clock`** / **`journey`**, encumbrance / attunement **enforcement** implementation, combat CR scaling engine.

```py
policies = {
    "auth": { "require_character": True },
    "time": { "mode": "manual" },
    "travel": {
        "apply_path_costs": False,
        "consume_rations": False,
        "rations_item": "Rations",
    },
    "downtime": {
        "mode": "manual",
        "max_workdays": None,
        "acquisition": "manual",
    },
    "crafting": {
        "require_downtime_before_roll": True,
        "auto_deduct_materials": False,
        "auto_deduct_gold": False,
    },
    "economy": {
        "enforce_cooldowns": True,
        "enforce_wallet_caps": False,
        "starting_gold": None,
    },
    "inventory": {
        "track_encumbrance": False,
        "enforce_encumbrance": False,
        "attunement_limit": None,
        "enforce_attunement": False,
        "magic_items_carry_limit": None,
        "enforce_magic_item_limit": False,
    },
    "exploration": {
        "enforce_cooldowns": True,
        "avoid_repeat_encounters": "off",
    },
    "combat": {
        "scale_encounters_to_level": False,
        "roll_monster_hp": True,
        "scale_mode": "party_average",
        "max_cr_delta": None,
        "min_cr": None,
    },
    "quest": {
        "self_assign": False,
        "max_active": None,
    },
    "content": {
        "enforce_read_cooldowns": False,
        "enforce_library_cooldowns": True,
    },
    "languages": { "allowed": [] },
    "display": {
        "footer_behaviour": "balanced",
        "helpful_tips": [],
        "credits": None,
    },
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

### `auth`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `require_character` | bool | `True` | When **`True`**, player aliases fail early if no active Avrae character is selected |

Checked in **[auth.gvar](gvars/auth.md)** after config/channel gates (before alias body). Admin commands unaffected. westmarch reference: all exploration/economy/crafting commands assume a selected character.

### `travel`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `apply_path_costs` | bool | `False` | When `True`, deduct **`path.cost`** (gp → coinpurse, wallet ids → [wallet](../aliases/economy/wallet.md)) on journey start or step completion (TBD in journeys port). |
| `consume_rations` | bool | `False` | When `True`, deduct rations from bags on journey steps that specify them. |
| `rations_item` | str | `"Rations"` | Exact item name for **`pc.modify_bag`** when **`consume_rations`** is **`True`** |

When both cost flags are **`False`**, routes are planning/display only — westmarch-style narrative travel without automated resource drain.

**Check:** **`consume_rations`** **`True`** → **warn** if **`rations_item`** is empty or item not found in a reference items list *(when catalogue wired)*.

### `downtime`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `mode` | `"tracked"` \| `"manual"` \| `"off"` | `"manual"` | Workday tracking |
| `max_workdays` | int \| `None` | `None` | Cap on accumulated workdays per character; **`None`** = unlimited |
| `acquisition` | `"manual"` \| `"world_clock"` \| `"journey"` | `"manual"` | How workdays are **granted** *(MVP: manual only; others reserved)* |

| `mode` | Behaviour |
|--------|-------------|
| **`tracked`** | **`!downtime`** + **`pc`** cvars active; commands with **`workdays_cost`** or recipes with **`workdays`** may debit when policies allow. **Requires **`subsystems.downtime.enabled`**.** |
| **`manual`** | Help text only — players adjust sheet / honour system; crafting does not block on cvar balance. |
| **`off`** | No downtime messaging or cvar use even if **`subsystems.downtime.enabled`**. |

| `acquisition` | Behaviour *(MVP)* |
|---------------|-------------------|
| **`manual`** | Only **`!downtime <amount>`** (or GM) changes balance — westmarch default. |
| **`world_clock`** | *(Deferred)* Grant workdays when in-world time advances by **`workday_hours`**. |
| **`journey`** | *(Deferred)* Grant workdays on journey step completion per path config. |

Labels and flavour (**`workday_hours`**, **`workweek_days`**) live in **`subsystems.downtime.config`** — [downtime.config](#downtimeconfig).

**`!westmarch check`** **errors** when:

- **`mode == "tracked"`** and **`subsystems.downtime.enabled`** is **`False`**
- **`max_workdays`** is set and **`max_workdays < 1`**

**Warnings** when:

- **`crafting.require_downtime_before_roll`** is **`True`** but **`downtime.mode`** is not **`tracked`**
- Any enabled crafting command has **`workdays_cost > 0`** in **`command_config`** but downtime is not **tracked**
- **`acquisition`** is **`world_clock`** but **`policies.time.mode`** is not **`world_clock`**

### `crafting`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `require_downtime_before_roll` | bool | `True` | When **`True`** and downtime **tracked**, block or warn if insufficient workdays before the skill check |
| `auto_deduct_materials` | bool | `False` | Auto-remove recipe ingredients from bags on success |
| `auto_deduct_gold` | bool | `False` | Auto-debit gp (and optional wallet costs) on craft/scribe success |

Workdays spent per command: **`subsystems.crafting.command_config.<cmd>.workdays_cost`** plus recipe **`workdays`** when enforced. **`cooldown_seconds`** on crafting commands is usually **`0`** (westmarch honour system); owners may add cooldowns for spam prevention.

westmarch reference: manual gp/downtime/material removal with messaging only unless policies + **`command_config`** enable automation.

**Check:** **`require_downtime_before_roll`** + any crafting command enabled → **`downtime.mode == "tracked"`** and **`subsystems.downtime.enabled`**.

### `economy`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enforce_cooldowns` | bool | `True` | When **`True`**, **`!job`** (and future timed economy commands) use **`command_config`** cooldowns |
| `enforce_wallet_caps` | bool | `False` | When **`True`**, **`pc.modify_wallet`** rejects grants above **`currencies[id].max_balance`** |
| `starting_gold` | int \| `None` | `None` | One-time gp grant on first successful economy/exploration command; **`None`** = off *(honour system)* |

**`!job`** uses **`command_config.job.cooldown_seconds`** (default **28800**) — **not** downtime unless **`workdays_cost > 0`**. Typical tables: cooldown-only jobs; set **`workdays_cost: 1`** for “a day’s work” tables.

Per-currency caps: optional **`max_balance`** on each [Currency](#currency) entry — only enforced when **`enforce_wallet_caps`** is **`True`**.

**Check:** **`enforce_wallet_caps`** **`True`** → **warn** if any currency lacks **`max_balance`**; **`starting_gold < 0`** → **error**.

### `inventory`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `track_encumbrance` | bool | `False` | Track carry weight in cvars / sheet helpers *(implementation deferred)* |
| `enforce_encumbrance` | bool | `False` | Block buy/loot/gather when over capacity — requires **`track_encumbrance`** |
| `attunement_limit` | int \| `None` | `None` | Max attuned magic items; `None` = do not enforce |
| `enforce_attunement` | bool | `False` | Block attuning over **`attunement_limit`** on buy/loot |
| `magic_items_carry_limit` | int \| `None` | `None` | Cap on carried magic items independent of attunement; `None` = no cap |
| `enforce_magic_item_limit` | bool | `False` | Block pickups over **`magic_items_carry_limit`** |

**MVP:** schema + **`!westmarch check`** **warns** when any **`enforce_*`** is **`True`** until enforcement ships in **[pc.gvar](gvars/pc.md)** / buy / loot aliases.

### `exploration`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enforce_cooldowns` | bool | `True` | When **`True`**, activity commands use **`command_config.*.cooldown_seconds`**; skipped in Avrae Development env |
| `avoid_repeat_encounters` | `"off"` \| `"same_biome"` \| `"global"` | `"off"` | Reduce picking the same encounter twice in a row |

| `avoid_repeat_encounters` | Behaviour |
|---------------------------|-----------|
| **`off`** | Uniform random within kind bucket — default |
| **`same_biome`** | Exclude the last picked **`encounter_id`** (or stable name) in this biome + activity from the next roll when other entries exist |
| **`global`** | Exclude last pick across all biomes for that activity |

Implementation: **[encounter_lists.gvar](gvars/encounter_lists.md)** reads recent **`encounter_id`** values from **[stats.gvar](gvars/stats.md)** (via **`add_log` extras**). Window size: **`exploration.config.repeat_exclude_window`** (default **5**). If exclusion empties the pool, fall back to uniform random and **warn** in dev logs.

Per-command cooldown durations: **`subsystems.exploration.command_config`** — not this policy block.

### `combat` *(post-MVP scaling — schema reserved)*

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `scale_encounters_to_level` | bool | `False` | Adjust combat **`cr`** / monster choice to party level *(deferred)* |
| `roll_monster_hp` | bool | `True` | When **`True`**, combat encounter embeds include rolled/average HP in the combat block; when **`False`**, narrative CR/monster list only (full HP at table discretion) |

| `scale_encounters_to_level` | MVP behaviour |
|-----------------------------|---------------|
| **`False`** *(default)* | Encounter **`cr`** and monsters taken literally from biome pool |
| **`True`** | **`!westmarch check`** **warns** until scaling ships |

| `roll_monster_hp` | MVP behaviour |
|-------------------|---------------|
| **`True`** *(default)* | westmarch-style **`!i madd`** block may include HP hints from monster stat blocks when catalogue loaded |
| **`False`** | Omit HP rolls — GM rolls or uses fixed stat block off-bot |

Future scaling keys *(reserved — warn when **`scale_encounters_to_level`** true)*:

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `scale_mode` | `"party_average"` \| `"character"` | `"party_average"` | Level source when scaling ships |
| `max_cr_delta` | float \| `None` | `None` | Max CR adjustment above party level |
| `min_cr` | float \| `None` | `None` | Floor CR after scaling |

Quest and gather kinds ignore scaling.

### `quest`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `self_assign` | bool | `False` | When **`True`**, quest-kind encounter outcomes with a **`quest_id`** auto-create or activate entries in **[quests.gvar](gvars/quests.md)** journal |
| `max_active` | int \| `None` | `None` | Cap on **`active`** quests per character; **`None`** = unlimited |

| `self_assign` | Behaviour |
|---------------|-----------|
| **`False`** *(default)* | Quest encounters are narrative hooks only — GM or player uses **`!quest add`** manually |
| **`True`** | **[encounters.gvar](gvars/encounters.md)** outcome handler calls **`quests.activate_from_encounter`** when outcome includes **`quest_id`** |

Requires **`subsystems.misc.commands.quest`** enabled when **`self_assign`** is **`True`** — **`!westmarch check`** **errors** otherwise.

**Check:** **`max_active`** set and **< 1** → **error**.

### `content`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enforce_read_cooldowns` | bool | `False` | When **`True`**, **`!read`** deep-read uses **`command_config.read.cooldown_seconds`** |
| `enforce_library_cooldowns` | bool | `True` | When **`True`**, **`!library`** uses **`command_config.library.cooldown_seconds`** (default **120**) |

### Display policy (footer)

**Config path:** **`policies.display`**. Embed **footer** behaviour for player-facing commands — independent of **`display.footer`** static text on the config gvar. Implemented in **[display.gvar](gvars/display.md)** inside **`get_display()`**.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `footer_behaviour` | see below | `"balanced"` | How to populate the embed footer |
| `helpful_tips` | `[ str, … ]` | `[]` | Owner tips for **`helpful_tips`** mode; engine defaults used when empty |
| `credits` | `str` \| `None` | `None` | Override credits line for **`credits`** mode; `None` → engine default string |

#### `footer_behaviour`

| Value | Footer content |
|-------|----------------|
| **`helpful_tips`** | One random string from **`helpful_tips`**, or engine default tips when the list is empty |
| **`string`** | Merged **`footer`** from [display inheritance](#embed-display-inheritance) (command → subsystem → base **`display.footer`**), then merged **`title`**, then **`display.name`** |
| **`help`** | Short hint for the active command — e.g. *Use `!enc help` for options* (alias prefix from invocation context) |
| **`credits`** | Creator / engine credits — **`policies.display.credits`** when set, else engine default |
| **`balanced`** | **Default.** Each embed footer randomly uses one of **`helpful_tips`**, **`string`**, **`help`**, or **`credits`** (same content rules as above) |

**`balanced`** is the recommended default for varied, low-maintenance footers. Set **`footer_behaviour`** to **`string`** when the table wants a fixed campaign line on every command embed.

Example — FR table with custom tips and fixed footer fallback:

```py
"display": {
    "footer_behaviour": "balanced",
    "helpful_tips": [
        "Tip: `!location` shows where you are before rolling `!enc`.",
        "Tip: `!westmarch show` summarizes enabled commands for this server.",
    ],
    "credits": "Sword Coast Westmarch — powered by westmarch-generic.",
},
```

**`!westmarch check`** **errors** on unknown **`footer_behaviour`** values. **Warns** when **`footer_behaviour`** is **`string`** and no **`footer`** is set at any inheritance layer (runtime still falls back to title / world name).

### `languages`

Setting-wide **allowed languages** for mechanics that care about language lists (library Comprehend Languages, language-tagged books, inference from character languages, future RP gates).

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `allowed` | `[ str, … ]` | `[]` | Language names permitted in **this** westmarch (e.g. `"Common"`, `"Elvish"`, `"Dwarvish"`) |

| `allowed` | Behaviour |
|-----------|-----------|
| **Empty / omitted** | No restriction — use full language table for resolved **`rules_version`** ([core/languages](gvars/core.md)) |
| **Non-empty** | Only listed languages are treated as valid for setting checks; character languages **not** in the list may be ignored or flagged in library/comprehension flows |

Names should match Avrae / SRD display names for the active rules version. **`!westmarch check`** **warns** when **`allowed`** contains entries unknown to the engine language table for **`get_rules_edition()`**.

Example — FR table limits exotic tongues:

```py
"languages": {
    "allowed": [
        "Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin",
        "Halfling", "Orc", "Draconic", "Infernal",
    ],
},
```

### Adding policy keys

New domains get a nested object under **`policies`**, documented here, with engine **`DEFAULTS`** and **`!westmarch show`** summary. Aliases **read policies** — they do not write them.

---

## Adding shapes

New shared shapes (journey state, shop listing, service, downtime block, …) get a section here with links from [server-config.md](server-config.md) and gvar/alias docs.
