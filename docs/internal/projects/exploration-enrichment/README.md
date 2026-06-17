# Exploration enrichment

Improve the exploration combat loop across **monster lookup**, **biome lookup**, **hunt results**, **loot sessions**, and the handoff into Avrae initiative.

This project turns the current MVP behaviours into a richer server-configurable model while keeping the generic repo rule: server-specific data comes from svars -> config gvar ids, not hard-coded alias constants.

## Goals

- Use one shared search model for monster, lootable, and biome names.
- Make ambiguous lookup explicit: one result proceeds, zero results reports no match, many results asks for a more specific query.
- Add a lightweight monster-name index so name search does not require loading every full monster shard.
- Let server owners author biome and location pools as compact JSON-compatible template rows.
- Let server owners register custom encounter template functions for their own server.
- Redesign loot tables around visible loot opportunities with hidden outcomes, not fixed generic rows.
- Let server owners configure loot rules from creature type, size, CR, tags, and other monster metadata.
- Resolve hunts into encounter packages that can contain one creature, packs, or leader-plus-minion groups.
- Add a configurable combat-start handoff so a server can choose copy-paste initiative commands or a first-class combat command.
- Show monster art by default in hunt and loot embeds when catalogue data provides it.

## Current pain points

`!loot goblin` can currently fall through into the active session and respond as if `goblin` were a lootable in the previous creature session. It also always builds the same rows:

```text
Survey the remains
<Monster> Trophy
Scattered Coin
```

Those are mechanics, not player-facing loot items. Surveying a corpse should be at most a one-time search action, trophy extraction should not be repeatable by default, and coin quantity should stay hidden until the attempt resolves.

`!hunt <creature>` and `!loot <creature>` also need the same lookup semantics as `core/lists.gvar` helpers, while `!enc <biome>` should search the configured biome registry instead of requiring exact codes.

## Shared Search

The canonical search behaviour should come from [lists.gvar](../../../../src/gvars/utils/core/lists.gvar):

- `search_list(items, search)`
- `search_list_by_key(items, key, search)`

Resolution contract:

| Result count | Behaviour |
|--------------|-----------|
| `0` | Report no results for the query. |
| `1` | Use that result without prompting. |
| `>1` | Ask the user to be more specific and show a short candidate list. |

Search order remains exact, case-insensitive exact, then substring. Callers should preserve that order and avoid adding command-specific fuzzy rules unless they are added to the shared helper.

### Monster lookup

Add a small monster-name index gvar generated from the monster catalogue:

```py
monster_name_index = [
    { "name": "Goblin", "shard": "g" },
    { "name": "Werewolf", "shard": "w" },
]
```

Lookup flow:

1. Search owner monster names first.
2. Search the generated engine monster-name index.
3. If exactly one result is selected, load only the referenced full monster shard.
4. If several results match, ask for a longer name and show candidates.
5. If no results match, report no monster results.

This lets substring search work without loading all monster data. It also leaves room for owner extension gvars to provide their own names before falling back to engine data.

### Biome lookup

`!enc <biome>` and any exploration command using manual biome input should search configured `world_data.biomes`.

Searchable fields:

- biome code, such as `forest`
- display name, such as `Forest`
- optional aliases, such as `woods`, `deep woods`, or `city`

The same `0 / 1 / many` contract applies. Biome lookup should still resolve to the configured registry entry and then lazy-load that biome's gvar body.

### Lootable lookup

Within an active loot session, player input should search visible loot opportunity labels using the same result contract.

If there is an active session and the input matches neither a lootable nor a session command, the command should not silently prevent starting a new creature session forever. The UX needs a clear path, such as:

- `!loot <visible loot>` attempts an item in the active session.
- `!loot start <creature>` starts or replaces a session.
- `!loot clear` closes the current session.

## JSON-Friendly Biome Rows

Biome gvars are raw JSON row lists. Location encounter gvars may still use their own module shape, but biome content should use pool tags to avoid duplicating shared encounters.

```json
[
  [["enc.gather", "forage.gather"], "gather_item", "Wild Herbs", "Fresh herbs grow near the path.", "Wisdom (Survival)", 12, "Herbs", 1],
  [["enc.combat"], "combat", "Goblin Ambush", "A crude net snaps up from the brush.", 1, "Goblin"]
]
```

Each row is a 2D-list entry:

```text
[
  pool_tags_or_null,
  template_name,
  arg_1,
  arg_2,
  ...
]
```

Rules:

- The first value is a list of pool tags such as `enc.gather`, or `null` for every compatible pool.
- The second value is the registered encounter template name.
- Remaining values are positional arguments passed to that template.
- `null` means "skip this argument and use the template default" for JSON authors.
- Rows must expand to normal [encounter](../westmarch-statement/data-shapes.md#encounter-input) dicts before selection or processing.
- Expanded encounters should be cached per alias invocation so the same row is not repeatedly expanded.
- The web config editor should validate unknown template names, invalid row types, wrong arg counts, and expansion failures.

This keeps biome files easy to generate and edit as JSON while preserving the engine's existing encounter processing model.

### Template registry

Add an encounter template registry that merges engine templates with server-owned templates.

Engine registry sketch:

```py
template_registry = {
    "gather_item": templates.get_gather_encounter,
    "gold_find": templates.get_gold_encounter,
    "damage": templates.get_damage_encounter,
    "ambush": templates.get_ambush_encounter,
}
```

Owner extension sketch:

```py
encounter_templates = {
    "mushroom_ring": get_mushroom_ring_encounter,
    "local_patrol": get_local_patrol_encounter,
}

def get_mushroom_ring_encounter(name, dc=None, reward=None):
    ...
```

Open design points:

- Where owner template functions live: config gvar, biome gvar, or a dedicated `extensions.encounter_templates` gvar.
- Whether owner templates can override engine template names. Safer default: reject duplicates unless an explicit policy enables overrides.
- How much static validation can run in the web editor without executing risky or expensive owner callables.
- How template rows represent keyword-style arguments if positional rows become too brittle. The first version should stay positional for simple JSON editing.

## Loot Redesign

The loot dialogue should show only player-selectable loot opportunities. It should not expose hidden quantity, hidden true item identity, or internal mechanics.

Example display:

```text
Active loot session: Goblin
Loot:
- Interesting Parcel
- Tarnished Trinket
- Small Coinpurse
```

An opportunity can reveal itself only after a roll:

```py
{
    "id": "goblin_parcel",
    "label": "Interesting Parcel",
    "skill": "Investigation",
    "dc": 13,
    "attempts": 1,
    "outcomes": [
        { "weight": 70, "type": "gold", "amount": "1d6", "reveal": "Coinpurse" },
        { "weight": 30, "type": "nothing", "reveal": "Nothing interesting" },
    ],
}
```

Default policy:

- Each visible opportunity can be attempted once.
- On success, apply the revealed reward and remove the opportunity.
- On failure, remove the opportunity unless a rule explicitly allows retries.
- When the last opportunity is removed, clear the session automatically.
- The response should say what changed, such as "Added **Goblin Trophy** to your Loot bag."
- If the final item closes the session, include that the loot session was closed.

Configurable rule inputs:

- monster `type`
- monster `size`
- monster `cr`
- monster tags or source metadata
- biome or encounter context, when available
- server policy overrides

Rule outputs:

- visible loot label
- skill and DC formula
- hidden reward distribution
- bag name or currency target
- attempt count or retry policy
- optional image, thumbnail, or flavour text

`Survey the remains` should become either a hidden-session setup rule or a visible one-time opportunity only when a server owner configures that label. It should not be a default item name.

## Hunt Enrichment

Hunts should resolve into an encounter package, not only a single monster name.

Base rules should be configurable and overridable:

- Pack creatures such as goblins, kobolds, rats, wolves, and similar low-CR monsters are more likely to appear in groups.
- Higher-CR monsters are more likely to appear alone, but may have thematically appropriate support.
- Leader monsters can bring minions. A vampire could appear with wolves, bats, skeletons, or vampire spawn.
- Server owners can choose whether hunts resolve one creature at a time or as full groups.

Example encounter package:

```py
pending_encounter = {
    "source": "hunt",
    "location": { "id": "mistwood", "name": "Mistwood" },
    "biome": { "code": "forest", "name": "Forest" },
    "primary": { "name": "Vampire", "count": 1 },
    "monsters": [
        { "name": "Vampire", "count": 1 },
        { "name": "Wolf", "count": "1d4" },
        { "name": "Skeleton", "count": "1d6" },
    ],
    "image": "monster or encounter image URL",
    "combat": {
        "map": "optional map id or URL",
        "effects": [],
        "initiative_options": {},
    },
}
```

The package becomes the bridge from `!hunt`, `!enc`, `!mine`, `!lumber`, `!fish`, and `!forage` into combat setup.

## Combat Handoff

Add a new misc command with working name `!combat`.

Purpose:

- Read a pending encounter created by hunt or exploration.
- Add monsters to initiative.
- Apply configured effects.
- Include map or scene information where configured.
- Report exactly what was added.

Server policy should choose the handoff mode:

```py
policies = {
    "combat": {
        "start_mode": "command",  # "command" | "copy_paste"
        "pending_encounter_scope": "channel",  # "character" | "channel" | "server"
    },
}
```

When `start_mode` is `copy_paste`, hunt and exploration embeds continue to show initiative commands. When `start_mode` is `command`, those embeds should point to `!combat start`.

Open command-shape question: `!combat` is the clearest name, but it overlaps conceptually with Avrae initiative. Alternatives are `!encounter start`, `!battle`, or a subcommand under an existing westmarch hub. The first implementation can use `!combat` behind a feature toggle and rename before publishing if it feels wrong in play.

## Monster Images

Hunt and loot embeds should use monster art when possible.

Preferred source order:

1. encounter package image
2. monster `image`
3. monster `image_url`
4. monster `thumb`
5. no image

Images should never block the command. Missing or invalid art falls back to the current text-only embed.

## Data Shape Sketch

Server config additions are likely to live under `policies.combat`, `policies.exploration`, and a new loot rules block.

```py
loot_rules = {
    "labels": {
        "coinpurse": "Small Coinpurse",
        "parcel": "Interesting Parcel",
        "trophy": "{monster.name} Trophy",
    },
    "rules": [
        {
            "id": "humanoid_coinpurse",
            "when": { "type": ["humanoid"], "max_cr": 2 },
            "chance": 80,
            "opportunity": {
                "label": "coinpurse",
                "skill": "Investigation",
                "dc": "10 + cr",
                "attempts": 1,
                "outcomes": [
                    { "weight": 80, "type": "gold", "amount": "1d6 + cr" },
                    { "weight": 20, "type": "nothing" },
                ],
            },
        },
    ],
}
```

```py
hunt_rules = {
    "grouping": [
        {
            "id": "low_cr_pack",
            "when": { "max_cr": 1, "tags_any": ["pack", "swarm"] },
            "count": "2d4",
        },
        {
            "id": "vampire_minions",
            "when": { "name": "Vampire" },
            "companions": [
                { "name": "Wolf", "count": "1d4", "chance": 60 },
                { "name": "Skeleton", "count": "1d6", "chance": 40 },
                { "name": "Vampire Spawn", "count": 1, "chance": 20 },
            ],
        },
    ],
}
```

Exact placement and validation rules should be finalized in [data-shapes.md](../westmarch-statement/data-shapes.md) before implementation.

## Implementation Plan

1. Add a shared resolver helper around `lists.search_list` and `lists.search_list_by_key` so aliases produce consistent zero, one, and many-result messages.
2. Generate and register a monster-name index gvar; update `monsters.gvar` to resolve by index before loading a full shard.
3. Update biome resolution so manual biome args search code, name, and aliases from `world_data.biomes`.
4. Add JSON-friendly pool row expansion through an encounter template registry.
5. Add server-owned encounter template registration.
6. Redesign `loot.gvar` session shape around visible opportunities and hidden outcomes.
7. Add configurable loot rules and default engine rules that avoid non-item labels like `Survey the remains`.
8. Update `!loot` UX for active-session ambiguity, one-attempt default, automatic close, bag update text, and monster imagery.
9. Add hunt encounter grouping rules and save pending encounter packages.
10. Add the misc combat command and combat handoff policy.
11. Update docs and `.alias-test` coverage for ambiguous search, no-result search, JSON pool rows, custom templates, hidden loot, session closure, pack hunts, and combat handoff mode.

## Documentation Impact

Update these docs as implementation lands:

- [enc alias](../westmarch-statement/aliases/exploration/enc.md)
- [hunt alias](../westmarch-statement/aliases/exploration/hunt.md)
- [loot alias](../westmarch-statement/aliases/exploration/loot.md)
- [encounter_templates.gvar](../westmarch-statement/gvars/encounter_templates.md)
- [monsters.gvar](../westmarch-statement/gvars/monsters.md)
- [loot.gvar](../westmarch-statement/gvars/loot.md)
- [biomes.gvar](../westmarch-statement/gvars/biomes.md)
- [data-shapes.md](../westmarch-statement/data-shapes.md)
- [server-config.md](../westmarch-statement/server-config.md)

## Open Questions

- Should pending encounters be scoped to character, channel, or server by default?
- Should failed loot attempts always consume the opportunity, or should retries be opt-in per opportunity?
- Should generated monster-name index entries include source book, CR, or type to make ambiguous result lists more useful?
- Should JSON pool rows stay positional only, or support a second object-argument form later?
- Should owner encounter template names be allowed to override engine names?
- Should `!combat` start immediately, or should it require `!combat preview` before `!combat start` for GM control?
- How much of Avrae initiative setup can be automated reliably across server permission setups?
