# Server setup

How to run **westmarch-generic** on your Avrae bot: subscribe to the engine workshop, create a **config gvar**, and wire the **`westmarch_config`** svar.

For architecture and config schema detail, see [internal westmarch-statement](internal/projects/westmarch-statement/server-config.md) (maintainers) and [mvp-commands](internal/projects/westmarch-statement/mvp-commands.md).

---

## Prerequisites

- Avrae bot on your Discord server
- **Dragonspeaker**, **Server Aliaser**, or Discord **Administrator** (required to set svars and run `!westmarch`)
- An Avrae workshop slot for your server’s config gvar

---

## Quick path

1. **Subscribe** to the westmarch-generic engine workshop on [Avrae Workshop](https://avrae.io/dashboard/workshop).
2. **Create** a config gvar — duplicate a [starter or preset](internal/projects/westmarch-statement/gvars/configs.md) or paste via `!gvar editor`.
3. **Set svar** — `!svar westmarch_config <your-gvar-uuid>`
4. **Enable** subsystems in your config gvar (`subsystems.exploration.enabled`, etc.).
5. **Verify** — `!westmarch check` and `!westmarch show`

In Discord you can also run **`!westmarch setup`** for step-by-step embeds (when the engine is deployed).

---

## 1 — Subscribe to the engine

Add the **westmarch-generic** workshop to your bot’s subscribed workshops in the Avrae dashboard. You only need **one** engine subscription — shared helpers ship inside that workshop (not a separate drac2-tools subscription).

Until the public workshop is published, maintainers may self-deploy from this repo ([DEVELOPMENT.md](../DEVELOPMENT.md)).

---

## 2 — Create your config gvar

Your **config gvar** is a workshop module in **your** workshop. It holds toggles, world data, and catalogues — not engine command logic.

**Recommended:** create a new gvar, open the editor, and paste from one of:

- [src/gvars/configs/starter.gvar](../src/gvars/configs/starter.gvar) — minimal schema, all subsystems off
- **Example presets** — Forgotten Realms, generic fantasy, or Spelljammer ([configs doc](internal/projects/westmarch-statement/gvars/configs.md))

```text
!gvar create # westmarch config
!gvar editor <uuid-from-response>
```

When published workshop UUIDs exist for a preset, duplicate that gvar in the Avrae dashboard instead of pasting by hand.

## Example config presets

Optional starting worlds (duplicate into your workshop, then set **`westmarch_config`**). Source files: `src/gvars/configs/` — details in [internal configs doc](internal/projects/westmarch-statement/gvars/configs.md).

| Preset | Setting | Set Avrae rules to |
|--------|---------|-------------------|
| Forgotten Realms (2014) | FR lore and tone | **2014** |
| Forgotten Realms (2024) | FR lore; 2024 tables | **2024** |
| Generic fantasy (2014) | Setting-neutral | **2014** |
| Generic fantasy (2024) | Setting-neutral; 2024 tables | **2024** |
| Spelljammer (2014) | Wildspace / spelljamming | **2014** |

Published workshop UUIDs for each preset will be listed here when available.

---

## 3 — Wire the svar

Point this Discord server at your config gvar:

```text
!svar westmarch_config <your-gvar-uuid>
```

| Item | Value |
|------|--------|
| **Svar name** | `westmarch_config` (fixed) |
| **Value** | 36-character gvar UUID only — not Python or JSON |

**Swap** to another config (season, staging world):

```text
!svar westmarch_config <other-uuid>
```

**Remove** configuration:

```text
!svar delete westmarch_config
```

---

## 4 — Enable subsystems

Edit your config gvar. Set `subsystems.<name>.enabled` to `True` and turn on individual commands under `commands.*` where applicable.

Example — exploration only:

```py
"exploration": {
    "enabled": True,
    "commands": { "forage": True, "enc": False, ... },
    "config": {
        "enc_biome_source": "auto",
        "distribution_policy": "random",
        "distribution": {"combat": 25, "quest": 25, "gather": 50},
    },
},
```

Downtime uses a single toggle: `"downtime": {"enabled": True}`.

Add world data (`locations`, encounter pools, shops, …) as you enable each vertical. Shapes: [data-shapes](internal/projects/westmarch-statement/data-shapes.md).

---

## 5 — Verify

```text
!westmarch check
!westmarch show
```

Fix errors reported by **`check`**, then try a smoke command for an enabled subsystem (e.g. `!forage` once pools exist).

---

## What players see when something is off

| State | Typical message |
|-------|-----------------|
| **`westmarch_config` unset** | Server not configured — GM must set the svar |
| **Svar set but config invalid** | Configuration error — GM runs `!westmarch check` |
| **Subsystem or command disabled in config** | This feature is disabled on this server |
| **Enabled but missing world data** | Command-specific error (e.g. no encounter pool for biome) |

Disabling a feature uses **`subsystems.*.enabled`** or **`commands.*`** in your config gvar — you do **not** need a separate svar per feature.

---

## Rules edition (2014 vs 2024)

Set optionally on your config gvar:

```py
rules_version = "2014"   # or "2024"
```

**Resolution order:** **`rules_version`** on config (if set) → Avrae server rules → **`"2014"`**. Aliases use **`config.get_rules_edition()`** — see [data-shapes](internal/projects/westmarch-statement/data-shapes.md#rules_version).

If **`rules_version`** disagrees with Avrae’s setting, **`!westmarch check`** warns; the config value wins at runtime.

Also set **`display.name`** and related fields for world branding — per-subsystem **`display`** / **`command_display`** and **`policies.display.footer_behaviour`** optional — [data-shapes § display](internal/projects/westmarch-statement/data-shapes.md#display) · [§ Embed display inheritance](internal/projects/westmarch-statement/data-shapes.md#embed-display-inheritance).

---

## Related

- [Documentation index](README.md)
- [DEVELOPMENT.md](../DEVELOPMENT.md) — contributors and self-deploy
- [public/assets/](public/assets/) — example TSV catalogues
