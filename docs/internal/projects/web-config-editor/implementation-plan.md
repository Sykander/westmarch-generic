# Web config editor implementation plan

## Phase 0 - Repo shape

Status: started.

- Move catalogue TSVs from `public/assets/` to root `assets/`.
- Reserve root `public/` for generated static Pages output.
- Reserve root `editor/` for React/Vite editor source.
- Keep Avrae workshop implementation under `src/`.
- Update generator paths and docs references.

## Phase 1 - Frontend scaffold

- Create `editor/package.json` with Vite, React, TypeScript, Tailwind, shadcn/ui, lucide-react, and test dependencies.
- Add `editor/vite.config.ts` with `base: "/westmarch-generic/"` and output to `../public`.
- Add root npm scripts that delegate to the editor, such as `editor`, `editor:dev`, `editor:build`, `types`, and `editor:test`.
- Add a minimal app shell with no domain behavior yet.
- Add GitHub Pages workflow using `actions/upload-pages-artifact` from `public`.

Acceptance:

- `npm run editor:build` emits `public/index.html`.
- The built page works under `/westmarch-generic/`.
- No editor code is under `src/`.

## Phase 2 - Config source model

- Define normalized config model interfaces.
- Add source states: `empty`, `pasted`, `loaded`, `dirty`, `published`, `exported`.
- Implement parser support for:
  - pure JSON object
  - common Drac2/Python literal assignments
  - raw fallback for unsupported source
- Track unsupported ranges/sections so the UI can disable unsafe structural editing.
- Implement serializer for supported model sections.

Acceptance:

- Pasted starter config opens in the editor.
- Unsupported source remains visible and exportable.
- Parser failures produce actionable messages rather than blank screens.

## Phase 3 - Browser validation

- Implement deterministic config checks in `editor/src/lib/validation`.
- Represent results as structured `ConfigIssue` objects.
- Add issue codes, paths, severity, explanations, and suggested fixes.
- Build a "Check and fix" panel with counts, filters, and "Go to field" actions.
- Add safe autofix only for deterministic repairs.

Initial rule groups:

- svar/gvar source state
- top-level config fields
- subsystem keys and command toggles
- display colour and footer behavior
- exploration distribution and biome source
- world data locations, paths, default location
- biome registry gvar references
- encounter pool shape and compact row template arity
- content topic policies
- command cooldown config

Acceptance:

- Browser validation can reproduce representative config errors and warnings from existing fixtures.
- Errors block publish.
- Export remains available with a warning.

## Phase 4 - Workbench UI

- Add top bar with source state, config id, token state, and share link.
- Add left navigation for editor sections.
- Add main editor pane with guided/raw tabs.
- Add right issue/help/status pane.
- Add help icon component using tooltip/hover-card patterns.
- Add stable responsive layout for desktop and mobile.

Acceptance:

- User can navigate every planned section without content overlap.
- Help icons are keyboard-focusable and labelled.
- Validation issues can focus the relevant section.

## Phase 5 - Core section editors

- Setup/load/paste source screen.
- Display editor.
- Subsystem and command toggle editor.
- Policy editor.
- World data editor for locations, paths, calendars, and default location.
- Biome registry editor with engine biome reference helpers.
- Economy editor for currencies, shops, and stock.
- Content editor for books/recipes links and references.

Acceptance:

- Common config edits can be made without raw editing.
- Every field covered by editor validation has a visible guided control or a documented raw-only fallback.

## Phase 6 - Encounter and biome gvar editors

- Add encounter template registry model.
- Add compact JSON row builder.
- Add full encounter dict editor.
- Add pool tag editor for `enc.combat`, `enc.quest`, `enc.gather`, `forage.gather`, `fish.gather`, `mine.gather`, and `lumber.gather`.
- Add custom biome gvar editor with export as separate gvar body.
- Add multi-gvar export manifest.

Acceptance:

- User can create a compact encounter row and preview the expanded meaning.
- User can export both main config and custom biome gvar bodies.
- Template arity and required fields validate before export.

## Phase 7 - Raw editor

- Add CodeMirror 6 for raw gvar content editing.
- Add section-scoped raw editor where possible.
- Add whole-source raw editor for unsupported files.
- Preserve source formatting when structural serializer cannot safely round-trip.
- Add dirty-state and parse-state warnings.

Acceptance:

- User can switch to raw mode, edit, re-parse, and return to guided mode when supported.
- Unsupported source is never silently discarded.

## Phase 8 - Avrae read and publish

- Implement browser Avrae client using `fetch`.
- Read gvar by id with user-entered token.
- Publish updated body with user confirmation.
- Re-fetch after publish and verify.
- Add progress rows for parse, validate, serialize, publish, verify, and export/report.
- Add retry for explicit user action only.

Acceptance:

- Tokenless user can still paste/edit/export.
- Tokened user can read accessible gvars.
- Publish failures show sanitized, actionable messages.

## Phase 9 - Export and reports

- Add copy-to-clipboard for each generated gvar body.
- Add download for `.gvar` bodies.
- Add zip export later if multiple gvars become common.
- Add validation report download without tokens.
- Add shareable link generation with `westmarch_config` only.

Acceptance:

- Exported files contain no token.
- Multi-gvar exports identify target ids and dependency order.

## Phase 10 - Tests and release

- Unit-test parser, serializer, validation, Avrae client error handling, and export naming.
- Add Playwright smoke tests for desktop and mobile.
- Add a manual Avrae CORS/API smoke checklist.
- Add Pages workflow once the static build exists.
- Update docs and setup guide with the public editor URL.

Acceptance:

- CI can build the editor and Avrae workshop code independently.
- Pages deployment does not require `AVRAE_TOKEN`.
- The first public release supports paste, check, edit, export, and guarded publish.
