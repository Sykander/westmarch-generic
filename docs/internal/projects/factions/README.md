# Factions project

Planning notes for a post-1.0.0 factions subsystem. This project should let server owners define factions that players can discover, join, earn standing with, and use as requirements or rewards in other systems.

The feature is not part of the first public release. It belongs in a 1.x.x release after `1.0.0`.

## Documents

- [problem-statement.md](problem-statement.md) - why factions need a first-class config and command model.
- [solution-statement.md](solution-statement.md) - target data shape, commands, state model, and integrations.
- [implementation-plan.md](implementation-plan.md) - phased implementation checklist for a post-1.0.0 release.

## Release target

| Version | Role |
|---------|------|
| `1.0.0` | First public release; factions are explicitly out of scope |
| `1.x.x` where `x > 0` | Additive feature release candidate for factions |

Example setting data, such as the Harpers in a Forgotten Realms config, must live in server config. The generic aliases should know only the faction schema and command behavior.
