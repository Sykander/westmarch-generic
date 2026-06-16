# Example server configs (`src/gvars/configs/`)

**Path:** `src/gvars/configs/` · **Phase:** 1+ *(content grows with ported verticals)*

**Example config gvar bodies** — full or partial **server world modules** checked into the repo for alias-tests, CI fixtures, and server owners who want a prefab starting point.

These are **not** engine code. Do not confuse with:

| Path | Role |
|------|------|
| **`src/gvars/utils/config/`** | Engine **`config.gvar`** — `get_config()`, defaults merge, svar loader |
| **`src/gvars/configs/biomes/`** | Engine **preset biome gvar bodies** — referenced via **`engine:configs/biomes/<code>`** |
| **`src/gvars/configs/`** | **Server data** — toggles, **`world_data`**, catalogues for a specific setting |
| **`src/gvars/configs/starter.gvar`** | Minimal empty schema — all subsystems off, no world data |

At runtime, the owner’s **`westmarch_config`** svar points at **their** workshop copy of one of these bodies (or a fork). The engine never hard-codes which preset is active.

---

## Purpose

1. **Testing** — `.varfile.json` / `.alias-test` fixtures load a known config UUID or inline module derived from a preset file.
2. **Onboarding** — owners duplicate a published workshop gvar or paste from repo instead of authoring from [starter.gvar](../../../../src/gvars/configs/starter.gvar) alone.
3. **Parity** — reference westmarch extraction can target a preset (e.g. Forgotten Realms 2014) as the canonical migration fixture.
4. **Documentation** — worked examples of [data-shapes.md](../data-shapes.md) in a coherent world.

Presets ship in the **same westmarch-generic repo** as source; workshop UUIDs for each preset are listed in [docs/setup.md](../../../../docs/setup.md) when published (one slot per preset in sourcemaps, same pattern as engine gvars).

**Bulk content authoring:** copy-paste prompts for external LLMs live in [`src/prompts/`](../../../../src/prompts/README.md). Full build guide: [prompt-generation/](../../prompt-generation/README.md) (locations → paths → shops → biomes → …). Generate there → validate → paste into Cursor for repo integration.

---

## Planned presets

Each file is one Draconic module (`.gvar`) — same shape as an owner config gvar. **Rules edition is not a config field**; each preset is **authored for** either 2014 or 2024 table data. The server owner must set Avrae’s rules setting to match ([solution-statement.md § Rules edition](../solution-statement.md#rules-edition-2014-vs-2024)).

| File *(planned)* | Setting | Intended rules | Summary |
|------------------|---------|----------------|---------|
| **`forgotten_realms_2014.gvar`** | Forgotten Realms | **2014** | Sword Coast–style FR names, factions, and tone; catalogues and DC bands aligned to 2014 SRD-era tables |
| **`forgotten_realms_2024.gvar`** | Forgotten Realms | **2024** | Same FR identity as 2014 preset where lore allows; spells, skills, and item lists aligned to 2024 revised rules |
| **`generic_fantasy_2014.gvar`** | Generic fantasy | **2014** | Setting-neutral placeholders — no FR-specific proper nouns; usable for homebrew worlds without retagging lore |
| **`generic_fantasy_2024.gvar`** | Generic fantasy | **2024** | Same as generic 2014 structurally; 2024-aligned catalogues and mechanics |
| **`spelljammer_2014.gvar`** | Spelljammer | **2014** | Wildspace / spelljamming ports, astral routes, and setting-appropriate locations; **2014 only** (no 2024 Spelljammer preset planned) |

### Setting guidelines *(authoring)*

**Forgotten Realms** — Realms-recognizable place names, organizations, and adventure hooks where licensing and table comfort allow; document any non-SRD sources in preset header comments. Prefer extraction from reference westmarch data where it is already FR-flavoured.

**Generic fantasy** — Replace setting-specific strings with neutral labels (`"river_town"`, `"border_fort"`). Same **`subsystems`** tree and data shapes as FR presets so owners can diff and swap flavour.

**Spelljammer** — Locations and travel emphasise ports, crystal spheres, and wildspace routes; **`world_clock`** / **`weather`** may differ from ground-based FR presets. Single 2014 preset unless a 2024 table product is adopted later.

### Optional metadata *(top-of-file comments only)*

Presets may document intent in a module docstring — **not** as engine-read keys unless added to schema deliberately later:

```py
"""Example config — Forgotten Realms, 2014-aligned catalogues.

Duplicate into your workshop; point !svar westmarch_config at your UUID.
Set rules_version = "2014" (or omit and rely on Avrae / engine default).
"""
```

Do **not** add ad-hoc top-level keys beyond [data-shapes.md § Top-level config fields](../data-shapes.md#top-level-config-fields) unless formally adopted in schema docs.

---

## Layout *(planned)*

```
src/gvars/configs/
  README.md
  starter.gvar                   # minimal schema — all subsystems off
  biomes/                        # preset JSON row-list bodies — engine:configs/biomes/<code>
    README.md
    biome_forest.gvar            # … (planned)
  forgotten_realms_2014.gvar
  forgotten_realms_2024.gvar
  generic_fantasy_2014.gvar
  generic_fantasy_2024.gvar
  spelljammer_2014.gvar
```

**Status:** Folder and files are **planned** — content lands incrementally as subsystems port (exploration rows first, then travel, catalogues, etc.). Early Phase 0 tests may use **`src/gvars/configs/starter.gvar`** or a thin slice of **`generic_fantasy_2014.gvar`** only.

---

## Sourcemaps and deploy

Example configs get **workshop gvar slots** in dev/prod sourcemaps when ready to publish (UUIDs from **`unused_gvars.md`**). They are **not** listed in engine **`env.gvars`** — the engine loader does not `using()` them.

| Consumer | How preset is used |
|----------|-------------------|
| **Server owner** | Duplicate published preset in Avrae workshop → `!svar westmarch_config <uuid>` |
| **Alias-tests** | `.varfile.json` references preset UUID or embeds minimal excerpt |
| **`!westmarch setup`** | Links to preset list in [docs/setup.md](../../../../docs/setup.md) |
| **CI** | Fixture config for subsystem tiers (document which preset exercises which vertical) |

---

## Growth order *(suggested)*

1. **`generic_fantasy_2014.gvar`** — first vertical slice (exploration + minimal biome rows); simplest test fixture.
2. **`forgotten_realms_2014.gvar`** — reference westmarch extraction target.
3. **`generic_fantasy_2024.gvar`** / **`forgotten_realms_2024.gvar`** — when 2024 catalogue branches exist.
4. **`spelljammer_2014.gvar`** — after travel/journeys and location model are stable.

Each preset should pass **`!westmarch check`** for the subsystems it enables.

---

## Related

- [server-config.md](../server-config.md) — config layers and owner workflow
- [config.md](config.md) — engine loader (not preset bodies)
- [src/gvars/configs/starter.gvar](../../../../src/gvars/configs/starter.gvar) — minimal empty template
- [docs/setup.md](../../../../docs/setup.md) — adoption and preset links
- [mvp-commands.md](../mvp-commands.md) — which subsystems each preset may enable
