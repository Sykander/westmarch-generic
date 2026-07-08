# Glossary

Definitions for westmarch-generic terms as they are used in this project.

## Core Setup

| Term | Meaning |
|------|---------|
| Engine | The reusable Avrae workshop code in this repo: aliases, helper gvars, generated catalogues, and shared command behavior. |
| Server config | The server-owned data that decides which systems are enabled and what world data the engine uses. |
| Config gvar | The Avrae gvar that stores a server's westmarch-generic config. It belongs to the server owner or maintainer, not to the engine workshop. |
| `westmarch_config` | The fixed server svar name whose value is the config gvar UUID for this Discord server. |
| Svar | Avrae server variable. In this project, svars are server-level pointers or settings, most importantly `westmarch_config`. |
| Gvar | Avrae global variable. Gvars hold workshop code, config modules, JSON data, catalogues, or other reusable data. |
| Cvar | Avrae character variable. westmarch-generic uses cvars for character-specific state such as location, journals, stats, or setup checks. |
| Uvar | Avrae user variable. Uvars are user-level state and are used only where a feature explicitly calls for user-scoped data. |
| Workshop | An Avrae package of aliases, snippets, and gvars that a server can subscribe to. |
| Starter config | A shipped example config that can be copied or used as a starting point. Examples include the minimal starter and Forgotten Realms 2014. |
| Preset | A fuller starter config for a specific style or world. Presets are examples, not hidden server state. |
| Editor | The static web config editor for loading, checking, editing, exporting, and publishing server config gvars. |
| Check page | The editor validation surface. Use it before publishing config changes or setting `westmarch_config`. |

## Config Shape

| Term | Meaning |
|------|---------|
| `subsystems` | Top-level config section that turns major feature areas on or off, such as exploration, travel, economy, crafting, content, downtime, or misc. |
| Command toggle | A `subsystems.<name>.commands.<command>` setting that enables or disables one player command inside an enabled subsystem. |
| Subsystem config | A `subsystems.<name>.config` block for feature-specific behavior, such as exploration biome source or travel route display. |
| `policies` | Top-level config section for house rules and enforcement choices. Policies describe what the engine enforces and what remains manual. |
| `display` | Top-level config section for shared world branding on command embeds, such as name, colour, footer, logo, and thumbnail. |
| Command display | Per-command or per-subsystem display overrides for command-specific embed titles, colours, images, or footer behavior. |
| `rules_version` | Optional config setting for D&D rules edition. When omitted, the engine falls back to Avrae server rules, then `"2014"`. |
| `world_data` | Top-level config section for geography and world-facing data: locations, paths, transport, calendars, weather, books, shops, and biome registry entries. |
| Extension gvar | A separate owner gvar used for large data, such as locations, paths, books, monsters, recipes, or custom biome rows. |
| Engine preset source | A shorthand such as `engine:configs/biomes/forest` that points to shipped engine data while editing or exporting supported presets. |

## World Data

| Term | Meaning |
|------|---------|
| Location | A specific place in the world. Locations can have names, descriptions, services, shops, library topics, activities, encounter pools, and paths to other locations. |
| Location id | Stable config key for a location, such as `waterdeep` or `silverymoon`. Engine internals use ids even when players type display names. |
| Path | A one-way route from one location id to another. Paths can define distance, travel time, transport requirements, costs, and journey steps. |
| Route | The full pathfinding result between a character's current location and a destination. A route may include several paths. |
| Journey | A character's active travel state while progressing along a route with commands such as `!travel next`. |
| Transport | A configured travel method such as walk, horse, ship, boat, fly, or portal. Paths can require one or more transport ids. |
| Calendar | World time model used by `!time` and optional travel arrival output. |
| Weather area | A named weather table or forecast source assigned to locations. |
| Shop | Configured seller or buyer used by economy commands such as `!buy` and `!sell`. |
| Service | Location-facing activity or shop-like offering that can appear in location or travel output. |
| Currency | A configured non-gold wallet unit for `!wallet` and economy outcomes. Avrae sheet coinpurse gold is separate. |

## Exploration And Encounters

| Term | Meaning |
|------|---------|
| Biome | A reusable activity basis for exploration content. A location can point to a biome so commands like `!enc` or `!forage` know which generic pool to use. |
| Biome registry | The `world_data.biomes` map that gives each biome id a display name and gvar source. |
| Biome gvar | A separate JSON gvar containing reusable encounter rows for one biome. Biome gvars are for generic wilderness-style content. |
| Encounter | A configured event chosen by exploration, travel, or location-specific pools. Encounters can show text, roll checks, start combat, give rewards, or trigger quest hooks. |
| Encounter pool | A collection of encounter rows that a command can choose from. Pools can live in biome gvars, inline location data, or location encounter gvars. |
| Location encounter | Place-specific encounter content attached to one location. Use this for local quest hooks, named places, or content that should not appear in every forest or road. |
| Encounter kind | High-level category chosen before the final encounter row. Common kinds are `combat`, `quest`, and `gather`. |
| Pool tag | A tag such as `enc.combat`, `enc.quest`, `enc.gather`, or `forage.gather` that says which command and kind can use an encounter row. |
| Encounter template | A reusable builder that turns a compact row into a full encounter dictionary. Templates keep common encounter shapes short and consistent. |
| Compact encounter row | A JSON array where the first value is pool tags, the second value is a template id, and the remaining values are template arguments. |
| Encounter outcome | A configured effect from an encounter, such as gold, item, currency, damage, healing, or quest activation. |
| Encounter context | Runtime data passed while resolving an encounter, such as character, rolls, args, activity, biome, location, and config. |
| Quest hook | Encounter data that can activate or update a quest journal entry when quest self-assignment is enabled. |

## Publishing And Ownership

| Term | Meaning |
|------|---------|
| Export | Generate a config gvar body from the editor for manual copy, download, or handoff. |
| Publish | Use the editor and a user-supplied Avrae token to update an accessible gvar through Avrae's API. |
| Avrae token | User credential used for optional browser-side gvar read or publish. It should not be placed in shared URLs or exported files. |
| Server configurator | A person with enough Avrae permissions to create gvars, edit gvars, set svars, and run setup/show commands. |
| Dragonspeaker | Avrae permission role that can manage aliases, gvars, and svars. |
| Server Aliaser | Avrae permission role for managing server aliases and related setup. |
