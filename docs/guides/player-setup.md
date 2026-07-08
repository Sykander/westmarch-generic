# Player Setup

Use this guide when you want players to know what they must prepare before westmarch-generic commands work smoothly.

Player setup is partly Avrae setup, partly server policy, and partly companion-workshop setup. The config can guide and check some of this, but staff should still provide a clear onboarding channel.

## What Players Need

Most servers should tell players to prepare:

- an Avrae-imported character
- the correct rules edition for the server
- any required companion workshop data, such as bags, notes, tools, or vSheet support
- a starting location if the server uses location-aware commands
- any starting wallet, inventory, or downtime expectations

Keep this list server-specific. Do not ask players to install companion workshops your config does not use.

## `policies.player_setup`

Use `policies.player_setup` for table-wide expectations around player readiness.

It should answer:

- which checks are required before using commands
- which checks are advisory
- what message a player sees when setup is incomplete
- whether staff approval is needed before the first expedition

Do not use setup checks as a substitute for public onboarding text. Players still need a readable first-steps channel.

## Companion Workshops

If your server expects companion workshops, document them with command examples and support contacts.

Common examples:

- bags or inventory tracking
- notes or journal tracking
- tool, downtime, or recipe tracking
- vSheet or character-summary helpers

For each one, tell players:

- what to subscribe to
- which first command to run
- what "ready" looks like
- which staff role can help

## Character Import Policy

Align player setup with Avrae server settings.

If your server requires specific source rules, character import behavior, or manual character approval, mention that before asking players to run westmarch commands.

Useful staff checks:

```text
!servsettings
!westmarch
!westmarch show
```

## First Player Smoke Commands

After a player has a character selected, have them run simple read-only commands first.

Suggested sequence:

```text
!westmarch
!location
!location <starter-location>
```

Then test configured subsystems:

```text
!buy
!enc
!travel <nearby-location>
```

Only include commands that are enabled for your server.

## Onboarding Text

Put player setup instructions in a channel such as `#character-creation`, `#getting-started`, or `#westmarch-info`.

Include:

- starting level and allowed sources
- character approval process
- required Avrae setup
- required companion workshops
- first westmarch command
- staff support channel

## Related Guides

- [Avrae server settings](avrae-server-settings.md)
- [Policies](policies.md)
- [Initial server text](initial-channel-texts.md)
- [Companion bots](companion-bots.md)
- [Launch checklist](launch-checklist.md)
