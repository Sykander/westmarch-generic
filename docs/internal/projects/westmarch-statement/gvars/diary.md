# diary.gvar

**Phase:** post-MVP · **Command:** **`!diary`** · **Toggle:** `subsystems.misc.commands.diary`

Freeform personal RP journal — character cvar storage. Distinct from **[quests.gvar](quests.md)** (structured quest log).

## API *(outline)*

```py
def load_diary(ch):
    """Return diary dict from character cvar."""

def save_diary(ch, diary):
    """Persist diary cvar."""

def append_entry(ch, text):
    """Add freeform note. Returns (success, message)."""

def format_list_embed(diary, config):
def format_entry_embed(diary, entry_id, config):
```

## Hub

**[journal alias](../aliases/misc/journal.md)** — **`!journal diary`** calls the same helpers as **`!diary`**.

## Related

- [aliases/misc/diary.md](../aliases/misc/diary.md)
- [quests.md](quests.md) — quest log
- [mvp-commands.md](../mvp-commands.md) — deferred past MVP
