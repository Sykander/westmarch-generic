# Phase 2 Slice 1 stabilization audit

Date: June 28, 2026

Phase 2 Slice 1 goal: lock in the current MVP command surface before reference extraction, parity work, and release operations.

## Summary

Status: complete for the current repository baseline.

- Full `make test` passed.
- `avrae-ls --analyze` was run across 68 live `.alias` / `.gvar` source files.
- Source-adjacent command help under `src/aliases/{economy,content,misc,travel,crafting}` has no placeholder or planned-stub copy for shipped MVP commands.
- `westmarch setup` and `westmarch show` mention the web editor / Check page and current config-summary surfaces.
- No new missing test cases were found during this audit. Existing tests already cover the manual-test fixes that originally motivated this stabilization pass.

## Test Baseline

Command:

```bash
make test
```

Result: pass.

Covered by the full target:

| Area | Result |
|------|--------|
| npm root install | pass, 0 vulnerabilities |
| lint | pass |
| sourcemap dev/prod/compare checks | pass |
| editor install | pass, npm audit noted 1 low + 1 moderate dependency vulnerability |
| TypeScript | pass |
| editor tests | 107/107 pass |
| Avrae utility config/display/auth | 51/51 pass |
| Avrae utility catalogues/content | 22/22 pass |
| Avrae utility encounters | 26/26 pass |
| Avrae utility exploration | 11/11 pass |
| Avrae utility world | 51/51 pass |
| Avrae utility systems | 54/54 pass |
| content/misc aliases | 11/11 pass |
| crafting aliases | 12/12 pass |
| downtime/economy aliases | 28/28 pass |
| exploration enc alias | 20/20 pass |
| exploration hunt/loot aliases | 27/27 pass |
| exploration fish/forage aliases | 23/23 pass |
| exploration lumber/mine aliases | 22/22 pass |
| travel aliases | 33/33 pass |
| westmarch aliases | 35/35 pass |

Notes:

- The editor test runner emits Node experimental-loader warnings from the custom TSX test loader. These are tooling noise, not test failures.
- The editor dependency audit note should be revisited before `1.0.0`, but it is not a Slice 1 runtime blocker.

## Analyzer Baseline

Command shape:

```bash
for f in $(rg --files src/aliases src/gvars | rg '\.(alias|gvar)$'); do avrae-ls --analyze "$f"; done
```

Result: 636 diagnostics, all warning severity.

Top warning shapes:

| Count | Warning | Disposition |
|-------|---------|-------------|
| 557 | `'o' may be undefined in this scope` | Tooling limitation. These are almost entirely `_read_field` / adapter maps such as `"name": lambda o: o.name`; the lambda parameter is valid Drac2/Python style and covered by tests. Suppress/document unless avrae-ls gains better lambda-scope handling. |
| 8 | `'_is_missing' may be undefined in this scope` | Tooling limitation / forward-reference warning. Functions are defined before runtime calls; alias tests cover the command. No immediate fix. |
| 6 | `'t' may be undefined in this scope` | Tooling limitation around local callback/helper scope. No runtime failure observed. |
| 6 | `'cfg' may be undefined in this scope` | Dynamic alias setup warning. Covered by alias tests; fix only if a concrete runtime issue appears. |
| 4 each | `'set_cvar'`, `'set'`, `'dict'` may be undefined | Avrae/Drac2 built-in or supported runtime names not modeled fully by analyzer. Track as avrae-ls environment-model gap. |
| 1-3 each | helper names such as `_normalize_id`, `resolve_destination`, `list_shops`, `get_path_cost`, `_parse_alt` | Forward-reference / dynamic helper analysis gaps. Tests cover current behavior; clean up opportunistically when editing those files. |

Highest warning files:

| File | Count | Notes |
|------|-------|-------|
| `src/aliases/westmarch/show.alias` | 74 | Mostly `_read_field` adapter lambdas and forward-reference helpers. |
| `src/gvars/utils/crafting/crafting.gvar` | 65 | Mostly adapter lambdas / helper-scope warnings. |
| `src/aliases/westmarch/westmarch.alias` | 48 | Mostly adapter lambdas. |
| `src/gvars/utils/world/paths.gvar` | 39 | Mostly adapter lambdas / route helper scopes. |
| `src/gvars/utils/pc/pc.gvar` | 38 | Mostly adapter lambdas and cvar/built-in modeling. |

Analyzer owner/disposition:

- Owner: maintainer + avrae-ls/tooling.
- Release disposition: not blocking for `1.0.0` while `make test` stays green.
- Cleanup rule: do not churn working Drac2 solely to appease analyzer false positives. Fix warnings when they point to real parser/runtime failures, or when a touched file can be made clearer without increasing statement cost.

## Command Docs Check

Checked current source help/docs:

- `src/aliases/economy/{buy,job,sell,wallet}.md`
- `src/aliases/content/{library,read}.md`
- `src/aliases/misc/{quest,recipe}.md`
- `src/aliases/travel/{location,time,travel,weather}.md`
- `src/aliases/crafting/{brew,craft,enchant,scribe}.md`

Result:

- No `Example help doc`, placeholder, planned/unavailable, or not-implemented copy remains in these shipped source docs.
- Time and weather source docs describe implemented commands.
- Economy source docs describe current shop/currency/job behavior at the level expected for static workshop help.
- Internal implementation docs had stale unchecked checklists for several commands; those docs now include explicit status notes saying the runtime source is implemented and the remaining unchecked boxes are historical until a full checklist refresh.

## Admin Setup/Show Check

Verified:

- `src/aliases/westmarch/setup.md` points owners to the web config editor Check page and `!westmarch show`.
- `src/aliases/westmarch/setup.alias` pages mention editor links, `!gvar editor`, Check page workflow, and current subsystem/world-data setup.
- `src/aliases/westmarch/show.md` states that validation lives in the editor Check page and lists current sections including `wiring`, `subsystems`, `policies`, `crafting`, `display`, `runtime`, `data`, `biomes`, and `player_setup`.
- `src/aliases/westmarch/show.alias` includes editor/dashboard links and summarizes current runtime/config surfaces.
- `src/aliases/westmarch/*.alias-test` passed 35/35.

## Existing Edge-Case Coverage

No new tests were added because the review did not uncover an untested behavior change. Existing tests already cover:

- inferred-location missing encounter text includes location context;
- manual biome missing-pool text stays biome-only;
- time/weather are implemented toggles with data validation;
- travel transport ids and aliases, including ambiguous/unknown handling;
- deferred policy flags warn in the editor;
- buy/sell missing shop, invisible shop, empty stock, and non-selling-shop diagnostics;
- `westmarch setup` / `show` editor links and current section summaries.

## Follow-Ups

These are not Slice 1 blockers, but should stay visible:

- Refresh the older internal alias implementation checklists so they use checked boxes or move historical checklist content into a separate implementation-history section.
- Revisit the editor dependency audit note before tagging `1.0.0`.
- Keep analyzer warning counts visible in future stabilization passes; a sudden new warning shape should be treated as suspicious even if the historical false-positive count remains high.
- Phase 2 Slice 2 can start from this green baseline.
