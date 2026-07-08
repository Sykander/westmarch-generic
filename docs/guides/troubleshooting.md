# Troubleshooting

Use this when a command does not behave the way a server configurator expected.

## First checks

Run:

```text
!westmarch show
```

Then check:

- Is `westmarch_config` set?
- Does the gvar id load?
- Is the subsystem enabled?
- Is the command enabled?
- Does the required world data exist?
- Did the editor Check page show errors?

## Common states

| State | What to do |
|-------|------------|
| `westmarch_config` unset | Create or publish a config gvar, then run `!svar westmarch_config <gvar-id>` |
| Gvar id wrong or inaccessible | Check the UUID and editor permissions |
| Command disabled | Enable the subsystem and command toggle |
| Missing character | Select or import an Avrae character |
| Missing location | Set character location through travel/location flow or check default location |
| No biome pool | Add biome registry entries and encounter rows |
| No shop stock | Add shops, visible locations, and stock rows |
| Publish failed | Export manually or check token/permission/API errors |

## Command disabled vs missing data

Disabled command:

- The config says the feature is off.
- Fix by enabling `subsystems.<name>.enabled` and `commands.<command>`.

Missing data:

- The command is on, but there is nothing useful to read.
- Fix by adding world data, shops, biomes, paths, books, recipes, or catalogues.

## Editor cannot publish

Use export instead when:

- no token is available;
- the token cannot update the target gvar;
- browser API calls fail;
- a reviewer must approve the config first.

After manual update, rerun:

```text
!westmarch show
```

## Next guides

- [Validation](validation.md)
- [Editor workflow](editor-workflow.md)
- [First config quickstart](first-config.md)
