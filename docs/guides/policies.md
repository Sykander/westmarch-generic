# Policies

Policies are table-wide behavior choices. They are not command toggles and they are not world data.

Use policies to answer questions like:

- Should commands require a selected character?
- Should cooldowns be enforced?
- Should crafting check or deduct resources?
- Should quest encounters add themselves to the quest journal?
- Should error embeds auto-delete?
- What does bare `!westmarch` check for players?

## Common policy areas

| Policy | Use |
|--------|-----|
| `auth` | Require selected character for player commands |
| `time` | Manual time vs world-clock behavior |
| `travel` | Route costs and rations |
| `downtime` | Workday tracking mode |
| `crafting` | Resource check/deduct/manual modes |
| `inventory` | Bag output and reserved encumbrance/attunement settings |
| `economy` | Job cooldowns, wallet caps, starting gold |
| `exploration` | Cooldowns and repeat encounter avoidance |
| `combat` | Combat HP display and reserved scaling settings |
| `quest` | Quest self-assignment |
| `content` | Library/read cooldown behavior |
| `display` | Footer, thumbnails, and error embeds |
| `player_setup` | Bare `!westmarch` checklist and HUD |
| `languages` | Setting-valid language list |

## Recommended defaults

For a first server:

```py
policies = {
    "auth": {"require_character": True},
    "time": {"mode": "manual"},
    "travel": {"apply_path_costs": False, "consume_rations": False},
    "exploration": {"enforce_cooldowns": True, "avoid_repeat_encounters": "off"},
    "quest": {"self_assign": False},
    "display": {
        "footer_behaviour": "balanced",
        "error_embeds": {"auto_delete": True, "timeout_seconds": 60},
    },
}
```

Start manual. Add enforcement only when staff know how they want disputes and edge cases handled.

## Resource policy modes

Crafting resource modes usually mean:

| Mode | Meaning |
|------|---------|
| `manual` | Show the cost or result, but do not check or mutate character state |
| `check` | Require the character to appear to have the resource, but do not spend it |
| `deduct` | Check first, then spend or remove it |

Use `manual` when a server tracks resources outside Avrae. Use `deduct` only when your bag/cvar setup is reliable.

## Player setup policy

`policies.player_setup` controls the bare `!westmarch` player checklist. It does not block other commands.

Use it for setup reminders such as:

- run `!vsheet setup`;
- create a Bags inventory;
- initialize downtime;
- show wallet/location HUD fields.

## Check page notes

The editor should warn when a policy depends on data or commands that are not enabled. For example:

- quest self-assignment needs the `quest` command;
- tracked downtime needs downtime enabled;
- wallet caps need currencies with max balances;
- world-clock time needs calendars.

## Next guides

- [Subsystems](subsystems.md)
- [Display and branding](display.md)
- [Player setup](player-setup.md)
- [Validation](validation.md)
