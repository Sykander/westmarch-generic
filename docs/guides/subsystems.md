# Subsystems and command toggles

Subsystems decide which command families exist on your server.

## Mental model

Each subsystem has:

- `enabled`: turns the whole family on or off;
- `commands`: turns individual commands on or off;
- `config`: feature-specific behavior;
- `command_config`: per-command cooldowns or costs;
- optional `display` and `command_display` overrides.

Example:

```py
subsystems = {
    "exploration": {
        "enabled": True,
        "commands": {
            "enc": True,
            "forage": True,
            "fish": False,
            "mine": False,
            "lumber": False,
            "hunt": False,
            "loot": False,
        },
        "config": {
            "enc_biome_source": "auto",
            "distribution_policy": "random",
            "distribution": {"combat": 25, "quest": 25, "gather": 50},
        },
    },
}
```

## Safe enabling order

| First enable | Needs |
|--------------|-------|
| `location` | `world_data.default_location` and at least one location |
| `travel` | locations and paths |
| `enc` / gathering | biome registry and usable encounter rows |
| `buy` / `sell` | shops and stock |
| `wallet` | currencies |
| crafting commands | catalogues, policies, optional downtime |
| `library` / `read` | books or book gvars |
| `quest` | quest journal policy and/or quest encounter outcomes |

Enable a command only when the data it needs exists.

## `config` vs `policies`

Use subsystem `config` for feature wiring:

- exploration biome source;
- travel route display;
- economy location checks;
- crafting recipe mode.

Use `policies` for table-wide enforcement choices:

- cooldown enforcement;
- downtime resource handling;
- quest self-assignment;
- error embed behavior;
- player setup checks.

## Smoke test pattern

For every enabled command:

1. Check the editor.
2. Publish.
3. Run `!westmarch show`.
4. Run the command with one normal example.
5. Run one bad lookup to confirm the error message is useful.

## Next guides

- [Policies](policies.md)
- [World data](world-data.md)
- [Troubleshooting](troubleshooting.md)
