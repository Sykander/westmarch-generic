# library.gvar

**Path:** `src/gvars/content/library.gvar` · **Phase:** 1 (Tier G)

Book **search**, **comprehension**, and **read display** for **`!library`** and **`!read`**. Ports westmarch `utils/library.gvar`; architecture: westmarch `docs/library/library-architecture.md`.

Topic resolution for **`!library`** follows **`subsystems.content.config`** — [data-shapes.md § content.config](../data-shapes.md#contentconfig).

## API

```py
def infer_topics(config, character):
    """
    Build topic list from location, [stats.gvar](stats.md) exploration history, and character profile.
    Used when library_topic_source is inferred or balanced.
    Returns list[str] — may be empty.
    """

def resolve_search_topics(config, character, args, argslist):
    """
    Apply content.config.library_topic_source (+ allowed_topics for restricted).
    Returns (topics, error_message) — error_message set when player input invalid or missing.
    """

def search_by_topics(config, topics, character, args, argslist):
    """Topic/tag search → one random matching book from config catalogue."""

def read_book(book, character, args, mode, argslist):
    """
    mode: "quick_read" | "deep_read"
    Runs comprehension rolls, censoring, decay — returns result dict for display.
    """

def read_display(read_result):
    """Embed-ready title + description."""

def get_comprehension(character, book_id):
    """Per-book comprehension cvar (decay over time)."""
```

**Alias flow:** **`resolve_search_topics`** → **`search_by_topics`** → **`read_book(quick_read)`** → **`read_display`**.

| `library_topic_source` | `resolve_search_topics` |
|------------------------|-------------------------|
| **`inferred`** | **`infer_topics`** only; reject if user passed topic args |
| **`balanced`** | **`infer_topics`** ∪ parsed user topics |
| **`manual`** | User topics required; no inference |
| **`restricted`** | User topics required; each must match **`allowed_topics`** |

Book dict — config or extension gvar; shape in [public/assets/README.md](../../../../public/assets/README.md) (books TSV columns).

Cooldowns: [pc.md](pc.md) keys for library search and deep read throttle.

## Dependencies

- **`core/`** — **`rolls`**, **`embeds`**, **`languages`** via `env.gvars.*` ([core.md](core.md))
- **`config.get_config()`** — **`subsystems.content.config`**, book catalogue, **`locations`**
- **`journeys.gvar`** / location cvars — location signal for inference
- **`pc.gvar`** — exploration/crafting history cvars for inference *(when wired)*

## Related

- [aliases/content/library.md](../aliases/content/library.md) · [read.md](../aliases/content/read.md)
- [data-shapes.md § content.config](../data-shapes.md#contentconfig)
