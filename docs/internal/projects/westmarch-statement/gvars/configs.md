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
2. **Onboarding** — owners paste or export from repo/editor starter sources instead of authoring from [starter.gvar](../../../../../src/gvars/configs/starter.gvar) alone.
3. **Parity** — reference westmarch extraction can target a preset (e.g. Forgotten Realms 2014) as the canonical migration fixture.
4. **Documentation** — worked examples of [data-shapes.md](../data-shapes.md) in a coherent world.

Presets ship in the **same westmarch-generic repo** as source and in the web editor starter list. Split preset data, such as large location/path JSON bodies, uses production UUIDs recorded in the sourcemap and generated env gvar.

**Bulk content authoring:** copy-paste prompts for external LLMs live in [`src/prompts/`](../../../../../src/prompts/README.md). Full build guide: [prompt-generation/](../../prompt-generation/README.md) (locations → paths → shops → biomes → …). Generate there → validate → paste into Cursor for repo integration.

---

## Preset status

Each top-level `.gvar` file is one Draconic module with the same shape as an owner config gvar. Presets may set optional `rules_version`; when omitted, runtime resolution falls back to the Avrae server setting and then `"2014"` ([data-shapes.md § rules_version](../data-shapes.md#rules_version)).

| File | Status | Setting | Intended rules | Summary |
|------|--------|---------|----------------|---------|
| **`starter.gvar`** | Shipped in 1.0.0 | Generic blank starter | Config/Avrae default | Minimal schema; all subsystems off; no world data |
| **`forgotten_realms_2014.gvar`** | Shipped in 1.0.0 | Forgotten Realms | **2014** | Sword Coast starter with travel, location, time, weather, economy, content, engine biome registry, and Forgotten Realms book shards. Large locations/paths live in sibling JSON gvars referenced by UUID. |
| **`westmarch_2014.gvar`** | Shipped in 1.0.0 | Westmarch | **2014** | Reference westmarch server starter with Nexus, Base Camp, Oakwood, Four Bridges, Mistcloak Mountain, copied path graph, small economy seed, and `wm-*` biome modules. Large locations/paths live in sibling JSON gvars referenced by UUID. |
| **`forgotten_realms_2024.gvar`** | Planned | Forgotten Realms | **2024** | Same FR identity as 2014 preset where lore allows; spells, skills, and item lists aligned to 2024 revised rules |
| **`generic_fantasy_2014.gvar`** | Planned | Generic fantasy | **2014** | Setting-neutral placeholders — no FR-specific proper nouns; usable for homebrew worlds without retagging lore |
| **`generic_fantasy_2024.gvar`** | Planned | Generic fantasy | **2024** | Same as generic 2014 structurally; 2024-aligned catalogues and mechanics |
| **`spelljammer_2014.gvar`** | Planned | Spelljammer | **2014** | Wildspace / spelljamming ports, astral routes, and setting-appropriate locations; **2014 only** (no 2024 Spelljammer preset planned) |

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

## Layout

```
src/gvars/configs/
  README.md
  starter.gvar                   # minimal schema — all subsystems off
  biomes/                        # preset JSON row-list bodies — engine:configs/biomes/<code>
    README.md
    biome_forest.gvar.json
    ...
  forgotten_realms_2014.gvar
  forgotten_realms_2014_locations.gvar.json
  forgotten_realms_2014_paths.gvar.json
  westmarch_2014.gvar
  westmarch_2014_locations.gvar.json
  westmarch_2014_paths.gvar.json
  forgotten_realms_2024.gvar
  generic_fantasy_2014.gvar
  generic_fantasy_2024.gvar
  spelljammer_2014.gvar
```

Files listed as planned above are not part of the 1.0.0 starter set.

---

## Sourcemaps and deploy

Split preset data and engine-owned config shards get **workshop gvar slots** in dev/prod sourcemaps when ready to publish (UUIDs from **`unused_gvars.md`**). Split locations/paths JSON gvars are referenced by literal production UUID from the config body, not through **`env.gvars`**. The engine loader does not `using()` top-level preset configs directly; server owners still point **`westmarch_config`** at their active config gvar.

| Consumer | How preset is used |
|----------|-------------------|
| **Server owner** | Start from the editor/source preset, save a config gvar in their own workshop, then `!svar westmarch_config <uuid>` |
| **Alias-tests** | `.varfile.json` references preset UUID or embeds minimal excerpt |
| **`!westmarch setup`** | Links to preset list in [docs/setup.md](../../../../setup.md) |
| **CI** | Fixture config for subsystem tiers (document which preset exercises which vertical) |

---

## Planned growth

1. **Generic fantasy 2014/2024** — setting-neutral starters for homebrew owners.
2. **Forgotten Realms 2024** — when 2024 catalogue branches and validation are complete.
3. **Spelljammer 2014** — after astral/wildspace location, route, and weather assumptions are documented.

Each preset should pass the web config editor checks for the subsystems it enables.

---

## Related

- [server-config.md](../server-config.md) — config layers and owner workflow
- [config.md](config.md) — engine loader (not preset bodies)
- [src/gvars/configs/starter.gvar](../../../../../src/gvars/configs/starter.gvar) — minimal empty template
- [docs/setup.md](../../../../setup.md) — adoption and preset links
- [mvp-commands.md](../mvp-commands.md) — which subsystems each preset may enable
