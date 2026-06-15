# Content — MVP implementation docs

**Config:** `subsystems.content` · Tier G

Book search and deep reading. Shared **`library.gvar`** engine.

## Commands

| # | Command | Doc | Source |
|---|---------|-----|--------|
| 1 | **library** | [library.md](library.md) | westmarch — topic search + quick skim |
| 2 | **read** | [read.md](read.md) | westmarch — deep read + 8h cooldown |

## Config

```py
"content": {
    "enabled": True,
    "commands": { "library": True, "read": True },
    "config": {
        "library_topic_source": "manual",   # inferred | balanced | manual | restricted
        "allowed_topics": [],               # required when restricted — non-empty list
    },
},
```

### `library_topic_source` *(library search only)*

| Mode | Summary |
|------|---------|
| **`inferred`** | Topics from location, recent exploration/crafting, character profile — **no** player topic args |
| **`balanced`** | Inferred topics **+** optional player topics |
| **`manual`** | Player topics only — **required** |
| **`restricted`** | Player topics only — **required**, must match **`allowed_topics`** |

Full spec: [data-shapes.md § content.config](../../data-shapes.md#contentconfig).

Book catalogues: [assets/books-forgotten-realms.tsv](../../../../../../assets/books-forgotten-realms.tsv) (Forgotten Realms in-universe works), [books-real.tsv](../../../../../../assets/books-real.tsv) (public-domain works — use **`content_link`** for full text URLs). Shape: [data-shapes.md § Book](../../data-shapes.md#book). Merge or keep separate at build time.

Reference: [westmarch library architecture](https://github.com/Sykander/westmarch/blob/main/docs/library/library-architecture.md).

## Implementation order

Port **library** first (including topic policy), then **read**.

## Related

- [user-stories.md](../../user-stories.md) — US-6.5
