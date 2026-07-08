# Factions project

Planning notes for a later factions subsystem. This project should let server owners define factions that players can discover, join, earn standing with, and use as requirements or rewards in other systems.

The feature is not part of the first public release. It is tracked on the `2.0.0` roadmap until the final target version is decided.

## Documents

- [problem-statement.md](problem-statement.md) - why factions need a first-class config and command model.
- [solution-statement.md](solution-statement.md) - target data shape, commands, state model, and integrations.
- [implementation-plan.md](implementation-plan.md) - phased implementation checklist for a later release.

## Release target

| Version | Role                                                                                   |
| ------- | -------------------------------------------------------------------------------------- |
| `1.0.0` | First public release; factions are explicitly out of scope                             |
| `2.0.0` | Next-major release candidate for factions unless the final design is strictly additive |

Example setting data, such as the Harpers in a Forgotten Realms config, must live in server config. The generic aliases should know only the faction schema and command behavior.
