Sells an item to a configured shop.

Usage:

```text
!sell <item> [quantity]
!sell <shop> <item> [quantity]
```

With no shop argument, the command searches shops visible at your current location. With a shop argument, it searches that shop directly. The resolved shop must allow buying from players with `accepts_sells: True`. Item names are matched against shop stock using the shared lookup behavior.

Use `!sell help` for server-aware runtime help.

Configured under: `Economy -> sell`
