# Web config editor solution statement

## Recommendation

Build the editor as a React + TypeScript + Vite static app under root `editor/`, with generated static output written to root `public/` for GitHub Pages.

Use shadcn/ui as source components added to the editor project, not as CDN-hosted components. shadcn's Vite docs describe installing/configuring components into a project with Tailwind and the CLI. Vite's GitHub Pages docs call out the required project-site `base` path and recommend GitHub Actions for build deployment.

References:

- [React: Creating a React App](https://react.dev/learn/creating-a-react-app)
- [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy.html)
- [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui Tooltip](https://ui.shadcn.com/docs/components/tooltip)
- [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)

## Repository layout

| Path | Role |
|------|------|
| `editor/` | React/Vite editor source and editor-only dependencies |
| `editor/src/app/` | App shell, view routing, page-level state |
| `editor/src/components/` | shadcn/ui copies and editor-specific components |
| `editor/src/lib/` | Parser, serializer, validation, Avrae client, export utilities |
| `editor/src/styles/` | Tailwind/shadcn theme CSS |
| `public/` | Generated static Pages output, including `index.html` |
| `assets/` | TSV catalogue source data for Avrae gvar generation |
| `src/` | Avrae aliases, snippets, and gvars only |

This keeps the web app separate from workshop code while still letting the repo publish a static site.

## Build and hosting

Use Vite with:

- `base: "/westmarch-generic/"` for GitHub project Pages.
- `build.outDir: "../public"` if the chosen workflow publishes root `public/`.
- `emptyOutDir: true` once generated output is intentionally managed.
- GitHub Pages Source: GitHub Actions.
- Pages artifact path: `public`.

Do not put secrets into the build. The browser app receives tokens only from user input at runtime.

## UI structure

Use a workbench layout rather than a landing page.

| Region | Purpose |
|--------|---------|
| Top bar | Config id, load state, unsaved/export status, token status, share link |
| Left nav | Sections: Setup, Check, Display, Subsystems, Policies, World, Biomes, Encounters, Economy, Content, Export/Publish |
| Main pane | Active section editor with guided controls and raw/source toggle |
| Right pane | Validation issues, help, selected-field explanation, publish/export progress |
| Footer/status strip | Parse mode, last validation time, local-only/publishable state |

The interface should be dense and calm: clear labels, compact controls, predictable section navigation, and no marketing-style hero.

## Help and guidance

Every non-obvious field should have a help icon near the label.

Help behavior:

- Use tooltips for short explanations.
- Use hover cards or side-panel help for longer "why this matters" guidance.
- Do not make tooltip-only content required for task completion.
- Ensure help triggers are keyboard-focusable and labelled.
- Link validation issues to the relevant section/field.

## Editing modes

Each complex section should support:

- Guided mode: radio groups, toggles, checkboxes, selects, text inputs, number inputs, tables, and compact row builders.
- Raw mode: direct editing of the relevant gvar/source text.
- Diff/preview mode later: show serialized output before export or publish.

Use an in-browser code editor for raw mode. Prefer CodeMirror 6 for the first implementation because it is lighter and easier to bundle for static hosting. Reconsider Monaco later if we need richer IDE behavior.

Unsupported Drac2 should remain editable as raw source, but structural controls should disable or mark the unsupported sections rather than pretending everything can be safely round-tripped.

## Domain sections

Initial sections:

- Setup and source: shared link, gvar id, token entry, paste area.
- Check and fix: validation summary, issue list, guided repair actions.
- Display: world identity, title, colour, footer, command display overrides.
- Subsystems: enabled flags and command toggles.
- Policies: rules version, cooldowns, repeat encounter policy, library/topic behavior.
- World data: locations, paths, calendars, transport, default location.
- Biomes: registry entries, engine biome references, custom biome gvar bodies.
- Encounters: compact JSON row builder and full encounter object editor.
- Economy: currencies, shops, stock, prices.
- Content: books, recipes, catalogue links.
- Export and publish: generated gvar bodies, copy/download, Avrae update status.

## Encounter editor

The encounter editor should support the compact JSON format discussed for exploration enrichment, while also allowing full encounter dictionaries.

Example compact row:

```json
[["enc.gather", "forage.gather"], "gather_item", "Wild Herbs", "You find useful herbs near a damp hollow.", "Wisdom (Survival)", 12, "Herbs", 1]
```

The UI should show template-aware labels, validate argument counts, validate pool tags, and preview the expanded encounter object where possible. Template names should be sourced from the engine's encounter template registry rather than hard-coded separately once that registry stabilizes.

## Guided config check

The browser validator is the source of truth for config checking and enriches the raw rule results for editor use. The browser model should represent issues as structured objects:

```ts
type ConfigIssue = {
  severity: "error" | "warning" | "info";
  code: string;
  path: string;
  section: string;
  title: string;
  detail: string;
  fix?: string;
  canAutoFix?: boolean;
};
```

Validation UX:

- Errors block publish, but export remains available with a warning.
- Warnings allow export and publish only after explicit confirmation where risk is meaningful.
- Info items suggest cleanup or improvements.
- Each issue should have "Go to field" behavior.
- Safe issues may offer "Apply fix" when the fix is deterministic.
- Complex issues should explain why the setting matters and what command behavior it affects.

Rule sources:

- Implement deterministic rules in `editor/src/lib/config.ts` / validation helpers.
- Keep a rule mapping document so browser rules and Drac2 rules can be compared.
- Add browser tests using the same sample config bodies as `.gvar-test` fixtures where practical.

## Avrae API and tokens

Allowed URL params:

```text
?westmarch_config=<gvar-id>
```

Token handling:

- User enters `AVRAE_TOKEN` manually.
- Token stays in memory by default.
- Optional `sessionStorage` can be added later behind an explicit checkbox.
- Do not use `localStorage` in MVP.
- Never include tokens in links, exports, reports, logs, or generated files.

Avrae operations:

- Read gvar by id when token is present.
- Publish one or more gvar bodies when token and permissions allow.
- Re-fetch after publish and verify body equality.
- Fall back to export/manual handoff on any auth, permission, CORS, or network failure.

## Alternatives considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Plain HTML/CSS/JS in `public/` | No build step, easy Pages setup | Hard to maintain complex forms, validation state, raw editor, and reusable controls | Reject for full editor |
| React via CDN with ad hoc components | Quick prototype, no bundler | shadcn/ui is not a CDN component library; poor type safety and harder testing | Reject |
| React + Vite + shadcn/ui in `editor/` | Static output, good component ergonomics, testable, Pages-friendly | Adds a frontend build and dependencies | Choose |
| Next.js static export | Strong React framework, routing conventions | More framework than needed for a client-only static app; export/base-path complexity | Defer |
| Backend/proxy service | Could hide tokens and centralize Avrae calls | Extra hosting, security burden, not GitHub Pages-only | Reject for MVP |

## Open risks

- Avrae API CORS behavior is external and may change.
- Parser round-tripping Drac2-like config source is the hardest technical risk.
- Keeping browser validation aligned with the documented config model needs tests and documentation discipline.
- Public repo data licensing remains separate from Pages hosting and editor implementation.
