# Release planning

This folder tracks intended release scope and documented release bodies.

When CI creates a production tag, it looks for `docs/internal/releases/<tag>.md`. If that file exists, CI creates a GitHub Release from it. If it does not exist, the tag remains tag-only. This keeps routine tags lightweight while making planned public releases explicit.

Keep the next planned release doc current as work lands. Completed work should move out of "planned" language before tagging; deferred work should be moved to a later release doc or roadmap section.

Release docs are for server owners, config maintainers, and developers adopting a release. Do not put maintainer runbook steps, such as "run `make build` before tagging", in `Upgrade Steps`; keep those in `DEVELOPMENT.md`.

## Release doc template

Every version-specific release doc must use this structure. Do not include a release date in the document; GitHub records the release timestamp when the release is created.

Optional release artwork may appear after the high-level description and before `Upgrade Steps`. Prefer GitHub Pages URLs for assets under `editor/public`, for example `https://sykander.github.io/westmarch-generic/westmarch-assets/releases/<tag>/banner.png`, so the GitHub Release body renders the same deployed asset as the editor site.

```md
## [<tag>](https://github.com/Sykander/westmarch-generic/releases/tag/<tag>)

> High-level release description.

<!-- Optional release artwork. -->

### Upgrade Steps

These steps are for server owners, config maintainers, and developers adopting the release.

- [ACTION REQUIRED] Required compatibility or rollout step for adopters.
- Optional migration or validation step.

### Breaking Changes

- Breaking change, or `None`.

### New Features

- New feature.

### Bug Fixes

- Bug fix.

### Performance Improvements

- Performance improvement.

### Other Changes

- Documentation, CI, roadmap, release-process, or other non-feature change.
```

## Version policy

Versioning follows SemVer-style `MAJOR.MINOR.PATCH` numbers from `package.json`.

Backwards compatibility starts at `1.0.0`. Patch and minor releases in the `1.x` line should preserve documented command names, documented argument layouts, and documented config keys. Breaking changes should be held for `2.0.0` unless the old behavior continues to work with a deprecation notice.

| Version line          | Meaning                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `1.0.0`               | First public release baseline                                                   |
| `1.0.x`               | Public patch releases: bug fixes, docs, validation fixes, and safe data updates |
| `1.x.0` where `x > 0` | Additive feature releases after the public baseline                             |
| `2.0.0`               | Reserved for breaking config or command contract changes                        |

## Roadmap

| Release           | Status                  | Scope                                                                                                                             |
| ----------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [1.0.0](1.0.0.md) | Release-candidate scope | First public release; implemented engine, editor, starter configs, docs, tests, and release hardening                             |
| [1.1.0](1.1.0.md) | Planned                 | Onboarding improvements: starter fallback, unwired setup/show messaging, starter quest investigation, public guides, and editor first-config flow |
| [2.0.0](2.0.0.md) | Planned                 | Next-major planning after the `1.x` compatibility line, including factions, combat handoff/maps, and economy progression commands |

For future public releases, add a version-specific file such as `1.2.0.md` or `2.1.0.md` when the target version becomes concrete. Use broad roadmap files only while the exact tag is undecided.

Pre-tag compatibility reviews live under [research](../research/). For `1.0.0`, see [1.0.0 command contract review](../research/1.0.0-command-contract-review.md).

## Related project docs

- [westmarch-statement](../projects/westmarch-statement/) - foundational product and command scope.
- [web-config-editor](../projects/web-config-editor/) - browser config editor and validation surface.
- [forgotten-realms-config](../projects/forgotten-realms-config/) - richer Forgotten Realms starter preset.
- [onboarding-experience](../projects/onboarding-experience/) - planned `1.1.0` first-run and server onboarding improvements.
- [factions](../projects/factions/) - next-major faction subsystem planning.
- [exploration-enrichment](../projects/exploration-enrichment/) - combat handoff, pending encounter, hunt, and loot enrichment planning.
