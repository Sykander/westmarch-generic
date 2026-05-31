# Misc — MVP implementation docs

**Config:** `subsystems.misc` · Tier H

Player utilities that are not exploration, travel, crafting, economy, or content.

## Commands

| # | Command | Doc | Phase | Source |
|---|---------|-----|-------|--------|
| 1 | **quest** | [quest.md](quest.md) | MVP | **new** — structured quest log |
| 2 | **recipe** | [recipe.md](recipe.md) | MVP | **new** — read-only recipe search |
| 3 | **diary** | [diary.md](diary.md) | post-MVP | **new** — freeform personal RP journal |
| 4 | **journal** | [journal.md](journal.md) | post-MVP | **new** — hub; routes to quest / recipe / diary |

### Hub pattern (post-MVP)

**`!journal`** is optional discoverability — not a replacement for top-level commands:

- **`!quest`** and **`!journal quest`** → same **[quests.gvar](../../gvars/quests.md)** output
- **`!recipe`** and **`!journal recipe …`** → same **[recipe.gvar](../../gvars/recipe.md)** output
- **`!diary`** and **`!journal diary …`** → same **`diary.gvar`** output *(when diary ships)*

Server owners enable each command independently via **`subsystems.misc.commands.*`**.

## Config *(MVP)*

```py
"misc": {
    "enabled": True,
    "commands": { "quest": True, "recipe": True },
},
```

## Config *(post-MVP additions)*

```py
"misc": {
    "enabled": True,
    "commands": {
        "quest": True,
        "recipe": True,
        "diary": True,
        "journal": True,
    },
},
```

## Related

- [crafting/README.md](../crafting/README.md) — **recipe** indexes crafting catalogues  
- [exploration/README.md](../exploration/README.md) — quest-weighted encounters; **`policies.quest.self_assign`**

## Other subsystems

| Folder | Config key | Commands |
|--------|------------|----------|
| [exploration/](../exploration/README.md) | `exploration` | enc, forage, fish, mine, lumber, hunt, loot |
| [travel/](../travel/README.md) | `travel` | travel, location, time, weather |
| [downtime/](../downtime/README.md) | `downtime` | downtime |
| [crafting/](../crafting/README.md) | `crafting` | craft, brew, enchant, scribe |
| [economy/](../economy/README.md) | `economy` | job, buy, sell, wallet |
| [content/](../content/README.md) | `content` | library, read |
| [admin/](../admin/README.md) | `admin` | westmarch (`setup`, `check`, `show`) |
| [gvars/](../../gvars/README.md) | — | config, auth, encounter engine |
