# Onboarding experience

Improve first-run usability for westmarch-generic without weakening the config-gvar ownership model.

Target release: [`1.1.0`](../../releases/1.1.0.md).

Project docs:

- [Problem statement](problem-statement.md)
- [Investigation](investigation.md)

## Initial Goals

- Let first-time users try normal player commands before a server owner has created and wired `westmarch_config`.
- Keep `westmarch_config` as the authoritative signal that a server has completed setup.
- Make `!westmarch setup` and `!westmarch show` clearly explain when the server is still using the temporary starter experience.
- Use the Forgotten Realms 2014 starter config as the temporary default for normal player commands when no server config svar is set.
- Add a starter quest in the Forgotten Realms starter config that teaches the main command loops through a short Waterdeep to Silverymoon journey.
- Let the web editor create or export a first config gvar from inside the editor flow, then remind the configurator to set `!svar westmarch_config <gvar-id>`.
- Build a public configurer guide library under `docs/guides/`, starting with a glossary and focused guides for server settings, display, policies, encounters, encounter templates, and publishing.
- Expose `docs/guides/` through GitHub Pages at `/westmarch-generic/docs/guides/` so configurators can browse guides from the hosted editor/docs surface.

## Scope

This project spans:

- Runtime config loading and admin-command messaging.
- Forgotten Realms starter content.
- Web editor create/publish workflow.
- Public configurer guides and glossary.
- GitHub Pages exposure for `docs/guides/` only.
- Setup docs and tests.

The first implementation should stay conservative: no server-specific constants in aliases, no silent mutation of svars, and no automatic creation of server-owned config without an explicit server configurator action.

## User outcomes

| User | Outcome |
|------|---------|
| First-time player | Can run `!westmarch`, travel, location, and other enabled starter commands immediately after the workshop is subscribed |
| Server configurator | Sees an explicit "no `westmarch_config` svar set" message in setup/show, with next steps to create and wire config |
| Content author | Can use the starter quest as a living command tour and adapt it into server-owned config later |
| Maintainer | Can distinguish real configured-server behavior from temporary starter fallback in tests and support reports |

## Non-goals

- Do not auto-set `westmarch_config`.
- Do not treat the fallback starter config as a completed server setup.
- Do not hard-code a server owner's config gvar id in player aliases.
- Do not block tokenless editor users from exporting a starter config manually.
- Do not require the introductory quest to cover every command in the workshop.

## Related docs

- [1.1.0 release plan](../../releases/1.1.0.md)
- [Server setup](../../../setup.md)
- [Web config editor](../web-config-editor/)
- [Forgotten Realms config](../forgotten-realms-config/)
- [westmarch setup command](../westmarch-statement/aliases/admin/setup.md)
- [westmarch show command](../westmarch-statement/aliases/admin/show.md)
