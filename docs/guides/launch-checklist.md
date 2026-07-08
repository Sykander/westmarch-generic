# Launch Checklist

Use this checklist before inviting players to use westmarch-generic commands on a live server.

The goal is not to prove every edge case. The goal is to catch missing config, broken gvar wiring, disabled command surprises, and incomplete onboarding text before players hit them.

## Config Wiring

- The live config is owned by the server owner or trusted config maintainer.
- A current JSON backup exists outside Avrae.
- The server svar points at the intended config gvar:

```text
!svar westmarch_config <your-gvar-id>
```

- `!westmarch show` reports the expected config.
- Staff know where the source JSON and extension gvar ids are stored.

## Editor Check

- The config passes the editor Check page with no errors.
- Warnings have been reviewed and accepted or fixed.
- Display, subsystem toggles, policies, world data, locations, shops, and encounters have been reviewed.
- The published gvar id matches the one in `westmarch_config`.

## Server Settings

- `!servsettings` matches the intended rules edition and character import policy.
- Avrae has access to the command channels where players will use westmarch commands.
- Admin-only setup commands are limited to staff-controlled channels or roles by server practice.
- Companion workshop expectations are documented for players.

## Smoke Commands

Run these in a staff test channel:

```text
!westmarch
!westmarch show
!location
!location <starter-location>
```

Then test only the subsystems your server enables:

```text
!travel <nearby-location>
!buy
!buy <known-item>
!sell
!enc
!forage
```

Also test one bad or unknown lookup term so staff see the failure style.

## Public Text

Before launch, publish or update:

- rules and safety text
- getting-started instructions
- character creation requirements
- westmarch command overview
- first quest or first activity prompt
- support channel and staff role

Use the initial channel text guide as a starting point and edit it for the server.

## Companion Bots

If optional bots are installed:

- Dyno logs are writing to the intended staff channel.
- Automod is not blocking normal Avrae or Tupperbox output.
- Tupperbox proxying works only in allowed channels.
- Music or ambience bots are limited to voice and bot-control channels.
- Staff know which bot is authoritative for moderation logs and cleanup.

## First Player Trial

Have one staff member or trusted tester go through onboarding as a new player:

1. Read the public setup text.
2. Select or import a character.
3. Run the first westmarch command.
4. Visit the starter location.
5. Try one enabled subsystem command.
6. Report confusing copy, missing permissions, or broken links.

Fix onboarding text before inviting the full player group.

## Related Guides

- [First config quickstart](first-config.md)
- [Validation](validation.md)
- [Avrae server settings](avrae-server-settings.md)
- [Initial server text](initial-channel-texts.md)
- [Companion bots](companion-bots.md)
