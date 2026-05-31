# Forgotten Realms — books (batch)

**Prompt:** [`books-batch.prompt.md`](books-batch.prompt.md)

**Schema:** [public/assets book columns](../../../../public/assets/README.md#book-columns)

## Before you send

Collect `library_topics` from all locations with `library` in `commands`.

## Validation

- [ ] `config_books` list
- [ ] Tags overlap pasted topic list
- [ ] `type` is `original` or `commentary`
- [ ] No empty `name` / `description`
- [ ] Literal `\\n\\n` in description for paragraphs

## Integration

> Merge into top-level `books` in preset. Set `subsystems.content.config.library_topic_source` to `inferred` or `balanced` if using location topics.
