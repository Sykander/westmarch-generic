# Travel

Route planning and character travel state for the travel subsystem.

## Usage

```text
!travel
!travel <location>
!travel <location> [transport-id...]
!travel <location> track
!travel next
!travel reset yes
!travel set <location> yes
```

Optional route flags are configured transport ids or aliases from
`world_data.transport`, such as `horse`, `cart`, `boat`, `ship`, `fly`, or
`portal`. They add to the default transport. Players can set persistent
availability with `!cvar westmarch_travel_transport ["fly", "walk", "swim"]`.

`!travel` shows the current location and active journey. Destinations are looked
up through `locations.search_locations`, so player input follows the standard
0 / 1 / many result shape: no match, one match, or a short "be more specific"
match list.

`track` and `journey` persist a planned route to `wg_journey`. `next` advances
one route step and updates `wg_location` when a path leg completes.

On arrival, the current-location view includes local jobs. Visible shop trade
prices are controlled by `subsystems.travel.config.show_shops_on_travel`.
`show_arrival_time` and `show_arrival_weather` append compact arrival notes when
the corresponding `time` or `weather` command is enabled.

## Config

Enable with:

```py
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True, "time": True, "weather": True},
        "config": {
            "route_priority": "least_encs",
            "show_arrival_time": True,
            "show_arrival_weather": True,
            "show_shops_on_travel": True,
            "combat_add_prompt": "madd_commands",
        },
    },
}
```

Requires `world_data.default_location`, `world_data.locations`, and
`world_data.paths` for route planning. `world_data.transport` is optional for
old configs, but recommended for named travel modes. Paths may use the generic
shape:

`route_priority` controls route scoring: `least_encs` (default),
`least_travel_time`, `least_cost`, or `custom` with numeric `route_weights`
such as `encounter`, `proceed`, `travel_hours`, `gold`, `rations`, and `leg`.
Combat encounter follow-up is controlled by `combat_add_prompt`: `madd_commands`
prints copyable `!i madd` commands, `combat_hint` points at `!combat`, and `off`
hides the follow-up.

```py
{
    "from": "river_town",
    "to": "oakwood",
    "requirements": {"transport": "horse"},
    "steps": [{"type": "encounter", "biome": "forest"}],
}
```

The engine also accepts westmarch import shorthand (`encs`, `horse`, `boat`,
`gold`) for parity during migration.

When `requirements.transport` is a list, every listed transport is required.
Use separate path entries for alternatives.
