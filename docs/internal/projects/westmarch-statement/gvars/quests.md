# quests.gvar

**Path:** `src/gvars/utils/misc/quests.gvar` · **Phase:** 1 (Tier H)

**Quest journal** cvar storage for **`!quest`** — list, view, append player notes. Greenfield (no westmarch player command).

## API

```py
def load_journal(ch):
    """Return quest journal dict from character cvar."""

def save_journal(ch, journal):

def list_quests(journal, config, filter="active"):
    """Filter by status / config categories."""

def get_quest(journal, quest_id_or_name):

def append_entry(ch, config, quest_id, text):
    """Add journal line under quest. Returns (success, message)."""

def activate_from_encounter(ch, config, quest_id, title=None, category=None):
    """When policies.quest.self_assign — create or activate quest from encounter outcome."""

def format_list_embed(journal, config):
def format_quest_embed(journal, quest_id, config):
```

Journal shape *(illustrative)*:

```py
{
    "quests": {
        "main_001": {
            "title": "Find the lost relic",
            "category": "main",
            "status": "active",
            "entries": [ { "text": "...", "at": unix_ts }, ... ],
        },
    },
}
```

Config **`quests`** may supply categories, display labels, optional template quests — not player write path.

Future: encounter outcome **`type: quest`** calls **`activate_from_encounter`** when **`policies.quest.self_assign`** — [encounters.md](encounters.md).

## Related

- [aliases/misc/quest.md](../aliases/misc/quest.md)
