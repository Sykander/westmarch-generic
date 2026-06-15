# Forgotten Realms — recipes (batch)

**Prompt:** [`recipes-batch.prompt.md`](recipes-batch.prompt.md)

**Schema:** [Recipe](../../../docs/internal/projects/westmarch-statement/data-shapes.md#recipe)

## Validation

- [ ] List assigns to `config_recipes`
- [ ] Unique `id` per entry
- [ ] Valid `kind`; `workdays` ≥ 1
- [ ] `description` has no quantity/workday repetition

## Integration

> Extend top-level `recipes` in preset config. Enable crafting subsystem commands matching kinds used.

## Note

Engine ships example rows in [recipes.tsv](../../../assets/recipes.tsv) — LLM batches add setting flavour.
