# Release planning

This folder tracks intended release scope. It is a planning index, not a generated changelog.

`package.json` is still pre-public at the time this roadmap is written. The first full public release target is `1.0.0`; it should include everything already implemented and stabilized before the tag.

## Version policy

| Version line | Meaning |
|--------------|---------|
| `1.0.0` | First public release baseline |
| `1.0.x` | Public patch releases: bug fixes, docs, validation fixes, and safe data updates |
| `1.x.0` where `x > 0` | Additive feature releases after the public baseline |
| `2.0.0` | Reserved for breaking config or command contract changes |

## Roadmap

| Release | Status | Scope |
|---------|--------|-------|
| [1.0.0](1.0.0.md) | Planned | First public release; current engine, editor, starter configs, docs, tests, and release hardening |
| [1.x.x](1.x.md) | Planned | Additive features after `1.0.0`, starting with the factions project |

## Related project docs

- [westmarch-statement](../projects/westmarch-statement/) - foundational product and command scope.
- [web-config-editor](../projects/web-config-editor/) - browser config editor and validation surface.
- [forgotten-realms-config](../projects/forgotten-realms-config/) - richer Forgotten Realms starter preset.
- [factions](../projects/factions/) - post-`1.0.0` faction subsystem.
