# Encounters

Encounters are configured events chosen by exploration, travel, or location-specific pools.

They can show narrative text, ask for rolls, start combat, award items or gold, apply damage or healing, or trigger quest hooks.

## Encounter pools

Encounter rows can live in:

| Source | Best for |
|--------|----------|
| Biome gvar | Reusable environment content |
| Location `encounters` | Small place-specific pools |
| Location `encounters_gvar_id` | Larger place-specific pools |

## Pool tags

Pool tags decide which command and kind can use a row.

Examples:

| Tag | Meaning |
|-----|---------|
| `enc.combat` | Combat result for `!enc` |
| `enc.quest` | Quest hook for `!enc` |
| `enc.gather` | Gather-style result for `!enc` |
| `forage.gather` | Gather result for `!forage` |
| `fish.gather` | Gather result for `!fish` |
| `mine.gather` | Gather result for `!mine` |
| `lumber.gather` | Gather result for `!lumber` |

## Kinds

Exploration usually chooses a kind first:

- `combat`
- `quest`
- `gather`

Then it picks one matching row from the relevant biome and location pools.

Configure the mix under:

```py
subsystems = {
    "exploration": {
        "config": {
            "distribution_policy": "random",
            "distribution": {"combat": 25, "quest": 25, "gather": 50},
        },
    },
}
```

## Compact rows

Most rows should use a built-in template:

```json
[["enc.gather", "forage.gather"], "gather_item", "Wild herbs", "You find useful herbs.", "Wisdom (Survival)", 12, "Herbs", 1]
```

Read this as:

1. This row can appear for `enc.gather` and `forage.gather`.
2. Use the `gather_item` template.
3. Pass title, description, check, DC, item name, and quantity.

## Safe authoring rules

- Give important encounters stable names.
- Put reusable environment content in biome gvars.
- Put named quest hooks in location encounter pools.
- Use templates before raw encounter dictionaries.
- Keep rewards small until item/currency policies are tested.
- Run the editor preview and Check page before publishing.

## Smoke commands

```text
!enc <biome>
!forage <biome>
!location
!travel next
```

Use location-inferred commands without a biome only when travel/location state is configured.

## Next guides

- [Biomes](biomes.md)
- [Encounter templates](encounter-templates.md)
- [Policies](policies.md)
- [Validation](validation.md)
