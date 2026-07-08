# Validation and the Check page

The editor Check page is the config validation surface.

`!westmarch show` summarizes what the engine loaded. It does not replace the editor Check page.

## Severity

| Severity | Meaning |
|----------|---------|
| Error | Fix before publishing or setting the svar |
| Warning | Review before launch; the config may still export |
| Info | Cleanup, polish, or guidance |

## Normal workflow

1. Make one config change.
2. Run Check.
3. Fix errors.
4. Review warnings.
5. Export or publish.
6. Run `!westmarch show`.
7. Smoke-test affected commands.

## Common errors

| Error area | Typical fix |
|------------|-------------|
| Missing default location | Add `world_data.default_location` and a matching location id |
| Enabled travel without paths | Add paths or disable travel until routes exist |
| Unknown biome code | Add the biome to `world_data.biomes` or fix the location/path reference |
| Bad gvar id | Paste a valid 36-character Avrae gvar UUID |
| Quest self-assign without quest command | Enable `subsystems.misc.commands.quest` or disable self-assign |
| Invalid colour | Use six hex digits, such as `#5865F2` |

## Common warnings

| Warning area | Why it matters |
|--------------|----------------|
| Feature enabled but sparse data | Players may hit empty pools or no-results messages |
| Manual resource policy | Staff must enforce costs outside the bot |
| Deferred enforcement setting | The config shape exists, but runtime enforcement may be planned later |
| Footer mode without footer text | Runtime can fall back, but branding may be weak |

## When to publish anyway

Publish with warnings only when:

- you understand what each warning means;
- the affected feature is not visible to players yet; or
- the server intentionally uses manual enforcement.

Do not publish with errors for a live server.

## Next guides

- [Editor workflow](editor-workflow.md)
- [Troubleshooting](troubleshooting.md)
- [Launch checklist](launch-checklist.md)
