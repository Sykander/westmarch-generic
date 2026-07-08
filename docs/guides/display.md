# Display and branding

Use display settings to make command embeds look like your world while keeping command behavior generic.

## Display layers

westmarch-generic resolves display in three layers:

1. Top-level `display`
2. `subsystems.<name>.display`
3. `subsystems.<name>.command_display.<command>`

Later layers override earlier layers field by field.

## Top-level display

Set this first:

```py
display = {
    "name": "The Sword Coast Westmarch",
    "description": "Expeditions, trade, and trouble along the Sword Coast.",
    "colour": "#5865F2",
    "footer": ["The Sword Coast Westmarch"],
    "logo": "https://example.com/logo.png",
    "image": "https://example.com/banner.png",
}
```

| Field | Use |
|-------|-----|
| `name` | World or campaign name; also fallback embed title |
| `description` | Short campaign summary |
| `colour` | Hex accent colour, with or without `#` |
| `footer` | Static footer text or list of footer text |
| `logo` | Small thumbnail image |
| `image` | Wide image |
| `link` | Optional info link for setup/show style embeds |

## Command overrides

Use subsystem display when a whole command family should look different:

```py
"exploration": {
    "enabled": True,
    "display": {
        "title": "Exploration",
        "colour": "#2ECC71",
    },
}
```

Use command display when one command needs its own title or image:

```py
"command_display": {
    "enc": {
        "title": "Encounter",
        "logo": "https://example.com/enc.png",
    },
}
```

## Footer behavior

Footer behavior lives in `policies.display.footer_behaviour`.

| Value | Result |
|-------|--------|
| `balanced` | Mixes tips, fixed footer, help hint, and credits |
| `string` | Uses merged `footer` text |
| `help` | Shows a command help hint |
| `helpful_tips` | Shows tips from `policies.display.helpful_tips` |
| `credits` | Shows configured or engine credits |

Use `balanced` unless your server wants fixed campaign text on every command.

## Error embed behavior

Use this to make command error messages disappear after a short time:

```py
policies = {
    "display": {
        "error_embeds": {"auto_delete": True, "timeout_seconds": 60},
    },
}
```

Set `auto_delete` to `False` if moderators prefer errors to remain visible.

## Check page notes

The editor should warn or error for:

- invalid colour formats;
- unknown footer behavior values;
- malformed error embed settings;
- fixed footer mode with no footer text.

## Next guides

- [Policies](policies.md)
- [Subsystems](subsystems.md)
- [Validation](validation.md)
