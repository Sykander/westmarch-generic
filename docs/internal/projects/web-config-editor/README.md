# Web config editor

Create a GitHub Pages-hosted editor for westmarch-generic server configuration gvars. The editor should let server owners load a config, edit it through structured forms, validate it, and optionally publish the updated gvar back to Avrae.

Project docs:

- [Problem statement](problem-statement.md)
- [Solution statement](solution-statement.md)
- [Implementation plan](implementation-plan.md)
- [GitHub Pages and browser publishing investigation](github-pages-investigation.md)

## Goals

- Make server configuration approachable without hand-editing a large Drac2/Python gvar.
- Support loading config from Avrae by `westmarch_config` gvar id when the user supplies an `AVRAE_TOKEN`.
- Support pasting gvar contents directly when users do not want to provide a token.
- Parse config contents and render a domain-specific editor for toggles, policies, world data, shops, currencies, biome registry, and encounter pools.
- Support JSON-friendly biome and location pool editing, including compact template rows.
- Validate the edited config before export or publish.
- Provide a guided config check similar to `!westmarch check`, with errors, warnings, explanations, field links, and suggested fixes.
- Export updated gvar contents for manual copy-paste.
- Optionally publish the updated config directly to Avrae from the browser when credentials and required ids are present. The existing `publish-avrae` package remains the endpoint/behavior reference, but the Pages app cannot use its Node CLI flow directly.

## User Flows

### Load by Avrae token

1. User opens the editor.
2. User enters `AVRAE_TOKEN` and `westmarch_config` gvar id.
3. Editor fetches the gvar contents.
4. Editor parses the config and opens the structured editor.
5. User edits and validates.
6. User clicks `Update`.
7. Editor publishes the new config through browser-side Avrae API calls.

### Paste-only mode

1. User opens the editor.
2. User pastes gvar contents.
3. Editor parses the config and opens the structured editor.
4. User edits and validates.
5. User exports the updated gvar body for manual publishing.

### Shareable setup links

The page should accept params so server owners can prefill setup information:

```text
?westmarch_config=<gvar-id>
```

Decision: do not put `AVRAE_TOKEN` in query params, and do not generate links containing tokens. Bearer tokens in query params can leak through browser history, logs, referrers, screenshots, and shared chat previews.

- Allow `westmarch_config` in query params.
- Ask the user to enter `AVRAE_TOKEN` manually when they want browser-side Avrae API access.
- Keep tokens in memory by default.
- Allow explicit `sessionStorage` persistence later if the UI makes the tradeoff clear.
- Do not persist tokens to `localStorage` in MVP.
- Never write tokens into generated links, exports, status logs, or downloadable reports.

The URL fragment approach, such as `#AVRAE_TOKEN=<token>`, is safer than query params because fragments are not sent to servers in normal HTTP requests, but it still leaks through screenshots, copy/paste, browser history, and shared chats. Treat fragment-token import as non-MVP and only add it later as an explicit unsafe import flow with a warning.

### Load and permission modes

| Mode | Inputs | Read from Avrae | Edit | Export | Publish |
|------|--------|-----------------|------|--------|---------|
| Shared id only | `westmarch_config` query param | No | No, until content is loaded | No, until content is loaded | No |
| Paste-only | pasted gvar body | Not needed | Yes | Yes | No |
| Token read | gvar id + token | Yes, if token can read | Yes | Yes | No, unless update succeeds |
| Token publish | gvar id + token + valid body | Yes | Yes | Yes | Yes, if token can update target gvar |

A user without a usable Avrae token should still be able to paste config contents, edit them, validate them, and export the updated `westmarch_config` gvar body. A user whose token can read but cannot publish should keep local edit/export access and get a clear permission failure when publishing is unavailable.

## Editor Scope

Initial editor sections:

- Setup, load, paste, and source state.
- Guided config check and fix list.
- Server identity and display settings.
- Subsystem command toggles.
- Policies.
- Currencies.
- World data: locations, paths, transport, calendars, and biome registry.
- Shops and shop stock.
- Recipes and content catalogue links where configured.
- Biome and location encounter pools.
- Loot rules and hunt rules from [exploration enrichment](../exploration-enrichment/).

Biome encounter editing emits compact JSON rows:

```json
[["enc.gather", "forage.gather"], "gather_item", "Wild Herbs", "You find useful herbs near a damp hollow.", "Wisdom (Survival)", 12, "Herbs", 1]
```

The first item is a pool-tag list or `null` for every compatible pool; the second item is the template name; remaining items are template args. The editor should know registered template names and show field labels for common engine templates where possible.

## Parsing Strategy

Config gvars are Drac2/Python-like source, not pure JSON. The editor should support three levels:

| Input style | Support |
|-------------|---------|
| Pure JSON config object | First-class parse and edit. |
| Drac2/Python config with literal assignments | Parse common literal values into an editable model. |
| Arbitrary executable Drac2 | Read-only raw editor plus warnings; cannot safely execute in the browser. |

The implementation should prefer a conservative parser over browser-side execution. When unsupported syntax appears, preserve the raw source and tell the user which sections cannot be edited structurally.

## Publishing

The update path should mirror the repo's existing publish tooling contract without depending on a backend.

Expected publish inputs:

- `AVRAE_TOKEN`
- target config gvar id
- updated gvar body

Expected publish output:

- success or failure status
- gvar id updated
- timestamp
- concise error details when Avrae rejects the update

Browser API findings from 2026-06-15:

- Avrae gvar `GET`/`POST` CORS preflight allowed a `github.io`-style origin with `authorization` and `content-type` headers.
- Unauthenticated `GET` returned `401` with `missing credentials`.
- Direct browser read/update appears technically possible, but update permission still needs a real-token functional test.

Because GitHub Pages is static, there is no backend to hide credentials, queue work, or poll on the user's behalf. The token is only ever a user-supplied browser credential. If Avrae API behavior changes, publishing should fall back to export/manual update rather than routing tokens through an unowned third-party proxy.

### Update status display

The publish view should show one row per local step and remote operation:

- parse source
- normalize editor model
- validate required sections
- serialize gvar body
- optionally fetch current remote body
- publish target gvar
- re-fetch target gvar
- verify remote body matches serialized body
- offer export and run report

Each row should show:

- label
- target gvar id or logical file/section name
- state: `pending`, `running`, `success`, `warning`, `failed`, `skipped`
- start/end time
- HTTP status when applicable
- sanitized error message
- suggested next action

Common failure handling:

| Failure | Likely cause | UI action |
|---------|--------------|-----------|
| `401` / `missing credentials` | no token or expired token | ask for token again |
| `403` | token lacks update permission | keep edit/export enabled, publish disabled |
| `404` | wrong gvar id or no access | ask user to verify id/access |
| validation error | malformed config | highlight section and block publish |
| network/CORS error | browser could not reach Avrae | allow export and retry |
| verify mismatch | update response succeeded but refetch differs | show warning and suggest manual check |

## Validation

Client validation should mirror `!westmarch check` where possible and add editor-specific guidance:

- Required top-level config sections.
- Unknown subsystem keys.
- Biome registry references.
- Biome/location pool shapes.
- JSON compact pool row template names and arg counts.
- Currency references in prices and outcomes.
- Shop stock shape.
- Loot rule and hunt rule shape.
- Dangling location/path ids.

Validation output should be grouped by severity:

- Error: cannot publish safely.
- Warning: likely config issue, but export allowed.
- Info: improvement suggestions.

Validation issues should include stable issue codes, config paths, section names, a short explanation, and a suggested fix. The issue list should support "Go to field" for every structurally editable setting and safe "Apply fix" actions only when the repair is deterministic.

## Implementation Plan

See [implementation-plan.md](implementation-plan.md).

## Open Questions

- Should the editor use a nested `editor/package.json`, root npm scripts only, or npm workspaces?
- What license, if any, should the repo declare once the third-party catalogue/data question is settled?
- Which third-party catalogue/data files need explicit notices or exclusion from the project code license before the repo goes public?
- Should token handling stay memory-only, or allow explicit session persistence?
- How should arbitrary Drac2 callables be represented when the editor cannot safely parse or execute them?
- Should custom encounter templates be editable in the web UI, or only referenced by name from pool rows?
