# library.gvar

**Path:** `src/gvars/utils/content/library.gvar` · **Phase:** 1 (Tier G)

Book **search**, **comprehension**, and **read display** for **`!library`** and **`!read`**. Ports westmarch `utils/library.gvar`; architecture: westmarch `docs/library/library-architecture.md`.

Topic resolution for **`!library`** follows **`subsystems.content.config`** — [data-shapes.md § content.config](../data-shapes.md#contentconfig).

Book dict shape: [data-shapes.md § Book](../data-shapes.md#book). Sources are read in this order:

1. `subsystems.content.config.books`
2. top-level `books`
3. `world_data.books`
4. `world_data.book_gvar_ids` / `world_data.book_gvars`
5. `extensions.books`

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
    """
    Embed-ready title + description.
    Appends content_link when book has content_link and comprehension_score >= 100.
    """

def get_comprehension(character, book_id):
    """Per-book comprehension cvar (decay over time). Keyed by book name."""
```

**Alias flow:** **`resolve_search_topics`** → **`search_by_topics`** → **`read_book(quick_read)`** → **`read_display`**.

| `library_topic_source` | `resolve_search_topics` |
|------------------------|-------------------------|
| **`inferred`** | **`infer_topics`** only; reject if user passed topic args |
| **`balanced`** | **`infer_topics`** ∪ parsed user topics |
| **`manual`** | User topics required; no inference |
| **`restricted`** | User topics required; each must match **`allowed_topics`** |

Cooldowns: [pc.md](pc.md) keys for library search and deep read throttle.

## `read_display` and `content_link`

Full books do not live in Discord embeds. Each [Book](../data-shapes.md#book) has:

- **`description`** — excerpt/summary shown in the embed (comprehension may censor or limit visible text).
- **`content_link`** *(optional)* — HTTPS URL to the full work elsewhere (typical for public-domain **`books-real`** rows).

**Link visibility** — append a markdown link to the embed **only when**:

| Condition | Required |
|-----------|----------|
| `book.get("content_link")` | Non-empty string |
| `read_result["comprehension_score"]` | **≥ 100** (after this read updates comprehension) |

If either fails, **`read_display`** must **not** mention **`content_link`**.

**Not shown:** search result embeds before a read; books with no **`content_link`**; partial comprehension (&lt; 100).

**Suggested copy:** `[Read the full text online]({content_link})` as a final line after the description block.

Both **`quick_read`** (`!library`) and **`deep_read`** (`!read`) use the same **`read_display`** rules.

## Dependencies

- **`core/`** — **`rolls`**, **`embeds`**, **`languages`** via `env.gvars.*` ([core.md](core.md))
- **`config.get_config()`** — **`subsystems.content.config`**, book catalogue, **`locations`**
- **`journeys.gvar`** / location cvars — location signal for inference
- **`pc.gvar`** — exploration/crafting history cvars for inference *(when wired)*

## Related

- [aliases/content/library.md](../aliases/content/library.md) · [read.md](../aliases/content/read.md)
- [data-shapes.md § Book](../data-shapes.md#book) · [§ content.config](../data-shapes.md#contentconfig)
