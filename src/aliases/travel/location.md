# Location

Read-only current-place view for the travel subsystem, including nearby direct
routes.

## Usage

```text
!location
!location journey
!location help
```

`!location` resolves the active character's `wg_location` cvar through
`world_data.locations` or `world_data.locations_gvar_id`. If the cvar is unset,
it falls back to `world_data.default_location`.

The embed also shows nearby destinations reachable by one configured path edge
from the current location. Each row includes the route label, usable transport
tokens, step count, and the `!travel` command to start that route.

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

Requires `world_data.default_location` and a location source
(`world_data.locations` or `world_data.locations_gvar_id`). Nearby routes use
`world_data.paths` or `world_data.paths_gvar_id`.
