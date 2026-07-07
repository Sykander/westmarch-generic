# Internal documentation

Documentation for **people working on westmarch-generic** — design notes, project planning, architecture decisions, and migration strategy.

This is not player- or server-owner-facing documentation. For the public model and configuration overview, see [../README.md](../README.md).

## Releases

| Release docs          | Status  | Description                                                                                    |
| --------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| [releases](releases/) | Planned | Release roadmap, including `1.0.0` as the first public release and `2.x.x` next-major planning |
| [research](research/) | Active  | Compatibility reviews, implementation audits, and evidence notes that are not release notes    |

## Projects

| Project                                                                    | Status             | Description                                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [exploration-enrichment](projects/exploration-enrichment/)                 | Planned            | Shared monster/biome search, richer hunt encounter packages, hidden-outcome loot sessions, and combat handoff command                                       |
| [factions](projects/factions/)                                             | Planned next-major | Config-owned factions that players can join, with membership, rank/renown, requirements, and integrations                                                   |
| [forgotten-realms-config](projects/forgotten-realms-config/)               | In progress        | Richer Forgotten Realms starter config for Sword Coast travel, locations, transport, shops, weather, and services                                           |
| [manual-testing-initial-release](projects/manual-testing-initial-release/) | Planning           | Manual and exploratory test notes for first public release hardening                                                                                        |
| [prompt-generation](projects/prompt-generation/)                           | Planning           | Prompt workflow and assets for generated config content                                                                                                     |
| [web-config-editor](projects/web-config-editor/)                           | Planned            | GitHub Pages editor for loading, validating, editing, exporting, and optionally publishing server config gvars                                              |
| [westmarch-statement](projects/westmarch-statement/)                       | Complete           | PS, US, SS, MVP, review + [aliases/](projects/westmarch-statement/aliases/) (by subsystem) + [gvars/](projects/westmarch-statement/gvars/) (engine modules) |
