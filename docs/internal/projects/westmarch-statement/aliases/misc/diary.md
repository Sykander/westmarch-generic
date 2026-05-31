# diary — post-MVP personal RP journal

**Subsystem:** misc · **Toggle:** `subsystems.misc.commands.diary` · **Phase:** post-MVP

**Greenfield** — freeform player-authored RP notes in character cvar storage. Distinct from:

- **`!quest`** — structured quest log buckets ([quest.md](quest.md))
- **`!recipe`** — read-only crafting catalogue lookup ([recipe.md](recipe.md))

westmarch had a dedicated **`diary`** command; westmarch-generic defers it post-MVP in favour of a clean split plus optional **[journal](journal.md)** hub.

## Player-facing behaviour *(outline)*

```
!diary                       # recent entries or help
!diary add <text>            # append freeform note
!diary <entry_id|n>          # view one entry
```

Storage: character cvar JSON — engine **[diary.gvar](../../gvars/diary.md)**. No server config tables required for initial shape; optional display labels later.

## Hub parity

When **[journal](journal.md)** ships, **`!journal diary`** / **`!journal diary add …`** must call the same **`diary.gvar`** helpers as **`!diary`**.

## Config

```py
"misc": {
    "commands": {
        "diary": True,
    },
},
```

Independent of **`quest`** and **`recipe`** toggles.

## Related

- [journal.md](journal.md) — optional hub
- [quest.md](quest.md) — structured quest log
- [mvp-commands.md](../../mvp-commands.md) — deferred past MVP
