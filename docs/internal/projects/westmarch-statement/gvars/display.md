# display.gvar

**Path:** `src/gvars/utils/display/display.gvar` · **Phase:** 0

Single entry point for **command-scoped embed branding**. Resolves subsystem, command, merged config display layers, and footer policy from the explicit command key + server config, then returns a pre-configured **`get_embed`** from **`core/embeds`**.

Call **once at the top** of each alias (after **`auth.is_allowed(COMMAND)`**) or pass the returned callable into snippets.

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
def get_display(command_override=None):
    """
    Return a configured get_embed callable for this command.

    command_override — canonical command key from auth.gvar COMMAND_MAP.
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

**One public function.** Merge, footer, and command resolution are private helpers — not part of the alias contract.

### Relationship to `core/embeds`

Vendored **`embeds.configure_get_embed`** ([core.md](core.md)) partial-applies defaults to **`get_embed`**:

```py
# drac2-tools pattern — returns lambda with baked-in -title, -footer, -color, …
get_embed = embeds.configure_get_embed(title="Encounter", footer="Tip: …", color="5865F2")
return get_embed(desc=body)                    # branded defaults
return get_embed(title="Override", desc=body)  # per-call title override
```

**`display.get_display(command_override=None)`** is the westmarch-generic wrapper that **computes** those defaults from config + the canonical command key, then delegates to **`configure_get_embed`**.

Permission-denied and other pre-branding exits should use **`embeds.get_embed(...)`** directly (no server display merge).

## Resolution *(internal)*

| Input | Source |
|-------|--------|
| Subsystem + command | Explicit command override — same **`COMMAND_MAP`** as [auth.gvar](auth.md) |
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
_display_cache = {}

def get_display(command_override=None):
    key = "" if command_override is None else str(command_override).strip().lower()
    if key not in _display_cache:
        subsystem, command, _ = _resolve_from_ctx(command_override)
        branding = _build_branding(subsystem, command)
        _display_cache[key] = embeds.configure_get_embed(**branding)
    return _display_cache[key]
```

## Usage

**Standard player alias:**

```py
using(
    auth = env.gvars.auth,
    display = env.gvars.display,
    embeds = env.gvars.embeds,
)

COMMAND = "enc"
ok, msg = auth.is_allowed(COMMAND)
get_embed = display.get_display(COMMAND)

if not ok:
    return get_embed(desc=msg)

# … command logic …

return get_embed(desc=body)
return get_embed(title="Ambiguous match", desc=choices)  # override title when needed
```

**Help subcommand** — same callable; override **`desc`** / **`title`** as usual:

```py
get_embed = display.get_display("enc")
return get_embed(desc=help_text)
```

**Snippets** — parent resolves once, passes callable down (snippets do **not** call **`display.get_display()`** unless they are top-level alias entry points):

```py
get_embed = display.get_display("library")
library.run_search(cfg, get_embed, query)
```

**Admin hub** (`!westmarch show`, `check`, `setup`) — pass the canonical admin command key. Admin commands still resolve to subsystem **`admin`**, so only base world **`display`** applies.

## Not in this module

- Config load / **`DEFAULTS`** merge → [config.md](config.md)
- Permission gate → [auth.md](auth.md)
- Config validation → web config editor
- Raw **`!embed`** string assembly → **`core/embeds`**

## Tests

- **`get_display("enc")`** for exploration **`enc`** fixture — returned callable produces embed with command **`command_display`** title/colour; **`configure_get_embed`** defaults overridable per call.
- **`get_display("show")`** for **`admin` / `show`** — base **`display.name`** still applies; no subsystem display layer is used.
- **`footer_behaviour`** each mode — deterministic PRNG seed in alias-test for **`balanced`** / **`helpful_tips`**.
- Second **`get_display()`** in same invocation returns identical callable (cache).
- Missing or unknown command override falls back to generic westmarch branding.

## Related

- [config.md](config.md) — loader; **`get_rules_edition()`**, **`get_policies()`**
- [data-shapes.md](../data-shapes.md) — `display`, **`command_display`**, **`policies.display`**
- [auth.md](auth.md) — **`COMMAND_MAP`** shared for ctx resolution
- [core.md](core.md) — **`embeds.get_embed`**, **`embeds.configure_get_embed`**
- [mvp-commands.md](../mvp-commands.md)
