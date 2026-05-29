# job — MVP implementation

**Subsystem:** economy · **Toggle:** `SUBSYSTEMS.economy.commands.job` · **Phase:** 1 (Tier F)

First economy port. Reference westmarch command: skill check → gp payout → coinpurse credit with cooldown.

## Player-facing behaviour

Work for pay using a skill check; gp is rolled from a payout table based on check total.

```
!job <skill> [bonuses]
```

- **Help** (`!job`, `!job help`, `!job ?`): usage + skill hint.
- **Skill:** prefix match against allowed skills (all 5e skills by default, or config allow-list).
- **Bonuses:** `adv`, `guidance`, `-b …` via drac2-tools `rolls.get_roll`.
- **Cooldown:** 8 hours per character (westmarch default); config `JOB.cooldown_seconds`.
- **Payout:** tiered dice by check total; credit via `ch.coinpurse.modify_coins(gp=…)`.

## westmarch reference

| Artifact | Path |
|----------|------|
| Alias | `westmarch/src/aliases/misc/job.alias` |
| Alias tests | `westmarch/src/aliases/misc/job.alias-test` |

westmarch keeps payout bands and cooldown **hard-coded** in the alias:

| Check total | Payout dice |
|-------------|-------------|
| ≤ 0 | `0` |
| ≤ 5 | `1d4-1` |
| ≤ 10 | `1d4+1` |
| ≤ 15 | `1d6+1` |
| ≤ 20 | `1d8+2` |
| > 20 | `1d8+3` |

Cooldown cvar: `"job_cooldown"` (not namespaced — generic should use `bags.job_cooldown_code`).

No separate job gvar in westmarch; logic is entirely in the alias.

## Generic architecture

```mermaid
flowchart TD
  A[!job alias] --> B{resolve_config}
  B -->|unset| Z[US-6.2 embed]
  B -->|ok| C{economy.commands.job?}
  C -->|off| D[Feature disabled embed]
  C -->|on| E[Resolve skill prefix]
  E --> F[rolls.get_roll check]
  F --> G[economy.job_payout from config bands]
  G --> H[coinpurse.modify_coins + cooldown cvar]
  H --> I[Embed]
```

### Engine vs config split

| Data | Owner | Notes |
|------|-------|-------|
| Roll + embed wiring | **Alias** or thin **`economy.gvar`** | Extract payout loop to gvar if alias grows |
| `JOB.payout_bands` | **Config** | Mirrors westmarch tiers; servers can rebalance |
| `JOB.cooldown_seconds` | **Config** | Default 28800 |
| `JOB.allowed_skills` | **Config** | Optional restrict list |
| Cooldown cvar key | **Engine** `bags` | Add `job_cooldown_code` |
| Skill names / edition | **Engine** + `RULES_EDITION` | Use drac2-tools rolls; branch if 2024 skill renames apply |

### Config loader integration

1. `resolve_config()` + `require_command(cfg, "economy", "job")`
2. Read `cfg.JOB` (or defaults matching westmarch if section missing)
3. Filter skill resolution against `allowed_skills` when set

## Implementation checklist

### Minimum shippable

- [ ] Add `job_cooldown_code` to engine **`bags.gvar`** (or westmarch-generic equivalent)
- [ ] **`economy.gvar`** (optional) — `resolve_payout_band(total, bands)` helper
- [ ] **`job.alias`** — loader, toggle, config bands, namespaced cooldown
- [ ] Template config **`JOB`** section with westmarch-default bands
- [ ] **`job.alias-test`** — port westmarch cases (help, fake skill, sleight, athletic+adv, bonuses)
- [ ] Wire env + sourcemaps

### Improvements over westmarch

- [ ] Payout tables in config ([US-3.4](../user-stories.md) house rules)
- [ ] Skip cooldown in Development env (match exploration aliases)
- [ ] Help lists allowed skills when config restricts them

### Out of scope (initial)

- Job types / employers / location-specific pay (future config extension)
- Integration with **downtime** workdays
- Rune or alternate currency payouts

## Exit criteria

| Criterion | Verification |
|-----------|----------------|
| Valid skill → roll + gp embed | Alias-test |
| Unknown skill → error embed | Alias-test |
| Toggle off / unset svar | Alias-test |
| Payout uses config bands | Unit alias-test with custom band in fixture |
| CI green | GitHub Actions |

## Follow-on ports

[buy.md](buy.md) and [sell.md](sell.md) share **`shops.gvar`**; land after **job** proves economy toggles and coinpurse flows.

## Related

- [README.md](README.md) — economy subsystem
- [buy.md](buy.md) — next in sequence
