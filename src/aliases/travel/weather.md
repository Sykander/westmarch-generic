Shows configured regional weather.

```text
!weather
!weather <area>
```

Weather areas are configured under `world_data.weather.by_area`. With no area argument, the command uses the selected character's current location when that location has `weather_area`, `area_code`, `biome`, or an `enc` activity area.

Configured under: `subsystems.travel.commands.weather`
