# Encounter templates

Encounter templates turn short compact rows into full encounter dictionaries.

Use templates when a pattern repeats. Avoid raw encounter dictionaries unless you need a shape the built-in templates cannot express.

## Compact row shape

```json
[pool_tags_or_null, "template_id", "arg 1", "arg 2"]
```

Example:

```json
[["enc.gather"], "skill_check", "Washed-out trail", "The road has collapsed into a muddy ditch.", "Wisdom (Survival)", 13]
```

## Built-in template families

| Template | Use |
|----------|-----|
| `flavour` / `story` | Narrative result without a mechanical reward |
| `skill_check` | Check-based scene |
| `saving_throw` | Save-based scene |
| `gather_item` | Check-gated item reward |
| `gold` | Gold reward |
| `healing` | Healing result |
| `damage` | Damage result |
| `combat` | Combat encounter |
| `ambush` | Combat with surprise/check flavor |
| `damage_combat` | Combat plus damage |
| `quest` | Quest hook or lead |
| `raw` | Literal encounter dictionary |

The editor should show template fields and previews where it can.

## Template arguments

Arguments are positional. That means order matters.

For example, `gather_item` expects:

```text
name, description, check_name, dc, item_name, total, optional bag
```

So this row:

```json
[["forage.gather"], "gather_item", "Mooncap patch", "Pale caps grow under a fallen log.", "Wisdom (Survival)", 14, "Mooncap", 1, "Materials"]
```

means:

- title: Mooncap patch
- check: Wisdom (Survival) DC 14
- reward: 1 Mooncap
- bag: Materials

## Custom templates

Create a custom template only when:

- the same raw structure appears many times;
- a built-in template cannot express the desired logic;
- the server maintainer is comfortable maintaining Drac2/Python-like config code;
- the editor can still validate or preview enough of the result.

Prefer adding data rows over adding template code.

## Next guides

- [Encounters](encounters.md)
- [Biomes](biomes.md)
- [Validation](validation.md)
