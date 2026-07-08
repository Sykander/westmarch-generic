# First config quickstart

Use this when you want the shortest path from a subscribed workshop to a server-owned `westmarch_config`.

## Goal

Create a config gvar, check it, publish or copy it, set the server svar, and prove that commands are reading your server's config.

## Prerequisites

- Avrae is in your Discord server.
- The westmarch-generic workshop is subscribed.
- You have Avrae permissions to create gvars and set svars, usually **Dragonspeaker** or **Server Aliaser**.
- You have picked a starter source: minimal starter, Forgotten Realms 2014, Westmarch 2014, or a copied config from another server you own.

## Steps

1. Open the Westmarch config editor.
2. Start from a preset or paste an existing config body.
3. Set at least the world name under **Display**.
4. Enable only the subsystems you are ready to support.
5. Open **Check** and fix blocking errors.
6. Export or publish the config gvar body.
7. Copy the final gvar id.
8. In Discord, run:

```text
!svar westmarch_config <your-gvar-id>
```

9. Confirm the server is wired:

```text
!westmarch show
```

10. Try one smoke command for each enabled subsystem.

## Safe first choices

| Area | Safe starting choice |
|------|----------------------|
| `rules_version` | Leave unset unless your table must override Avrae server rules |
| `display.name` | Set to your campaign or server world name |
| Subsystems | Enable only one or two while learning |
| Policies | Keep defaults until a guide tells you why to change one |
| World data | Start small: one default location, one nearby destination, one route |
| Encounters | Use engine biome presets before custom biome gvars |

## Smoke commands

Run only the commands for features you enabled:

```text
!westmarch
!westmarch show
!location
!travel <destination>
!enc <biome>
!forage <biome>
!buy <item>
!wallet
```

If a command says it is disabled, check `subsystems.<name>.enabled` and `subsystems.<name>.commands.<command>`.

## Next guides

- [Editor workflow](editor-workflow.md)
- [Avrae server settings](avrae-server-settings.md)
- [Display and branding](display.md)
- [Subsystems and command toggles](subsystems.md)
- [Validation](validation.md)
- [Troubleshooting](troubleshooting.md)
