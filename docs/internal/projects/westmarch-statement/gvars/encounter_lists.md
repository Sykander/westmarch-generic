# encounter_lists.gvar

**Path:** `src/gvars/encounters/encounter_lists.gvar` · **Phase:** 0–1

Build encounter lists from config biome pools and pick **one encounter** for an activity command (**enc**, **forage**, …). Ports westmarch `encounter_lists.gvar`.

## API *(planned)*

```py
def get_encounter(biome, activity, character, config):
    """
    Resolve biome → pick encounter kind → pick concrete encounter dict.
    Uses config.subsystems.exploration.config for distribution_policy + distribution.
    """
```

Legacy westmarch name **`get_encounter_list`** may remain for “all encounters in pool”; aliases call **`get_encounter`** for the single-roll path.

## Kind selection

Reads **`config.subsystems.exploration.config`**:

| Key | Role |
|-----|------|
| **`distribution_policy`** | `"random"` — weighted PRNG per roll; `"balanced"` — adjust for per-character kind history |
| **`distribution`** | `{ "combat": int, "quest": int, "gather": int }` — must sum to 100 |

After kind is chosen, filter biome pool entries where **`encounter["kind"]`** matches (or inferred kind). Pick one entry at random within that subset; error if subset empty.

**Balanced mode:** engine cvar (e.g. `westmarch_enc_kind_history`) stores recent kinds; selection weights deficit vs target **`distribution`**.

## Pool shape

Owner config — per-biome lists keyed by activity (`enc_encounters`, `forage_encounters`, …). Each entry is an [encounter](../data-shapes.md#encounter-input) dict; set **`kind`** explicitly when inference is ambiguous.

## Related

- [encounters.md](encounters.md) — run chosen encounter
- [data-shapes.md § exploration.config](../data-shapes.md#explorationconfig)
- [aliases/exploration/enc.md](../aliases/exploration/enc.md)
