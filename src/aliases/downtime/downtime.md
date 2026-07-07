Shows and adjusts your available downtime workdays.

Usage: `!downtime`, `!downtime <amount>`, or `!downtime spend <amount>`

When downtime mode is `tracked`, the ledger automatically accrues **1 workday per IRL day** from your first `!westmarch` or `!downtime` check, up to `subsystems.downtime.config.max_workdays`.

Use `!downtime <amount>` to add or spend workdays. Signed numbers and dice expressions are accepted, and `!downtime spend <amount>` always spends the result.

Running `!downtime` creates the downtime cvars in tracked mode if needed.
