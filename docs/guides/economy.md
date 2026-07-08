# Economy

Use this guide when you want westmarch-generic commands to handle wallets, shops, buying, selling, jobs, and location services.

The economy should support play without replacing staff judgment. Configure the common, repeatable flows and keep special rewards or unusual trades manual until they are worth encoding.

## Economy Pieces

| Piece | Purpose |
|-------|---------|
| Currency | Defines the coin or token units players use |
| Wallet behavior | Controls how balances are shown or updated |
| Shops | Define what can be bought and where |
| Stock | Controls item availability, prices, and limits |
| Sell rules | Decide what players can sell and how prices are calculated |
| Jobs or services | Provide repeatable earning or spending hooks |
| Location services | Attach economy actions to specific places |

## Start With One Shop

For a first economy pass, configure one general shop at a starter location.

Give it:

- a clear location
- a small item list
- simple prices
- a short description
- predictable buy behavior

Then smoke test:

```text
!location <shop-location>
!buy
!buy <item-name>
!sell
```

Build out more shops after the basic loop works.

## Buying

Buying should be obvious to players:

- which shop they are buying from
- whether the item is in stock
- what the price is
- whether there are purchase limits
- whether the command changes character inventory, wallet state, or only emits guidance

If a command depends on character setup, mention that in player onboarding text and in staff support notes.

## Selling

Selling is easier to abuse than buying. Keep initial sell rules narrow.

Safer first settings:

- only allow sale of known configured items
- use conservative resale values
- require staff review for rare or story items
- keep gathered resource sell values low until the gathering loop is tested

Avoid generic "sell anything" behavior unless staff are comfortable with the consequences.

## Jobs And Services

Jobs and services can give players simple things to do between adventures.

Examples:

- dock work in a port
- caravan guard work at a trade hub
- herb gathering near a forest settlement
- paid research at a library
- healer, stable, room, or transport services

Tie these to locations so the world feels coherent.

## Location Economy

When economy commands are location-aware, decide:

- which locations have shops
- which locations buy goods
- where jobs are available
- whether prices differ by location
- whether travel should unlock better markets

This helps make travel meaningful without requiring a huge encounter design pass.

## Staff Review Points

Review economy config when:

- a new shop is added
- a new gathered resource becomes sellable
- a price changes by a large amount
- a command starts writing to character or server state
- players find a repeatable profit loop

## Smoke Tests

Run these in a test channel before launch:

```text
!westmarch show
!location <shop-location>
!buy
!buy <known-item>
!sell
!sell <known-sellable-item>
```

Also test a missing item and an ambiguous item name so staff know what players will see.

## Related Guides

- [World data](world-data.md)
- [Locations and travel](locations-and-travel.md)
- [Policies](policies.md)
- [Player setup](player-setup.md)
- [Troubleshooting](troubleshooting.md)
