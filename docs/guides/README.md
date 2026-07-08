# Guides

Practical guides for server owners, server configurators, and maintainers using westmarch-generic.

These are public-facing docs. Internal design notes, implementation plans, and maintainer investigations live under [../internal/](../internal/).

## Start here

| Guide | Use when |
|-------|----------|
| [Glossary](glossary.md) | You need westmarch-generic terms like config gvar, biome, location, policy, or encounter template defined in one place |
| [First config quickstart](first-config.md) | You want the shortest path from starter config to a wired `westmarch_config` svar |
| [Editor workflow](editor-workflow.md) | You want to load, check, edit, export, or publish config gvars in the web editor |
| [Westmarch server setup](server-setup.md) | You are creating a Discord server, channels, roles, bot access, and workshop subscriptions |
| [Initial server text](initial-channel-texts.md) | You need paste-ready first posts for rules, getting-started, westmarch overview, character creation, and meta channels |
| [Server setup](../setup.md) | You are wiring the westmarch-generic engine, creating a config gvar, setting `westmarch_config`, and validating setup |

## Configurer guides

These guides explain the config jobs server maintainers do most often.

| Guide | Purpose |
|-------|---------|
| [Avrae server settings](avrae-server-settings.md) | Align `!servsettings`, rules edition, character import policy, and server config |
| [Config ownership and publishing](config-ownership.md) | Keep server config gvars owner-controlled, backed up, published, and wired to `westmarch_config` |
| [Display and branding](display.md) | Configure `display`, command display, colours, footer behavior, thumbnails, and error embeds |
| [Subsystems and command toggles](subsystems.md) | Decide which command families and individual commands are enabled |
| [Policies](policies.md) | Choose table-wide enforcement behavior and safe defaults |
| [Validation](validation.md) | Use the editor Check page and understand errors vs warnings |
| [Troubleshooting](troubleshooting.md) | Diagnose missing svar, invalid gvar, disabled command, missing data, and publish failures |
| [World data](world-data.md) | Understand locations, paths, transport, calendars, weather, shops, and gvar splits |
| [Locations and travel](locations-and-travel.md) | Create connected locations, paths, route requirements, and travel smoke tests |
| [Biomes](biomes.md) | Understand biome registry, preset biome gvars, and location-vs-argument exploration |
| [Encounters](encounters.md) | Create exploration, quest, combat, and gathering encounter rows |
| [Encounter templates](encounter-templates.md) | Use built-in template ids, template arguments, compact rows, and custom template tradeoffs |
| [Economy](economy.md) | Configure currencies, wallets, shops, stock, jobs, buy/sell behavior, and service locations |
| [Player setup](player-setup.md) | Configure player setup checks, companion workshop expectations, and first-player smoke commands |
| [Launch checklist](launch-checklist.md) | Run final checks before inviting players into the server |

## Companion bot guides

| Guide | Purpose |
|-------|---------|
| [Companion bots](companion-bots.md) | Decide which optional bots belong on the server |
| [Dyno setup](dyno-setup.md) | Configure moderation logs, automod, and Dyno permissions |
| [Tupperbox setup](tupperbox-setup.md) | Configure roleplay proxying and moderation expectations |
| [Bard Bot setup](bardbot-setup.md) | Configure optional Avrae-triggered sound effects and ambience access |

## Still planned

These guide topics are tracked for the onboarding project but are not written yet.

| Planned guide | Purpose |
|---------------|---------|
| Presets | Explain choosing and adapting starter configs |
| Crafting and downtime | Explain craft/brew/enchant/scribe, recipe modes, resources, tools, bags, and downtime |
| Content and recipes | Explain books, topics, library/read, recipe catalogues, and search behavior |
| Quests | Explain quest journal setup, quest hooks, and `policies.quest.self_assign` |
| Travel, time, and weather | Bring locations, paths, calendars, weather, transport, and arrival output together |
| Exploration loop | Explain `enc`, gathering, hunt/loot, distributions, cooldowns, and repeat avoidance |
| Permissions and channels | Explain channel restrictions, admin command access, Dragonspeaker, Server Aliaser, and aliasing roles |
| Extension gvars and large data | Explain when to split locations, paths, biomes, books, monsters, recipes, and custom catalogues |

Guide docs should describe what to do and why. Detailed implementation contracts should stay in internal docs unless server configurators need them to make safe config choices.

## GitHub Pages Exposure

The editor is already published through GitHub Pages. A planned onboarding improvement is to expose this guide folder through the Pages build at:

```text
/westmarch-generic/docs/guides/
```

Only `docs/guides/` should be copied or rendered into the Pages docs area. Other docs can remain repository docs unless they are moved or summarized here.

Initial Pages guide scope:

- this guide index
- the glossary
- configurer guides
- companion bot guides

Internal docs should stay out of the public Pages navigation. Root docs such as `docs/setup.md` should not be included automatically; if a setup topic needs hosted guide treatment, create or move a guide under `docs/guides/`.
