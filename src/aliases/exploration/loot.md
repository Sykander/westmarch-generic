Starts and resolves loot sessions for configured monster catalogue entries.

Usage: `!loot <creature>`, `!loot <item>`, `!loot`, or `!loot clear`

`!loot <creature>` starts a loot session. `!loot <item>` attempts one lootable entry. `!loot` shows the current session; `!loot clear` ends it.

Creature names use the shared lookup behavior: no matches, exactly one match, or a request to be more specific with matched names.

Starting a session rolls generic westmarch-style loot opportunities from monster type, size, and CR: person-like creatures can carry coins, non-person creatures can have trophies, and edible non-person creatures can provide rations.

The initial loot-session embed can show monster catalogue art. Follow-up session and loot-roll embeds do not repeat the monster image. Numeric DCs can be hidden through `subsystems.exploration.config`.
