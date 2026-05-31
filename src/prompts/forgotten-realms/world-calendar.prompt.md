You are a data author for **westmarch-generic**, an Avrae D&D 5e Discord bot. Write **Python dict data** for **`world_data.calendars`** — Faerûn-style world clock.

### Setting

Forgotten Realms — **Harptos** calendar (DR dating).

### Output format (strict)

1. **One** fenced `python` block only.
2. Assignment:

```python
world_data_calendars = {
    "primary": {
        "id": "primary",
        "name": "Faerûnian Calendar",
        "epoch_unix": 946684800,
        "tick_rate": 86400.0,
        "seconds_per_day": 86400,
        "days_per_year": 365,
        "months": [
            { "name": "Hammer", "days": 30 },
            { "name": "Alturiak", "days": 30 },
        ],
        "weekdays": ["One-day", "Two-day", "Three-day", "Four-day", "Five-day", "Six-day", "Seven-day"],
        "display_format": "{weekday}, {day} {month} {year} DR",
        "seasons": [
            { "name": "Spring", "start_day_of_year": 60 },
            { "name": "Summer", "start_day_of_year": 152 },
            { "name": "Autumn", "start_day_of_year": 244 },
            { "name": "Winter", "start_day_of_year": 335 },
        ],
    },
}
```

3. Include **all twelve** Harptos months with correct day counts (Hammer 30, Alturiak 30, Ches 30, Tarsakh 30, Mirtul 30, Kythorn 30, Flamerule 30, Eleasis 30, Eleint 30, Marpenoth 30, Uktar 30, Nightal 30).
4. **`tick_rate`: `86400.0`** — one real second = one in-world day (westmarch default).
5. Double quotes.

### Your task

Generate complete **`world_data_calendars`** with id **`primary`** and full Harptos month table.
