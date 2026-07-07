# Commands Test

## Exploration

### Enc

#### Help Text confusing

`!help enc -here`

> Help
# Encounters
Example help doc for the !enc command.
When manual biome input is enabled, the first argument is matched against registered biome codes with the shared lookup behavior: no matches, exactly one match, or a request to be more specific.

1. Don't say this is the example help doc for the `!enc` command
2. Start off with a concise and clear explanation of what the command is used for - the basic usage syntax `!enc <biome> [bonuses]` and how to view the per server help `!enc help`
3. At the bottom list out the subsystem it's configured under `Exploration -> enc`
4. Get rid of # Encounter at the top

We should apply similar principles to all of the other alias help text md files so they're all consistent and easy to understand

(review also can we should other helpful information here - if so what and why)

#### No encounters configured text

> 
Dodge
Westmarch Generic
No encounters configured for forest / mine on this server.
Image
The official Westmarch Generic server!

If the biome was inferred from the location then we should say that here `No encounters configured for LOCATION_NAME / forest / mine` instead of the default text

in the case the user picked the biome then the current text is fine

## Time and Weather

Resolved for the current 1.0.0 release-candidate scope.

`!time` now reads configured `world_data.calendars`, and `!weather` reads configured `world_data.weather.by_area`. Alias coverage includes the generic commands and the Forgotten Realms starter calendar/weather path.

## Economy

### Buy

I tried to buy a dagger but it doesn't work and I don't know why - is something broken or did I miss some configuration?

> 
Dodge
Westmarch Generic
Found no shop stock matches for Dagger.
Image
Powered by westmarch-generic.

### Sell

Tried to sell stuff but it doesn't work either - i think i must be missing some necessary configuration 

### job

job seems fine!

### Wallet

> Westmarch Generic
No owner-defined wallet currencies are configured. Avrae gp remains on your sheet coinpurse.

Lets fix this text to "No wallet currencies configured."

### Quest

Looks good but i don't know how to try it - I haven't configured any quest encounters yet

## Location/Travel

### Travel

> 
Dodge
Westmarch Generic
River Town
Jack Farstrider is in River Town.

Visited 1 visit.

River Town -> Oakwood
River Town -> Oakwood
Run !enc 
Run !enc 
Run !enc 

To track this journey, run !travel "Oakwood" track.
Image
The official Westmarch Generic server!

The output from this has an empty space after !enc inside the command block when no biome is specified

Also don't we show emoji next to the step inside the journey to show how you're doing it - walking person for walking - wings for flying - horse for riding a horse - boat for in a boat etc.

these should be setup by default with a subsystem configuration for changing the emojis (with a dropdown picker) in the editor with the ones i said above listed as default (this should match kinda how ../westmarch does it)

jounrey automatic update texts are perfect i love them

> Journey step completed.

> Arrived in Oakwood.
Completed River Town -> Oakwood.

very good work

## Crafting

### scribe

in the event the pc knows a spell but doesn't have spell slots to cast it (ie if they got misty step from fey touched but don't have a spellcasting feature) then there should be some option to allow those people to scribe the scroll

> Westmarch Generic
No level 2 spell slots available.

at the moment this is what the text shows but we should add a new arg for the command like `-i` (same as for normal cast command) to allow someone to scribe without expending the resource or checking they know the spell (the same as how it works for -i) and this in the event a player wants to scribe something like misty step from fey touched they would remove their cc for one free casting per day and then do scribe with -i

so lets update this text here like `No level 2 spell slots available. Use -i to bypass this check.` and if `-i` was used then we should state that in the output text when they craft the scroll

## Craft

> Westmarch Generic
Create an item from the configured crafting catalogue.

Usage
!craft <item>
item Name to look up.

Examples
!craft "Potion of Healing"
!craft "Cloak of Protection"

You can't use craft to craft magic items so the example crafts are fake and don't work - they're both magic items

to make a potion of healing you'd use the brew command and for a cloak of protection you'd use enchant

the same issue under enchant and brew where it lists bad examples

brew is for potions and tonics and poisons etc.
craft is for making physical mundane items or vehicle or objects or etc.
enchant is for making magic items by enchanting a mundane item with some magic process to make a cloak of protection or bag of beans or goggles of the night etc.
scribe is for making spell scrolls (not the same as wizards copying spells into a spellbook)
