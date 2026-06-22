# Full config workflow

End-to-end process to build a **playable** example preset (e.g. `forgotten_realms_2014.gvar`) using LLM prompts + Cursor integration.

---

## Phase 0 — Scaffold (human)

1. Duplicate [`starter.gvar`](../../../../src/gvars/configs/starter.gvar) → `forgotten_realms_2014.gvar` (or your preset name).
2. Enable subsystems you want for MVP play:

   | Subsystem | Turn on when you have… |
   |-----------|-------------------------|
   | `exploration` | Biome registry + pools (or engine presets) |
   | `travel` | `locations`, `paths`, `default_location` |
   | `economy` | `shops` (at least hub stores) |
   | `crafting` | Recipes and/or engine item catalogue |
   | `content` | Books + location `library_topics` |
   | `downtime` | Optional — policies only |

3. Set Avrae rules edition to match preset (2014 vs 2024).

---

## Phase 1 — Locations (foundation)

| Step | Prompt | Output variable |
|------|--------|-----------------|
| 1 | [`locations.prompt.md`](../../../../src/prompts/forgotten-realms/locations.prompt.md) — `Mode: bootstrap`, then `expand` | `world_data_locations` (10, then 10–15 per batch) |

- Integrate under `world_data.locations` for small configs, or into the JSON gvar referenced by `world_data.locations_gvar_id` for large presets.
- Set `world_data.default_location` from the `# default_location:` comment.
- Keep a **master id list** (spreadsheet or text file) — paste into later prompts.
- For 50+ locations, batch by **region** (e.g. “Dessarin Valley batch 2”, “Coast batch 1”).

---

## Phase 2 — Biome registry

| Step | Prompt | Output |
|------|--------|--------|
| 2 | [`biome-registry.prompt.md`](../../../../src/prompts/forgotten-realms/biome-registry.prompt.md) | `world_data_biomes` |

- Paste the **set of biome codes** used in your locations’ `commands` exploration lists.
- Prefer `engine:configs/biomes/<code>` for standard terrain until you author custom biome rows.
- Integrate under `world_data.biomes`.

---

## Phase 3 — Paths (connect locations)

| Step | Prompt | Output |
|------|--------|--------|
| 3 | [`paths-batch.prompt.md`](../../../../src/prompts/forgotten-realms/paths-batch.prompt.md) | `world_data_paths` |

- Paste **location id list** and optional **hub id** into the prompt placeholders before sending.
- Work **one region at a time** — connect hub to neighbors first, then wild loops.
- Integrate as extend/merge into `world_data.paths` for small configs, or into the JSON gvar referenced by `world_data.paths_gvar_id` for large presets.
- Avoid duplicate `(from, to, requirements.transport)` triples.

Optional: [`world-transport.prompt.md`](../../../../src/prompts/forgotten-realms/world-transport.prompt.md) if you need horse/boat modes beyond walk.

---

## Phase 4 — Shops (economy)

| Step | Prompt | Output |
|------|--------|--------|
| 4 | [`shops-batch.prompt.md`](../../../../src/prompts/forgotten-realms/shops-batch.prompt.md) | `config_shops` |

- Paste locations that have `buy`/`sell` in `commands` and their `services` ids.
- Shop **`id`** should match the service id from the location when possible.
- Integrate under top-level `shops` dict (not inside `world_data`).

---

## Phase 5 — Biome encounter rows (exploration depth)

| Step | Prompt | Output |
|------|--------|--------|
| 5 | [`biome-pools-batch.prompt.md`](../../../../src/prompts/forgotten-realms/biome-pools-batch.prompt.md) | JSON row list |

- **One chat per biome code** (forest, urban, road, …).
- Fill `[BIOME_CODE]`, `[BIOME_DISPLAY_NAME]`, biome brief, and activities needed before sending.
- Custom pools → separate `.gvar` per biome; update registry `gvar_id` from `engine:…` to workshop UUID after publish.
- Engine presets are enough for smoke tests; custom rows add setting flavour.

Target per biome (first pass): **5–10** rows each for `enc.combat`, `enc.gather`, `enc.quest`, plus rows for enabled biome-backed activity tags (`forage.gather`, `fish.gather`, `mine.gather`, `lumber.gather`). A row may list multiple tags when the same encounter belongs in several pools.

---

## Phase 6 — Recipes & books (crafting + library)

| Step | Prompt | Output |
|------|--------|--------|
| 6a | [`recipes-batch.prompt.md`](../../../../src/prompts/forgotten-realms/recipes-batch.prompt.md) | `config_recipes` |
| 6b | [`books-batch.prompt.md`](../../../../src/prompts/forgotten-realms/books-batch.prompt.md) | `config_books` |

- Recipes: align `name` with [items.tsv](../../../../assets/items.tsv) or note new items for a follow-up.
- Books: align `tags` with `library_topics` on locations that have `library`.
- Integrate under top-level `recipes` (list) and `books` (list) — or extension gvar when size grows.

---

## Phase 7 — World clock (optional)

| Step | Prompt | Output |
|------|--------|--------|
| 7 | [`world-calendar.prompt.md`](../../../../src/prompts/forgotten-realms/world-calendar.prompt.md) | `world_data_calendars` |

- Only if `policies.time.mode` is `world_clock`.
- Integrate under `world_data.calendars`.

---

## Phase 8 — Validate & publish

1. Run the web config editor checks with config loaded.
2. Fix with [`revision.prompt.md`](../../../../src/prompts/_templates/revision.prompt.md).
3. Publish workshop gvar; wire `westmarch_config` svar.
4. Document UUID in [docs/setup.md](../../../../docs/setup.md) when ready.

---

## Follow-up chats (same thread)

Use [`expand-batch.prompt.md`](../../../../src/prompts/_templates/expand-batch.prompt.md):

- “Add 10 more locations to the existing dict — full output, no diff.”
- “Add paths from `new_hub` to these five ids: …”

---

## Checklist — minimum playable region

- [ ] `default_location` + ≥10 locations with `commands`
- [ ] Paths from hub to each neighbor (bidirectional = two path entries)
- [ ] `world_data.biomes` covers every exploration biome code used
- [ ] At least engine preset pools OR one custom biome pool authored
- [ ] Hub shops for `buy`/`sell` locations
- [ ] Optional: 5+ books tagged for hub `library_topics`
- [ ] `subsystems.*.enabled` and `commands.*` match what locations offer
