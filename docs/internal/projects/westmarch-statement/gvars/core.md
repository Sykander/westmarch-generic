# Core gvars — vendored utilities

**Path:** `src/gvars/core/` · **Phase:** 0–1

Shared **Drac2 helpers** copied into the westmarch-generic workshop — not loaded from a separate [drac2-tools](https://github.com/Sykander/drac2-tools) subscription at runtime.

Server owners subscribe to **one** engine workshop (Option **E1**). Core modules ship in the same sourcemap as **`config`**, **`auth`**, **`pc`**, and subsystem gvars. Aliases import them via **`env.gvars.*`** the same way as any other engine gvar.

---

## Why vendor instead of external `env` refs

| Approach | Owner experience | Maintainer experience |
|----------|------------------|------------------------|
| **External drac2-tools UUIDs in `env`** | Must also subscribe to drac2-tools; two workshops to keep in sync | Engine release tied to another workshop’s deploy |
| **Vendored `core/`** *(this plan)* | One subscription; one upgrade path | Copy/adapt once; evolve in-repo; optional upstream diff |

This satisfies the intent of [US-7.3](../user-stories.md) — reuse community library **implementations** without asking every server owner to wire a second workshop.

---

## Two port kinds

### 1. Core utilities — `src/gvars/core/`

**Pure helpers:** no server config, no westmarch domain rules. Copy from **drac2-tools** `src/gvars/utils/<name>/<name>.gvar`, adjust **`using()`** / env keys, trim unused surface, add to sourcemap.

**Initial candidates** (copy when first caller needs them):

| Module | Upstream | Typical callers |
|--------|----------|-----------------|
| **commands** | drac2-tools `utils/commands` | embeds, multiline flows |
| **embeds** | drac2-tools `utils/embeds` | All player-facing aliases |
| **rolls** | drac2-tools `utils/rolls` | encounters, loot, library, job |
| **strings** | drac2-tools `utils/strings` | encounters, crafting |
| **lists** | drac2-tools `utils/lists` | encounter pools, formatting |
| **dicts** | drac2-tools `utils/dicts` | config merge helpers |
| **regex** | drac2-tools `utils/regex` | parsing, validation |
| **languages** | drac2-tools `utils/languages` | library read (2014-aligned) |
| **bags** | drac2-tools `utils/bags` | **`pc.gvar`** only — not aliases directly |
| **random** | drac2-tools `utils/random` | seeded / deterministic rolls in tests |
| **tools** | drac2-tools `utils/tools` | shared small helpers |

**Do not copy into `core/`:**

- Avrae builtins (`character()`, `vroll()`, `time()`, …)
- Server config or catalogue **data**
- Test-only harness (**`expect`**) — stays beside alias-tests unless a gvar test alias needs it

### 2. Domain engine modules — `src/gvars/<area>/`

**westmarch-specific behaviour.** Copy **relevant code** from the [westmarch](https://github.com/Sykander/westmarch) reference repo and/or drac2-tools, then refactor for this engine:

- Load world data via **`config.get_config()`**, not hard-coded tables
- Route sheet mutations through **`pc.gvar`**, not raw **`coinpurse`** / drac2 **`bags`** in aliases
- Match documented API contracts ([pc.md](pc.md), [encounters.md](encounters.md), …)

**Example — `pc.gvar`:**

| Source | What to port |
|--------|----------------|
| westmarch `src/gvars/utils/bags.gvar` | Downtime, cooldown cvars, bag wrapper patterns |
| drac2-tools `utils/bags` | Low-level **`modify_bag`** / stack semantics (via **`core/bags`** or inlined) |
| *(new)* | Wallet currencies, **`(success, message)`** mutator contract |

Domain modules **may** call **`core/*`** internally; aliases should call the **domain** surface (**`pc`**, **`encounters`**, …), not **`core/bags`** directly.

---

## Layout

```
src/gvars/
  env.dev.gvar / env.prod.gvar    # westmarch-generic UUIDs only
  core/
    commands.gvar
    embeds.gvar
    rolls.gvar
    strings.gvar
    lists.gvar
    …
  config/config.gvar
  auth/auth.gvar
  pc/pc.gvar
  encounters/ …
  world/ …
  …
```

**`env.gvars`** maps short names → workshop UUIDs for **this** repo’s slots. Production **`env`** must **not** reference external drac2-tools UUIDs.

---

## Port workflow

1. **Identify upstream** — drac2-tools path and/or westmarch path in module doc (e.g. [pc.md](pc.md) → westmarch `bags.gvar`).
2. **Copy** into target path under `src/gvars/core/` or domain folder.
3. **Adapt** — replace external `using(env=…)` with `env.gvars.*` from this workshop; drop unused exports; fix Drac2 subset issues.
4. **Provenance** — short header comment in the **`.gvar`** source: upstream repo, path, port date (maintainer-facing, not player docs).
5. **Register** — add slot to **`utils/sourcemap.*.json`**, UUID from **`unused_gvars.md`**, **`make rebuild`**.
6. **Test** — `.alias` + `.alias-test` for core modules that expose logic; alias-tests for domain consumers.
7. **Document** — public API in [gvars/](README.md) or domain doc; link upstream for diffing.

Periodic **upstream diff** against drac2-tools (and westmarch for domain ports) is maintainer hygiene — not automatic sync.

---

## Import conventions

Aliases and engine gvars use the same pattern as today:

```py
using(
    embeds = env.gvars.embeds,
    rolls = env.gvars.rolls,
    pc = env.gvars.pc,
)

return embeds.get_embed(title="Found loot", desc=rolls.format_roll(result))
```

**`embeds.configure_get_embed`** — partial application for aliases with many exit points. Returns a callable with baked-in **`-title`**, **`-footer`**, **`-color`**, etc. Player-facing aliases obtain a pre-configured instance from **`display.get_display()`** ([display.md](display.md)) rather than calling **`configure_get_embed`** directly:

```py
get_embed = display.get_display()
return get_embed(desc=body)
return get_embed(title="Custom", desc=body)  # per-call overrides
```

**Inside `pc.gvar`:**

```py
using(bags = env.gvars.bags)   # core/bags.gvar — not exposed to aliases

ok = bags.modify_bag(ch, item, count, bag)
# wrap → (success, message) for alias contract
```

---

## When to copy vs keep inline

| Situation | Action |
|-----------|--------|
| Used by **two or more** engine modules or aliases | **`core/`** module |
| **Single caller**, &lt; ~15 lines, unlikely to grow | Inline in domain gvar |
| Needs **westmarch config** or **`pc`** write path | Domain gvar, not `core/` |
| Upstream module pulls **heavy unused** deps | Copy subset only; don’t drag entire drac2-tools tree |

---

## Related

- [README.md](README.md) — full engine gvar index
- [pc.md](pc.md) — domain port example (westmarch + core)
- [solution-statement.md](../solution-statement.md) — decision record, engine structure
- [DEVELOPMENT.md](../../../../DEVELOPMENT.md) — sourcemaps, UUIDs, `make rebuild`
