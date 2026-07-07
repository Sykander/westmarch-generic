Looks up configured crafting recipes.

Usage:

```text
!recipe <recipe>
!recipe ingredient <item>
```

Recipe names and ingredient searches use the shared lookup behavior: no matches, exactly one match, or a request to be more specific with a short match list. Recipes are used by crafting when `subsystems.crafting.config.recipe_mode` is `recipes` or `mixed`.

Use `!recipe help` for server-aware runtime help.

Configured under: `Misc -> recipe`
