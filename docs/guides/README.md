# Guides

Practical guides for server owners, server configurators, and maintainers using westmarch-generic.

These are public-facing docs. Internal design notes, implementation plans, and maintainer investigations live under [../internal/](../internal/).

## Start here

| Guide | Use when |
|-------|----------|
| [Glossary](glossary.md) | You need westmarch-generic terms like config gvar, biome, location, policy, or encounter template defined in one place |
| [Westmarch server setup](server-setup.md) | You are creating a Discord server, channels, roles, bot access, and workshop subscriptions |
| [Initial server text](initial-channel-texts.md) | You need paste-ready first posts for rules, getting-started, westmarch overview, character creation, and meta channels |
| [Server setup](../setup.md) | You are wiring the westmarch-generic engine, creating a config gvar, setting `westmarch_config`, and validating setup |

## Planned Configurer Guides

The onboarding project for release `1.1.0` should expand this folder with focused, task-oriented guides for server configurators.

| Planned guide | Purpose |
|---------------|---------|
| Avrae server settings | Explain `!servsettings`, rules edition, character import policy, and which Avrae settings should match westmarch-generic config |
| Config display | Explain `display`, per-subsystem display overrides, command display, colours, footer behavior, thumbnails, and error embed behavior |
| Policies | Explain `policies`, what the engine enforces, what remains manual, and how to choose safe defaults |
| World data | Explain `world_data`, locations, paths, transport, calendars, weather, shops, and when to move large data into separate gvars |
| Encounters | Explain how to create exploration, quest, combat, and gathering encounters from existing templates |
| Encounter templates | Explain built-in template ids, template arguments, compact encounter rows, and when a custom template is justified |
| Config publishing | Explain editor export, browser publish, gvar ownership, and the final `!svar westmarch_config <gvar-id>` step |

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

Internal docs should stay out of the public Pages navigation. Root docs such as `docs/setup.md` should not be included automatically; if a setup topic needs hosted guide treatment, create or move a guide under `docs/guides/`.
