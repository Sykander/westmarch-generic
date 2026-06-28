Buys an item from a configured shop at your current location.

Usage: `!buy <item> [quantity] [yes]`

Item names are matched against visible shop stock using the shared lookup behavior: no matches, exactly one match, or a request to be more specific. Shops can be configured at the top level as `shops` or under `world_data.shops`.

By default, `!buy <item>` previews the resolved item and price, then shows the exact `!buy "Item Name" yes` command required to complete the purchase. Owners can opt out with `subsystems.economy.config.ask_to_confirm_purchases = False`.

Use `!buy help` for server-aware runtime help.

Configured under: `Economy -> buy`
