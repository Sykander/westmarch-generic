# read — MVP implementation

**Subsystem:** content · **Toggle:** `subsystems.content.commands.read` · **Phase:** 1 (Tier G)

Deep read companion to [library.md](library.md). Same **`library.gvar`** engine; `deep_read` mode + 8h cooldown.

## Player-facing behaviour

```
!read <title> [-author author] [comprehend] [bonuses]
```

- **Search:** `library.search_by_name(name, author)` — disambiguation embed if multiple hits.
- **Read:** `library.read_book(..., "deep_read", ...)` + `library.read_display`.
- **Cooldown:** 28800s (`bags.read_cooldown_code`); skip in Development.
- **Comprehension:** full body (not 120-char quick skim); skill roll in embed field when present.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/misc/read.alias` |
| Alias tests | `westmarch/src/aliases/misc/read.alias-test` |
| Engine | `westmarch/src/gvars/utils/library.gvar` |
| Architecture | `westmarch/docs/library/library-architecture.md` |

## Generic architecture

Same loader path as library; toggle `content.commands.read`.

```text
search_by_name → read_book(deep_read) → read_display
```

**`!read`** is not affected by **`library_topic_source`** — it always uses title/author search ([read.md](read.md)).

## Prerequisites

- [content/library.md](../content/library.md) — **`library.gvar`** ported, config `BOOKS`
- **`bags.read_cooldown_code`**, **`book_comprehension_code`**

## Implementation checklist

- [ ] **`read.alias`** — loader, content toggle, author disambiguation
- [ ] Share config fixture with library alias-tests
- [ ] **`read.alias-test`** — help, single book deep read, cooldown message shape
- [ ] **`rules_edition`** — languages helper path

## Exit criteria

Parity with westmarch read flow for fixture book; library+read toggles independent.

## Related

- [library.md](library.md) — port first
- [README.md](README.md) — content subsystem index
- [quest.md](quest.md) — next in misc sequence
