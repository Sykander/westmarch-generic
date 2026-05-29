# enchant — MVP implementation

**Subsystem:** crafting · **Toggle:** `SUBSYSTEMS.crafting.commands.enchant` · **Phase:** 1 (Tier E)

Fourth crafting port. Enchant **magic items** using Arcana check; DC from item **rarity** (same table as brew).

## Player-facing behaviour

```
!enchant <item> [bonuses]
```

- **Help:** requirements (base item, spells cast, ingredients, downtime — honour system), usage, salvage note.
- **Prerequisites:** Arcana prof or Jeweler's Tools; help mentions disadvantage if lacking tools to craft base item (not enforced in westmarch alias — document for future).
- **Roll:** Arcana check; DC from `CRAFT_RARITY_DC`.
- **Success:** add magic item to **Equipment** bag.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/crafting/enchant.alias` |
| Alias tests | `westmarch/src/aliases/crafting/enchant.alias-test` |
| Catalogue | `items.gvar` — `search_for_item(..., type_str="Magic Item")` |

Tools: Jeweler's Tools.  
Skills: Arcana (sheet prof OR tools).

Rarity → DC: same map as [brew.md](brew.md) (`CRAFT_RARITY_DC`); default fallback when rarity missing differs (`3d20kh1+20` in westmarch enchant vs `1d10+5` in brew).

## Generic architecture

Same pattern as [brew.md](brew.md); differences:

| Aspect | brew | enchant |
|--------|------|---------|
| Catalogue type | Potion | Magic Item |
| Skill / ability | nature / wis | arcana / default |
| Success bag | Potions | Equipment |
| Tools | 4 brewing kits | Jeweler's Tools |

Reuse **`crafting.gvar`** `dc_from_rarity` with per-command default DC override in config if needed.

## Prerequisites

- [brew.md](brew.md) — rarity DC path proven
- [scribe.md](scribe.md) — can land before or after enchant; no hard dependency
- Fixture **MAGIC_ITEMS_LIST** with `name`, `rarity`

## Implementation checklist

- [ ] **`enchant.alias`** from brew template
- [ ] Toggle `crafting.commands.enchant`
- [ ] Config magic item fixtures + shared `CRAFT_RARITY_DC`
- [ ] **`enchant.alias-test`** — help, prof gate, enchant smoke
- [ ] Tier E cluster complete — all four crafting commands in CI

## Tier E exit criteria

| Criterion | Status |
|-----------|--------|
| All four commands independently toggled | Required |
| Catalogues load from config gvar | Required |
| DC / cost tables config-driven | Required |
| Shared `crafting.gvar` avoids duplicate prof/DC logic | Required |
| **recipe** (Tier H) can index same catalogues | Follow-on |

## Related

- [scribe.md](scribe.md) — prior in doc sequence
- [README.md](README.md) — shared pipeline
- [../economy/buy.md](../economy/buy.md) — item names align with catalogues
