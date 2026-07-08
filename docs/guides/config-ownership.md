# Config Ownership and Publishing

Use this guide when you need to turn a starter preset or editor draft into a server-owned westmarch-generic config.

The important rule is simple: the server should point `westmarch_config` at a gvar controlled by the server's staff, not at a temporary editor draft, a copied example that nobody owns, or a maintainer-only fixture.

## Ownership Model

There are three different things involved:

| Thing | Purpose |
|-------|---------|
| Config gvar | The JSON config for one server |
| Extension gvar | Optional extra data referenced by the config, such as large world or catalogue data |
| `westmarch_config` svar | The server variable that tells commands which config gvar to load |

The svar is only a pointer. The actual world, display, policies, locations, shops, encounters, and toggles live in the config gvar and any extension gvars it references.

## Recommended Workflow

1. Start from the Forgotten Realms starter config or another preset in the editor.
2. Change the name, display, policies, subsystems, world data, and encounters for your server.
3. Run the editor Check page.
4. Export or publish the config to a gvar owned by a server owner or trusted config maintainer.
5. Keep a backup copy of the exported JSON outside Avrae.
6. Set the server svar:

```text
!svar westmarch_config <your-gvar-id>
```

7. Run `!westmarch show` in the server to confirm the wired gvar id.

## Who Should Own The Gvar

Use an account that will remain available to the server staff team. Avoid publishing the only live config from a personal account that may leave the server.

Good options:

- a server owner account
- a long-term staff maintainer account
- a shared staff process where the exported JSON is backed up and another maintainer can republish it if needed

Avoid:

- using a maintainer fixture as the live server config
- pointing production at a one-off testing gvar
- letting only one person keep the latest JSON

## Backups

Before publishing a major change, export the current live config and store it with a date or version label.

Useful labels:

```text
westmarch-config-2026-07-08-before-economy.json
westmarch-config-1.1.0-launch.json
westmarch-config-season-2.json
```

Backups matter because gvar updates are easy to overwrite. A plain JSON export is enough to recover by republishing and resetting `westmarch_config`.

## Staging Changes

For large edits, use a staging gvar:

1. Export the current production config.
2. Load it in the editor.
3. Make changes.
4. Publish to a separate staging gvar.
5. Temporarily set `westmarch_config` in a test server to the staging gvar.
6. Smoke test commands.
7. Publish or copy the tested config to the production gvar.

Do not test risky changes by repeatedly changing the live server's config during active play.

## Extension Gvars

Extension gvars are useful when a config becomes too large or when different staff members maintain different data sets.

Common split candidates:

- large location lists
- paths and transport data
- biome and encounter data
- books, topics, recipes, items, or monster catalogues

Keep extension gvars documented in the main config and in staff notes. If the main config points at an extension gvar that is deleted or made private, commands depending on that data can fail.

## Publish Handoff

When one maintainer publishes a config for another server owner, include:

- the gvar id
- the export date
- what preset or previous config it came from
- whether extension gvars are required
- the exact svar command

```text
!svar westmarch_config <your-gvar-id>
```

After the owner sets the svar, check `!westmarch show` before announcing the server as ready.

## Related Guides

- [Editor workflow](editor-workflow.md)
- [Validation](validation.md)
- [Troubleshooting](troubleshooting.md)
- [Launch checklist](launch-checklist.md)
