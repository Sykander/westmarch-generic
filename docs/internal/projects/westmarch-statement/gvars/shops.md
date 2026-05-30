# shops.gvar

**Path:** `src/gvars/economy/shops.gvar` · **Phase:** 1 (Tier F)

Resolve **shop** definitions from config and run **buy** / **sell** transactions (price checks + [pc.md](pc.md) mutations).

## API

```py
def find_shop(config, query, character_location_id=None):
    """By shop id, name prefix, or location services gate."""

def list_stock(shop, config):
    """Items available at shop with resolved prices."""

def find_stock_item(shop, item_query, config):
    """Match player item name to shop row."""

def buy(ch, config, shop, item, qty=1):
    """Debit gp/wallet via pc; add bag items. Returns (success, message)."""

def sell(ch, config, shop, item, qty=1):
    """Credit gp/wallet; remove from bag. Returns (success, message)."""
```

Shop shape *(config — document fully in data-shapes when buy/sell spec lands)*:

```py
{
    "id": "forest_general",
    "name": "Forest General Store",
    "location_id": "oakwood",       # optional gate
    "stock": [
        { "item": "Rope", "price": { "gold": 1 }, "qty": 10 },
        { "item": "Potion of Healing", "price": { "shards": 2 } },
    ],
    "buyback": 0.5,                 # optional fraction of list price
}
```

Item names join [items.md](items.md). Non-`gold` price keys are wallet currency ids.

## Related

- [aliases/economy/buy.md](../aliases/economy/buy.md) · [sell.md](../aliases/economy/sell.md)
- [pc.md](pc.md)
