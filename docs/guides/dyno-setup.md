# Dyno setup

Dyno is optional. Use it for moderation, logs, automod, welcome messages, and utility commands.

Official references:

- [Dyno docs](https://docs.dyno.gg/)
- [Dyno dashboard](https://dyno.gg/account)
- [Invite Dyno](https://dyno.gg/invite)

## Recommended westmarch role

Use Dyno for server operations, not game mechanics.

Good fits:

- action logs;
- moderation logs;
- automod;
- welcome messages;
- report or support routing;
- basic moderation utilities.

Avoid:

- duplicating Avrae command behavior;
- giving Dyno permissions in private game channels where it is not needed;
- relying on Dyno for westmarch-generic config state.

## Permission checklist

Before enabling moderation modules:

- Put Dyno's role above the roles it should moderate.
- Give Dyno only the permissions required by the modules you enable.
- Give Dyno access to log channels.
- Keep staff-only logs hidden from players.
- Test every action in a private moderation test channel.

Dyno's Automod docs call out role ordering and channel permissions as required checks. Its Action Log docs also call out channel permissions for the log channel.

## Suggested modules

| Module | Purpose |
|--------|---------|
| Action Log | Track deleted/edited messages, joins/leaves, role updates, channel changes |
| Automod | Catch spam, mass mentions, suspicious links, and other disruptive patterns |
| Moderation | Warnings, timeouts, bans, and moderation workflow |
| Welcome | Join messaging and orientation |

Start with logs before enforcement. It is easier to tune automod after staff can see what it would have caught.

## Westmarch-specific setup

Suggested log channels:

- `#logs`
- `#dyno-logs`
- `#moderator-only`
- `#report-something` or ticket channel

Suggested ignored channels:

- staff planning channels where automod would be noisy;
- bot-only test channels;
- private game channels if DMs moderate those manually.

Suggested ignored roles:

- Administrator;
- Moderator;
- trusted bot roles.

Do not ignore ordinary player roles unless there is a clear reason.

## Smoke test

After setup:

1. Confirm Dyno can post to the log channel.
2. Trigger a harmless test event, such as editing a test message.
3. Confirm staff can see the log.
4. Confirm players cannot see staff logs.
5. Test one automod rule in a private test channel before enabling it broadly.

## Next guides

- [Companion bots](companion-bots.md)
- [Westmarch server setup](server-setup.md)
