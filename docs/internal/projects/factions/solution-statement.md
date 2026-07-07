# Factions solution statement

## Recommendation

Add a config-owned `factions` catalogue and one player-facing `!faction` hub command in a later release.

The first implementation should be deliberately small:

- owners define factions in config;
- players can list, search, view, join, leave, and inspect their standing;
- membership state is stored on the character;
- other systems can read a shared requirement shape later.

Do not ship this in `1.0.0`. Track the work on the `2.x.x` roadmap unless the final design is strictly additive.

## Target config shape

Use a top-level `factions` catalogue so organizations can be referenced by world, economy, content, quest, and downtime systems without pretending they are only locations.

```py
subsystems = {
    "factions": {
        "enabled": False,
        "commands": {
            "faction": False,
        },
        "config": {
            "membership_cvar": "wg_factions",
            "default_join_policy": "approval",
        },
    },
}

factions = {
    "harpers": {
        "name": "The Harpers",
        "description": "A semi-secret network of informants and adventurers who oppose tyranny and hidden threats.",
        "visibility": "public",
        "join_policy": {"mode": "approval"},
        "ranks": [
            {"id": "ally", "name": "Ally", "renown": 0},
            {"id": "agent", "name": "Agent", "renown": 3},
        ],
        "locations": ["waterdeep"],
        "tags": ["good", "information", "spies"],
    },
}
```

This shape is illustrative. Final implementation should follow the repo's config parser and editor constraints.

## Command surface

Prefer one top-level alias at first:

| Command                  | Behavior                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| `!faction`               | Show the character's faction status and brief help                |
| `!faction list`          | List visible factions                                             |
| `!faction <name>`        | Show one faction by id/name/alias search                          |
| `!faction join <name>`   | Join directly or create a pending membership based on join policy |
| `!faction leave <name>`  | Leave a faction when allowed                                      |
| `!faction renown <name>` | Show standing, rank, and next threshold                           |
| `!faction help`          | Explain configured behavior                                       |

Admin or moderator actions can be added behind the same alias once the state model is proven:

- `!faction approve <name>`;
- `!faction promote <name>`;
- `!faction demote <name>`;
- `!faction renown <name> <delta>`;
- `!faction set <name> <rank-or-renown>`.

The exact admin permission check should reuse the existing auth pattern and should be documented before implementation.

## Membership state

Use a character cvar by default, such as `wg_factions`, storing JSON-compatible data:

```json
{
  "harpers": {
    "status": "active",
    "rank": "ally",
    "renown": 1,
    "joined_at": 1717286400
  }
}
```

Character-local state fits the current Avrae model and avoids pretending the config gvar can be a mutable roster.

Known limitations:

- cross-character or account-wide faction membership needs a separate design;
- approval workflows may need a player confirmation step, a moderator command run by the character owner, or manual GM handling;
- server-wide rosters are non-MVP unless a storage mechanism is chosen.

## Shared requirement shape

Other systems should be able to express faction requirements without duplicating logic:

```py
"requirements": {
    "factions": [
        {"id": "harpers", "rank": "agent"},
        {"id": "lords_alliance", "renown": 2},
    ]
}
```

Initial integrations can be read-only:

- shops can show faction-gated stock;
- quests can require or reward faction standing;
- libraries can reveal faction collections;
- locations can list local faction presence;
- downtime/crafting services can require faction status.

Do not wire every integration in the first factions slice. Build the helper API and one or two representative integrations first.

## Editor and validation

The web editor should eventually support:

- faction catalogue editing;
- join policy controls;
- rank/renown table editing;
- validation of duplicate ids and invalid thresholds;
- validation of references from locations, shops, quests, libraries, and requirements;
- Check-page guidance when the faction command is enabled without faction data.

## Compatibility

The feature must be additive:

- existing `1.0.0` configs remain valid;
- `subsystems.factions` defaults to disabled when absent;
- no existing subsystem should require factions;
- Forgotten Realms faction examples belong in the Forgotten Realms config, not the generic engine.
