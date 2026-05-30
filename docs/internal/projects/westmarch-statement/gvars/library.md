# library.gvar

**Path:** `src/gvars/content/library.gvar` · **Phase:** 1 (Tier G)

Book **search**, **comprehension**, and **read display** for **`!library`** and **`!read`**. Ports westmarch `utils/library.gvar`; architecture: westmarch `docs/library/library-architecture.md`.

## API

```py
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

Book dict — config or extension gvar; shape in [public/assets/README.md](../../../../public/assets/README.md) (books TSV columns).

Cooldowns: [pc.md](pc.md) keys for library search and deep read throttle.

## Dependencies

- drac2-tools: **`rolls`**, **`embeds`**, **`languages`** (Comprehend Languages)
- Config book catalogue (fiction + real lists merged by owner)

## Related

- [aliases/content/library.md](../aliases/content/library.md) · [read.md](../aliases/content/read.md)
