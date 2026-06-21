# Factions problem statement

## Background

Many westmarch campaigns use organizations as a durable part of play. Players join groups, earn reputation, unlock contacts, receive missions, access faction shops, and get recognized by allies or rivals.

Forgotten Realms has obvious examples such as the Harpers, the Order of the Gauntlet, the Emerald Enclave, the Lords' Alliance, and the Zhentarim. Other servers may use guilds, noble houses, clans, colleges, cults, mercenary companies, or entirely original factions.

`westmarch-generic` currently has no first-class faction model. Server owners can mention factions in quest text, shop names, or location descriptions, but the engine cannot consistently answer:

- which factions exist on this server;
- which factions a character belongs to;
- what rank or renown a character has;
- whether a shop, quest, service, route, library, or activity requires faction membership;
- how faction rewards are granted or displayed.

## Problem

Without a shared factions subsystem, each feature that wants faction behavior would invent its own small rule. That would make configs harder to validate and would encourage server-specific constants in aliases.

The first public release should stay focused on the current command surface and release hardening. Factions are useful, but they are not required for `1.0.0`. They should be planned as an additive 1.x.x feature after the public baseline is stable.

## Users

| User | Needs |
|------|-------|
| Server owner | Define factions, join policies, ranks, rewards, and visibility without editing engine aliases |
| Player | See available factions, understand join requirements, track membership, and view standing |
| GM/content author | Gate quests, shops, libraries, services, and rewards by faction membership or rank |
| Maintainer | One generic schema and helper API that other systems can reuse |
| Reviewer | Clear boundaries between faction data, character state, and server-specific lore |

## Constraints

- Do not include factions in the `1.0.0` first public release scope.
- Implement factions in a later `1.x.x` release, higher than `1.0.0`.
- Keep all faction lore in config gvars, not generic aliases.
- Use `lists.search_list` style lookup behavior for user-entered faction names: 0 matches, 1 match, many matches.
- Avoid requiring a mutable server database. Character-specific membership should use character state unless a later storage design is deliberately added.
- Make the subsystem additive and disabled by default so existing `1.0.0` configs keep working.

## Required outcomes

When implemented, the factions feature should support:

- owner-defined faction catalogue data;
- player-facing faction list/search/show commands;
- character membership and standing display;
- join policies such as open, approval, invite-only, or closed;
- ranks or tiers based on renown, standing, or manual promotion;
- faction rewards and requirements that other systems can read;
- optional location, shop, quest, library, and downtime integrations;
- editor validation for faction ids, rank thresholds, join policy shape, and references from other config sections.

## Non-goals for the first factions slice

- Automatic Discord role management.
- A centralized server roster that requires mutable external storage.
- Hard-coded Forgotten Realms faction names in engine code.
- Replacing the quest, economy, or content systems.
- Breaking `1.0.0` config shape or command behavior.
