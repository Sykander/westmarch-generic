# Companion bots

westmarch-generic requires Avrae. Other bots are optional and should be added only when they support your server's workflow.

## Recommended optional bots

| Bot | Use |
|-----|-----|
| Dyno | Moderation, action logs, automod, welcome messages, and utility moderation commands |
| Tupperbox | Character proxy messages for roleplay channels |
| Bard Bot | Avrae-triggered sound effects, custom sounds, profiles, music, and ambience in live game voice channels |

## Setup principles

- Put bot logging in staff-only channels.
- Keep bot permissions narrow.
- Test each bot in one private channel before opening it to players.
- Do not let optional bots become required for core westmarch-generic commands.
- Document player-facing bot commands in #meta or #getting-started only after staff approve the workflow.

## Suggested channel access

| Bot | Player channels | Staff channels |
|-----|-----------------|----------------|
| Dyno | Public moderation/welcome features only | Logs, moderator tools, reports |
| Tupperbox | RP channels where proxying is allowed | Tupper logs if enabled |
| Music bot | Live game voice/text channels | None unless staff wants audit notes |

## Guides

- [Dyno setup](dyno-setup.md)
- [Tupperbox setup](tupperbox-setup.md)
- [Bard Bot setup](bardbot-setup.md)
- [Westmarch server setup](server-setup.md)
