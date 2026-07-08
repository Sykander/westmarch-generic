# Onboarding experience problem statement

Target release: [`1.1.0`](../../releases/1.1.0.md).

## Background

westmarch-generic is intentionally config-driven. A Discord server sets the `westmarch_config` svar to a server-owned config gvar, and aliases load that config at runtime. This keeps the engine reusable and avoids baking server data into command aliases.

That model is good for long-term ownership, but it creates a cold-start cliff. If the engine workshop is subscribed before `westmarch_config` exists, most commands cannot demonstrate their value. A first-time server owner sees setup work before seeing a working world.

The repo already ships a Forgotten Realms 2014 starter config with travel, locations, shops, content, and other useful baseline data. That starter world can become the temporary trial experience while preserving the svar-based ownership model for real server setup.

## Problem

The first-run path is too brittle:

- Normal player commands fail or report that the server is unconfigured before a server owner wires `westmarch_config`.
- `!westmarch setup` and `!westmarch show` need to remain honest that no server-owned config is wired.
- New configurators must still understand that the starter experience is temporary and that their real server setup requires creating a config gvar and setting the svar.
- The web editor can validate and export config, but the first config-gvar creation and "now set the svar" handoff are still easy to miss.
- The starter config demonstrates data, but it does not yet guide a player through a purposeful command-learning journey.
- Public setup docs exist, but server configurators do not yet have a clear guide library for common configuration jobs such as Avrae server settings, display, policies, world data, encounters, encounter templates, and publishing.
- Project terminology is spread across setup docs, internal docs, and editor labels instead of one public glossary.
- The hosted GitHub Pages surface is editor-first; `docs/guides/` is not yet exposed as a browseable guide set under `/westmarch-generic/docs/guides/`.

## Users

| User | Needs |
|------|-------|
| First-time player | Try commands without knowing what a gvar or svar is |
| Server owner | See a working example before committing to config work |
| Server configurator | Get clear admin guidance that `westmarch_config` is unset and must be wired |
| Content author | Learn command patterns through starter-world content instead of reading only setup docs |
| Guide reader | Understand project vocabulary and choose the right configuration guide without reading internal design docs |
| Maintainer | Preserve supportability by exposing whether behavior came from fallback or a real config |

## User goals

- Run the bare `!westmarch` command before server setup is complete and see a useful starter-world response.
- Try starter travel, location, shopping, selling, foraging, and exploration commands against Forgotten Realms data.
- Run `!westmarch setup` as a configurator and immediately see that no `westmarch_config` svar is set.
- Run `!westmarch show` as a configurator and see setup status plus links to create, validate, publish, and wire a config.
- Use the editor to start from a known preset, create or export a config gvar, and receive a final reminder to set the server svar.
- Follow a starter quest that teaches command use in a natural order.
- Find public configurer guides for `!servsettings`, config display, policies, encounters, encounter templates, and publishing.
- Read a glossary that defines westmarch-generic terms such as config gvar, svar, biome, location, path, encounter pool, and encounter template.
- Browse configurer guides from the hosted GitHub Pages surface rather than only from the repository tree.

## Constraints

- Server-specific data should still load through `westmarch_config` and server-owned gvars.
- The fallback starter config is engine-shipped example data, not server-owned data.
- Admin commands must not imply the server is fully configured when the svar is unset.
- Runtime command behavior must be able to distinguish:
  - svar unset and using fallback starter config
  - svar set and config loaded
  - svar set but config failed to load
- The editor is statically hosted. Browser-side gvar creation depends on Avrae API support and permissions; if unavailable, the editor must provide a manual `!gvar create` or copy/export flow.
- Fallback behavior must not hide real configuration mistakes. If `westmarch_config` is set but invalid or unloadable, commands should report that configured-server error instead of silently using starter fallback.

## Success criteria

- With no `westmarch_config` svar, normal non-admin commands behave as though the Forgotten Realms 2014 starter config is loaded.
- With no `westmarch_config` svar, `!westmarch setup` defaults to the initial setup page and says the svar has not been set.
- With no `westmarch_config` svar, `!westmarch show` reports "unwired" status and points to the editor and exact svar command shape.
- With a valid `westmarch_config` svar, runtime behavior is unchanged and uses the server-owned config.
- With an invalid configured svar, commands do not fall back to the starter config.
- The starter quest gives players a practical command tour from Waterdeep toward Silverymoon.
- The editor can guide a configurator from starter preset to created/exported config gvar and a visible `!svar westmarch_config <gvar-id>` reminder.
- Public guide navigation gives configurators an obvious path from setup to display, policies, world data, encounters, templates, and publishing.
- A public glossary defines the project vocabulary used by commands, the editor, and setup docs.
- `docs/guides/` has a planned or implemented GitHub Pages exposure path under `/westmarch-generic/docs/guides/`.
