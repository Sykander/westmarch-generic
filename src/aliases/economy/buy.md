Buys an item from a configured shop.

Usage:

```text
!buy <item> [quantity] [yes]
!buy <shop> <item> [quantity] [yes]
```

Item names are matched against visible shop stock using the shared lookup behavior: no matches, exactly one match, or a request to be more specific. Shops can be configured at the top level as `shops` or under `world_data.shops`.

With no shop argument, the command searches shops visible at your current location. With a shop argument, it searches that shop directly. By default, `!buy <item>` previews the resolved item and price, then shows the exact `yes` confirmation command required to complete the purchase. Owners can opt out with `subsystems.economy.config.ask_to_confirm_purchases = False`.

Use `!buy help` for server-aware runtime help.

Configured under: `Economy -> buy`
