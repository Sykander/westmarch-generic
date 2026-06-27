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
    "combat_text": str | callable,       # optional standardized combat announcement
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | Embed title |
| `description` | yes | Embed body (may include roll text appended by processor) |
| `rolls` | no | Empty / omitted → skip straight to static fields + outcomes |
| `outcomes` | no | Omitted → no sheet changes; see [Outcome](#outcome) |
| `combat_text` | no | Appended to description after callables resolve; templates use it for standardized combat announcements |
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
    "config": config,         # resolved server config, or None
    "activity": activity,     # enc / forage / mine / ..., or None
    "biome": biome,           # resolved biome code, or None
    "location": location,     # current location dict, or None
    "location_id": location_id,
    "current_location": location,
    "current_location_id": location_id,
}
```

**Callable convention:** `def field(ectx):` — always one parameter named **`ectx`**.
All keys above are present; optional values are **`None`** when they are not known.

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
| `config` | When the processor can resolve or was passed the server config; else `None` |
| `activity` | Exploration activity command such as `enc`, `forage`, `mine`; else `None` |
| `biome` | Resolved biome code for the picked encounter; else `None` |
| `location`, `current_location` | Current location dict for the character; else `None` |
| `location_id`, `current_location_id` | Current location id for the character; else `None` |

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
        "location_id": "river_town",
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

Explicit **brew / enchant / craft / scribe** instructions for an output item. Source TSV: [assets/recipes.tsv](../../../../assets/recipes.tsv). Stored in config as **`recipes`** — list of recipe dicts, or dict keyed by **`id`**.

```py
recipe = {
    "id": "example_brew_healing",
    "name": "Potion of Healing",
    "kind": "brew",
    "workdays": 2,
    "gold": 25,
    "consumed": [
        { "item": "Arnica", "qty": 2 },
        { "item": "Crystal vial", "qty": 1 },
    ],
    "required": [],
    "spells": None,
    "tools": ["Herbalism Kit"],
    "tags": ["potion", "healing"],
    "description": "Reduce the herbs in a clean vessel over a gentle heat, then seal the vial and agitate the infusion until it glows faintly red. The draught is finished when the colour holds at room temperature.",
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Multiple variants per output **`name`** |
| `name` | yes | Join to **`items`** / potion / magic item catalogues |
| `kind` | yes | Drives which crafting command applies |
| `workdays` | yes | Used by crafting resource policy |
| `gold` | no | gp cost; command fallback supplies baseline when omitted |
| `consumed` | no | Empty when nothing is consumed (rare) |
| `required` | no | Base items for enchant, etc. — `enchant` consumes these by default only when item resources are `deduct` |
| `spells` | no | Empty when no spell must be cast; spell-slot automation is separately controlled by policy |
| `tools` | no | Tool options for `tool_policy`; can be a list or single tool name |
| `description` | yes | In-world process text — what the recipe *says*; do not repeat quantities or workdays (those live in other columns) |

Crafting commands use recipes according to **`subsystems.crafting.config.recipe_mode`**: `raw` ignores recipes, `recipes` requires a unique recipe, and `mixed` searches recipes first then falls back to item/spell catalogues. **`!recipe`** searches **`recipes`** + item metadata. **Recipe encounter** outcomes (`type: recipe`) store **`description`** in the notes cvar ([encounters.md](gvars/encounters.md)).

---

## Book

Volume entry for **`!library`** and **`!read`**. Stored in config **`books`** (list or dict) or loaded from generated catalogue shards ([content-pipeline.md](content-pipeline.md)). Authoring source: [assets/books-forgotten-realms.tsv](../../../../assets/books-forgotten-realms.tsv), [books-real.tsv](../../../../assets/books-real.tsv).

```py
book = {
    "name": "A Brief History of the Dessarin",   # required — title; comprehension cvar key
    "description": str,                         # required — excerpt/summary for Discord embeds
    "author": str,                              # required
    "written": str,                             # required — in-world or publication date string
    "rarity": str,                              # required — common, uncommon, rare, …
    "language": str,                            # required — e.g. Common; drives language checks
    "type": "original" | "commentary",          # required
    "base_work": str,                           # optional — for commentaries: work referenced
    "tags": [ str, ... ],                       # required — topic tokens for !library search
    "read_bonus": int,                          # optional — default 0
    "image": str,                               # optional — embed image URL
    "content_link": str,                        # optional — URL to full text outside Discord
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `name` | yes | Unique title for search; key for per-character comprehension cvar |
| `description` | yes | **Embed body only** — short excerpt, summary, or representative passage. Not the full work. Max practical length for Discord (~2–4 paragraphs). Use literal `\n\n` in TSV for paragraph breaks. |
| `author` | yes | Display name (translator/editor for public-domain imports) |
| `written` | yes | Flavour date (`1480 DR`) or publication year for real works |
| `rarity` | yes | `common`, `uncommon`, `rare`, `very rare`, `legendary`, `ancient`, … |
| `language` | yes | Script/language for comprehension ([languages.gvar](gvars/core.md)) |
| `type` | yes | `original` or `commentary` |
| `base_work` | no | Empty string or omit for `original` |
| `tags` | yes | Lowercase tokens; align with location **`library_topics`** where possible |
| `read_bonus` | no | Default **0** |
| `image` | no | Empty in TSV until URLs added |
| `content_link` | no | HTTPS URL where the **full** text can be read for free (see below) |

### TSV columns

Both book TSV files share the same header (including **`content_link`**):

`name`, `description`, `author`, `written`, `rarity`, `language`, `type`, `base_work`, `tags`, `read_bonus`, `image`, `content_link`

Build: **`npm run generate:books`** → [configs/books/](../../../../src/gvars/configs/books/).

### Forgotten Realms vs real catalogues

| File | Purpose | Typical `content_link` |
|------|---------|------------------------|
| **`books-forgotten-realms.tsv`** | Canon in-universe titles (Volo's Guides, North histories, …) | **Forgotten Realms Wiki** lore page when no full text is freely hosted; **DM's Guild** URL for official digital editions of matching sourcebooks |
| **`books-real.tsv`** | Public-domain (or otherwise licensed) real-world works | **Project Gutenberg**, Wikisource, Standard Ebooks, etc. — only sources you may legally redistribute a link to |

Do **not** paste copyrighted novel text into **`description`**. Do **not** link to pirate or scan sites.

### Display and comprehension ([library.gvar](gvars/library.md))

Discord embeds cannot reasonably carry full novels. The split:

| What | Where |
|------|--------|
| **Skim / study text** | `description` in the embed — may be **censored** or truncated by comprehension score |
| **Full text** | **`content_link`** — optional external URL |

**`read_display(read_result)`** rules *(both **`quick_read`** and **`deep_read`**)*:

1. Always show title + comprehension-scored **`description`** (existing westmarch behaviour).
2. Append a **“Read full text”** link **only when all** of:
   - `book.content_link` is a non-empty string, **and**
   - `read_result.comprehension_score >= 100` (per-book comprehension cvar via **`get_comprehension(character, book["name"])`** after the read roll updates it).

If **`content_link`** is omitted or comprehension is below 100, **no link line** appears — players are not pointed off-platform until they have fully comprehended the in-embed excerpt.

Suggested embed footer line:

```markdown
[Read the full text online](https://…)
```

3. **`content_link` is never shown on search-only embeds** — only after a **`read_book`** call produces a **`read_result`**.

### Catalogue placement

| Storage | Notes |
|---------|--------|
| Top-level **`books`** on config gvar | Small curated lists |
| **`world_data.books`** | World-owned small curated lists |
| **`world_data.book_gvar_ids`** | Multiple owner gvars containing JSON book arrays |
| **`extensions.books`** / shard gvars | Large corpora — [content-pipeline.md](content-pipeline.md) |

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
| **`travel`**, **`location`** | **`locations`** or **`locations_gvar_id`**, **`default_location`**, **`paths`** or **`paths_gvar_id`** (for routing) |
| Exploration activities with **`enc_biome_source: location`** or **`auto`** (inferred) | **`locations`** or **`locations_gvar_id`** + **`biomes`** registry + **`journeys.gvar`** |
| Exploration activity commands | **`biomes`** registry with resolvable **`gvar_id`** per referenced code |
| **`hunt`**, **`loot`** custom creatures | Optional **`monsters`** owner rows; bundled monster catalogue is available by default |
| **`time`** with **`policies.time.mode: world_clock`** | **`calendars`** (at least one) |

Access after load:

```py
cfg = config.get_config()
cfg.world_data.locations
cfg.world_data.locations_gvar_id
cfg.world_data.paths
cfg.world_data.paths_gvar_id
cfg.world_data.transport
cfg.world_data.calendars
cfg.world_data.biomes.forest.gvar_id
cfg.world_data.monsters
```

**Legacy flat keys** — older docs/examples used top-level **`locations`**, **`paths`**, **`encounter_pools`**, **`world_clock`**. The web config editor **warns** when those appear without **`world_data`**; loaders accept flat keys during migration only.

### `world_data` object

```py
world_data = {
    "default_location": "river_town",
    "locations_gvar_id": "<uuid>",
    "locations": { "river_town": { … }, "oakwood": { … } },
    "paths_gvar_id": "<uuid>",
    "paths": [ { "from": "river_town", "to": "oakwood", … }, … ],
    "transport": { "horse": { … }, "boat": { … } },
    "calendars": { "primary": { … } },
    "biomes": {
        "forest": { "gvar_id": "<uuid>", "name": "Forest" },
        "cave": { "gvar_id": "<uuid>", "name": "Cave" },
    },
    "monsters": [
        { "name": "Moonlit Wolf", "cr": 1, "type_str": "Beast", "size": "M" },
    ],
    "items": {
        "include_engine": True,
        "entries": [
            { "name": "Mooncap", "rarity": "mundane", "type": "Item", "value": "5 gp" },
        ],
    },
    "books": [
        { "name": "Oakwood Almanac", "author": "Mira", "written": "1492 DR", "rarity": "common", "language": "Common", "type": "original", "description": "A local guide.", "tags": ["forest"] },
    ],
    "book_gvar_ids": ["<uuid>", "<uuid>"],
}
```

| Key | Required | Notes |
|-----|----------|-------|
| **`default_location`** | when travel/location on | **`locations`** id slug |
| **`locations`** | when travel/location on and no **`locations_gvar_id`** | Dict keyed by stable **`id`** — [Location](#location). Inline entries override matching external ids. |
| **`locations_gvar_id`** | no | UUID of a JSON gvar containing the large locations dict, optionally wrapped as **`{"locations": {...}}`**. The web editor may display shipped preset UUIDs as **`engine:configs/...`** aliases while editing. |
| **`paths`** | when **`travel`** routes journeys and no **`paths_gvar_id`** | List of [Path](#path) edges. Inline entries are appended after external entries. |
| **`paths_gvar_id`** | no | UUID of a JSON gvar containing the large paths list, optionally wrapped as **`{"paths": [...]}`**. The web editor may display shipped preset UUIDs as **`engine:configs/...`** aliases while editing. |
| **`transport`** | no | [Transport](#transport) modes — horse, boat, ship, … |
| **`calendars`** | when world clock on | [Calendar](#calendar) definitions |
| **`biomes`** | when exploration on | Registry only — [Biome registry](#biome-registry); encounter bodies in separate gvars |
| **`monsters`** | no | Owner monster overlay rows for **`hunt`** / **`loot`**; large bestiaries use **`extensions.monsters`** |
| **`items`** | no | Owner item overlay/source for crafting and shops; can be inline, `{entries, gvar_id, gvar_ids, include_engine}`, or loaded through **`extensions.items`** |
| **`books`** | when content library/read on | Small owner book catalogue; large catalogues should use **`book_gvar_ids`** or **`extensions.books`** |
| **`book_gvar_ids`** | no | List of gvar UUIDs containing JSON book arrays |

Shops remain top-level **`shops`** because they are a service registry shared by economy commands. Item and book catalogues may live under **`world_data`** so each world can add local goods and libraries without editing engine constants.

### Transport

**`transport`** replaces westmarch's implicit **horse** / **boat** flags with named transport categories. Keep route requirements broad enough that path authors do not need separate edges for every mount or vehicle variant.

```py
transport = {
    "walk": {
        "name": "Walking",
        "default": True,
        "aliases": ["walking", "foot", "on_foot"],
    },
    "horse": {
        "name": "Horse or mount",
        "description": "Rideable land mounts.",
        "aliases": ["riding_horse", "warhorse", "pony", "mule", "camel"],
    },
    "cart": {
        "name": "Cart or wagon",
        "description": "Drawn land vehicles and draft animals.",
        "aliases": ["draft_horse", "wagon", "carriage", "chariot", "sled"],
    },
    "boat": {
        "name": "Boat",
        "description": "Small craft for rivers, lakes, ferries, and short crossings.",
        "aliases": ["rowboat", "keelboat"],
    },
    "ship": {
        "name": "Ship",
        "description": "Seagoing vessel travel.",
        "aliases": ["longship", "sailing_ship", "galley", "warship"],
    },
    "fly": {
        "name": "Flying",
        "aliases": ["flying", "flight", "flying_mount"],
    },
    "swim": {
        "name": "Swimming",
        "aliases": ["swimming", "swimming_mount"],
    },
    "portal": {
        "name": "Portal",
    },
    "teleportation_circle": {
        "name": "Teleportation circle",
        "aliases": ["teleport_circle", "teleport", "circle"],
    },
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | Player-facing label |
| `description` | no | Help / journey embed copy |
| `aliases` | no | Specific names that resolve to this broad category |
| `default` | no | **`walk`** (or first mode) when player has no configured/default transport availability |

**Path requirements** should reference canonical transport **ids** (not booleans). Omit transport requirements for ordinary routes that can be walked or used by mundane overland travel; add requirements only when the path genuinely needs a capability such as boat, ship, flight, swimming, a portal, or a teleportation circle. Configured aliases are accepted for compatibility, but categories such as `horse` and `cart` keep the route graph small. Each path has **one** `steps` list — no alternate step lists on the same edge. If a corridor has genuinely different actions for walking, riding, or boating, use separate path entries (same `from`/`to`, different `requirements.transport` and `steps`):

```py
world_data = {
    "paths": [
        {
            "from": "oakwood",
            "to": "oakwood_east",
            "distance_miles": 12,
            "travel_hours": 4,
            "steps": [
                { "type": "encounter", "biome": "forest" },
            ],
        },
        {
            "from": "oakwood",
            "to": "oakwood_east",
            "requirements": { "transport": "horse" },
            "distance_miles": 10,
            "travel_hours": 2,
            "steps": [
                { "type": "encounter", "biome": "road", "description": "Canter along the east trail." },
            ],
        },
        {
            "from": "harbor",
            "to": "island",
            "requirements": { "transport": "boat" },
            "distance_miles": 8,
            "travel_hours": 3,
            "steps": [
                { "type": "encounter", "biome": "sea", "description": "Sail across the bay." },
            ],
        },
    ],
}
```

| `requirements.transport` | Meaning |
|--------------------------|---------|
| **string** | Traveller must have that transport available |
| **list of strings** | Traveller must have every listed transport available |
| **omitted** | No transport requirement |

**`journeys.gvar`** combines the default transport, character cvar **`westmarch_travel_transport`**, and explicit travel args, then considers only paths whose **`requirements`** match that available set.

westmarch **`path.horse`** / **`path.boat`** parallel lists → **separate path dicts** with **`requirements.transport`** and that mode’s **`steps`** — not nested variants on one path.

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

**Lazy load** — [biomes.gvar](gvars/biomes.md) loads the biome JSON on first **`get_encounter(biome, …)`** for that code; caches per alias invocation. Unused biomes never load.

**Biome codes** in **`locations.activities.*`** and **`!enc <code>`** must exist in this registry.

#### Biome gvar body *(separate workshop module)*

Biome gvars are **raw JSON**, not Drac2 modules. The body is one list of compact encounter rows:

```json
[
  [["enc.gather", "forage.gather"], "gather_item", "Wild berries", "You find a patch of ripe berries under thorny leaves.", "Wisdom (Survival)", 12, "Berries", 1],
  [["enc.combat"], "combat", "Wolf sign", "Fresh tracks and a low growl warn you that a hungry pack is close.", 1, "Wolf"],
  [["enc.quest"], "quest", "Lost waymarker", "A weathered marker points toward a trail that is not on any current map."],
  [null, "flavour", "Old campsite", "You find a cold fire ring and bootprints softened by rain."]
]
```

Each row is:

```json
[pool_tags_or_null, "template_name", ...template_args]
```

| Row part | Required | Notes |
|----------|----------|-------|
| `pool_tags_or_null` | yes | `null` = every compatible pool; otherwise list pool tags such as `enc.combat`, `enc.quest`, `enc.gather`, `forage.gather`, `fish.gather`, `mine.gather`, `lumber.gather` |
| `template_name` | yes | Engine encounter template id from [encounter_templates.gvar](gvars/encounter_templates.md) |
| `template_args` | no | Positional JSON values passed to that template |

Compatibility is checked before the template expands: pool tags must match the selected branch, and built-in template ids provide their branch (`combat`, `quest`, or `gather`) for `null` rows. This lets a single row appear in multiple pools without duplicating the encounter body, while keeping routing out of the encounter dict.

| westmarch | westmarch-generic |
|-----------|-------------------|
| **`encounters`** mega-list + random mix into 100 slots | Dropped — wilderness entries are tagged compact rows |
| Library / merchant / job hints in **`encounters`** | **Location encounter gvar** — not biome ([investigation §4–5](biome-data-shape-investigation.md)) |
| **`enc_encounters`**, **`mine_encounters`**, … as flat lists | Row pool tags such as **`enc.gather`**, **`mine.gather`** |
| **`combat_encounters`** mixed into every roll | Row pool tags such as **`enc.combat`** |
| **`recipe_encounters`** mixed globally | Recipe-tagged **`gather`** entries or **`economy`** catalogues |
| d100 **`get_encounter_list`** | **Kind first** ([exploration.config](#explorationconfig) **`distribution`**) → uniform random within matching subset |

Expanded template output matches [Encounter *(input)*](#encounter-input). The selected **`kind`** is selector metadata, not an encounter field.

**Selection algorithm** ([encounter_lists.gvar](gvars/encounter_lists.md)):

1. Resolve biome code → load biome gvar if needed
2. Resolve character location → load location encounter gvar when **`encounters_gvar_id`** set
3. Choose **`kind`** ∈ **`{ combat, quest, gather }`** using **`distribution_policy`** + **`distribution`** *(exploration activities)*
4. Build candidate list — biome rows whose pool tags match **`activity.kind`** ∪ location pools (exploration); service activities use location pool only
5. Empty list → player-facing error; else uniform random pick — **not** d100

**Biome rows** — exploration & gathering only. Economy, crafting, content, dungeons — **location-scoped** ([investigation §3–5](biome-data-shape-investigation.md)).

#### Engine preset biomes

Placed at **`src/gvars/configs/biomes/`** (not under **`src/gvars/utils/config/`**, which is reserved for the engine **`config.gvar`** loader).

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

An in-world place characters **travel to**, **view** via `!location`, and **run activities** at. Stored inline in **`world_data.locations`** or in the JSON gvar pointed to by **`world_data.locations_gvar_id`** — dict keyed by stable **`id`**. Lookup and display: [gvars/locations.md](gvars/locations.md).

```py
location = {
    "id": "oakwood",                    # dict key; slug for !enc oakwood when used as area arg
    "name": "Oakwood Forest",           # required — display name, cvar identity
    "description": str,                 # optional — general flavour for !location
    "travel_description": str,          # optional — extra text on !travel (westmarch travel_desc)
    "image": str,                       # optional — embed image URL
    "link": str,                        # optional — Discord channel URL for embed links
    "biome": str,                       # optional — primary biome code (forest, cave, river, …)
    "commands": {                       # optional — player commands available at this place
        "enc": ["forest"],              # exploration keys → list of biome pool codes
        "forage": ["forest"],
        "library": True,                # other location-gated keys → True when available
        "job": True,
        "buy": True,
        "sell": True,
    },
    "activities": {                     # legacy — same shape as exploration keys in `commands`
        "enc": ["forest"],
        "forage": ["forest"],
    },
    "services": [ "general_store", "inn" ],  # optional — ids into shop/service config
    "library_topics": [ "nature", "history" ],  # optional — topic hints for !library inference
    "encounters_gvar_id": "<uuid>",             # optional — lazy-loaded place-specific encounter module
    "dungeon_ids": [ "whispering_hollow" ],     # optional — post-MVP; dungeons enterable here
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
| `biome` | no | Default when an exploration command omits biome list |
| `commands` | no | **Preferred** — per-command availability at this location (see below) |
| `activities` | no | **Legacy** — exploration subset of `commands`; omit when using `commands` |
| `services` | no | Shop / service ids — vendors, crafting benches ([Shop](#shop) **`location_id`**) |
| `library_topics` | no | Topics for **`!library`** when **`library_topic_source`** is **`inferred`** or **`balanced`** |
| `encounters_gvar_id` | no | Workshop UUID — lazy-loaded [location encounter module](#location-encounter-module-separate-workshop-gvar) |
| `dungeon_ids` | no | **Post-MVP** — dungeon registry keys enterable at this place ([investigation §5](biome-data-shape-investigation.md)) |

### Commands map

**Authoring rule:** list every **location-gated** player command on a place-by-place basis. Omit a key → that command is **not** available while the character is here.

| Value | Meaning |
|-------|---------|
| **`["forest", …]`** | Exploration command — biome pool codes (keys in **`world_data.biomes`**) |
| **`True`** | Command is available here (no extra args on the location) |

**Exploration keys** (value must be a biome list): `enc`, `forage`, `fish`, `mine`, `lumber`, `hunt`, `loot`.

**Economy keys** (value `True` when offered): `job`, `buy`, `sell` — wire **`shops`** / payout config to this **`location_id`**; optional prose in **location encounter gvar**.

**Crafting keys** (value `True` when offered): `craft`, `brew`, `enchant`, `scribe`.

**Content keys** (value `True` when offered): `library`, `read`.

Service commands are **not** biome pool keys — configure per location ([biome-data-shape-investigation.md §4–5](biome-data-shape-investigation.md)).

**Do not put in `commands`** — these are global or travel-scoped, not per-location toggles: `travel`, `location`, `time`, `weather`, `wallet`, `downtime`, `quest`, `recipe`, `journal`, `diary`.

westmarch used `encs` with emoji prefixes (`✅`, `❓`, `❌`) plus biome lists. westmarch-generic: **presence of the key = available**; absence = not offered. Uncertainty / rarity moves to encounter pool weights, not location display flags.

### Activities map (legacy)

Same shape as the **exploration keys** inside **`commands`**. New configs should use **`commands`** only; loaders may copy exploration entries into **`activities`** for backward compatibility.

### Config example

```py
world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {
            "name": "River Town",
            "link": "https://discord.com/channels/…",
            "image": "https://…/river_town.png",
        },
        "oakwood": {
            "name": "Oakwood Forest",
            "biome": "forest",
            "commands": {
                "enc": ["forest"],
                "forage": ["forest"],
                "lumber": ["forest"],
                "mine": ["forest"],
                "loot": ["forest"],
            },
            "services": ["forest_guide"],
        },
    },
}
```

## Location encounter module *(separate workshop gvar)*

Place-specific encounter prose — jobs, shops, library scenes, unique exploration beats, and *(post-MVP)* dungeon hooks. **Not** stored on biome gvars.

**Pointer:** optional **`encounters_gvar_id`** on [Location](#location) — workshop UUID, lazy-loaded like biome bodies.

```py
# Owner workshop — e.g. oakwood_settlement_encounters.gvar
pools = {
    "enc": {
        "gather": [ encounter, … ],   # supplements biome — merged at roll time
    },
    "job": { "gather": [ encounter, … ] },
    "buy": { "gather": [ encounter, … ] },
    "library": { "gather": [ encounter, … ] },
    "craft": { "gather": [ encounter, … ] },
    # any activity enabled on this location's commands map
}
```

| Concern | Biome gvar | Location encounter gvar |
|---------|------------|---------------------------|
| Scope | Generic archetype (*a* forest) | Named place (*Oakwood Village*) |
| Activities | `enc`, `forage`, `mine`, `fish`, `lumber`, `hunt` only | Any command enabled on location — economy, crafting, content, plus optional **`enc`** supplements |
| Mechanics | Encounter outcomes only | Encounter prose only — **`shops`**, recipes, payout bands stay in config |
| Required? | Yes when location lists biome codes | Optional — omit **`encounters_gvar_id`** for config-only places |

Loader: [location_encounters.gvar](gvars/location_encounters.md). Design rationale: [biome-data-shape-investigation.md §4–6](biome-data-shape-investigation.md).

---

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

A **one-way route** from one location to another. Stored inline in **`world_data.paths`** or in the JSON gvar pointed to by **`world_data.paths_gvar_id`** — list of path dicts. Routing and display: [gvars/paths.md](gvars/paths.md).

```py
path = {
    "from": "oakwood",              # location id — origin
    "to": "oakwood_east",           # location id — destination
    "distance_miles": 24,           # optional — route length used for pathfinding cost
    "travel_hours": 8,              # optional — overrides distance-derived travel cost
    "requirements": {               # optional — transport / state gates
        "transport": "horse",       # or ["horse", "boat"] — see world_data.transport
    },
    "steps": [ journey_step, ... ], # one ordered list for this path only
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
| `distance_miles` | no | Approximate route distance. Used for route cost as `distance_miles / 12` when no more specific travel metric is set. |
| `travel_hours` | no | Approximate travel time. Used for route cost as `travel_hours / 4`. |
| `travel_steps` / `route_cost` | no | Explicit route-planning weights for special cases. These affect pathfinding, not player-facing journey steps. |
| `requirements` | no | `str → bool` — player/state must satisfy `True` keys |
| `cost` | no | Resource dict — `gold` → coinpurse; other keys → wallet currency **ids** ([Currency](#currency)) |
| `label` | no | Shown in journey planning UI |

### Journey step

One entry in **`path["steps"]`** — what the player does before advancing (`!travel next` or activity hook).

```py
# Run an exploration encounter using a biome pool code
{ "type": "encounter", "biome": "forest", "description": "Follow the old trail." }

# Run a specific exploration activity using a biome pool code
{ "type": "encounter", "activity": "forage", "biome": "forest" }

# Pay resources at this step
{ "type": "cost", "gold": 5 }

# Edge-case fallback / narrative-only hop
{ "type": "proceed", "description": "Follow the forest trail" }
```

**Encounter steps** map to `!enc <biome>` by default, or to `!<activity> <biome>` when `activity` is set. **Cost steps** represent a payment/resource requirement; the first travel/location slice displays them, and a later enforcement slice will deduct them when policy allows. Steps may include **`description`**; travel displays it beside the action. Author steps should be meaningful things players resolve; use `distance_miles`, `travel_hours`, `travel_steps`, or `route_cost` for route length. **Proceed** remains available for edge-case narrative-only legs and as the engine fallback when no actionable steps are configured.

### Requirements and parallel paths

**`requirements.transport`** gates **whether this path dict applies** for the traveller's available transport set. The default transport (usually `walk`), character cvar **`westmarch_travel_transport`** (JSON list), and explicit `!travel <destination> <transport...>` args combine into that set. A string requirement needs that one transport. A list requirement means **all listed transports are required**; use separate path entries when alternatives should be valid.

**`requirements`** may also gate faction, item, or narrative access (item gates deferred). Display **`label`** when access is narrative-only (not yet enforced).

### westmarch fields mapped

| westmarch `paths.gvar` | Generic |
|------------------------|---------|
| `from`, `to` (area names) | `from`, `to` (location **ids**) |
| `encs` list | `steps` with `{ "type": "encounter", "biome": … }` |
| `horse`, `boat` lists | Separate path dicts — `requirements.transport` + that list as `steps` |
| `gold` | `cost.gold` and/or `{ "type": "cost", "gold": N }` step |
| `label` | `label` |

### Config example

```py
world_data = {
    "paths": [
        {
            "from": "oakwood",
            "to": "oakwood_east",
            "distance_miles": 12,
            "travel_hours": 4,
            "steps": [
                { "type": "encounter", "biome": "forest" },
            ],
        },
        {
            "from": "oakwood",
            "to": "oakwood_east",
            "requirements": { "transport": "horse" },
            "distance_miles": 10,
            "travel_hours": 2,
            "steps": [
                { "type": "encounter", "biome": "road", "description": "Canter along the east trail" },
            ],
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

Used in **`!westmarch show`**, embed footers, and migration notes. The web config editor may warn when the engine documents a newer recommended schema and **`config_version`** is unset or below a documented minimum.

### `rules_version`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `rules_version` | `"2014"` \| `"2024"` | `None` | Optional **override** for which D&D 5e rules revision this config’s catalogues and mechanics assume |

**Resolution** — aliases call **`config.get_rules_edition()`**, not raw config:

1. **`rules_version`** on config gvar when set
2. Else Avrae guild/server rules when Drac2 exposes them
3. Else **`"2014"`**

When **`rules_version`** is set and differs from Avrae’s rules setting, the config override wins at runtime. The web config editor is the validation surface for mismatch warnings.

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
    "recipes": "<workshop-uuid>",
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
| **`recipes`** | [recipe.gvar](gvars/recipe.md) | Custom recipe catalogue |
| **`books`** | [library.gvar](gvars/library.md) | Custom book catalogue |

Values are **36-character workshop gvar UUID strings** only. Unknown keys → **warning**; bad UUID → **error** in the web config editor.

Each catalogue **`*.gvar`** checks command-specific catalogue config first, then **`config.get_config().extensions.<key>`** on first load; if set, **`get_gvar(uuid)`** and cache; else engine preset shards ([content-pipeline.md](content-pipeline.md)).

### `display` *(base layer)*

Branding and player-facing identity for **this westmarch world** — the **base** layer in [embed display inheritance](#embed-display-inheritance). Not Discord server metadata alone.

```py
display = {
    "name": "The Sword Coast Westmarch",     # world / campaign name → embed title when title unset
    "description": "Frontier expeditions from Neverwinter to the High Forest.",
    "image": "https://…/banner.png",       # optional — hero / embed image URL
    "logo": "https://…/logo.png",            # optional — thumbnail / icon URL
    "footer": ["Sword Coast Westmarch"],     # optional — fixed footer text(s) when policies.display.footer_behaviour is string
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
| `footer` | no | Static footer text, or list of texts to randomly choose from, when **`policies.display.footer_behaviour`** is **`string`**; may include `{world}` placeholder *(TBD in port)* |
| `link` | no | Discord invite or wiki — optional “world info” link in admin/show embeds; **not** merged into player command embeds |
| `colour` | no | Hex accent — **`#RRGGBB`** or **`RRGGBB`** (6 hex digits). Inherited unless overridden; omit for engine default |

**`colour` format:** case-insensitive hex only — no `0x` prefix. The web config editor reports invalid length or non-hex characters at **any** display layer. Aliases call **`display.get_display()`** once, then use the returned **`get_embed`** — [display.gvar](gvars/display.md).

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
    "footer": ["…"],                     # optional — fixed footer text(s) (string policy mode)
    "colour": "#5865F2",                 # optional — hex accent
}
```

| Field | Subsystem | Command | Notes |
|-------|-----------|---------|-------|
| `title` | yes | yes | Base layer supplies via **`display.name`** |
| `description` | yes | yes | Inherited |
| `image` | yes | yes | Inherited |
| `logo` | yes | yes | Inherited |
| `footer` | yes | yes | String, or list of strings to randomly choose from, used when **`footer_behaviour`** is **`string`**; see [Display policy](#display-policy) |
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

Each key under **`subsystems`** matches a **player-facing** alias folder (`exploration`, `travel`, …). The setup hub (**`!westmarch`**) is **not** in **`subsystems`** — always available to holders of Avrae aliasing roles ([gvars/auth.md](gvars/auth.md)), not config toggles.

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
| `monster_images` | `{ hunt, loot }` | `{ "hunt": "thumbnail", "loot": "thumbnail" }` | Where hunt embeds and initial loot-session embeds put available monster art: `"thumbnail"`, `"image"`, or `"off"` |
| `show_check_dcs` | `{ hunt, loot }` | `{ "hunt": True, "loot": True }` | Whether hunt/loot reveal the DC number in public check text |

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
| **`location`** | Inferred | `!<activity> [bonuses]` — biome from character location | **`subsystems.travel.enabled`**, **`travel.commands.location`**, **`world_data.locations`** or **`locations_gvar_id`**, **`journeys.gvar`** |

**`auto` effective mode:**

- **Inferred** when travel subsystem on, **`location`** command on, a location source exists, and character has a resolvable location.
- **Manual** otherwise — first positional arg must be a registered biome code.

**Location inference:** character location → resolved location entry → first biome in **`activities[activity]`**, else **`location.biome`**. Error if location unset or no biome for that activity. When **`subsystems.travel.config.location_biome_override`** is enabled, an exact registered biome code as the first arg (for example `!enc road`) overrides the inferred location biome.

**Manual inference:** first token of alias args → validate against **`world_data.biomes`**; help text lists codes from **`biomes.list_biomes(config)`**.

#### Encounter kind mix (`distribution_policy` + `distribution`)

Before picking a concrete encounter, **`encounter_lists`** + **[biomes.gvar](gvars/biomes.md)** choose a **kind**: **`combat`**, **`quest`**, or **`gather`**. **No d100 table** — kind is decided first from **`distribution`**, then one encounter is chosen uniformly at random from biome rows tagged **`activity.kind`**.

| `distribution_policy` | Behaviour |
|---------------------|-----------|
| **`random`** | Weighted pseudo-random draw each command — kind chosen independently using **`distribution`** percentages (PRNG). |
| **`balanced`** | Per-character kind counters in **[stats.gvar](gvars/stats.md)** **`wg_stats[<command>].kinds`**; next pick favours kinds **under** their target share so the session feels varied without streaks. Still uses **`distribution`** as the target mix — not uniform random. |

Both modes honour the same **`distribution`** percentages; only the selection algorithm differs.

The web config editor reports errors when:

- Any **`distribution`** value is not a non-negative integer
- Unknown keys in **`distribution`** (only **`combat`**, **`quest`**, **`gather`** allowed)
- Sum of **`distribution`** values ≠ **100**
- Invalid **`distribution_policy`** value

Warning when a kind has **> 0%** but no matching **`activity.kind`** rows for any biome referenced by enabled commands/locations.

Future activity clones (**forage**, **fish**, …) share the same kind-first pick and **`enc_biome_source`** policy — see [aliases/exploration/README.md](aliases/exploration/README.md).

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `repeat_exclude_window` | int | `5` | When **`subsystems.exploration.config.avoid_repeat_encounters`** is on — how many recent picks from **[stats.gvar](gvars/stats.md)** to consider when excluding duplicates |

#### Hunt / loot display

**`monster_images`** is keyed by command:

```py
"monster_images": {
    "hunt": "thumbnail",  # "thumbnail" | "image" | "off"
    "loot": "thumbnail",
}
```

When set to **`thumbnail`**, the command passes the monster catalogue **`image_url`** as the embed thumbnail. **`image`** uses the full embed image slot. **`off`** leaves command/display branding alone. Owner monster rows may use **`image_url`** or **`image`**. For **`loot`**, monster art is used only when a new loot session starts; active-session and loot-roll embeds do not repeat it.

**`show_check_dcs`** is also keyed by command:

```py
"show_check_dcs": {
    "hunt": True,
    "loot": True,
}
```

When **`False`**, the command still rolls against the same DC but prints generic check text such as **`Survival check`** or **`Investigation check`** without the numeric DC.

### `downtime.config`

Downtime tracking, acquisition, caps, labels, and schedule copy live here.

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

### `crafting.config`

Crafting subsystem wiring: rules override, recipe strategy, catalogue sources, optional checks/tools, and subsystem-wide output override.

```py
"crafting": {
    "config": {
        "rules_version": None,  # None → config.get_rules_edition()
        "recipe_mode": "mixed",
        "require_known_spell": True,
        "catalogues": {
            "items": "engine:catalogues/items",
            "potions": "engine:catalogues/potions",
            "spells": "engine:catalogues/spells",
            "magic_items": "engine:catalogues/magic_items",
            "recipes": None,
        },
        "checks": {
            "craft": {"mode": "none", "skill": None, "dc": None},
            "brew": {"mode": "none", "skill": "nature", "dc": None},
            "enchant": {"mode": "none", "skill": "arcana", "dc": None},
            "scribe": {"mode": "none", "skill": "arcana", "dc": None},
        },
        "tool_policy": {
            "scribe": {"mode": "off", "tools": ["Calligrapher's Supplies"]},
        },
        "item_handling": None,
    },
}
```

`recipe_mode` controls whether recipe data participates in crafting:

| Mode | Behaviour |
|------|-----------|
| `raw` | Ignore recipes entirely and use RAW baseline cost/workday tables. |
| `recipes` | Require a unique matching recipe; no recipe means the command stops. |
| `mixed` | Use a unique matching recipe when present, otherwise fall back to RAW. This is the default. |

`require_known_spell` controls the RAW scribing gate. When `True` (default), `scribe` requires the resolved spell name to appear in the character's Avrae spellbook before a scroll can be made. Set it to `False` only when the server tracks scroll eligibility outside Avrae. `subsystems.crafting.command_config.scribe.require_known_spell` can override it for the command.

Catalogue values may be an engine slug, a 36-character gvar UUID, an inline list, or an object like `{"gvar_id": "...", "include_engine": True}`. Required command catalogues:

| Command | Required catalogue |
| --- | --- |
| `craft` | `items` |
| `brew` | `potions` |
| `scribe` | `spells` |
| `enchant` | `magic_items` |

`checks.<command>.mode` can be `none`, `manual`, or `roll`. RAW defaults to `none`; `manual` prints a reminder, and `roll` uses `rolls.get_roll` with the configured `skill`, optional `ability`, optional `dc`, and `require_success` flag.

`tool_policy.<command>.mode` can be `off`, `manual`, or `check`. `check` can enforce `require_proficiency` through `tools.gvar` (`pTools` / `eTools`) and `require_kit` through the configured bag.

### `economy.config`

Subsystem-level defaults only when no per-command override exists. Prefer **`command_config`** for command-specific costs.

### `content.config`

Controls how **`!library`** builds **search topics** before matching the book catalogue. **`!read`** is unchanged — it searches by title/author, not topic policy.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `library_topic_source` | `"inferred"` \| `"balanced"` \| `"manual"` \| `"restricted"` | `"manual"` | How search topics are chosen for **`!library`** |
| `allowed_topics` | `[ str, … ]` | `[]` | Required when **`library_topic_source`** is **`restricted`** — whitelist of topic tokens players may search |
| `books` | list \| dict \| `None` | `None` | Optional content-local book source; **`world_data.books`** / **`world_data.book_gvar_ids`** preferred for world catalogues |

Access:

```py
cfg.subsystems.content.config.library_topic_source
cfg.subsystems.content.config.allowed_topics
cfg.subsystems.content.config.books
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

The web config editor reports errors when:

- Invalid **`library_topic_source`** value
- **`library_topic_source == "restricted"`** and **`allowed_topics`** missing or empty
- Unknown keys in **`content.config`** beyond documented fields *(warning in MVP if lenient)*

Warnings when:

- **`library_topic_source`** is **`inferred`** or **`balanced`** but **`travel.commands.location`** is off and no locations define **`library_topics`** *(location signal weakened)*
- **`content.commands.library`** on but book catalogue empty

### `travel.config`

Travel reads shared **`world_data.default_location`**, the configured location source, and the configured path source; these keys tune route display and biome/location behavior.

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `location_biome_override` | `bool` | `True` | In location-inferred exploration mode, an exact registered biome code as the first arg overrides the location biome. |
| `path_biome_policy` | `"from_location"` \| `"off"` | `"from_location"` | When enabled, path encounter step biomes should be listed on the path's origin location for that activity. |
| `transport_icons` | `{ transport_id: emoji }` | engine defaults | Icons shown once per path beside the route label when that path has transport requirements. |

### Other subsystems

Document **`config`** keys in each subsystem’s alias README when implemented. Empty **`config`** `{}` is valid; defaults fill missing keys only.

### Cross-subsystem validation

The web config editor reports errors when **`config`** requires another subsystem or **`world_data`** slice that is off or missing — e.g. `exploration.config.enc_biome_source == "location"` but **`travel.commands.location`** is disabled, or **`enc_biome_source == "auto"`** resolves to inferred while locations/travel prerequisites are missing *(warning only for auto — runtime falls back to manual)*.

Policy ↔ subsystem checks — [Policies MVP checklist](#policies-mvp-checklist) below.

---

## Command config

Per-command **durations and costs** live under **`subsystems.<subsystem>.command_config`**, keyed by command name (same keys as **`commands`**).

**Cooldowns** — seconds between successful uses; read by **`pc.check_cooldown(ch, command, config)`** from **[stats.gvar](gvars/stats.md)** **`last_used_at`**. **`0`** = no cooldown for that command (even when **`policies.*.enforce_cooldowns`** is **`True`**).

**Workday costs** — workdays spent on success when **`subsystems.downtime.config.mode == "tracked"`** and the command or recipe requires downtime.

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
        "craft":   { "cooldown_seconds": 0 },
        "brew":    { "cooldown_seconds": 0 },
        "scribe":  { "cooldown_seconds": 0, "rules_version": "2014" },
        "enchant": { "cooldown_seconds": 0, "resources": { "downtime": "manual" } },
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
| **`workdays_cost`** | int | `0` | Legacy/simple workday cost for commands that use it; crafting commands now prefer recipe/baseline `workdays` + resource policy |
| **`rules_version`** | `"2014"` \| `"2024"` | `None` | Crafting command override; default uses `config.get_rules_edition()` via crafting helper |
| **`resources`** | dict | `{}` | Per-command resource modes overriding `subsystems.crafting.config.resources` |
| **`item_handling`** | str \| dict | `None` | Per-command output override: `"manual"`, `"bags"`, or object with `mode`/bag names |
| **`consume_required_items`** | bool | command default | For crafting recipes, whether `required` items are consumed when item resources are `deduct` |
| **`require_known_spell`** | bool | inherited | Scribe-only override for the RAW spellbook gate |

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
| Is **`!downtime`** tracked in cvars? | **`subsystems.downtime.config.mode`** |
| Max workdays a PC can hold? | **`subsystems.downtime.config.max_workdays`** |
| Does **`!job`** use cooldown or workdays? | **`command_config.job`** — **`cooldown_seconds`** / **`workdays_cost`** |
| How long between **`!enc`** rolls? | **`command_config.enc.cooldown_seconds`** |
| Are cooldowns enforced at all for exploration? | **`policies.exploration.enforce_cooldowns`** |
| Avoid same encounter twice in a row? | **`subsystems.exploration.config.avoid_repeat_encounters`** |
| Roll monster HP in combat blocks? | **`policies.combat.roll_monster_hp`** |
| Must player have a character selected? | **`policies.auth.require_character`** |
| What does bare **`!westmarch`** check for each player? | **`policies.player_setup`** |
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
| **`crafting`** | ✓ | `resources`, `item_handling`, legacy `require_downtime_before_roll`, `auto_deduct_*` | resource mode validity; downtime checks need downtime tracking |
| **`economy`** | ✓ | `enforce_cooldowns`, `enforce_wallet_caps`, `starting_gold` | **`job`** cooldown; caps → **`currencies.*.max_balance`** |
| **`exploration`** | ✓ | `enforce_cooldowns`, `avoid_repeat_encounters` | repeat on → stats + encounter id in **`add_log`** |
| **`combat`** | ✓ | `scale_encounters_to_level` *(defer)*, `roll_monster_hp`, `scale_mode`, `max_cr_delta`, `min_cr` *(defer)* | scaling on → warn |
| **`quest`** | ✓ | `self_assign`, `max_active` | **`self_assign`** + quest encounters → **`misc.commands.quest`** on |
| **`inventory`** | schema | encumbrance, attunement, **`enforce_*`** | enforcement deferred; warn when enforce on |
| **`display`** | ✓ | `footer_behaviour`, `command_thumbnail`, tips, credits | invalid mode → error |
| **`player_setup`** | ✓ | `enabled`, `require_character`, `hud`, `checks` | check type/key/gates |
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
        "mode": "off",
        "max_workdays": None,
        "acquisition": "manual",
    },
    "crafting": {
        "require_downtime_before_roll": True,
        "auto_deduct_materials": False,
        "auto_deduct_gold": False,
        "resources": {
            "gold": "manual",
            "materials": "manual",
            "items": "manual",
            "downtime": "check",
            "spell_slot": "manual",
        },
        "item_handling": None,
    },
    "economy": {
        "enforce_cooldowns": True,
        "enforce_wallet_caps": False,
        "starting_gold": None,
    },
    "inventory": {
        "item_handling": {
            "mode": "manual",
            "default_bag": "Equipment",
            "equipment_bag": "Equipment",
            "crafted_bag": "Equipment",
            "potions_bag": "Potions",
            "scrolls_bag": "Scrolls",
            "magic_items_bag": "Equipment",
            "materials_bag": "Materials",
        },
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
        "command_thumbnail": "default",
        "helpful_tips": [],
        "credits": None,
    },
    "player_setup": {
        "enabled": True,
        "require_character": True,
        "hud": {
            "enabled": True,
            "fields": ["coinpurse", "wallet", "location"],
        },
        "checks": [],
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

Requires **`world_clock`** config data when `mode == "world_clock"` — the editor warns if missing.

### `auth`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `require_character` | bool | `True` | When **`True`**, player aliases fail early if no active Avrae character is selected |

Checked in **[auth.gvar](gvars/auth.md)** after config/channel gates (before alias body). Admin commands unaffected. westmarch reference: all exploration/economy/crafting commands assume a selected character.

### `player_setup`

Configures the player-facing bare **`!westmarch`** command. These checks do not block other aliases; they tell a player whether their selected character has the server-specific setup pieces that companion workshops expect.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enabled` | bool | `True` | When **`False`**, bare `!westmarch` skips player setup checks |
| `require_character` | bool | `True` | When **`True`**, bare `!westmarch` asks the user to select a character before checking |
| `hud` | dict \| list \| bool | see below | Controls the compact character HUD shown by bare `!westmarch` |
| `checks` | list[dict] | `[]` | Generic checks for cvars, uvars, svars, or custom counters |

Default HUD:

```py
"hud": {
    "enabled": True,
    "fields": ["coinpurse", "wallet", "location"],
}
```

Built-in HUD fields only render when their subsystem or command is enabled:

| Field | Requires | Value |
|-------|----------|-------|
| `coinpurse` | `subsystems.economy.enabled` | Avrae character coinpurse |
| `wallet` | `subsystems.economy.commands.wallet` | Configured `currencies` balances from `wg_wallet_<id>` cvars |
| `location` | `subsystems.travel.commands.location` | Character `wg_location`, resolved through the configured location source when possible |
| `time` | `subsystems.travel.commands.time` | Configured world calendar time |
| `weather` | `subsystems.travel.commands.weather` | Configured regional weather |

Custom HUD fields use the same storage readers as setup checks:

```py
{"type": "cvar", "key": "renown", "label": "Renown", "show_empty": True}
```

Each check:

| Key | Type | Meaning |
|-----|------|---------|
| `type` | `"cvar"` \| `"uvar"` \| `"svar"` \| `"cc"` | Storage surface to inspect; omitted means `"cvar"` |
| `key` | str | Required cvar/uvar/svar/custom counter name |
| `label` | str | Player-facing name in the status output |
| `message` | str | Player-facing fix, usually a companion workshop setup command |
| `equals` / `value` | scalar | Optional exact required value; omitted means any non-empty value passes |
| `one_of` | list | Optional accepted values |
| `invert` | bool | Optional reverse check |
| `when_subsystem` | str | Only check when the subsystem is enabled |
| `when_command` | `"subsystem.command"` | Only check when that command is enabled |

Example:

```py
policies = {
    "player_setup": {
        "enabled": True,
        "require_character": True,
        "hud": {"enabled": True, "fields": ["coinpurse", "wallet", "location"]},
        "checks": [
            {"type": "cvar", "key": "vsheet", "label": "vSheet", "message": "Run `!vsheet setup`."},
            {"type": "cvar", "key": "wg_downtime", "label": "Downtime", "message": "Run `!downtime setup`.", "when_subsystem": "downtime"},
        ],
    },
}
```

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
| `mode` | `"tracked"` \| `"manual"` \| `"off"` | `"off"` | Workday tracking |
| `max_workdays` | int \| `None` | `None` | Cap on accumulated workdays per character; **`None`** = unlimited |
| `acquisition` | `"manual"` \| `"world_clock"` \| `"journey"` | `"manual"` | How workdays are **granted** *(MVP: manual only; others reserved)* |

| `mode` | Behaviour |
|--------|-------------|
| **`tracked`** | **`!downtime`** + **`pc`** cvars active; commands with **`workdays_cost`** or recipes with **`workdays`** may debit when policies allow. Requires **`subsystems.downtime.enabled`**. |
| **`manual`** | **`!downtime`** can still show and adjust the player ledger, but other commands treat it as honour-system bookkeeping and do not block on cvar balance. |
| **`off`** | No downtime messaging or cvar use even if **`subsystems.downtime.enabled`**. |

| `acquisition` | Behaviour *(MVP)* |
|---------------|-------------------|
| **`manual`** | Only **`!downtime <amount>`** (or GM) changes balance. |
| **`world_clock`** | *(Deferred)* Grant workdays when in-world time advances by **`workday_hours`**. |
| **`journey`** | *(Deferred)* Grant workdays on journey step completion per path config. |

Labels and flavour (**`workday_hours`**, **`workweek_days`**) live in **`subsystems.downtime.config`** — [downtime.config](#downtimeconfig).

The web config editor reports errors when:

- **`mode == "tracked"`** and **`subsystems.downtime.enabled`** is **`False`**
- **`max_workdays`** is set and **`max_workdays < 1`**

**Warnings** when:

- Any enabled crafting command has downtime resource mode **`check`** or **`deduct`** but **`downtime.mode`** is not **`tracked`**
- Any enabled crafting command has **`workdays_cost > 0`** in **`command_config`** but downtime is not **tracked**
- **`acquisition`** is **`world_clock`** but **`policies.time.mode`** is not **`world_clock`**

### `crafting`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `resources.gold` | `"manual"` \| `"check"` \| `"deduct"` | `"manual"` | gp handling |
| `resources.materials` | `"manual"` \| `"check"` \| `"deduct"` | `"manual"` | recipe `consumed` item handling, usually from the materials bag |
| `resources.items` | `"manual"` \| `"check"` \| `"deduct"` | `"manual"` | recipe `required` item handling, usually base equipment |
| `resources.downtime` | `"manual"` \| `"check"` \| `"deduct"` | `"check"` | recipe/baseline workday handling |
| `resources.spell_slot` | `"manual"` \| `"check"` \| `"deduct"` | `"manual"` | scribe spell-slot handling |
| `item_handling` | str \| dict \| `None` | `None` | Subsystem-wide output override; per-command overrides win |
| `require_downtime_before_roll` | bool | `True` | Legacy compatibility; maps to downtime `check` when no explicit resources entry exists |
| `auto_deduct_materials` | bool | `False` | Legacy compatibility; maps materials/items to `deduct` when no explicit resources entry exists |
| `auto_deduct_gold` | bool | `False` | Legacy compatibility; maps gold to `deduct` when no explicit resources entry exists |

Resource modes:

| Mode | Behaviour |
|------|-----------|
| `manual` | Do not check or mutate; print what the player gained/costs. |
| `check` | Verify the character appears to have the resource; do not remove it. |
| `deduct` | Verify first, then spend/remove the resource before recording output. |

Workdays come from `recipe_mode`: `raw` uses only RAW baselines, `recipes` requires recipe rows, and `mixed` uses a unique recipe when present and otherwise falls back to RAW. **`cooldown_seconds`** on crafting commands is usually **`0`**; owners may add cooldowns for spam prevention.

westmarch reference: manual gp/downtime/material removal with messaging only. westmarch-generic keeps manual as the default but supports `check`/`deduct` policies.

**Check:** Any enabled crafting command whose resolved downtime resource mode is **`check`** or **`deduct`** should have **`downtime.mode == "tracked"`** and **`subsystems.downtime.enabled`**.

### `inventory.item_handling`

Controls what commands do with newly gained items.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `mode` | `"manual"` \| `"bags"` | `"manual"` | `manual` prints gained text; `bags` writes to the Bags cvar |
| `default_bag` | str | `"Equipment"` | Generic bag fallback |
| `equipment_bag` | str | `"Equipment"` | Existing/equipped base item bag |
| `crafted_bag` | str | `"Equipment"` | Mundane crafted item output |
| `potions_bag` | str | `"Potions"` | Brew output |
| `scrolls_bag` | str | `"Scrolls"` | Scribe output |
| `magic_items_bag` | str | `"Equipment"` | Enchant output |
| `materials_bag` | str | `"Materials"` | Recipe consumed-material source |

Crafting-specific `item_handling` overrides can appear at `subsystems.crafting.config.item_handling`, `subsystems.crafting.config.item_handling`, or `subsystems.crafting.command_config.<cmd>.item_handling`.

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

**MVP:** schema + editor warnings when any **`enforce_*`** is **`True`** until enforcement ships in **[pc.gvar](gvars/pc.md)** / buy / loot aliases.

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
| **`True`** | The editor warns until scaling ships |

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

Requires **`subsystems.misc.commands.quest`** enabled when **`self_assign`** is **`True`** — the editor reports an error otherwise.

**Check:** **`max_active`** set and **< 1** → **error**.

### `misc.commands`

Per-command toggles under **`subsystems.misc`**. MVP ships **`quest`** and **`recipe`** only; post-MVP adds **`diary`** and hub **`journal`**.

```py
"misc": {
    "enabled": True,
    "commands": {
        "quest": True,    # MVP — structured quest log
        "recipe": True,   # MVP — read-only recipe browser
        "diary": False,   # post-MVP — freeform RP journal
        "journal": False, # post-MVP — hub; !journal quest ≡ !quest
    },
},
```

**Hub auth:** **`!journal <sub>`** checks the **target** command’s toggle (e.g. **`quest`** for **`!journal quest`**). Bare **`!journal`** help requires **`journal`** enabled. See [aliases/misc/journal.md](../aliases/misc/journal.md).

### `content`

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `enforce_read_cooldowns` | bool | `False` | When **`True`**, **`!read`** deep-read uses **`command_config.read.cooldown_seconds`** |
| `enforce_library_cooldowns` | bool | `True` | When **`True`**, **`!library`** uses **`command_config.library.cooldown_seconds`** (default **120**) |

### Display policy

**Config path:** **`policies.display`**. Embed behaviour for player-facing commands — independent of **`display.footer`** static text on the config gvar. Implemented in **[display.gvar](gvars/display.md)** inside **`get_display()`**.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `footer_behaviour` | see below | `"balanced"` | How to populate the embed footer |
| `command_thumbnail` | `"default"` \| `"character"` | `"default"` | Whether command embed thumbnails use the configured logo/default logo or the selected PC image when available |
| `helpful_tips` | `[ str, … ]` | `[]` | Owner tips for **`helpful_tips`** mode; engine defaults used when empty |
| `credits` | `str` \| `None` | `None` | Override credits line for **`credits`** mode; `None` → engine default string |

`command_thumbnail: "character"` changes the default thumbnail passed by **`display.get_display()`**. A command that explicitly passes its own thumbnail, such as hunt/loot monster art, still wins for that embed response.

#### `footer_behaviour`

| Value | Footer content |
|-------|----------------|
| **`helpful_tips`** | One random string from **`helpful_tips`**, or engine default tips when the list is empty |
| **`string`** | Merged **`footer`** from [display inheritance](#embed-display-inheritance) (command → subsystem → base **`display.footer`**). If the merged value is a list, one non-empty text is chosen randomly. Falls back to merged **`title`**, then **`display.name`** |
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

The editor reports errors on unknown **`footer_behaviour`** values. It warns when **`footer_behaviour`** is **`string`** and no **`footer`** is set at any inheritance layer (runtime still falls back to title / world name).

### `languages`

Setting-wide **allowed languages** for mechanics that care about language lists (library Comprehend Languages, language-tagged books, inference from character languages, future RP gates).

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `allowed` | `[ str, … ]` | `[]` | Language names permitted in **this** westmarch (e.g. `"Common"`, `"Elvish"`, `"Dwarvish"`) |

| `allowed` | Behaviour |
|-----------|-----------|
| **Empty / omitted** | No restriction — use full language table for resolved **`rules_version`** ([core/languages](gvars/core.md)) |
| **Non-empty** | Only listed languages are treated as valid for setting checks; character languages **not** in the list may be ignored or flagged in library/comprehension flows |

Names should match Avrae / SRD display names for the active rules version. The editor warns when **`allowed`** contains entries unknown to the engine language table for **`get_rules_edition()`**.

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
