# Editor test

## Policies tab

### Encounter biome source

Shouldn't this be under subsystems.exploration.config ?

same for Repeat encounters

### Downtime mode

This should be under subsystems.downtime.config

same for Downtime acquisition
Max workdays

### Crafting rules override

should be under subsystems.crafting.config right (i remember we have a path under subsystems for config but i forget if its called config or something but use the existing one)

same for
Crafting recipes
Scribe spell requirement
Crafting gold
Crafting materials
Crafting items
Crafting downtime
Crafting spell slots
Crafted item output

### Crafting catalogue sources

This should be renamed to catalogue resources and kept under policies but consider that's its used across exploration (library) and crafting (scribe) (craft) and economy (buy) (sell) so it should be kept under policies because it's general

### Crafting checks

should be under subsystem.crafting.config

same for 
Crafting tool policy
Crafting command overrides

### Exploration distribution

This should be under subsystems.exploration.config

same for Hunt monster art
Loot monster art
Hunt DC visibility
Loot DC visibility

## General

The left bar with page tabs and the right bar with actions log don't scroll when the user scrolls so they can move out of frame - this isn't expected (on a desktop)

When scrolling down on pages with expandible rows then the header of the current open view being viewed should be sticky at the top of the screen as the user scrolls so they can always see the button to minimise it


