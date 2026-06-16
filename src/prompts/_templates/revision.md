# Revision prompt

Use when ChatGPT’s first output failed validation.

**Prompt file:** [`revision.prompt.md`](revision.prompt.md) — copy the **entire file** into the same chat (or a new one), then fill in the `[PASTE …]` placeholders before sending.

Attach:

1. The specific errors (from the asset’s validation checklist).
2. ChatGPT’s previous output.

Do not redesign unrelated entries — only fix what failed validation.

For raw biome JSON rows, ask for a fenced `json` block. For config structures, ask for fenced `python`.
