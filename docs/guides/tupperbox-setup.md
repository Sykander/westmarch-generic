# Tupperbox setup

Tupperbox is optional. Use it when players roleplay as characters through proxy messages.

Official references:

- [Tupperbox](https://tupperbox.app/)
- [Tupperbox guide](https://tupperbox.app/guide/basics)
- [Tupperbox dashboard](https://tupperbox.app/dashboard/list)

## Recommended westmarch role

Use Tupperbox for roleplay presentation only.

Good fits:

- world RP channels;
- tavern or downtime scenes;
- in-character letters;
- character voice separation.

Avoid:

- requiring Tupperbox for Avrae commands;
- allowing proxying in staff channels;
- allowing proxying where moderation cannot identify the sender.

## Server setup

1. Invite Tupperbox.
2. Give it access only to channels where proxying is allowed.
3. Decide whether proxying is allowed in all RP channels or only selected channels.
4. Set up a staff-visible Tupperbox log if your moderation policy needs one.
5. Add player instructions to #meta or #character-creation.
6. Test with one character profile before launch.

The Tupperbox guide recommends the dashboard for creating profiles, and also documents the `tul!register` command. It also notes that Tupperbox must have access to the channel where proxy messages are sent.

## Player instructions

Tell players:

- where proxying is allowed;
- whether proxies must match approved characters;
- whether avatars must be safe for the server;
- how to reveal sender identity to moderators if needed;
- how to ask for help.

Minimal player example:

```text
tul!register CharacterName cname:text
cname: Hello from character voice.
```

The word `text` is the placeholder in the bracket pattern. Players replace it with the message they want to send.

## Moderation notes

Require a log channel if:

- your server allows public RP with proxy messages;
- moderators need to review deleted or edited RP posts;
- players can create many character profiles.

If you do not enable logging, document how moderators should identify the sender of a proxy message.

## Smoke test

1. Create a test tupper.
2. Send a proxy message in an allowed RP channel.
3. Confirm the original message is replaced.
4. Confirm proxying does not work in disallowed channels.
5. Confirm staff can identify the sender through your chosen moderation workflow.

## Next guides

- [Companion bots](companion-bots.md)
- [Initial server text](initial-channel-texts.md)
