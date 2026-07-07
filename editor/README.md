# Web config editor

This folder contains the React/Vite source for the static westmarch-generic web config editor.

The root build writes GitHub Pages-ready static files to `../public/`.

| Path | Purpose |
|------|---------|
| `src/app/` | Application shell, route/view composition, and screen-level state |
| `src/components/` | Reusable editor UI components |
| `src/lib/` | Avrae API client, parser, serializer, validation, and export logic |
| `src/styles/` | Editor CSS |

Useful commands from the repo root:

```bash
npm run build
npm run types
make editor
```

The Avrae workshop code remains under `src/`; editor code should not be added there.

See [web-config-editor solution statement](../docs/internal/projects/web-config-editor/solution-statement.md) and [implementation plan](../docs/internal/projects/web-config-editor/implementation-plan.md).
