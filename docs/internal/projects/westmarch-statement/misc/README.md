# Misc — MVP implementation docs

**Config:** `SUBSYSTEMS.misc` · Tier H

Player utility commands that are not exploration, travel, crafting, economy, or content.

## Commands

| # | Command | Doc | Source |
|---|---------|-----|--------|
| 1 | **quest** | [quest.md](quest.md) | **new** — quest journal |
| 2 | **recipe** | [recipe.md](recipe.md) | **new** — read-only recipe search |

## Config

```py
"misc": {
    "enabled": True,
    "commands": { "quest": True, "recipe": True },
},
```

## Related

- [crafting/README.md](../crafting/README.md) — **recipe** indexes crafting catalogues  
- [exploration/README.md](../exploration/README.md) — quest-weighted encounters deferred in activity pipeline

## Other subsystems

| Folder | Config key | Commands |
|--------|------------|----------|
| [exploration/](../exploration/README.md) | `exploration` | enc, forage, fish, mine, lumber, hunt, loot |
| [travel/](../travel/README.md) | `travel` | travel, location, time, weather |
| [downtime/](../downtime/README.md) | `downtime` | downtime |
| [crafting/](../crafting/README.md) | `crafting` | craft, brew, enchant, scribe |
| [economy/](../economy/README.md) | `economy` | job, buy, sell |
| [content/](../content/README.md) | `content` | library, read |
