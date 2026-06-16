You are generating visual assets for **westmarch-generic**, a configurable D&D-style West Marches Avrae workshop toolkit.

Generate assets as individual images using the prompts below. Keep a consistent visual language across the full pack.

### Shared visual identity

Create artwork for "westmarch-generic", a configurable D&D-style West Marches Avrae workshop toolkit.

Visual identity: practical fantasy cartography meets clean developer tooling. Use parchment, ink, compass markings, dice geometry, subtle runic UI motifs, map lines, and restrained magical glow. The style should feel polished, readable, and modern, not cute, not grimdark, not busy.

Palette: warm parchment, deep forest green, muted teal, brass gold, charcoal ink, with small accents of arcane blue.

Do not include copyrighted D&D logos, ampersands, official monster likenesses, Discord logo, Avrae logo, or readable body text unless explicitly requested. No watermark. No fake UI screenshots.

### Publication target

Save final source assets under:

```text
editor/public/westmarch-assets/
```

After GitHub Pages deploy, the public URL shape is:

```text
https://sykander.github.io/westmarch-generic/westmarch-assets/...
```

### Asset list

```text
editor/public/westmarch-assets/
  brand/
    logo.png
    logo-square.png
    logo-mark.svg
    favicon.svg
    favicon-32.png
    favicon-192.png
    banner.png
    social-card.png
  subsystems/
    exploration.png
    travel.png
    downtime.png
    crafting.png
    economy.png
    content.png
    misc.png
    admin.png
  commands/
    exploration/enc.png
    exploration/forage.png
    exploration/fish.png
    exploration/mine.png
    exploration/lumber.png
    exploration/hunt.png
    exploration/loot.png
    travel/travel.png
    travel/location.png
    travel/time.png
    travel/weather.png
    downtime/downtime.png
    crafting/craft.png
    crafting/brew.png
    crafting/enchant.png
    crafting/scribe.png
    economy/job.png
    economy/buy.png
    economy/sell.png
    economy/wallet.png
    content/library.png
    content/read.png
    misc/quest.png
    misc/recipe.png
    admin/westmarch.png
    admin/setup.png
    admin/check.png
    admin/show.png
```

## Brand assets

### Logo

```text
Use case: logo-brand
Asset type: project logo, transparent-background PNG plus vector-friendly SVG concept
Primary request: Design a clean emblem logo for "westmarch-generic".
Subject: a compass rose combined with a d20 silhouette and a folded wilderness map, with small modular config nodes around the compass.
Style/medium: vector-friendly fantasy utility logo, crisp edges, simple shapes, high readability at small size.
Composition/framing: centered emblem, balanced circular/square silhouette, works as GitHub avatar and app icon.
Text: no text.
Constraints: must remain legible at 32px; avoid thin details; no official D&D branding.
```

### Favicon / SVG mark

```text
Use case: logo-brand
Asset type: favicon and simple SVG mark
Primary request: Create an ultra-simple icon mark for westmarch-generic.
Subject: a d20-compass hybrid: one compass needle inside a twenty-sided die outline.
Style/medium: flat vector icon, 2-3 colors maximum.
Composition/framing: centered inside a square canvas with generous padding.
Text: no text.
Constraints: readable at 16px and 32px; avoid gradients, tiny map lines, or complex shading.
```

### Banner

```text
Use case: ads-marketing
Asset type: wide GitHub Pages / README banner, 1600x500
Primary request: Create a cinematic banner for westmarch-generic.
Scene/backdrop: an unfurled fantasy map on a worktable with route lines, biome markers, dice, small brass tools, and subtle magical config glyphs.
Subject: the map and toolkit feeling like a configurable campaign control panel.
Style/medium: painterly-but-clean digital illustration, polished fantasy editorial art.
Composition/framing: wide banner, strong empty space near center-left for optional title overlay, detail concentrated around edges.
Lighting/mood: warm desk light with restrained teal magical accents.
Text: no text.
Constraints: must crop well to wide aspect ratios; avoid dark muddy contrast; no logos or readable fake text.
```

### Social card

```text
Use case: ads-marketing
Asset type: Open Graph social preview, 1200x630
Primary request: Create a social preview image for westmarch-generic.
Scene/backdrop: a clean fantasy map table with modular cards representing subsystems: exploration, travel, crafting, economy, content.
Subject: compass-d20 emblem prominent but not oversized.
Style/medium: polished digital illustration with crisp icon-like details.
Composition/framing: centered emblem with supporting objects arranged around it; safe margins for platform cropping.
Text: optional exact title "westmarch-generic" only if the generator can render it cleanly; otherwise no text.
Constraints: no fake tiny writing; no official D&D branding.
```

## Subsystem thumbnails

Use this template once per subsystem by replacing `{subsystem}` and `{symbol}`.

```text
Use case: stylized-concept
Asset type: subsystem thumbnail, square 1024x1024
Primary request: Create a square thumbnail for the {subsystem} subsystem in westmarch-generic.
Subject: {symbol}
Style/medium: consistent fantasy toolkit icon art, semi-flat illustration with light depth, parchment-and-ink base with teal/brass accents.
Composition/framing: centered symbol, subtle map-grid background, readable at Discord embed thumbnail size.
Text: no text.
Constraints: same visual language as the logo; avoid clutter; no copyrighted logos.
```

Subsystem symbols:

```text
Exploration: compass over wilderness hexes
Travel: route line, boots, road marker, weathered map pin
Downtime: candle, calendar page, resting camp token
Crafting: hammer, tongs, blueprint, small sparks
Economy: coin stack, ledger, merchant scale
Content: open book, library shelves, bookmark ribbon
Misc: quest notice, sealed note, recipe card
Admin: config gear, checklist, command scroll
```

## Command thumbnails

Use this template once per command by replacing `{command}`, `{subsystem}`, and `{symbol}`.

```text
Use case: stylized-concept
Asset type: Discord command thumbnail, square 1024x1024
Primary request: Create a command thumbnail for the "{command}" command in the "{subsystem}" subsystem of westmarch-generic.
Subject: {symbol}
Style/medium: cohesive fantasy utility icon, semi-flat digital illustration, parchment map texture, charcoal ink outlines, brass and teal accents.
Composition/framing: centered readable object, subtle subsystem motif in the background.
Text: no text.
Constraints: must be distinct from sibling commands but clearly part of the same subsystem family; readable as a small embed thumbnail.
```

Command symbols:

```text
enc: crossed paths meeting a d20 encounter marker
forage: gathered herbs and berries beside a small satchel
fish: fishing hook, ripple circle, river map line
mine: pickaxe striking a mineral vein
lumber: axe beside stacked timber and tree rings
hunt: tracking marks, bow, wilderness trail
loot: small treasure cache with item tags

travel: winding route across map hexes
location: map pin over a named settlement marker, no readable text
time: hourglass over moon/sun dial
weather: cloud, wind lines, sun/rain split

downtime: resting camp ledger with candle

craft: anvil, hammer, measured blueprint
brew: potion flask and bubbles
enchant: glowing rune over an item
scribe: quill, ink, spell scroll

job: work order board and coin token
buy: merchant stall token and coin
sell: tagged goods and balancing scale
wallet: coin pouch and ledger

library: shelves, open index book, bookmark
read: open book with soft magical light

quest: pinned quest notice and compass tack
recipe: recipe card, spoon, ingredient icons

westmarch: central compass-d20 config emblem
setup: gear turning beside a blank config scroll
check: checklist with brass checkmark seal
show: display panel or opened dossier with map tabs
```

## Generation notes

- Generate PNGs for Discord embeds first.
- Treat `favicon.svg` and `logo-mark.svg` as clean vector follow-up assets after selecting the winning logo direction.
- Keep text out of thumbnails; readable image-generator text is unreliable and embed thumbnails are too small for it.
- Keep subsystem and command thumbnails visually related, but make sibling command symbols immediately distinguishable.

