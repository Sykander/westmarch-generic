# Editor workflow

Use the editor to load, check, edit, export, and optionally publish your `westmarch_config` gvar.

## Editor sections

| Section | Use it for |
|---------|------------|
| Setup | Load from Avrae, paste source, or start from a starter config |
| Display | World name, rules edition override, colours, footer, and embed branding |
| Subsystems | Command families, command toggles, cooldowns, and subsystem-specific settings |
| Policies | Table-wide enforcement choices and player setup behavior |
| World | Locations, paths, transport, calendars, weather, shops, and currencies |
| Biomes & Encounters | Biome registry, custom biome gvars, encounter rows, and templates |
| Check | Validation errors, warnings, and suggested fixes |
| Export | Copy, download, or publish generated gvar bodies |

## Token safety

You can use the editor without an Avrae token by pasting and exporting config bodies manually.

Only enter an Avrae token when you want the browser to load or publish gvars through Avrae. Do not put tokens in shared URLs, screenshots, docs, Discord messages, or downloaded reports.

## Normal edit loop

1. Load or paste the config.
2. Make a small change.
3. Open **Check**.
4. Fix errors before publishing.
5. Export or publish.
6. Run `!westmarch show`.
7. Run a command smoke test.

## Related gvars

Large configs may use related gvars for locations, paths, biome bodies, encounters, books, recipes, or catalogues.

Keep ownership clear:

- The main config gvar points to related gvar ids.
- Related gvars should belong to the same server owner or maintainer group.
- Preset engine sources are examples; create owner gvars before editing them heavily.

## Export vs publish

| Mode | Use when |
|------|----------|
| Export | You do not have a token, do not have update permission, or want a review handoff |
| Publish | You have a token and permission to update the target gvar |
| Manual paste | You want to use Avrae's dashboard or `!gvar editor` yourself |

After export or publish, the server still needs:

```text
!svar westmarch_config <your-gvar-id>
```

## Next guides

- [First config quickstart](first-config.md)
- [Validation](validation.md)
- [Config publishing](config-ownership.md)
- [Troubleshooting](troubleshooting.md)
