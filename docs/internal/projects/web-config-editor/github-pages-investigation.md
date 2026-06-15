# GitHub Pages and browser publishing investigation

Date: 2026-06-15

## Summary

Hosting the web config editor on GitHub Pages is viable if the repository is public, or if the owner has a paid GitHub plan that allows Pages from private repositories. For this project, the practical free path is:

1. Make `Sykander/westmarch-generic` public.
2. Decide project licensing separately from Pages hosting.
3. Publish a static browser app through GitHub Pages.
4. Keep `AVRAE_TOKEN` out of shared URLs.
5. Support paste/export as the baseline workflow, with optional browser-side Avrae read/update when the user supplies a token.

GitHub Pages does not provide a backend. Every load, validation, export, and optional Avrae update must run in browser JavaScript, or through a separate service that we do not currently plan to operate.

## GitHub Pages viability

Official GitHub docs say GitHub Pages is available in public repositories on GitHub Free and GitHub Free for organizations, and in public or private repositories on paid plans. They also describe Pages as static hosting for HTML, CSS, and JavaScript from a repository, optionally through a build process.

This means the free-hosting plan works for this repo only after the repository is public. The license choice is not what enables Pages; visibility and GitHub plan do.

Default project-site URL:

```text
https://sykander.github.io/westmarch-generic/
```

If the editor is hosted below the project site, a likely editor URL is:

```text
https://sykander.github.io/westmarch-generic/config-editor/
```

Important limits and constraints:

- Pages sites are public on the internet, even when the source repository is private on a paid plan.
- Pages supports static files only. GitHub explicitly does not support server-side languages such as PHP, Ruby, or Python on Pages.
- Published Pages sites may be no larger than 1 GB.
- Pages has a soft bandwidth limit of 100 GB per month.
- Pages deployments time out after 10 minutes.
- GitHub Pages is intended for static project sites, not commercial SaaS hosting.

Sources:

- [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Terms for Additional Products and Features: Pages](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#pages)

## Public repository readiness

Making the repository public exposes:

- all source files and generated gvar bodies
- all catalogue data under `assets/`
- Actions workflow files
- future Actions logs for public runs
- existing public-facing commit history after the visibility change
- forkability of the repository

GitHub documents several consequences when changing a private repository to public, including that code becomes visible to anyone, anyone can fork it, activity is published, and Actions history/logs become visible.

Local checks performed:

- No `LICENSE`, `LICENSE.md`, `LICENSE.txt`, or `COPYING` file is currently present.
- `package.json` does not currently declare a project license.
- No committed `.env` or credential-looking files were found by a filename scan.
- Text search found expected documentation references to `AVRAE_TOKEN`; it did not find an obvious committed token. This is not a full secret audit.
- `gh api repos/Sykander/westmarch-generic` returned `404` in the current auth context, so current GitHub-side visibility and Pages settings were not confirmed from the CLI.

Before making public:

1. Decide the exact project license when ready. If the intent is strong copyleft for the project-owned codebase, use `GPL-3.0-or-later` or `GPL-3.0-only`.
2. Add a root `LICENSE` file and update `package.json`.
3. Add a README license note if third-party data/assets are excluded or differently licensed.
4. Review generated catalogues and `assets/` for third-party content that should not be relicensed as GPL.
5. Review old workflow runs/artifacts in GitHub before changing visibility.
6. Confirm no private workshop ids, server-specific config, or Discord/community-private data is committed.
7. Keep `AVRAE_TOKEN` only in GitHub Actions secrets and local shells, never in source or Pages config.

Sources:

- [Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [GNU GPLv3 summary on Choose a License](https://choosealicense.com/licenses/gpl-3.0/)
- [GNU GPLv3 text](https://www.gnu.org/licenses/gpl-3.0.en.html)

## Content licensing risk

This repo is not only code. It also includes D&D-oriented data and links. A GNU license can cover original project code, docs, and generated tooling, but it cannot grant rights to third-party content the project does not own.

Public-readiness should include a content pass over:

- monster/item/spell/catalogue data
- Forgotten Realms names and lore references
- D&D Beyond image URLs and DMsGuild/Fandom links
- any copied or derived upstream westmarch data
- public-domain book metadata and links

Wizards of the Coast's Fan Content Policy allows free fan content under conditions, but says fan content does not include verbatim copying and reposting of Wizards IP. D&D Beyond's SRD page says SRD content can be used under Creative Commons, but SRD exclusions exist for brand identity and IP reasons.

Practical decision for this project:

- Treat GPL as the license for project-owned code and docs only.
- Add explicit third-party notices before public launch if any assets/data are kept.
- Prefer SRD/CC-BY-compatible data or original data for public catalogues.
- Do not imply that GPL relicenses Wizards, D&D Beyond, DMsGuild, Fandom, or upstream westmarch content.

Sources:

- [Wizards Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy)
- [D&D Beyond System Reference Document](https://www.dndbeyond.com/srd)

## Avrae API browser findings

The existing `publish-avrae` package uses these gvar endpoints:

```text
GET  https://api.avrae.io/customizations/gvars/{id}
POST https://api.avrae.io/customizations/gvars/{id}
```

It sends `Authorization: <AVRAE_TOKEN>` and JSON content. The package is a Node CLI and reads `process.env.AVRAE_TOKEN`, so it cannot be dropped directly into a Pages app. The browser app can still reuse the endpoint contract and implement its own `fetch` client.

CORS probes on 2026-06-15:

```text
OPTIONS https://api.avrae.io/customizations/gvars/00000000-0000-0000-0000-000000000000
Origin: https://example.github.io
Access-Control-Request-Method: GET
Access-Control-Request-Headers: authorization,content-type
```

Result:

```text
HTTP/2 200
access-control-allow-origin: https://example.github.io
access-control-allow-headers: authorization, content-type
access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
vary: Origin
```

The same preflight result was observed for `POST`.

Unauthenticated `GET` result:

```text
HTTP/2 401
{"success": false, "error": "missing credentials"}
```

Implications:

- Browser-side fetch from GitHub Pages appears technically possible for both read and update.
- A token is required to fetch a gvar through the API.
- A no-token user cannot load a gvar by id directly through the API; they need to paste gvar contents or enter a token.
- Update permission still needs a real-token functional test. The UI must expect `401`, `403`, `404`, validation, and network/CORS failures.

## Token handling decision

Decision: do not put `AVRAE_TOKEN` in query params, and do not generate links containing tokens.

Allowed shareable query params:

```text
?westmarch_config=<gvar-id>
```

Not allowed in generated/shared URLs:

```text
?AVRAE_TOKEN=<token>
?token=<token>
```

MVP token behavior:

- User enters `AVRAE_TOKEN` manually when they want the browser to fetch from Avrae.
- Token stays in memory by default.
- Optional `sessionStorage` persistence can be added behind an explicit checkbox.
- Do not use `localStorage` for tokens in MVP.
- Do not show token values in logs, status output, export files, error reports, or generated links.

The URL fragment approach, such as `#AVRAE_TOKEN=<token>`, is safer than query params because fragments are not sent to servers in normal HTTP requests, but it still leaks through screenshots, copy/paste, browser history, and shared chats. Treat fragment-token import as non-MVP and only add it later as an explicit unsafe import flow with a warning.

## Read, edit, export, and publish modes

The editor should support these modes:

| Mode | Inputs | Can read from Avrae | Can edit | Can export | Can publish |
|------|--------|---------------------|----------|------------|-------------|
| Shared id only | `westmarch_config` query param | No | No, until content is loaded | No, until content is loaded | No |
| Paste-only | pasted gvar body | Not needed | Yes | Yes | No |
| Token read | gvar id + token | Yes, if token can read | Yes | Yes | No, unless update succeeds |
| Token publish | gvar id + token + valid body | Yes | Yes | Yes | Yes, if token can update target gvar |

If a user can read but cannot publish, the editor should still let them edit locally and download the updated `westmarch_config` body. They can then send that file/body to someone with Avrae permissions.

Export requirements:

- Export the serialized gvar body as a `.gvar` or `.txt` download.
- Include a copy-to-clipboard action.
- Include a small metadata header in the download sidecar or UI, not in the gvar body unless the parser format supports comments safely.
- Never include `AVRAE_TOKEN` in exports.
- Include validation errors and warnings in an optional run report download.

## Browser-only update status UI

Because GitHub Pages has no backend, progress must be driven by browser promises around each local step and each Avrae `fetch` call.

Recommended update steps:

1. Parse source.
2. Normalize editor model.
3. Validate required sections.
4. Serialize gvar body.
5. Optionally fetch current remote body.
6. Publish with `POST /customizations/gvars/{id}`.
7. Re-fetch remote body.
8. Verify the remote body matches the serialized body.
9. Offer export and run report.

Each step should show:

- label
- target gvar id or logical file/section name
- state: `pending`, `running`, `success`, `warning`, `failed`, `skipped`
- start/end time
- HTTP status when applicable
- sanitized error message
- suggested next action

For future multi-gvar updates, display one row per gvar/file target and use `Promise.allSettled()` so one failure does not hide the rest of the result. Keep concurrency low and make retries explicit.

Failure reason examples:

| Failure | Likely cause | UI action |
|---------|--------------|-----------|
| `missing credentials` / `401` | no token or expired token | ask for token again |
| `403` | token lacks update permission | keep edit/export enabled, publish disabled |
| `404` | wrong gvar id or no access | ask user to verify id/access |
| validation error | malformed config | highlight section and block publish |
| network/CORS error | browser could not reach Avrae | allow export and retry |
| verify mismatch | update response succeeded but refetch differs | show warning, keep export, suggest manual check |

## Pages implementation options

### Option A: static files under `public/`

Use this if the MVP is plain HTML/CSS/JS with no build step.

GitHub settings:

- Settings -> Pages -> Build and deployment
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/public`

Repo changes:

- Add `public/index.html`.
- Add JS/CSS assets below `public/`.
- Add `public/.nojekyll` if generated assets or paths need to bypass Jekyll.

Pros:

- Smallest setup.
- No new Actions workflow needed.
- Easy to inspect and debug.

Cons:

- Harder to use a modern frontend toolchain.
- Build output and source can get mixed together.
- Manual editing of `public/` can conflict with future generated output.

### Option B: `editor/` source plus GitHub Actions Pages deploy

Use this if the editor needs a bundler, tests, TypeScript, or framework.

GitHub settings:

- Settings -> Pages -> Build and deployment
- Source: GitHub Actions

Workflow requirements:

- `permissions: contents: read, pages: write, id-token: write`
- build the editor
- upload static artifact with `actions/upload-pages-artifact`
- deploy with `actions/deploy-pages`
- environment: `github-pages`
- artifact path: `public` if Vite emits to root `public/`

Pros:

- Keeps editor source and output separate.
- Better for a serious app.
- Does not require committing build output.

Cons:

- Adds another workflow.
- Public Actions logs will show build output.
- Need to make sure the Avrae deploy CI and Pages deploy CI do not block each other unnecessarily.

Recommended path:

Use Option B. The editor needs React state, shadcn/ui source components, TypeScript models, parser/serializer tests, and a static build. Keep source in `editor/` and emit generated static files to `public/`.

## Current repo changes needed

- Choose exact GNU license variant.
- Add root `LICENSE`.
- Add a `package.json` `"license"` field with the selected SPDX id.
- Add README license note and third-party content notice.
- Add the editor static app under `editor/`.
- Build the editor to root `public/`.
- Add `.github/workflows/pages.yml` with Pages permissions.
- Add `public/.nojekyll` when generated output needs it.
- Add browser tests for parser/serializer/validation once implementation starts.
- Add a small manual CORS/API smoke checklist because Avrae API behavior is external and not guaranteed by this repo.
