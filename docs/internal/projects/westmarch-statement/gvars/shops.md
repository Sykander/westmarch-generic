# shops.gvar

**Path:** `src/gvars/utils/economy/shops.gvar` · **Phase:** 1 (Tier F)

Resolve **shop** definitions from config and run **buy** / **sell** transactions. All sheet changes go through **[pc.gvar](pc.md)** — aliases never call coinpurse or **`core/bags`** directly.

Config shapes: [data-shapes.md § Shop](../data-shapes.md#shop), [StockEntry](../data-shapes.md#stockentry).

## API

```py
def find_shop(config, query, character_location_id=None):
    """By shop id, name prefix, or location gate. Returns (shop, error_message)."""

def list_shops(config, character_location_id=None):
    """Shops the player can access at current location (or all when no travel gate)."""

def list_stock(shop, config):
    """Stock rows with resolved buy prices for embeds."""

def find_stock_item(shop, item_query, config):
    """Prefix / exact name match on stock display names."""

def price_for_buy(shop, stock_entry, qty):
    """Total price dict — { gold, wallet_id, … }."""

def price_for_sell(shop, stock_entry, qty):
    """Sell payout dict — buyback × list price unless sell_price set."""

def trade_text(config, character_location_id=None):
    """Markdown yaml code block summarizing visible shop buy/sell prices."""

def buy(ch, config, shop, item_query, qty=1):
    """
    Validate funds, debit via pc.modify_gold / pc.modify_wallet, then add item rows
    through pc.modify_bag or complete service rows without bag mutation.
    Returns (success, message).
    """

def sell(ch, config, shop, item_query, qty=1):
    """
    Validate inventory, pc.modify_bag remove, credit via pc mutators.
    Returns (success, message).
    """
```

## Config: `shops`

Top-level **`shops`** dict on owner config — see [data-shapes § Shop](../data-shapes.md#shop):

```py
shops = {
    "general_store": {
        "id": "general_store",
        "name": "General Store",
        "location_id": "oakwood",
        "accepts_sells": True,
        "buyback": 0.5,
        "stock": [
            { "item": "Rope", "price": { "gold": 1 } },
            { "item": "Potion of Healing", "price": { "shards": 2 }, "qty": 5 },
            { "item": "Stabling (1 day)", "price": { "gold": 0.5 }, "fulfillment": "service" },
            { "display_name": "Shiny Ring", "item": "Ring of Protection", "price": { "gold": 20 } },
        ],
    },
}
```

| Field | Role |
|-------|------|
| **`price.gold`** | gp — **`pc.modify_gold`** |
| **`price.<wallet_id>`** | Config **`currencies`** — **`pc.modify_wallet`** |
| **`accepts_sells`** | Gate for **`!sell`** |
| **`buyback`** | Default sell fraction when **`sell_price`** omitted on row |
| **`display_name`** | Optional stock-row name players see/search; **`item`** stays the delivered bag/catalogue target |
| **`fulfillment`** | Optional stock-row mode; **`service`** charges without adding a bag item |

Stock display names are matched with the shared `lists.search_list` behavior: exact, case-insensitive exact, then substring. Explicit `price` rows do not need catalogue validation during lookup; when `price` is omitted, the engine falls back to the bundled item/potion/magic item catalogues plus owner entries from `world_data.items`, `world_data.catalogues.items`, or `extensions.items` to infer value. Rows whose `fulfillment`, `kind`, or `type` is `service` are treated as services: `!buy` charges for them and does not add a bag item, while `!sell` rejects them.

## Related

- [aliases/economy/buy.md](../aliases/economy/buy.md) · [sell.md](../aliases/economy/sell.md)
- [pc.md](pc.md)
