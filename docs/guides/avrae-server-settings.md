# Avrae server settings

Use this guide before publishing a new westmarch-generic config.

## What belongs in Avrae settings

Avrae server settings are not the same as `westmarch_config`.

| Setting area | Where it lives |
|--------------|----------------|
| Avrae rules edition | Avrae server settings, unless config `rules_version` overrides it |
| Character import behavior | Avrae server settings and your Discord onboarding text |
| Workshop subscriptions | Avrae dashboard or `!servalias sub` |
| westmarch-generic config id | `!svar westmarch_config <gvar-id>` |
| Command toggles and world data | The config gvar |

## Rules edition

westmarch-generic resolves rules edition in this order:

1. `rules_version` in the config gvar, when set.
2. Avrae server rules from `!servsettings`, when available.
3. `"2014"` fallback.

Recommended:

- Use Avrae server settings as the normal source of truth.
- Set `rules_version` only when this config must deliberately override the server default.
- Make Discord character-creation text match the chosen edition.

## Character import policy

Your server text should tell players:

- which sheet tools are allowed;
- where to import and update characters;
- which command checks they should run after import;
- who approves characters.

If your `policies.player_setup` checks for companion workshop state, make sure those companion workshop setup steps appear in your player-facing onboarding.

## Server setting checklist

Before launch:

- Confirm Avrae is in the server.
- Confirm the westmarch-generic workshop is subscribed.
- Confirm Avrae rules edition matches your config/preset.
- Confirm players can import or select characters in the intended channels.
- Confirm configurators have **Dragonspeaker** or **Server Aliaser**.
- Confirm `!westmarch setup` and `!westmarch show` are available to configurators.

## Smoke test

Run:

```text
!servsettings
!westmarch show
!westmarch
```

Then test one enabled player command with a selected character.

## Next guides

- [First config quickstart](first-config.md)
- [Player setup](player-setup.md)
- [Troubleshooting](troubleshooting.md)
