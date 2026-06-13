# Problem statement

## Context

[westmarch](https://github.com/Sykander/westmarch) is a rich Avrae ruleset: exploration, crafting, dungeons, economy, and supporting data (areas, loot, encounters, items, monsters, and more). It works well for the server it was built for because the game mechanics and that server's world are implemented together in one workshop codebase.

Avrae gives server owners powerful runtime configuration through **server variables (svars)** and **workshop globals (gvars)**. In practice, many workshops still treat the repository as a single product: logic, copy, tables, and server identity live in the same files, deployed to one workshop environment.

westmarch-generic is a deliberate break from that pattern. The goal is a **reusable game engine** that any compatible Discord server can adopt, while **per-server identity and content** live outside the engine codebase.

## The problem

**Westmarch-style game systems are hard to reuse across servers because server-specific configuration is embedded in the engine.**

Today, adopting or adapting westmarch-like mechanics for a different server typically means one or more of:

1. **Forking the codebase** — copy the repo, replace hard-coded areas, loot tables, encounter definitions, branding, and bespoke rules, then maintain a divergent fork forever.
2. **Editing engine code for one server's data** — change aliases and gvars that implement *how the game works* in the same places that define *what this server's world contains*, so every customization risks breaking shared mechanics.
3. **Running a single-server workshop** — ship one combined ruleset that only fits one community; other servers cannot opt in without significant developer effort.
4. **Duplicating effort across communities** — each server rebuilds similar systems (travel, crafting, dungeons, loot) with slightly different data shapes and no shared upgrade path when the engine improves.

This coupling creates real costs:

- **For maintainers** — bug fixes and feature work in core mechanics must be merged manually across forks, or re-applied on top of server-specific edits. Refactors touch both algorithm and content.
- **For server owners** — customizing the world (new regions, loot pools, encounter tables, house rules) requires Drac2 development skills and comfort editing a large monolithic codebase, not configuring a product they run.
- **For players** — inconsistent behaviour and documentation across servers that "use westmarch" but are actually running different forks with different assumptions.
- **For the ecosystem** — shared libraries (e.g. [drac2-tools](https://github.com/Sykander/drac2-tools)) help with utilities, but they do not solve the problem of *where server world data lives* relative to *where game logic lives*.

## Who is affected

| Stakeholder | Pain |
|-------------|------|
| **Engine maintainers** (this repo) | Cannot evolve mechanics cleanly while server data is scattered through alias and gvar sources. |
| **Server owners / GMs** | Want a westmarch-like experience without owning a fork or hiring someone to patch code for every world change. |
| **Content authors** | Need a stable place to define areas, tables, and flags that does not require editing command implementations. |
| **Players** | Expect consistent commands and help; opaque per-server forks make that hard to guarantee. |

## What we need instead

We need a clear separation:

- **Engine** — aliases, snippets, and shared libraries that implement *how* westmarch-style systems behave (commands, rolls, flows, validation).
- **Configuration** — per-server *what* — regions, encounters, loot, economy tuning, feature flags, display strings — loaded at runtime, not compiled into the engine tree.

Configuration must be **addressable on a live Avrae server** without redeploying the whole workshop for every world edit. Server owners should be able to point the bot at their setup through **svars** (unset = feature off or safe default; set to a **gvar id** = load that server's config module).

## Representative server-owner goals

These scenarios illustrate why **biomes** and **locations** are separate layers ([biome-data-shape-investigation.md](biome-data-shape-investigation.md) §5–6):

### Three forest regions

One server runs **Oakwood** (temperate **`forest`** biome, village + wilds), **Misty Forest** ( **`dark_forest`** wilds + **`elven_settlement`** town), and **Jungle expanse** ( **`jungle`** wilds + **`pyramid`** site with a post-MVP dungeon). Many locations reuse the same biome code; each settlement gets its own shops, jobs, and optional **location encounter gvar**.

### Steampunk conversion

Districts as **locations** with factory jobs, airship **`shops`**, and clockwork **`craft`** — wilderness **`!enc`** uses custom **`factory_wastes`** / **`docks`** biomes without embedding city NPCs in generic biome rolls.

### Gestalt / high-power

Standard **`mountain`** / **`cave`** biomes with scaled callable **`cr`**; **locations** gate **`hunt`** and **`dungeon_ids`** to tiered hunting grounds while payout and shop prices stay in config.

## Scope of this problem (broad)

This project is not "fix one alias" or "extract one table." The problem is **architectural**:

- Multiple game verticals from westmarch (exploration, crafting, dungeons, economy, etc.) assume server-specific data is reachable from the same codebase that defines behaviour.
- There is no agreed **config gvar schema**, **svar naming convention**, or **loading pattern** for "this server's westmarch instance."
- Tooling, tests, and deploy pipelines today assume a **single workshop identity** in sourcemaps, not a generic engine plus N config gvars owned by different communities.
- Migration from monolithic westmarch to engine + config has not been defined; without that path, the generic repo cannot replace the original in practice.

Until engine and configuration are separated with a documented, testable contract, westmarch remains a **single-server product** rather than a **platform other servers can configure**.

## Out of scope (for this statement)

This document describes the problem, not the full solution. The following are related but separate concerns:

- Exact config gvar schema for every westmarch subsystem (follow-on design).
- Hosting or distributing config gvars for third parties (operational model).
- UI for server owners to edit config without touching gvars (future tooling).
- Porting every westmarch command before the configuration model is proven (phased delivery).

## Summary

**westmarch-generic exists because embedding server-specific world data and reusable game logic in one Avrae codebase does not scale to multiple Discord servers.** Server owners need to configure their instance via svars and gvars; maintainers need an engine they can improve once and deploy everywhere. The problem is to define and deliver that split — so westmarch becomes something servers *run and configure*, not something they *fork and patch*.

## Related documents

- [user-stories.md](user-stories.md) — journeys and use cases that follow from this problem
- [review.md](review.md) — critical review of westmarch-statement docs
- [solution-statement.md](solution-statement.md) — proposed solution and implementation plan
