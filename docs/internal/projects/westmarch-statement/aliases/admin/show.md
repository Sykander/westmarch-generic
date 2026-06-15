# westmarch show — MVP implementation

**Subsystem:** admin *(not in config)* · **Phase:** 0–1

**Subcommand** of [`!westmarch`](westmarch.md) — readable summary of the server’s loaded config for GMs and content authors.

## Player-facing behaviour

```
!westmarch show
!westmarch show <section>   # optional MVP stretch: exploration | travel | economy | …
```

- **Who may run:** same as [westmarch.md](westmarch.md).
- **Output:** embed explaining **what is configured**, not a raw gvar dump.

### MVP summary sections

| Section | Content |
|---------|---------|
| **Wiring** | Svar name, full config gvar UUID, Avrae dashboard lookup link, load status, optional **`config_version`** |
| **World** | **`display.get_display()`** default title/footer/colour from base **`display`**; **`cfg.display`** fields for show copy ([display.gvar](../../gvars/display.md)) |
| **Subsystems** | Diff codeblock: `+` enabled and valid, neutral lines disabled and valid, `-` enabled with validation errors |
| **Policies** | Summary of `policies.*` — auth, time, travel, downtime, crafting, economy, exploration, combat, quest, content, inventory, **`languages.allowed`**, **`display.footer_behaviour`** — [data-shapes.md § Server policies](../../data-shapes.md#server-policies) |
| **Runtime** | **`get_rules_edition()`** — **`rules_version`** override, else Avrae, else 2014 |
| **Data overview** | Counts where cheap: e.g. N areas, N shops, N books, catalogue sizes |
| **Pointers** | Link to public schema docs; suggest `!westmarch check` if issues suspected |

Each section includes a **one-line explanation** where helpful (e.g. when **`rules_version`** overrides Avrae).

### Explicit non-goals

- Do **not** post full `ITEMS_LIST`, monster shards, or book bodies to Discord.
- Do **not** expose other servers’ data — guild-scoped svar only.

Optional **`verbose`** flag (Phase 1+): extra keys, extension gvar UUIDs, sample area codes — still capped for embed limits.

## Generic architecture

```mermaid
flowchart TD
  A["!westmarch show"] --> B{auth.is_allowed?}
  B -->|no| Z[Permission denied]
  B -->|yes| D[get_config]
  D --> E[admin.summarize_config cfg section]
  E --> F[Embed with field glossary]
```

Footer may note validation warnings from **`check_config.validate()`** (same rules as **`check`**) when useful.

## Implementation checklist

- [ ] **`admin.summarize_config(config, section=None)`**
- [ ] **`show.alias`** under `westmarch/` — permission, optional section arg
- [ ] **`.alias-test`** — template fixture; permission denied; no catalogue dump
- [ ] Wire env + sourcemaps (sub-alias of `westmarch`)

## Related

- [setup.md](setup.md) — onboarding companion
- [westmarch.md](westmarch.md) — parent hub
- [README.md](README.md) — access control
