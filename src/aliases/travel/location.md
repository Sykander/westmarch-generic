# Location

Read-only current-place view for the travel subsystem.

## Usage

```text
!location
!location journey
!location help
```

`!location` resolves the active character's `wg_location` cvar through
`world_data.locations`. If the cvar is unset, it falls back to
`world_data.default_location`.

`!location journey` appends the active `wg_journey` summary when one is being
tracked.

## Config

Enable with:

```py
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"location": True},
    },
}
```

Requires `world_data.default_location` and `world_data.locations`.
