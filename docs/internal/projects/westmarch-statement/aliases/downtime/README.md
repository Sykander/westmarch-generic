# Downtime — MVP implementation docs

**Config:** `subsystems.downtime` · Tier D

Single toggle — no per-command flags. Character workday tracking for crafting and other long activities.

## Command

| Command | Doc | Source |
|---------|-----|--------|
| **downtime** | [downtime.md](downtime.md) | westmarch |

## Config

```py
"downtime": { "enabled": True },
```

Optional `DOWNTIME` block for labels and rates ([US-3.4](../../user-stories.md) house rules).

**Policy:** `subsystems.downtime.config.mode` — `"tracked"` \| `"manual"` \| `"off"` ([data-shapes.md](../../data-shapes.md#server-policies)). Subsystem toggle enables the command; policy controls cvar enforcement.

## Related

- [crafting/README.md](../crafting/README.md) — crafting aliases assume manual downtime spend before rolls
