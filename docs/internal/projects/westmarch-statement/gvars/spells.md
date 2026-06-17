# spells.gvar

**Path:** `src/gvars/utils/catalogues/spells/spells.gvar`

Spell catalogue facade for `!scribe`. Engine defaults come from `spells_list.gvar.json`; servers can override with `subsystems.crafting.config.catalogues.spells`, `world_data.catalogues.spells`, or `extensions.spells`.

## API

```py
spells.catalogue_entries(cfg)
spells.resolve(cfg, "Fireball")
spells.search(cfg, "Fireball")
spells.name_matches(cfg, "fire")
spells.match_error("fire", matches)
spells.spell_name(spell)
spells.spell_level(spell)
spells.spell_school(spell)
```

Resolution uses `lists.search_list_by_key` and follows the standard 0 / 1 / many result shape.
