# Web config editor

Create a GitHub Pages-hosted editor for westmarch-generic server configuration gvars. The editor should let server owners load a config, edit it through structured forms, validate it, and optionally publish the updated gvar back to Avrae.

## Goals

- Make server configuration approachable without hand-editing a large Drac2/Python gvar.
- Support loading config from Avrae by `westmarch_config` gvar id when the user supplies an `AVRAE_TOKEN`.
- Support pasting gvar contents directly when users do not want to provide a token.
- Parse config contents and render a domain-specific editor for toggles, policies, world data, shops, currencies, biome registry, and encounter pools.
- Support JSON-friendly biome and location pool editing, including compact template rows.
- Validate the edited config before export or publish.
- Export updated gvar contents for manual copy-paste.
- Optionally publish the updated config through `publish-avrae` when credentials and required ids are present.

## User Flows

### Load by Avrae token

1. User opens the editor.
2. User enters `AVRAE_TOKEN` and `westmarch_config` gvar id.
3. Editor fetches the gvar contents.
4. Editor parses the config and opens the structured editor.
5. User edits and validates.
6. User clicks `Update`.
7. Editor publishes the new config through `publish-avrae`.

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

Token prefill is useful but sensitive. Bearer tokens in query params can leak through browser history, logs, referrers, screenshots, and shared chat previews. Safer design:

- Allow `westmarch_config` in query params.
- Prefer token prefill only in the URL fragment, such as `#AVRAE_TOKEN=<token>`, because fragments are not sent to servers in normal HTTP requests.
- Show a clear warning before using a token loaded from a link.
- Never write tokens into generated links by default.
- Keep tokens in memory or `sessionStorage`; do not persist to `localStorage` unless the user explicitly opts in.

If full token-in-link sharing is ever supported, it should be an explicit unsafe mode and the UI should label it as such.

## Editor Scope

Initial editor sections:

- Server identity and display settings.
- Subsystem command toggles.
- Policies.
- Currencies.
- World data: locations, paths, transport, calendars, and biome registry.
- Shops and shop stock.
- Recipes and content catalogue links where configured.
- Biome and location encounter pools.
- Loot rules and hunt rules from [exploration enrichment](../exploration-enrichment/).

Encounter pool editing should support both full encounter dicts and compact JSON rows:

```json
["gather_item", "Wild Herbs", "Survival", 12, "Herbs", 1, "Forage"]
```

The editor should know registered template names and show field labels for common engine templates where possible.

## Parsing Strategy

Config gvars are Drac2/Python-like source, not pure JSON. The editor should support three levels:

| Input style | Support |
|-------------|---------|
| Pure JSON config object | First-class parse and edit. |
| Drac2/Python config with literal assignments | Parse common literal values into an editable model. |
| Arbitrary executable Drac2 | Read-only raw editor plus warnings; cannot safely execute in the browser. |

The implementation should prefer a conservative parser over browser-side execution. When unsupported syntax appears, preserve the raw source and tell the user which sections cannot be edited structurally.

## Publishing

The update path should integrate with the repo's existing publish tooling rather than reimplementing Avrae details in several places.

Expected publish inputs:

- `AVRAE_TOKEN`
- target config gvar id
- updated gvar body
- optional metadata needed by `publish-avrae`

Expected publish output:

- success or failure status
- gvar id updated
- timestamp
- concise error details when Avrae rejects the update

Open implementation question: GitHub Pages is static, so direct publish either needs browser-safe Avrae API calls or a separate backend/proxy. If Avrae blocks browser CORS or the token would be exposed to third-party infrastructure, publishing should remain local/manual until a safe deployment model exists.

## Validation

Client validation should mirror `!westmarch check` where possible:

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

## Implementation Plan

1. Decide Pages location, likely `docs/config-editor/` or a dedicated frontend package with a Pages build output.
2. Define a normalized config model for the editor.
3. Build parser support for pure JSON and literal Drac2 assignment config.
4. Build read-only fallback for unsupported source.
5. Build editor forms for toggles, policies, currencies, and world data first.
6. Add encounter pool editor with compact JSON rows and template registry awareness.
7. Add validation mirroring `!westmarch check`.
8. Add export-to-gvar-body.
9. Investigate safe publish path through `publish-avrae`.
10. Add optional Avrae load/update once token handling and CORS are confirmed.

## Open Questions

- Should the editor live entirely under `docs/` for GitHub Pages, or be a built app committed into Pages output?
- Can Avrae gvar fetch/update be called safely from a static browser app?
- Should token handling be memory-only, or allow explicit session persistence?
- How should arbitrary Drac2 callables be represented when the editor cannot safely parse or execute them?
- Should custom encounter templates be editable in the web UI, or only referenced by name from pool rows?
