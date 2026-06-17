# display.gvar

**Path:** `src/gvars/utils/display/display.gvar` · **Phase:** 0

Single entry point for **command-scoped embed branding**. Resolves subsystem, command, merged config display layers, and footer policy from **`ctx`** + server config, then returns a pre-configured **`get_embed`** from **`core/embeds`**.

Call **once at the top** of each alias (after **`auth.is_allowed()`**) or pass the returned callable into snippets.

Config **data** lives on the owner gvar ([data-shapes.md § Embed display inheritance](../data-shapes.md#embed-display-inheritance)); this module owns **behaviour** — resolution, merge order, defaults, footer modes.

## Dependencies

```py
using(
    config = env.gvars.config,
    embeds = env.gvars.embeds,
)
```

Reads merged config via **`config.get_config()`** only — does not load svars itself.

## API

```py
def get_display():
    """
    Return a configured get_embed callable for this invocation.

    No arguments — infers subsystem + command from ctx (same COMMAND_MAP as auth.gvar),
    merges display layers + footer policy, then:

        return embeds.configure_get_embed(
            title=...,
            desc=...,       # merged description when set
            footer=...,
            image=...,
            thumb=...,      # logo URL
            color=...,      # normalised for core/embeds
        )

    Aliases use the return value like embeds.get_embed — pass desc/title/etc. per
    exit point; unset kwargs keep the configured defaults.

    Cached per alias invocation — safe to call multiple times; same callable returned.
    """
```

**One public function.** Merge, footer, and ctx resolution are private helpers — not part of the alias contract.

### Relationship to `core/embeds`

Vendored **`embeds.configure_get_embed`** ([core.md](core.md)) partial-applies defaults to **`get_embed`**:

```py
# drac2-tools pattern — returns lambda with baked-in -title, -footer, -color, …
get_embed = embeds.configure_get_embed(title="Encounter", footer="Tip: …", color="5865F2")
return get_embed(desc=body)                    # branded defaults
return get_embed(title="Override", desc=body)  # per-call title override
```

**`display.get_display()`** is the westmarch-generic wrapper that **computes** those defaults from config + **`ctx`**, then delegates to **`configure_get_embed`**.

Permission-denied and other pre-branding exits should use **`embeds.get_embed(...)`** directly (no server display merge).

## Resolution *(internal)*

| Input | Source |
|-------|--------|
| Subsystem + command | **`ctx.alias`**, hub subcommand arg — same **`COMMAND_MAP`** as [auth.gvar](auth.md) |
| Display layers | **`cfg.display`** → **`subsystems[subsystem].display`** → **`command_display[command]`** |
| Admin commands | Subsystem **`admin`** — base **`display`** only (no subsystem layer) |
| Footer | **`policies.display.footer_behaviour`** — see [Display policy](../data-shapes.md#display-policy) |
| Thumbnail | **`policies.display.command_thumbnail`** can keep the configured logo/default logo or use the selected PC image |
| Fallbacks | Humanized command/subsystem names, **`display.name`**, guild name, engine default colour |

Engine constants in this gvar (not owner config):

- **`DEFAULT_HELPFUL_TIPS`** — when **`helpful_tips`** / **`balanced`** picks tips and owner list is empty
- **`DEFAULT_CREDITS`** — when **`credits`** mode and **`policies.display.credits`** is `None`
- **`DEFAULT_COLOUR`** — passed to **`configure_get_embed`** when no merged hex

The web config editor validates config shapes; **`display.gvar`** trusts merged config at runtime.

### Footer policy

| `footer_behaviour` | Footer passed to **`configure_get_embed`** |
|--------------------|---------------------------------------------|
| **`helpful_tips`** | Random from **`policies.display.helpful_tips`** or **`DEFAULT_HELPFUL_TIPS`** |
| **`string`** | Merged **`footer`** string, or one random non-empty item from a merged **`footer`** list → merged **`title`** → world **`name`** |
| **`help`** | e.g. *Use `!{command} help` for options* (**`ctx.prefix`**) |
| **`credits`** | **`policies.display.credits`** or **`DEFAULT_CREDITS`** |
| **`balanced`** | Random among the four modes above |

### Command thumbnail policy

`policies.display.command_thumbnail` defaults to **`"default"`**, which uses the merged **`logo`** value or the engine logo. Set it to **`"character"`** when command embeds should use the selected PC image as their default thumbnail. Per-response thumbnails passed by command logic still override this default.

### Per-invocation cache

```py
_cached = None

def get_display():
    global _cached
    if _cached is None:
        subsystem, command, _ = _resolve_from_ctx()
        branding = _build_branding(subsystem, command)
        _cached = embeds.configure_get_embed(**branding)
    return _cached
```

## Usage

**Standard player alias:**

```py
using(
    auth = env.gvars.auth,
    display = env.gvars.display,
    embeds = env.gvars.embeds,
)

ok, msg = auth.is_allowed()
if not ok:
    return get_embed(desc=msg)

get_embed = display.get_display()

# … command logic …

return get_embed(desc=body)
return get_embed(title="Ambiguous match", desc=choices)  # override title when needed
```

**Help subcommand** — same callable; override **`desc`** / **`title`** as usual:

```py
get_embed = display.get_display()
return get_embed(desc=help_text)
```

**Snippets** — parent resolves once, passes callable down (snippets do **not** call **`display.get_display()`** unless they are top-level alias entry points):

```py
get_embed = display.get_display()
library.run_search(cfg, get_embed, query)
```

**Admin hub** (`!westmarch show`, `check`, `setup`) — **`get_display()`** still works; ctx maps to **`admin`** + subcommand, so only base world **`display`** applies.

## Not in this module

- Config load / **`DEFAULTS`** merge → [config.md](config.md)
- Permission gate → [auth.md](auth.md)
- Config validation → web config editor
- Raw **`!embed`** string assembly → **`core/embeds`**

## Tests

- **`get_display()`** for exploration **`enc`** fixture — returned callable produces embed with command **`command_display`** title/colour; **`configure_get_embed`** defaults overridable per call.
- **`get_display()`** for **`admin` / `show`** — base **`display.name`** as default title only.
- **`footer_behaviour`** each mode — deterministic PRNG seed in alias-test for **`balanced`** / **`helpful_tips`**.
- Second **`get_display()`** in same invocation returns identical callable (cache).
- Unknown **`ctx.alias`** — align with auth: either never reached (auth fails first) or fall back to generic westmarch branding *(match auth step 1)*.

## Related

- [config.md](config.md) — loader; **`get_rules_edition()`**, **`get_policies()`**
- [data-shapes.md](../data-shapes.md) — `display`, **`command_display`**, **`policies.display`**
- [auth.md](auth.md) — **`COMMAND_MAP`** shared for ctx resolution
- [core.md](core.md) — **`embeds.get_embed`**, **`embeds.configure_get_embed`**
- [mvp-commands.md](../mvp-commands.md)
