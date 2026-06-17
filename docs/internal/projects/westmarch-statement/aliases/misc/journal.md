# journal — post-MVP hub command

**Subsystem:** misc · **Toggle:** `subsystems.misc.commands.journal` · **Phase:** post-MVP

**Parent alias** for misc player utilities — help and routing only. Does **not** duplicate engine logic; subcommands call the same gvars as standalone aliases ([quest.md](quest.md), [recipe.md](recipe.md), [diary.md](diary.md)).

## Design

| Standalone | Hub equivalent | Same behaviour when target command enabled |
|------------|----------------|---------------------------------------------|
| **`!quest`** | **`!journal quest`** | Quest log list / detail / add |
| **`!recipe`** | **`!journal recipe …`** | Recipe search / detail |
| **`!diary`** | **`!journal diary …`** | Personal RP notes *(when diary ships)* |

**Parity rule:** **`!quest`** and **`!journal quest`** must produce the same output — shared **[quests.gvar](../../gvars/quests.md)** helpers only (aliases cannot call other aliases).

## Player-facing behaviour *(outline)*

```
!journal                     # help — list enabled subcommands
!journal quest               # same as !quest
!journal quest add …         # same as !quest add …
!journal recipe rope         # same as !recipe rope
!journal diary               # same as !diary (post-MVP)
```

## Config and auth

Each target command has its **own** toggle under **`subsystems.misc.commands.*`**. Server owners enable only what they want:

```py
"misc": {
    "enabled": True,
    "commands": {
        "quest": True,
        "recipe": True,
        "diary": False,
        "journal": True,
    },
},
```

**Hub routing auth:** **`!journal <sub>`** checks the **target** command’s toggle (e.g. **`quest`** for **`!journal quest`**), not a separate hub-only gate — so **`journal`** can stay off while **`!quest`** still works.

Bare **`!journal`** (help only) requires **`subsystems.misc.commands.journal`** enabled.

**[auth.gvar](../../gvars/auth.md)** — register **`journal`** and pass the resolved canonical target command into **`is_allowed(command)`**.

## Sourcemap layout *(planned)*

```
src/aliases/journal/
  journal.alias      # parent — help + dispatch
  quest.alias        # optional sub-alias (or inline dispatch in parent)
  recipe.alias
  diary.alias
```

Prefer **one parent** that **`using()`** shared gvars and branches on first arg if Avrae sub-alias count is costly.

## Related

- [README.md](README.md) — MVP vs post-MVP misc commands
- [quest.md](quest.md) · [recipe.md](recipe.md) · [diary.md](diary.md)
- [westmarch.md](../admin/westmarch.md) — prior art for setup hub pattern
