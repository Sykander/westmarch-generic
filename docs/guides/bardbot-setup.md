# Bard Bot setup

Use this guide for Bard Bot, the Discord Dungeon sound-effects bot that can react to Avrae output and play sounds in voice channels.

Bard Bot is optional. westmarch-generic does not require sound automation.

Official references:

- [Discord Dungeon](https://discorddungeon.com/)
- [Bard Bot quick start](https://discorddungeon.com/docs/quick-start)
- [Bard Bot docs](https://discorddungeon.com/docs)
- [The play command](https://discorddungeon.com/docs/basic-usage/04-play-command)

## Recommended westmarch role

Use Bard Bot for:

- Avrae-triggered spell, weapon, and roll sound effects;
- built-in D&D sound effects;
- custom sounds uploaded by staff or players;
- encounter, monster, character, or location sound profiles;
- direct sound playback with `~play`;
- live game ambience in voice channels.

Avoid:

- giving Bard Bot access to staff-only channels by default;
- letting sound commands clutter game text channels;
- requiring Bard Bot access for core gameplay;
- assuming every Avrae output format will trigger sounds forever without retesting after Avrae changes.

## Setup checklist

1. Invite Bard Bot from the official Discord Dungeon docs.
2. Join a Discord voice channel.
3. In the matching text channel, ask Bard Bot to join:

```text
~join
```

4. Confirm it can react to Avrae by running an Avrae action such as a spell cast in the same text channel.
5. Confirm direct playback works:

```text
~play explosion
```

6. Ask for command help:

```text
~help
```

7. Log in through Discord Dungeon if staff want to review built-in sounds, upload custom sounds, or create sound profiles.
8. When testing is complete, disconnect the bot:

```text
~leave
```

## Channel pattern

| Channel | Access |
|---------|--------|
| Game voice channels | Bard Bot can connect and speak |
| Game OOC channels | DMs or hosts can run `~join`, `~play`, and related commands |
| Staff channels | No access unless staff explicitly wants it |
| Public general channels | Usually no sound command access |

## Role pattern

Create a dedicated sound-control role if the server needs tighter command access.

Suggested roles:

- Dungeon Master
- Game Host
- Sound Control

Avoid giving every player global playback control unless your community is small and trusted. Player character profiles can be useful, but staff should still decide which channels allow sound commands.

## Sound Profiles

Bard Bot supports sound profiles and character profiles through Discord Dungeon.

Use profiles when:

- a DM wants a different sound set for an encounter or region;
- a player wants character-specific sounds;
- the server wants shared default ambience;
- a monster or boss should have distinctive effects.

Keep the first launch simple. Start with built-in sounds and one test custom profile before asking every player to configure their own.

## Troubleshooting

If `~join` does not work, check that Bard Bot can see the text channel and access the voice channel.

If Bard Bot joins but cannot be heard, check voice permissions, especially speak permission.

If `~play explosion` works but Avrae-triggered sounds do not, retest with the exact Avrae command from the quick start and check the Discord Dungeon docs or support Discord. Bard Bot depends on Avrae message output, so Avrae output changes can affect automatic triggers.

## Launch Text

Put Bard Bot instructions in #meta or the game channel pins:

```markdown
Bard Bot sound effects are optional. DMs may use Bard Bot in game voice channels.
Keep Bard Bot commands in #game-ooc unless the DM says otherwise.
Ask before triggering custom sounds during a live scene.
```

## Smoke test

1. Join a test voice channel.
2. Run `~join` in the matching text channel.
3. Run `~play explosion`.
4. Run an Avrae spell or attack that should trigger a built-in sound.
5. Confirm only intended channels and roles can control playback.
6. Run `~leave`.

## Next guides

- [Companion bots](companion-bots.md)
- [Westmarch server setup](server-setup.md)
