# Westmarch server setup guide

This guide covers the Discord-side setup for a new westmarch server: create the server, invite the core bots, subscribe Avrae to the right workshops, and do a first launch check.

For the westmarch-generic engine and config gvar setup, see [Server setup](../setup.md).

---

## 1. Create the Discord server

Start from a blank Discord server, or start from the westmarch server template:

[Westmarch server template](https://discord.new/VkbanhK5k8pD)

If you are not using the template, set up the basic structure before inviting players:

- Enable Community features if you want rules screening, announcements, server discovery, or onboarding.
- Set default notifications to **Only @mentions**.
- Create staff roles before player roles so permissions are clear from the start.
- Create a shared **Bot** role and give it to every bot after invite.

Recommended roles:

| Role | Purpose |
|------|---------|
| **Administrator** | Full server administration |
| **Moderator** | Player support, moderation, tickets, and moderation actions |
| **Maintainer** | Server setup, config gvars, Avrae workshop subscriptions, and automation |
| **Dragonspeaker** | Avrae aliasing permissions for server aliases, svars, and gvars |
| **Dungeon Master** | Runs sessions and manages game-facing channels |
| **Adventurer** | Verified player access |
| **Bot** | Shared base role for bots |
| **Looking for Group** | Players who want LFG pings |
| **He/Him** | Optional pronoun role |
| **She/Her** | Optional pronoun role |
| **Pronouns in Bio** | Optional pronoun pointer role |

Keep bot permissions narrow where practical. A shared **Bot** role is useful for channel access, but each bot may still need its own permissions from its invite flow.

### Channels & Roles onboarding

Use Discord's **Channels & Roles** customization questions to let players self-assign common onboarding roles.

| Question | Answer option | Grants |
|----------|---------------|--------|
| **Are you ready to create your character and begin your journey in Westmarch?** | **Yes** | **Adventurer** |
| **What things do you want to be pinged for?** | **Looking for Group** — get pings when someone is looking for a group to play with | **Looking for Group** |
| **What pronouns should people use to refer to you?** | **He/Him** | **He/Him** |
| **What pronouns should people use to refer to you?** | **She/Her** | **She/Her** |
| **What pronouns should people use to refer to you?** | **Other** — put your preferred pronouns in your bio | **Pronouns in Bio** |

---

## 2. Create the main channel layout

A westmarch server usually needs persistent information, community space, world channels, staff coordination, and live-game areas.

Suggested categories:

| Category | Channels |
|----------|----------|
| **Start Here** | #rules, #getting-started, #westmarch, #character-creation, #meta, #welcome |
| **General** | #general, #questions, #bot, #media, #community, #hangout |
| **Westmarch** | #quests, #adventurers, #ooc |
| **World** | Location channels for actual places players can travel to in the world |
| **Dungeon Masters** | #discussion, #directory, #world-info, #meta, #bot, #hangout |
| **Maintainers** | #discussion, #suggestions, #bot, #meta, #hangout |
| **Moderators** | #discussion, #moderator-only, #logs, #dyno-logs, #report-something, #hangout |
| **Game 1** | #ooc, #game, #rp, voice #vc |
| **Game 2** | #ooc, #game, #rp, voice #vc |
| **Game 3** | #ooc, #game, #rp, voice #vc |

Lock **Dungeon Masters**, **Maintainers**, and **Moderators** to their staff roles. The **Dungeon Masters** category can still include a player-visible #directory channel that lists current DMs and what they run; give players read-only access to that channel if it lives inside the staff category.

Let Avrae see and speak in any channel where players will run game commands.

---

## 3. Add starter channel posts

Use these as first-pass posts while building the server. They avoid setting-specific lore by default; edit names, tone, allowed sources, staff contacts, and world details to match the actual community before launch.

### #getting-started

Paste this into the getting-started channel:

```markdown
# ✨ Welcome to Westmarch! ✨
Thanks for joining us! We're excited to have you here and look forward to playing with you. Westmarch is a collaborative world where adventurers shape the story through quests, dungeons, and roleplay.
## Getting Started
Welcome to Westmarch, and thank you for joining us!

First, please make sure you've read and understand #rules and, if you'd like, read about the server and what it's for in #westmarch.
## Next Steps
To get started, head over to Channels & Roles and answer the questions to get the Adventurer role.
You need this role to see most of the channels below.

Then read #character-creation to start making your character.

Once you're all set up, you can dive into adventures by:
* joining quests in #quests
* or engaging in roleplay in the World location channels.

Guides and rules on how to play can be found in #meta.

We look forward to playing with you and seeing how you shape the world!
```

### #rules

Paste this into the rules channel:

```markdown
# Server Rules
## **1. Respectful Communication**
Treat everyone with respect. Absolutely no harassment, witch hunting, sexism, racism, or hate speech will be tolerated.
## **2. No Spam**
No spam or self-promotion (server invites, advertisements, etc.) without permission from a staff member. This includes DMing fellow members, excessive messages, irrelevant content, and unnecessary @mentions.
## **3. Keep it clean**
No age-restricted or obscene content. This includes text, images, or links featuring nudity, sex, hard violence, or other graphically disturbing content.
## **4. Respect Privacy**
Do not share personal information about yourself or others without explicit consent. This includes addresses, phone numbers, emails, etc.
## **5. Follow Discord's Terms of Service**
By being a member of this server, you are expected to adhere to Discord's official Terms of Service and Community Guidelines.
## **6. No PVP**
Players may not engage in any form of harm or hostile action - physical, magical, or otherwise - against other players, their characters, allies, or pets.
## **7. 18+**
All server members should be 18 years of age or older.
## **8. Let us know**
If you see something against the rules or something that makes you feel unsafe, let staff know. We want this server to be a welcoming space!
```

### #westmarch

Paste this into the main westmarch channel:

```markdown
# ♾️ Westmarch
This server is intended to be a collaborative hub for adventurers, storytellers, and gamers who share a passion for D&D 5e. Built on respect, creativity, and inclusivity, our community thrives on compelling stories, engaging roleplay, and shared adventures. Here, no single voice rules; instead, trusted maintainers and active participants shape the experience together.

Whether it's crafting characters, delving into epic quests, playing minigames, or roleplaying downtime moments, this is a space where everyone can find a place at the table and contribute to a living world.
## 🌍 How Westmarch Works
This Westmarch server is intended as a community driven by collaboration, creativity, and shared adventures. The server is designed for everyone to contribute in meaningful ways, shaping the world and the stories we create together.

**Adventurers** are the heart of the server. They participate in games, create characters, and engage in roleplay and downtime activities. Through their creativity, adventurers help bring the world to life and shape the ongoing narratives.

**Dungeon Masters** are the architects of our adventures. They design and run campaigns, guiding players through epic quests and creating immersive worlds. DMs collaborate with adventurers to ensure every story is exciting, engaging, and meaningful.

**Maintainers** are trusted members of the community who help steer the direction of Westmarch. They propose new ideas, suggest improvements to the server, and ensure the community stays vibrant and welcoming. Maintainers are key to making sure Westmarch evolves in a way that benefits everyone.

**Moderators** help maintain a safe and respectful environment by enforcing server rules and ensuring all members engage positively. They address any issues that arise, keeping the community enjoyable for everyone.
```

### #character-creation

Paste these into the character creation channel as separate posts, in order.

Before posting, edit the defaults in Post 2 if your server uses a different starting level, ability score method, source list, or starting equipment policy. Remove the vSheet bullet in Post 4 if your server does not use vSheet.

Post 1:

```markdown
# Character Creation in Westmarch
Adventurers come from all walks of life, with rich backgrounds and intriguing stories waiting to unfold. Your character will be part of a living, breathing world, and their journey starts with creating a unique individual ready to explore, discover, and grow.
## Character Creation Rules
To help keep the process smooth and consistent for everyone, please follow these guidelines when creating your character.
```

Post 2:

```markdown
## **1. Character Sheet Format**
Use D&D Beyond for your character sheet. This keeps imports consistent and easy to review.

Your backstory and additional character details should be posted separately in #adventurers.

D&D Beyond content sharing campaigns are listed in #meta or #community.
## **2. Starting Level**
All characters begin at Level 1.

Use standard array or point buy with 27 points for ability scores.

Use the normal starting equipment or starting gold options from your class and background.
## **3. Allowed Content**
Use official D&D 5e content for this server's rules edition. Partner, third-party, playtest, and homebrew material require staff approval.

Flavor is free! You are allowed to reflavor anything, however you may not change mechanics.
## **4. Joining the World**
Adventurers can arrive from distant lands, nearby settlements, established factions, or any origin that fits the server's setting. Some may be locals, some may be travelers, and some may have come seeking danger, work, discovery, or a fresh start.

Your character can come from any origin that fits the setting. Your character must be an original creation and cannot copy names, faces, or known figures.
## **5. Backstories and Details**
Your character's backstory and background are essential parts of their creation. When creating your character, be sure to provide a detailed backstory that reflects their personality, goals, and how they ended up in the lands. This is your chance to tie your character into the world!

* Note: Your character's backstory should explain why they are part of this westmarch and may include any significant keepsakes or mementos they carry from their past.
* Remember: Sheet tools do not always make backstories visible, so be sure to share your character's backstory and any relevant background details in your character post on the designated channel.

We do not allow child or kid characters. Please ensure your character is an adult both physically and mentally for their species.
```

Post 3:

````markdown
## **6. Character Import**
Once you've created your sheet, head over to #bot and run the following commands.

First, set your D&D Beyond character sheet to public, then import it with the character sheet URL.

```sh
!import <url_here>
```

If you update your sheet later, you can instead:

```sh
!update
```

Next, set your character's level, languages, tools, and other details. Use only the commands that apply to your character:

```sh
!level
!manage feat add <feat_here>
!manage lang learn <language_here>
!manage sense add <sense_here>
!manage speed add <speed_here>
!tool pro <tool_here>
!westmarch
```

`!westmarch` shows your setup checklist. Complete any items it lists.
````

Post 4:

```markdown
## **7. Character Approval Process**
Once you've created your character, make a post in #adventurers with the following details:

* A link to your public character sheet.
* An image of your character.
* Your character's full backstory, background, and ability scores.
* Include the `!vsheet` output in the post.

When you're ready, tag the post with Awaiting Approval.

A Maintainer will review your submission and either approve it or provide feedback on what needs to be adjusted. Once approved, your character will be ready to embark on their adventures!

**Note**
If you can't see #adventurers, you need to complete registration in Channels & Roles.
## **8. Alignment and Roleplay Guidelines**
There are no strict alignment restrictions, but we ask that you create characters who fit within the collaborative storytelling nature of Westmarch. Characters should engage in roleplay that encourages cooperation and interaction with others, avoiding disruptive or antisocial behavior.
## Getting Started
Once your character is approved, you're ready to explore Westmarch! Join games, dive into storylines, and immerse yourself in the world. The journey is yours to shape, and your character's adventures await!
```

---

## 4. Invite bots

**Avrae is required.** The other bots are optional; invite only the ones that match how your community wants to run.

| Bot | Required? | Why invite it |
|-----|-----------|---------------|
| **Avrae** | Yes | D&D sheets, dice, combat, aliases, server aliases, and westmarch-generic commands |
| **Tupperbox** | Optional | Character proxy messages for roleplay channels; useful when players post in character |
| **Dyno** | Optional | Moderation, logs, automod, welcome messages, and utility commands |
| **Tavern Records** | Optional | Server records and campaign/table logging; useful when you want persistent session or character records outside normal chat |
| **Colorchan** | Optional | Self-service color roles and cosmetic role management |
| **Bardbot** | Optional | Music or ambience for live table channels |
| **Disboard** | Optional | Public server listing and bumping when recruiting new players |
| **Google Bot** | Optional | Search and utility commands in community or planning channels |

Known invite link from the bootstrap notes:

- [Tavern Records](https://discord.com/oauth2/authorize?client_id=1393970585163530341)

After inviting each bot:

1. Assign the **Bot** role.
2. Confirm it can read and send messages in its intended channels.
3. Remove access from channels where the bot is not needed.
4. Put bot logging in staff-only or bot-only channels.

---

## 5. Subscribe Avrae to workshops

In the Avrae dashboard, subscribe the server/bot to the westmarch-generic engine and any companion workshops your server plans to use.

Use server-level workshop subscriptions so players can use the aliases in the server without subscribing individually.

If you have server alias permissions, you can paste this whole block into Discord to subscribe to the common workshop set:

```text
!multiline
!servalias sub https://avrae.io/dashboard/workshop/6a1a4e9a65f5e47e3a890691
!servalias sub https://avrae.io/dashboard/workshop/5f7385fe647bb0a416316d1d
!servalias sub https://avrae.io/dashboard/workshop/6296b723c964982e890e5315
!servalias sub https://avrae.io/dashboard/workshop/6342ac449fb55be1a501367c
!servalias sub https://avrae.io/dashboard/workshop/69811ff8d67be6e3d7232edb
!servalias sub https://avrae.io/dashboard/workshop/64000c538b440f92d9975fab
!servalias sub https://avrae.io/dashboard/workshop/5f6a4623f4c89c324d6a5cd3
!servalias sub https://avrae.io/dashboard/workshop/600c00b9a2be999cfcb21a85
!servalias sub https://avrae.io/dashboard/workshop/5f88d637f2d59b2718721a9a
!servalias sub https://avrae.io/dashboard/workshop/65adf56c81896a704c651239
!servalias sub https://avrae.io/dashboard/workshop/66dcb7c52d6128334efd1c43
!servalias sub https://avrae.io/dashboard/workshop/605cb7331e2241970bbf0f30
!servalias sub https://avrae.io/dashboard/workshop/60069282052554a14d397617
!servalias sub https://avrae.io/dashboard/workshop/638f5e434dbab671607f33a5
!servalias sub https://avrae.io/dashboard/workshop/692625378316717c4a511557
!servalias sub https://avrae.io/dashboard/workshop/6378f00016eb2e36c259169a
!servalias sub https://avrae.io/dashboard/workshop/630b0e39b85ea38890666c08
```

That command subscribes the 2014 Target Assist workshop. If your server uses 2024 rules, use the 2024 Target Assist workshop instead:

```text
!servalias sub https://avrae.io/dashboard/workshop/63fe7c97caaad20bc4903309
```

Required:

| Workshop | Link | Use |
|----------|------|-----|
| **Westmarch Generic** | [workshop](https://avrae.io/dashboard/workshop/6a1a4e9a65f5e47e3a890691) | Core configurable westmarch engine |

Strong companions:

| Workshop | Link | Use |
|----------|------|-----|
| **vSheet** | [workshop](https://avrae.io/dashboard/workshop/5f7385fe647bb0a416316d1d) | Verbose character tools and sheet-derived automation |
| **Bags** | [workshop](https://avrae.io/dashboard/workshop/6296b723c964982e890e5315) | Inventory and item bags; useful for exploration rewards and loot |
| **Notes** | [workshop](https://avrae.io/dashboard/workshop/6342ac449fb55be1a501367c) | Recipes, journals, quest notes, and reminders |
| **Tools** | [workshop](https://avrae.io/dashboard/workshop/630b0e39b85ea38890666c08) | Tool checks for crafting workflows |

Combat, maps, and table flow:

| Workshop | Link | Use |
|----------|------|-----|
| **Target Assist** | [2014 workshop](https://avrae.io/dashboard/workshop/69811ff8d67be6e3d7232edb) / [2024 workshop](https://avrae.io/dashboard/workshop/63fe7c97caaad20bc4903309) | Targeting helpers; choose the version that matches your rules |
| **Combat Options 2014** | [workshop](https://avrae.io/dashboard/workshop/64000c538b440f92d9975fab) | Combat helpers for 2014 rules |
| **Map Utilities** | [workshop](https://avrae.io/dashboard/workshop/5f6a4623f4c89c324d6a5cd3) | Map-related workflows |
| **Quick Bags** | [workshop](https://avrae.io/dashboard/workshop/600c00b9a2be999cfcb21a85) | Fast inventory helpers |
| **Initiative Utilities** | [workshop](https://avrae.io/dashboard/workshop/5f88d637f2d59b2718721a9a) | Initiative and combat flow helpers |

Optional table extras:

| Workshop | Link |
|----------|------|
| **Potions** | [workshop](https://avrae.io/dashboard/workshop/65adf56c81896a704c651239) |
| **Resting Revised** | [workshop](https://avrae.io/dashboard/workshop/66dcb7c52d6128334efd1c43) |
| **Games** | [workshop](https://avrae.io/dashboard/workshop/605cb7331e2241970bbf0f30) |
| **Riptide Shortcuts** | [workshop](https://avrae.io/dashboard/workshop/60069282052554a14d397617) |
| **Bard Workshop** | [workshop](https://avrae.io/dashboard/workshop/638f5e434dbab671607f33a5) |
| **Emotes** | [workshop](https://avrae.io/dashboard/workshop/692625378316717c4a511557) |
| **Drinking** | [workshop](https://avrae.io/dashboard/workshop/6378f00016eb2e36c259169a) |

If you subscribe to **Riptide Shortcuts**, that workshop also provides a `!quest` alias. Rename the Riptide copy so westmarch-generic keeps the clean quest command:

```text
!servalias rename quest quest-deprecated
```

When Avrae asks which alias to rename, select the one marked as Riptide. This step is only needed on servers that added Riptide Shortcuts.

In Discord, run:

```text
!westmarch setup -p "Recommended Workshops"
```

Use that page as the in-bot checklist for companion workshop guidance.

---

## 6. Configure westmarch-generic

The Discord server should not hard-code world data inside aliases. Server-specific data lives in a config gvar, and the server points to it with the `westmarch_config` svar.

Run these commands from an account with Avrae aliasing permissions, such as **Dragonspeaker** or **Server Aliaser**.

Minimum flow:

1. Subscribe to the **Westmarch Generic** workshop.
2. Set Avrae server settings with `!servsettings`, including the server-wide character import policy and rules edition.
3. Create or duplicate a config gvar.
4. Set the server svar:

```text
!svar westmarch_config <your-gvar-uuid>
```

5. Check what the engine loaded:

```text
!westmarch show
```

6. Open the web editor and use the **Check** page before publishing config changes:

```text
https://sykander.github.io/westmarch-generic/?westmarch_config=<your-gvar-uuid>
```

For the full config guide, use [Server setup](../setup.md) or run:

```text
!westmarch setup
```

---

## 7. Prepare player onboarding

Before launch, write a short onboarding message that tells a new player exactly what to do.

Recommended checklist:

1. Read #rules, #getting-started, #westmarch, and #meta.
2. Create or import a character into Avrae.
3. Run the server's vSheet setup, if vSheet is required.
4. Run `!westmarch` to see server-specific setup checks.
5. Set any required downtime, wallet, location, or inventory data.
6. Create Tupperbox proxies, if roleplay proxying is used.
7. Ask in #questions if anything fails.

Keep staff-facing setup notes in the Maintainers #discussion or #meta channel, or in a private document. When you change the config gvar, record what changed and what command you used to test it.

---

## 8. Pre-launch smoke test

Before inviting the wider player base, test with one staff account and one normal player account.

Discord permissions:

- A new player can see welcome, rules, onboarding, and public play channels.
- A new player cannot see staff channels, logs, private DM notes, or config channels.
- Bots can read and send messages only where they are meant to operate.

Avrae and workshops:

- `!westmarch setup` opens the setup pages.
- `!westmarch show` displays the loaded config gvar.
- The web editor **Check** page passes for the config gvar.
- Enabled subsystem commands have the companion workshops they need.
- Disabled subsystem commands fail cleanly instead of exposing staff-only details.

Player setup:

- `!westmarch` gives a useful checklist for a normal player.
- A test character can use the first enabled westmarch workflow, such as travel, downtime, gathering, or a quest command.
- The chosen inventory and notes workflows match what the server guide tells players to use.

---

## Launch checklist

- Discord roles and channel permissions are set.
- The server template or blank-server role/channel setup is complete.
- Starter posts are published in the first public channels.
- Avrae, moderation, roleplay, and utility bots are invited.
- Every bot has the **Bot** role.
- Avrae is subscribed to **Westmarch Generic** and selected companion workshops.
- `westmarch_config` points to the intended config gvar.
- `!westmarch show` matches the intended server state.
- The web editor **Check** page passes.
- Player onboarding tells people which commands to run first.
- Staff know where config changes are tracked.
