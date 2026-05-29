# brew — MVP implementation

**Subsystem:** crafting · **Toggle:** `SUBSYSTEMS.crafting.commands.brew` · **Phase:** 1 (Tier E)

Second crafting port. Brew **potions** using Nature (Wisdom) or brewing tool proficiency; DC from potion **rarity**.

## Player-facing behaviour

```
!brew <potion> [bonuses]
```

- **Help:** requirements, usage, salvage note (honour system).
- **Prerequisites:** recipe + ingredients + downtime removed manually; **Nature** skill prof **or** brewing-related tool in `pTools`/`eTools`.
- **Roll:** Nature check, Wisdom ability; DC from `CRAFT_RARITY_DC`.
- **Success:** add potion to **Potions** bag.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/crafting/brew.alias` |
| Alias tests | `westmarch/src/aliases/crafting/brew.alias-test` |
| Catalogue | `items.gvar` — `search_for_item(..., type_str="Potion")` |

Tools: Herbalism Kit, Poisoner's Kit, Brewer's Supplies, Alchemist's Supplies.  
Skills: Nature (sheet prof OR tools from cvar).

Rarity → DC (move to config `CRAFT_RARITY_DC`):

| Rarity | DC dice |
|--------|---------|
| common | 1d6+4 |
| uncommon | 1d10+5 |
| rare | 2d12kh1+10 |
| very rare | 2d20kh1+15 |
| legendary | 3d20kh1+20 |

## Generic architecture

Same pattern as [craft.md](craft.md); differences:

| Aspect | craft | brew |
|--------|-------|------|
| Catalogue type | `Item` | `Potion` |
| DC source | gp value band | `item.rarity` |
| Skill / ability | sleightOfHand / con | nature / wis |
| Success bag | Equipment | Potions |
| Prof gate | tools only | tools **or** Nature prof |

Reuse **`crafting.gvar`**: `require_proficiency(cfg, "brew", ch)`, `dc_from_rarity(cfg, rarity)`.

## Prerequisites

- [craft.md](craft.md) — `items.gvar` + `crafting.gvar` skeleton
- Fixture **POTIONS_LIST** with `name`, `rarity`

## Implementation checklist

- [ ] **`brew.alias`** from generic craft template
- [ ] Toggle `crafting.commands.brew`
- [ ] Config `CRAFT_RARITY_DC` + potion fixtures
- [ ] **`brew.alias-test`** — help, prof gate, potion smoke
- [ ] Help lists tools/skills from config when overridden

## Exit criteria

Same per-command checks as [craft.md](craft.md).

## Related

- [craft.md](craft.md) — prior port
- [scribe.md](scribe.md) — next in sequence
