# Initial server text guide

This guide helps maintainers write the first permanent posts for a new westmarch server: the welcome path, rules, westmarch overview, character creation instructions, and the first player-facing support channels.

Use it after the Discord channel layout exists and before inviting players. For the full server bootstrap, see [Westmarch server setup guide](server-setup.md). For the Avrae engine and config gvar setup, see [Server setup](../setup.md).

---

## Goals

Initial channel text should do four things:

1. Tell a new player what this server is.
2. Tell them exactly what to do next.
3. Keep staff policy, character rules, and Avrae setup consistent.
4. Avoid setting-specific promises that the config gvar, channel permissions, or active staff process do not support yet.

Write these posts as stable references, not chat messages. Most of them should live in read-only channels or be pinned before launch.

---

## Before writing

Decide these facts first. Every starter post should agree with them.

| Fact | Example |
|------|---------|
| Server name | Westmarch |
| Setting name or premise | A frontier adventuring hub on the edge of an unexplored wild |
| Rules edition | D&D 5e 2014, D&D 5e 2024, or a stated mix |
| Starting level | Level 1 |
| Ability scores | Standard array, point buy, rolled stats, or staff-approved exceptions |
| Starting equipment | Class/background equipment, starting gold, or a custom grant |
| Allowed sources | Official books only, specific books, approved homebrew, or case-by-case |
| Character sheet tool | D&D Beyond, Dicecloud, GSheet, or a server-specific policy |
| Required bot commands | `!import`, `!update`, `!westmarch`, `!vsheet`, bags, notes, or other workshop commands |
| Approval owner | Maintainer, Dungeon Master, moderator, or named staff role |
| Support channel | #questions, #bot, ticket channel, or staff mention policy |

If a rule appears in both Discord text and westmarch-generic config, update both. For example, rules edition, enabled commands, travel defaults, downtime tracking, inventory handling, and crafting policy should match what `!westmarch show` and the config editor say.

---

## Writing rules

- Put the player's next action near the top.
- Keep each channel focused on one job.
- Prefer short numbered steps over long paragraphs.
- Use real channel mentions after the channels exist.
- Put detailed rulings in #meta instead of overloading #getting-started.
- Name staff roles instead of individual people unless one person really owns the process.
- Remove every placeholder before launch.
- Re-read the posts as a brand-new player with no server context.

Good channel text answers: "Where am I?", "What do I do first?", "What can I do here?", and "Who do I ask when stuck?"

---

## Recommended post order

Publish these first:

1. #rules
2. #westmarch
3. #character-creation
4. #meta
5. #getting-started

Publish #getting-started last because it links to the others. After posting, pin the messages or put them in a read-only channel with slow mode disabled.

---

## #getting-started

Purpose: the shortest possible path from join to first useful action.

Paste this into #getting-started after replacing bracketed placeholders.

```markdown
# Welcome to [Server Name]

Thanks for joining us. [Server Name] is a collaborative world where adventurers shape the story through quests, dungeons, downtime, travel, and roleplay.

## Getting started

First, read #rules. If you want to understand what this server is for and how play works, read #westmarch next.

## Next steps

1. Go to Channels & Roles and answer the onboarding questions to get the Adventurer role.
2. Read #character-creation and make your first character.
3. Use #bot for Avrae imports, updates, and setup checks.
4. Ask in #questions if anything is unclear.

You need the Adventurer role to see most player channels.

Once your character is approved, you can start playing by:

- joining quests in #quests
- posting and updating your character in #adventurers
- roleplaying in World location channels
- using #meta for server-specific guides and play rules

We look forward to playing with you and seeing how you shape the world.
```

Keep this post short. If it needs more than one screen of reading, move the detail to #westmarch, #character-creation, or #meta.

---

## #rules

Purpose: community boundaries, moderation expectations, and safety baseline.

Paste this into #rules, then edit it to match your moderation policy.

```markdown
# Server Rules

## 1. Respectful communication

Treat everyone with respect. Harassment, hate speech, targeted insults, and hostile behavior are not welcome here.

## 2. No spam or unwanted promotion

Do not spam, flood channels, advertise, send unsolicited invites, or DM members for promotion without staff permission.

## 3. Keep public channels appropriate

Do not post explicit sexual content, graphic content, shock material, or anything that would make the public server unsafe for normal play.

## 4. Respect privacy

Do not share another person's private information, messages, images, or identifying details without consent.

## 5. Follow Discord's rules

Follow Discord's Terms of Service and Community Guidelines.

## 6. No player-versus-player conflict without staff approval

Characters may not attack, steal from, sabotage, magically control, or otherwise harm other player characters, allies, pets, or property unless staff have approved the scene in advance.

## 7. Use collaborative characters

Create characters who can participate in a shared adventuring community. Characters built to disrupt the group may be declined or retired.

## 8. Ask staff for help

If something breaks these rules or makes the server unsafe, contact a Moderator or use [report channel or ticket process].
```

Add server-specific requirements, such as age gates, content ratings, safety tools, or table conduct, only if staff are prepared to enforce them.

---

## #westmarch

Purpose: explain what the server is, how play happens, and what each role does.

Paste this into #westmarch after replacing the placeholders.

```markdown
# [Server Name]

[Server Name] is a collaborative hub for adventurers, storytellers, and D&D 5e players set in [short setting premise]. Built on respect, creativity, and shared play, this community thrives on compelling stories, engaging roleplay, and shared adventures.

No single campaign party owns the story here. Trusted staff and active players shape the world together through quests, roleplay, downtime, crafting, travel, and the other systems this server enables.

Whether you want to create characters, delve into quests, roleplay between sessions, or pursue long-term goals, this is a place to find a table and contribute to a living world.

## How Westmarch works

A westmarch server is a community-driven shared world. Players and staff contribute in different ways, shaping the setting and the stories that happen inside it.

**Adventurers** are the heart of the server. They create characters, join games, roleplay in public world channels, pursue downtime activities, and help bring the world to life through their choices.

**Dungeon Masters** run quests, encounters, scenes, and world events. Each DM may have their own table style, but all games use the server's shared rules and setting boundaries.

**Maintainers** manage the server setup, Avrae configuration, westmarch-generic config, guides, catalogues, automation, and long-term server structure.

**Moderators** keep the server safe and respectful. They handle conduct issues, reports, moderation actions, and channel access.

## How to play

1. Create a character using #character-creation.
2. Import your character in #bot.
3. Run `!westmarch` and complete the checklist it shows.
4. Watch #quests for open games.
5. Use World channels for roleplay when your character is in that location.

## Shared-world expectations

- Be generous with other players' spotlight.
- Let DMs resolve scenes at their tables.
- Keep character actions compatible with a cooperative server.
- Ask before making claims that permanently change the shared world.
- Put rules and setup questions in #questions or #bot.
```

Good #westmarch text is not a lore dump. Give enough premise to make the server feel real, then direct players toward character creation and play.

---

## #character-creation

Purpose: tell players how to build, import, post, and get approval for a character.

Use multiple posts so players can link to the exact step they need. Replace the bracketed placeholders before launch.

### Post 1: Overview

```markdown
# Character Creation

This channel explains how to create a character for [Server Name].

Read each post in order before submitting a character. If you are unsure whether an option is allowed, ask in #questions before building around it.
```

### Post 2: Build rules

```markdown
## 1. Character sheet

Use [sheet tool] for your character sheet. Your sheet must be public or visible to staff during review.

## 2. Starting level

Characters start at level [starting level].

Use [ability score method] for ability scores.

Use [starting equipment policy] for starting gear and gold.

## 3. Allowed content

This server uses [rules edition].

Allowed sources: [allowed sources].

Partner, third-party, playtest, unearthed arcana, and homebrew options require staff approval before use.

Flavor changes are welcome when they do not change mechanics.

## 4. The call of adventure

Your character should be an original adult adventurer who is ready and willing to answer the call of adventure.

Your character can be a local, traveler, faction member, exile, explorer, mercenary, scholar, pilgrim, or any other concept that fits [setting name].

They should be ready and willing to engage in collaborative roleplay with other adventurers they meet in the world and with other players on the server.

Avoid concepts that require constant party conflict, hidden main-character status, or private lore that staff cannot use.

## 5. Backstory

Your backstory should explain:

- who your character is
- why they answer the call of adventure
- why they are connected to this shared world
- what goals, bonds, debts, rivals, or mysteries might create future play

Keep backstories usable at the table. Staff may ask you to revise details that conflict with the setting or server tone.
```

### Post 3: Avrae import

````markdown
## 6. Import your character

When your sheet is ready, go to #bot and import it.

For D&D Beyond, make the sheet public, then run:

```sh
!import <character_sheet_url>
```

If you change the sheet later, run:

```sh
!update
```

Then run the setup commands that apply to your character:

```sh
!level
!manage feat add <feat_name>
!manage lang learn <language_name>
!manage sense add <sense_name>
!manage speed add <speed_name>
!tool pro <tool_name>
!westmarch
```

`!westmarch` shows your server setup checklist. Complete anything it lists before asking for approval.
````

Edit this post if your server uses a sheet tool other than D&D Beyond or has a different import process.

### Post 4: Approval process

```markdown
## 7. Submit for approval

Create a post in #adventurers with:

- character name
- public character sheet link
- character image or description
- backstory
- background
- ability scores
- important choices that are not obvious from the sheet
- `!vsheet` output, if this server requires vSheet

When the post is ready, tag it with [approval tag] or ask for review in [review channel].

A [approval role] will review the character. They may approve it, ask questions, or request changes.

Do not join quests with an unapproved character unless a DM or Maintainer says otherwise.
```

Remove the vSheet line if the server does not use vSheet.

### Post 5: Character post template pointer

```markdown
## 8. Character post template

Use the pinned template in #adventurers when you create your character post.
```

---

## #meta

Purpose: index practical guides without burying players in long pinned messages.

Paste this into #meta once the linked channels and documents exist.

````markdown
# Meta and Play Guides

Use this channel for server-specific play references, optional rules, bot notes, and guides.

## Core links

- New player path: #getting-started
- Server rules: #rules
- Westmarch overview: #westmarch
- Character creation: #character-creation
- Questions and support: #questions
- Avrae commands: #bot
- Character roster: #adventurers
- Quest board: #quests

## Server facts

- Rules edition: [rules edition]
- Starting level: [starting level]
- Ability scores: [ability score method]
- Character sheet tool: [sheet tool]
- Content sharing: [link or channel]

## Bot checks

Run this in #bot whenever you are unsure what your character still needs:

```sh
!westmarch
```
````

As the server grows, keep this channel as an index. Put long rulings in separate posts or docs and link them from here.

---

## #quests

Purpose: make the quest board usable before the first DM posts a game.

```markdown
# Quest Board

DMs post open games here.

Players can react, reply, or follow the DM's listed signup process. Read the full quest post before signing up.

Quest posts should include:

- quest name
- DM
- date and time with timezone
- expected length
- level range
- number of players
- content warnings, if any
- location or starting point
- rewards or special notes
- signup instructions

Do not argue about selections in this channel. Ask the DM or staff privately if something needs clarification.
```

---

## #adventurers

Purpose: turn character submissions into an easy-to-browse roster. Pin this post and lock it if the channel supports forum-style posts or threads.

````markdown
# How to make an Adventurer Post

Read #character-creation and follow the setup steps there before you make an Adventurer post.

You need:

- a public [sheet tool] character sheet
- an image or clear visual description of your character
- a short backstory explaining who they are, why they adventure, and how they arrived in the shared world
- background details and ability scores for staff review

## Posting rules

Create one post per character. Include your character image before posting if the channel format does not let you change it later.

Keep the first post updated when your character levels up, retires, changes sheet links, or has major story updates.

Approved characters will be tagged or marked by staff. Do not use another player's character, art, backstory, or sheet as your own.

## Template

Copy this into your Adventurer post and replace the guidance text.

```md
# Name
Your character's full name.

# Index
The index of this character. Use 1 for your first character, 2 for your second, and so on.

# Description
Species, age, appearance, clothing, visible gear, and any first-impression details.

# Character Sheet
Public link to your character sheet. Link the live sheet, not an exported PDF.

# Backstory
Two or three paragraphs about who your character is, why they adventure, how they arrived in the shared world, and any keepsakes or mementos they brought with them.

# Background
**Name:** Background name. Add "(Custom)" if this is a custom background.
**Feature:** Background feature, if your rules edition uses one.
**Proficiencies:** Skill and tool proficiencies from your background.
**Languages:** Languages from your background.

# Ability Scores
STR 8
DEX 14
CON 15
INT 10
WIS 13
CHA 12
```
````

---

## Launch review

Before inviting players, check:

- #getting-started links to channels that exist.
- #character-creation matches Avrae server settings and the westmarch-generic config.
- `!westmarch show` matches the public setup text.
- The approval tag, review channel, and staff role exist.
- New players can see the Start Here channels.
- New players cannot post in read-only reference channels unless intended.
- Avrae can read and speak in #bot and every channel where commands are expected.
- Placeholder text has been replaced.

When any setup rule changes after launch, update the Discord post, config gvar, and relevant docs in the same pass.
