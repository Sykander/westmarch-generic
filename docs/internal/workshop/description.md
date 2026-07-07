westmarch-generic is a configurable Avrae workshop for West Marches-style Discord servers.

It provides reusable aliases for exploration, travel, downtime, crafting, economy, library content, quests, and server setup without baking one server's world data into the commands. Each server points the workshop at its own config gvar through the `westmarch_config` svar, so locations, encounter tables, shops, recipes, display text, and feature toggles can be maintained per server.

Server owners start with:

```text
!westmarch setup
```

Use the setup flow to create or bind a config gvar, then run:

```text
!westmarch show
```

to confirm what the engine loads in Discord. The web config editor is the validation surface:

https://sykander.github.io/westmarch-generic/

Need help, want to report issues, or want to follow development? Join the westmarch-generic developer Discord server:

https://discord.gg/Y2M8wZuhDN

Included command groups:

- Admin: `!westmarch`, `!westmarch setup`, `!westmarch show`
- Exploration: `!enc`, `!forage`, `!fish`, `!mine`, `!lumber`, `!hunt`, `!loot`
- Travel: `!travel`, `!location`, `!time`, `!weather`
- Downtime and economy: `!downtime`, `!job`, `!buy`, `!sell`, `!wallet`
- Crafting: `!craft`, `!brew`, `!enchant`, `!scribe`
- Content and misc: `!library`, `!read`, `!quest`, `!recipe`

The default workshop is intentionally generic. Server-specific lore, locations, prices, jobs, books, recipes, encounter pools, and display branding should live in your config gvar or companion content gvars.
