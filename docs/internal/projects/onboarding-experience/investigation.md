# Onboarding experience investigation

Status: initial investigation for planned release `1.1.0`.

No code or test runs were performed for this investigation. This document collects candidate improvements and tradeoffs before a solution statement or implementation plan is written.

## Summary

The strongest onboarding path is likely a layered approach:

1. Let normal player commands use the shipped Forgotten Realms 2014 starter config when `westmarch_config` is unset.
2. Keep `!westmarch setup` and `!westmarch show` explicit that no server-owned `westmarch_config` svar has been set.
3. Add a short starter quest to the Forgotten Realms starter config that teaches command loops in play.
4. Improve the editor's first-config flow so a server configurator can create or export a base config gvar and gets a clear final reminder to set the svar.
5. Add a public guide library and glossary so configurators know what is possible and which concepts matter.
6. Add companion-bot setup guides for common first-server tools such as Dyno, Tupperbox, and Bard Bot.
7. Expose `docs/guides/` through GitHub Pages at `/westmarch-generic/docs/guides/` so the hosted experience is not editor-only.

These ideas complement each other. The fallback makes the workshop immediately usable, the admin messaging preserves correctness, the starter quest teaches by doing, the editor closes the handoff from example world to server-owned config, and the guide library gives configurators a stable learning path.

## Investigation questions

- What should a first-time player be able to do immediately after the workshop is subscribed?
- How do we avoid making the temporary starter experience look like completed server setup?
- Which commands should the starter quest teach first?
- Can the editor create a new Avrae gvar directly, or only update/export existing gvars?
- Which public guides should exist before `1.1.0` ships?
- What terminology needs one canonical public glossary entry?
- How should GitHub Pages expose `docs/guides/` without pulling in root docs or internal planning docs?
- What source-state details do support and tests need to distinguish fallback from configured-server behavior?
- Which pieces are small enough for `1.1.0`, and which should become later onboarding polish?

## Current onboarding friction

| Friction | Impact |
|----------|--------|
| Commands need `westmarch_config` before useful output | New users see setup failure before seeing value |
| Admin setup and player trial are coupled | The workshop cannot act as a playable demo while still saying setup is incomplete |
| Config gvar creation is a separate Avrae/editor handoff | Configurators can edit/export but miss the final svar step |
| Starter data lacks a guided activity | Players have data to query, but no obvious first journey |
| Public guide coverage is thin | Configurators must infer how display, policies, encounters, templates, and publishing fit together |
| Companion bot setup is separate from engine setup | First-time server owners still need moderation logs, proxy rules, and ambience bot boundaries to launch cleanly |
| No single public glossary | Terms like biome, location, encounter pool, template, gvar, and svar require context from scattered docs |
| Guides are repository-first | GitHub Pages hosts the editor, but `docs/guides/` is not yet browseable from the hosted surface |
| Troubleshooting depends on knowing gvar/svar concepts | First-time users need vocabulary before they can diagnose setup |

## Candidate improvements

### 1. Starter fallback when `westmarch_config` is unset

Use the Forgotten Realms 2014 starter config as the resolved runtime config for normal commands only when the svar is absent.

Expected behavior:

- `!westmarch`, `!travel`, `!location`, `!buy`, `!sell`, `!forage`, and other enabled starter commands can work on a fresh subscribed server.
- `!westmarch setup` still says no `westmarch_config` svar has been set.
- `!westmarch show` still reports the server as unwired.
- If `westmarch_config` is set but broken, commands do not fall back silently.

Benefits:

- Users can try the workshop before setup is complete.
- The shipped starter preset gets used as an interactive demo.
- Existing configured servers should be unaffected.

Risks:

- Support output can become ambiguous unless fallback state is visible.
- A server owner may assume the starter config is their server config unless setup/show copy is clear.
- Runtime code needs a reliable source-state distinction, not just `cfg is None`.

Open checks:

- Confirm the runtime env can load the Forgotten Realms starter config without requiring a server-owned UUID.
- Audit auth gating with fallback active.
- Decide whether normal player embeds need a subtle fallback note, or whether admin commands are enough.

### 2. Setup/show unwired messaging

Make admin surfaces explicitly describe the missing-svar state even when normal commands are using starter fallback.

Expected behavior:

- `!westmarch setup` defaults to initial setup when the svar is missing.
- `!westmarch show` titles the status as unwired or starter fallback rather than configured.
- Both commands provide the exact final step:

```text
!svar westmarch_config <your-gvar-id>
```

Benefits:

- Preserves the config ownership model.
- Gives server configurators a clear next action.
- Creates a clean diagnostic path for support.

Risks:

- Copy needs to be concise enough for Discord embeds.
- `show` may need two summary modes: fallback preview vs configured summary.

Open checks:

- Decide whether `show` should list starter fallback subsystem counts.
- Decide whether `setup` should link directly to an editor "create first config" route once that exists.

### 3. Forgotten Realms starter quest

Add a short quest that teaches commands through travel from Waterdeep toward Silverymoon.

Possible flow:

| Step | Activity | Commands taught |
|------|----------|-----------------|
| 1 | Check character/server status in Waterdeep | `!westmarch`, `!location` |
| 2 | Buy travel supplies or a service | `!buy` |
| 3 | Start the journey to Silverymoon | `!travel Silverymoon` |
| 4 | Advance along route steps | `!travel next` |
| 5 | Explore and gather supplies along the way | `!enc`, `!forage`, or another configured exploration command |
| 6 | Sell a recovered or gathered item at a stop | `!sell` |
| 7 | Arrive and inspect Silverymoon | `!location Silverymoon`, optional `!time` / `!weather` |
| 8 | Record or complete quest progress if enabled | `!quest` |

Benefits:

- Converts onboarding from reading docs into play.
- Exercises several configured systems in a realistic order.
- Gives server owners a model for their own custom intro quests.

Risks:

- The quest can become brittle if it requires exact inventory/currency state.
- Some commands may need starter data adjustments before the quest is smooth, especially exploration pools and sellable gathered items.
- If `!quest` is part of the flow, the starter config must enable the misc quest command and compatible policy.

Open checks:

- Review current Waterdeep to Silverymoon route data and stops.
- Confirm where exploration pools, sellable gathered items, and buying shops exist.
- Decide whether quest progress should be formal `!quest` state or softer location/encounter text.

### 4. Editor first-config creation and svar reminder

Improve the editor so a server configurator can create or export their base config from the first-run flow, then gets a clear reminder to wire the server svar.

Possible flow:

1. Open editor.
2. Choose "Create first config".
3. Pick a base preset, defaulting to Forgotten Realms 2014.
4. Edit basic server identity and starter subsystem choices.
5. Run Check.
6. Publish/create the gvar if token permissions allow, or export for manual creation.
7. Show a publish-complete dialog and persistent banner:

```text
!svar westmarch_config <created-or-target-gvar-id>
```

Benefits:

- Closes the biggest handoff gap between editor and Discord.
- Makes the final svar command copyable.
- Keeps tokenless users on a manual export path.

Risks:

- Browser-side Avrae gvar creation may not be supported; update-only may be the available API path.
- Token handling must remain memory-only or explicitly user-approved.
- A transient toast is too easy to miss for the final wiring step.

Open checks:

- Investigate Avrae API support for creating a new gvar from the browser.
- Decide whether the editor should require an existing target gvar id for MVP and treat "create" as manual instructions.
- Add a route or state that setup/show can link to directly.

### 5. Better fresh-server help and docs

Update public setup docs only after behavior exists. The docs should explain the starter fallback as a trial state, not as server configuration.

Potential improvements:

- Add a "Try it before setup" section.
- Add a troubleshooting row for "starter fallback active".
- Add a short "claim this world" path: duplicate/edit config, publish gvar, set svar.
- Link the starter quest as the recommended first player activity.
- Update initial channel text templates after the quest and fallback behavior are settled.

Benefits:

- Reduces support questions after the behavior changes.
- Sets expectations for configured vs starter fallback state.

Risks:

- Guide and setup docs can get ahead of implementation if updated too early.

Open checks:

- Decide whether this belongs in `docs/setup.md`, `docs/guides/server-setup.md`, or both.

### 6. Public configurer guide library

Add focused guides under `docs/guides/` for the configuration jobs a server configurator naturally wants to do.

Detailed guide inventory and prioritization: [guide-library-investigation.md](guide-library-investigation.md).

Initial guide set:

| Guide | Goal |
|-------|------|
| Glossary | Define westmarch-generic terms in public language |
| Avrae server settings | Explain `!servsettings`, rules edition, character import policy, and the settings that must match server config |
| Config display | Explain `display`, command display, colours, footer behavior, thumbnails, and error embeds |
| Policies | Explain what `policies` control, what the engine enforces, and what remains manual |
| World data | Explain locations, paths, transport, calendars, weather, shops, services, and extension gvars |
| Encounters | Explain how to create encounter pools and rows for exploration, quest, combat, and gathering |
| Encounter templates | Explain template ids, args, compact rows, built-ins, and when custom templates are worth adding |
| Config publishing | Explain export, publish, gvar ownership, and setting `westmarch_config` after the editor creates or updates a gvar |
| Companion bots | Explain when to add optional bots and how to keep them from conflicting with Avrae |
| Dyno setup | Explain moderation logs, automod, channel scope, permissions, and diagnostics |
| Tupperbox setup | Explain proxy channels, moderation expectations, and player-facing setup |
| Bard Bot setup | Explain Avrae-triggered sound effects, custom sounds, voice/channel permissions, and support boundaries |

Benefits:

- Gives configurators a learning path that does not require reading internal design docs.
- Reduces support load for repeated concepts.
- Gives editor help links stable public targets.

Risks:

- Guides can drift from editor validation and runtime behavior unless they are updated with behavior changes.
- Too many partial guides can be worse than a few complete guides.

Open checks:

- Decide which guide pages must be complete for `1.1.0` and which can remain planned.
- Decide whether each guide should include editor screenshots after the UI is stable.
- Keep implementation-only details in `docs/internal/` unless configurers need them.

### 7. Guides on GitHub Pages

Expose only `docs/guides/` through the hosted GitHub Pages surface, under:

```text
/westmarch-generic/docs/guides/
```

Possible approaches:

| Option | Shape | Tradeoff |
|--------|-------|----------|
| Static docs links from editor | Add a Docs/Guides entry that points to rendered or raw `docs/guides/` pages | Smallest UI change, but markdown rendering may depend on GitHub |
| Build guides into Pages output | Copy or render `docs/guides/` into `public/docs/guides/` during site build | Better hosted reading experience, but adds build work |
| Docs route inside editor app | Render guide markdown inside the React app | Best integrated experience, more frontend work and routing |
| Separate docs generator | Use a docs tool only for `docs/guides/` and link the editor | Good long-term docs UX, extra dependency and styling choices |

Benefits:

- Lets configurers browse docs from the same hosted surface as the editor.
- Keeps root docs and internal docs out of the Pages docs area unless a topic is moved into `docs/guides/`.
- Creates stable public URLs for editor help links and Discord setup embeds.

Risks:

- Public Pages output must avoid root docs and internal docs.
- Relative links from guide pages to docs outside `docs/guides/` need review because those targets will not be present under `/westmarch-generic/docs/guides/`.
- If generated docs are checked in under `public/`, build churn could become noisy.

Open checks:

- Decide whether guide docs should be rendered markdown, copied markdown, or app routes.
- Decide how to include only `docs/guides/`.
- Decide where the editor should link to docs: top nav, help dialog, section help links, or all three.

## Option matrix

| Improvement | User value | Implementation risk | Best release target |
|-------------|------------|---------------------|---------------------|
| Starter fallback for missing svar | High | Medium | `1.1.0` candidate |
| Setup/show unwired messaging | High | Low to medium | `1.1.0` candidate |
| Editor svar reminder after publish/export | High | Low to medium | `1.1.0` candidate |
| Editor direct gvar creation | High | Unknown | Investigate for `1.1.0`; fallback to manual export |
| Forgotten Realms starter quest | Medium to high | Medium | `1.1.0` candidate if data supports it |
| Public glossary | High | Low | `1.1.0` candidate |
| Configurer guide library | High | Medium | `1.1.0` candidate, phased by guide |
| `docs/guides/` on GitHub Pages | Medium to high | Medium | `1.1.0` candidate if build path is simple |
| Player-facing fallback footer on every command | Low to medium | Low | Defer unless support needs it |
| Full interactive tutorial system | Medium | High | Later release |

## Suggested `1.1.0` slice

Recommended initial release scope:

- Missing-svar starter fallback for normal commands.
- Explicit unwired messaging in `!westmarch setup` and `!westmarch show`.
- Editor publish/export completion reminder with copyable `!svar westmarch_config <gvar-id>`.
- Starter quest design and minimal data pass if the current Forgotten Realms route/shop/gathering data supports it.
- Public guide index and glossary.
- First configurer guides for server settings, display, policies, encounters, encounter templates, and publishing, scoped to what the editor/runtime already support.
- A simple GitHub Pages docs exposure plan for `docs/guides/` under `/westmarch-generic/docs/guides/`.
- Relevant guide and setup docs updated after implementation.

Defer unless investigation proves cheap:

- Browser-side creation of brand-new gvars.
- A full tutorial framework separate from normal quest/encounter data.
- Fully integrated docs rendering inside the editor app.
- Persistent fallback notices on every player command.

## Proposed next docs

After this investigation is reviewed:

1. Write a solution statement for the chosen `1.1.0` slice.
2. Write an implementation plan with runtime, admin command, starter content, editor, docs, and test phases.
3. Update the `1.1.0` release doc from planned scope to actual release notes as work lands.
