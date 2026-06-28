# Server setup

How to run **westmarch-generic** on your Avrae bot: subscribe to the engine workshop, create a **config gvar**, and wire the **`westmarch_config`** svar.

For architecture and config schema detail, see [internal westmarch-statement](internal/projects/westmarch-statement/server-config.md) (maintainers) and [mvp-commands](internal/projects/westmarch-statement/mvp-commands.md).

---

## Prerequisites

- Avrae bot on your Discord server
- **Dragonspeaker** or **Server Aliaser** — Avrae aliasing permissions to edit workshop aliases, gvars, and svars (required to set svars and run `!westmarch setup` / `!westmarch show`). Not the same as being campaign GM or DM.
- An Avrae workshop slot for your server’s config gvar

---

## Quick path

1. **Subscribe** to the westmarch-generic engine workshop on [Avrae Workshop](https://avrae.io/dashboard/workshop).
2. **Create** a config gvar — duplicate a [starter or preset](internal/projects/westmarch-statement/gvars/configs.md), use the [Westmarch config editor](https://sykander.github.io/westmarch-generic/), or paste via `!gvar editor`.
3. **Set svar** — `!svar westmarch_config <your-gvar-uuid>`
4. **Enable** subsystems in your config gvar (`subsystems.exploration.enabled`, etc.).
5. **Verify** — use the editor **Check** page, then run `!westmarch show`

In Discord you can also run **`!westmarch setup`** for step-by-step embeds (when the engine is deployed).

Need help? Join the [Westmarch Generic Discord](https://discord.gg/ZAkJ44489G) to ask setup questions and compare notes with other server owners.

---

## 1 — Subscribe to the engine

Add the **westmarch-generic** workshop to your bot’s subscribed workshops in the Avrae dashboard. You only need **one** engine subscription — shared helpers ship inside that workshop (not a separate drac2-tools subscription).

Until the public workshop is published, maintainers may self-deploy from this repo ([DEVELOPMENT.md](../DEVELOPMENT.md)).

---

## 2 — Create your config gvar

Your **config gvar** is a workshop module in **your** workshop. It holds toggles, world data, and catalogues — not engine command logic.

**Recommended:** create a new gvar, open the editor, and paste from one of:

- [src/gvars/configs/starter.gvar](../src/gvars/configs/starter.gvar) — minimal schema, all subsystems off
- **Example presets** — Forgotten Realms, generic fantasy, or Spelljammer ([configs doc](internal/projects/westmarch-statement/gvars/configs.md))

You can edit exported or pasted config bodies in the [Westmarch config editor](https://sykander.github.io/westmarch-generic/). After your `westmarch_config` svar exists, use `?westmarch_config=<your-gvar-uuid>` to prefill the gvar id.

```text
!gvar create # westmarch config
!gvar editor <uuid-from-response>
```

When published workshop UUIDs exist for a preset, duplicate that gvar in the Avrae dashboard instead of pasting by hand.

## Example config presets

Optional starting worlds (duplicate into your workshop, then set **`westmarch_config`**). Source files: `src/gvars/configs/` — details in [internal configs doc](internal/projects/westmarch-statement/gvars/configs.md).

| Preset | Setting | Set Avrae rules to |
|--------|---------|-------------------|
| Forgotten Realms (2014) | Sword Coast travel, time, weather, and FR tone | **2014** |
| Forgotten Realms (2024) | FR lore; 2024 tables | **2024** |
| Generic fantasy (2014) | Setting-neutral | **2014** |
| Generic fantasy (2024) | Setting-neutral; 2024 tables | **2024** |
| Spelljammer (2014) | Wildspace / spelljamming | **2014** |

Published workshop UUIDs for each preset will be listed here when available.

---

## 3 — Wire the svar

Point this Discord server at your config gvar:

```text
!svar westmarch_config <your-gvar-uuid>
```

| Item | Value |
|------|--------|
| **Svar name** | `westmarch_config` (fixed) |
| **Value** | 36-character gvar UUID only — not Python or JSON |

**Swap** to another config (season, staging world):

```text
!svar westmarch_config <other-uuid>
```

**Remove** configuration:

```text
!svar delete westmarch_config
```

---

## 4 — Enable subsystems

Edit your config gvar. Set `subsystems.<name>.enabled` to `True` and turn on individual commands under `commands.*` where applicable.

Example — exploration only:

```py
"exploration": {
    "enabled": True,
    "commands": { "forage": True, "enc": False, ... },
    "config": {
        "enc_biome_source": "auto",
        "distribution_policy": "random",
        "distribution": {"combat": 25, "quest": 25, "gather": 50},
    },
},
```

Downtime uses a single toggle: `"downtime": {"enabled": True}`.

Crafting needs command toggles plus catalogue wiring. Engine catalogues are available as generic defaults; replace them with your own gvar UUIDs or inline lists when your server has custom items, potions, spells, magic items, or recipes.

```py
subsystems = {
    "crafting": {
        "enabled": True,
        "commands": {"craft": True, "brew": True, "scribe": True, "enchant": True},
        "config": {
            "rules_version": None,  # None uses config.get_rules_edition()
            "recipe_mode": "mixed",  # raw, recipes, or mixed
            "require_known_spell": True,  # RAW scribing gate; set False if tracked elsewhere
            "catalogues": {
                "items": "engine:catalogues/items",
                "potions": "engine:catalogues/potions",
                "spells": "engine:catalogues/spells",
                "magic_items": "engine:catalogues/magic_items",
                "recipes": None,
            },
            "checks": {
                "scribe": {"mode": "none", "skill": "arcana", "dc": None},
            },
            "tool_policy": {
                "scribe": {"mode": "off", "tools": ["Calligrapher's Supplies"]},
            },
        },
        "command_config": {
            "scribe": {"rules_version": "2024"},
        },
    },
}

policies = {
    "crafting": {
        "resources": {
            "gold": "manual",
            "materials": "manual",
            "items": "manual",
            "downtime": "check",
            "spell_slot": "manual",
        },
    },
    "inventory": {
        "item_handling": {
            "mode": "manual",  # or "bags"
            "crafted_bag": "Equipment",
            "potions_bag": "Potions",
            "scrolls_bag": "Scrolls",
            "magic_items_bag": "Equipment",
            "materials_bag": "Materials",
        },
    },
}
```

Recipe modes are `raw`, `recipes`, or `mixed`. RAW does not require crafting rolls; set a command check mode to `manual` or `roll` only if your server wants that gate. Scribing checks the character spellbook by default; set `require_known_spell` to `False` only when your server tracks scroll eligibility outside Avrae. Players can use `!scribe <spell> -i` for feature-granted spells that Avrae does not expose as known spells or usable slots; this bypasses only the known-spell and spell-slot checks. Tool policy modes are `off`, `manual`, or `check`. Crafting resource modes are `manual`, `check`, or `deduct`. Item output modes are `manual` or `bags`.

Travel/location example:

```py
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True, "time": True, "weather": True},
        "config": {
            "location_biome_override": True,
            "path_biome_policy": "from_location",
            "show_arrival_time": True,
            "show_arrival_weather": True,
            "show_shops_on_travel": True,
            "transport_icons": {"walk": "🚶", "fly": "🪽", "horse": "🐎", "boat": "⛵"},
        },
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest", "commands": {"enc": ["forest"]}},
    },
    "paths": [
        {
            "from": "river_town",
            "to": "oakwood",
            "distance_miles": 12,
            "travel_hours": 4,
            "steps": [{"type": "encounter", "biome": "forest"}],
        },
    ],
}
```

Travel combines the default transport with any transport args on `!travel <destination> ...`. Players can set persistent availability with a JSON cvar, for example `!cvar westmarch_travel_transport ["fly", "walk", "swim"]`.

Use `distance_miles` or `travel_hours` for route length. Keep `steps` for meaningful things players resolve, such as encounters, costs, hazards, or special activities; `proceed` is mainly an edge-case fallback.

Large maps can be split into JSON gvars and referenced from the config:

```py
world_data = {
    "default_location": "waterdeep",
    "locations_gvar_id": "<locations-json-gvar-uuid>",
    "paths_gvar_id": "<paths-json-gvar-uuid>",
}
```

For large route graphs, store path JSON as `{"paths_by_from": {"location_id": [path, ...]}}` so travel commands can read only the paths leaving the current location.

The web editor may display shipped world-data presets as `engine:configs/...` aliases while
editing; generated/exported config bodies use runtime gvar UUIDs unless you generate owner gvars.

`time` needs `world_data.calendars`; `weather` needs `world_data.weather.by_area`. When `show_arrival_time` or `show_arrival_weather` is true, `!travel next` appends those notes when the character arrives somewhere. Use `show_shops_on_travel` to control whether bare `!travel` and arrival output include local shop price tables.

Economy setup needs top-level data before enabling player commands:

```py
subsystems = {
    "economy": {
        "enabled": True,
        "commands": {"job": True, "buy": True, "sell": True, "wallet": False},
        "config": {
            "job_location_policy": "warn",  # off, warn, or check
            "jobs": [
                {"id": "dock_work", "name": "Dock Work", "skills": ["athletics", "perception"]},
            ],
        },
    },
}

currencies = {
    "shards": {"name": "Arcane Shard", "plural": "Arcane Shards"},
}

shops = {
    "general": {
        "id": "general",
        "name": "General Store",
        "accepts_sells": True,
        "stock": [
            {"item": "Rope, Hemp (50 ft)", "price": {"gold": 1}},
        ],
    },
}
```

`!wallet` needs `currencies`. `!buy` and `!sell` need `shops`, and `!sell` needs at least one shop with `accepts_sells: True`. Location rows still use boolean availability (`"commands": {"job": True, "buy": True, "sell": True}`); named job rows live under `subsystems.economy.config.jobs`.

Quest setup is mostly data-driven. To try quest-flavoured exploration, add quest-tagged encounter rows to a biome pool such as `enc.quest`; to use `policies.quest.self_assign`, also enable `subsystems.misc.commands.quest` so the quest journal command is available.

Add world data (`locations`, encounter pools, shops, …) as you enable each vertical. Shapes: [data-shapes](internal/projects/westmarch-statement/data-shapes.md).

If you enable a subsystem that expects another workshop, subscribe that companion too. Exploration rewards can add recovered items to character bags, so pair exploration loot/gathering with your server’s preferred **Bags** alias workshop.

---

## 5 — Verify

Use the [Westmarch config editor](https://sykander.github.io/westmarch-generic/) **Check** page before publishing or pasting config changes. The editor is the source of truth for config validation.

After publishing, run:

```text
!westmarch show
```

`show` summarizes the config that the engine loaded; it does not validate. Then try a smoke command for an enabled subsystem (e.g. `!forage` once pools exist).

Players can run:

```text
!westmarch
```

Once `westmarch_config` is set, the bare command checks that the selected character meets the server’s configured player setup checks.
It can also show a compact character HUD for enabled subsystems, such as Coinpurse, configured wallet currencies, location, time, and weather.

Configure those checks with `policies.player_setup`:

```py
policies = {
    "display": {
        "command_thumbnail": "character",  # optional: command embeds use the selected PC image when available
    },
    "player_setup": {
        "enabled": True,
        "require_character": True,
        "hud": {
            "enabled": True,
            "fields": ["coinpurse", "wallet", "location"],
        },
        "checks": [
            {"type": "cvar", "key": "vsheet", "label": "vSheet", "message": "Run `!vsheet setup`."},
            {"type": "cvar", "key": "wg_downtime", "label": "Downtime", "message": "Run `!downtime setup`.", "when_subsystem": "downtime"},
        ],
    },
}
```

---

## What players see when something is off

| State | Typical message |
|-------|-----------------|
| **`westmarch_config` unset** | Server not configured — a Dragonspeaker or Server Aliaser must set the svar |
| **Svar set but config invalid** | Use the web editor Check page before publishing; command errors stay feature-specific |
| **Subsystem or command disabled in config** | This feature is disabled on this server |
| **Enabled but missing world data** | Command-specific error (e.g. no encounter pool for biome) |

Disabling a feature uses **`subsystems.*.enabled`** or **`commands.*`** in your config gvar — you do **not** need a separate svar per feature.

---

## Rules edition (2014 vs 2024)

Set optionally on your config gvar:

```py
rules_version = "2014"   # or "2024"
```

**Resolution order:** **`rules_version`** on config (if set) → Avrae server rules → **`"2014"`**. Aliases use **`config.get_rules_edition()`** — see [data-shapes](internal/projects/westmarch-statement/data-shapes.md#rules_version).

If **`rules_version`** disagrees with Avrae’s setting, the config value wins at runtime. The editor Check page is where validation guidance should live.

Also set **`display.name`** and related fields for world branding — per-subsystem **`display`** / **`command_display`** and **`policies.display.footer_behaviour`** optional — [data-shapes § display](internal/projects/westmarch-statement/data-shapes.md#display) · [§ Embed display inheritance](internal/projects/westmarch-statement/data-shapes.md#embed-display-inheritance).

---

## Companion workshops

Good companions for many westmarch-generic servers:

| Workshop | Why use it |
|----------|------------|
| **vSheet / Verbose Character Tools** | Sheet/class/subclass automation ([workshop](https://avrae.io/dashboard/workshop/5f7385fe647bb0a416316d1d)) |
| **Bags** | Inventory visibility; exploration rewards can add items to bags ([workshop](https://avrae.io/dashboard/workshop/6296b723c964982e890e5315)) |
| **Notes** | Recipes, quest notes, journals, and reminders ([workshop](https://avrae.io/dashboard/workshop/6342ac449fb55be1a501367c)) |
| **Targeting Assist** | Combat targeting helpers; choose [2014](https://avrae.io/dashboard/workshop/69811ff8d67be6e3d7232edb) or [2024](https://avrae.io/dashboard/workshop/63fe7c97caaad20bc4903309) |
| **Map Utilities** | Required if your server config uses maps ([workshop](https://avrae.io/dashboard/workshop/5f6a4623f4c89c324d6a5cd3)) |
| **Tools** | Subscribe when crafting is configured to require tools ([workshop](https://avrae.io/dashboard/workshop/630b0e39b85ea38890666c08)) |
| **Optional flow helpers** | [Combat Options 2014](https://avrae.io/dashboard/workshop/64000c538b440f92d9975fab), [Auto](https://avrae.io/dashboard/workshop/617805d1137cd863517bc42c), [Initiative Utilities](https://avrae.io/dashboard/workshop/5f88d637f2d59b2718721a9a), [!qb](https://avrae.io/dashboard/workshop/600c00b9a2be999cfcb21a85) |
| **Optional table extras** | [Potions](https://avrae.io/dashboard/workshop/65adf56c81896a704c651239), [Resting Revised](https://avrae.io/dashboard/workshop/66dcb7c52d6128334efd1c43), [Play Games](https://avrae.io/dashboard/workshop/605cb7331e2241970bbf0f30), [Riptide Shortcuts](https://avrae.io/dashboard/workshop/60069282052554a14d397617), [Bard Workshop](https://avrae.io/dashboard/workshop/638f5e434dbab671607f33a5), [Emotes](https://avrae.io/dashboard/workshop/692625378316717c4a511557), [Drinking](https://avrae.io/dashboard/workshop/6378f00016eb2e36c259169a) |

---

## Related

- [Documentation index](README.md)
- [DEVELOPMENT.md](../DEVELOPMENT.md) — contributors and self-deploy
- [assets/](../assets/) — example TSV catalogues
