# Web config editor source

This folder is reserved for the future React web config editor source.

Planned shape:

| Path | Purpose |
|------|---------|
| `src/app/` | Application shell, route/view composition, and screen-level state |
| `src/components/` | Reusable editor UI and shadcn/ui component copies |
| `src/lib/` | Avrae API client, parser, serializer, validation, and export logic |
| `src/styles/` | Tailwind/shadcn theme entrypoints |

Build output should be static files under the repo root `public/` folder. The Avrae workshop code remains under `src/`; editor code should not be added there.

See [web-config-editor solution statement](../docs/internal/projects/web-config-editor/solution-statement.md) and [implementation plan](../docs/internal/projects/web-config-editor/implementation-plan.md).
