# Travel

Route planning and character travel state for the travel subsystem.

## Usage

```text
!travel
!travel <location>
!travel <location> <transport-id>
!travel <location> track
!travel next
!travel reset yes
!travel set <location> yes
```

Optional route flags are configured transport ids or aliases from
`world_data.transport`, such as `riding_horse`, `boat`, or `ship`. Legacy
`horse` still works when the config keeps it as an id or alias.

`!travel` shows the current location and active journey. Destinations are looked
up through `locations.search_locations`, so player input follows the standard
0 / 1 / many result shape: no match, one match, or a short "be more specific"
match list.

`track` and `journey` persist a planned route to `wg_journey`. `next` advances
one route step and updates `wg_location` when a path leg completes.

## Config

Enable with:

```py
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}
```

Requires `world_data.default_location`, `world_data.locations`, and
`world_data.paths` for route planning. `world_data.transport` is optional for
old configs, but recommended for named travel modes. Paths may use the generic
shape:

```py
{
    "from": "river_town",
    "to": "oakwood",
    "requirements": {"transport": "riding_horse"},
    "steps": [{"type": "encounter", "biome": "forest"}],
}
```

The engine also accepts westmarch import shorthand (`encs`, `horse`, `boat`,
`gold`) for parity during migration.
