# Content generation prompts

Copy-paste prompts for **external LLMs** (ChatGPT, etc.) to draft bulk **world data** for example configs under [`src/gvars/configs/`](../gvars/configs/).

**Full guide:** [docs/internal/projects/prompt-generation/](../../docs/internal/projects/prompt-generation/README.md) — build order, scale (20–100+ locations), asset catalog.

## File format

| File | Purpose |
|------|---------|
| **`*.prompt.md`** | Copy **entire file** into ChatGPT |
| **`*.md`** | Checklist, integration notes |

Templates: [`_templates/`](_templates/) · Shared snippets: [`_shared/`](_shared/)

## Forgotten Realms prompt set

| # | Asset | Prompt | Batch |
|---|-------|--------|-------|
| 1 | Locations | [`locations.prompt.md`](forgotten-realms/locations.prompt.md) | 10 bootstrap / 10–15 expand |
| 2 | Biome registry | [`biome-registry.prompt.md`](forgotten-realms/biome-registry.prompt.md) | 1 |
| 3 | Paths | [`paths-batch.prompt.md`](forgotten-realms/paths-batch.prompt.md) | 15–25 |
| 4 | Shops | [`shops-batch.prompt.md`](forgotten-realms/shops-batch.prompt.md) | 5–10 |
| 5 | Biome rows | [`biome-pools-batch.prompt.md`](forgotten-realms/biome-pools-batch.prompt.md) | 1 biome |
| 6 | Recipes | [`recipes-batch.prompt.md`](forgotten-realms/recipes-batch.prompt.md) | 8–12 |
| 7 | Books | [`books-batch.prompt.md`](forgotten-realms/books-batch.prompt.md) | 5–8 |
| 8 | Transport | [`world-transport.prompt.md`](forgotten-realms/world-transport.prompt.md) | 1 |
| 9 | Calendar | [`world-calendar.prompt.md`](forgotten-realms/world-calendar.prompt.md) | 1 |

## Workflow (short)

1. Open the **`.prompt.md`** for the asset; fill `[PASTE …]` placeholders.
2. Copy **whole file** → ChatGPT.
3. Validate with matching **`.md`** checklist.
4. Paste output → Cursor for integration into `forgotten_realms_2014.gvar` (or your preset).
5. **`expand-batch`** or **`revision`** templates for follow-ups.

**One asset type per chat.** Do not ask for engine code or subsystem toggles in these prompts.

## Folder layout

```
src/prompts/
  README.md
  _templates/          revision, expand-batch
  _shared/             biome-codes snippet
  forgotten-realms/    FR Sword Coast asset pairs
  generic-fantasy/     (planned — fork FR prompts)
  spelljammer/         (planned)
```

## Tips

- Keep a **master location id list** — paste into every batch prompt.
- After first good batch, use **expand-batch** in the same thread.
- Engine catalogues (monsters, items, spells) come from **TSV**, not these prompts — see [content-pipeline.md](../../docs/internal/projects/westmarch-statement/content-pipeline.md).

## Related

- [prompt-generation/assets.md](../../docs/internal/projects/prompt-generation/assets.md) — full catalog
- [data-shapes.md](../../docs/internal/projects/westmarch-statement/data-shapes.md)
- [gvars/configs.md](../../docs/internal/projects/westmarch-statement/gvars/configs.md)
