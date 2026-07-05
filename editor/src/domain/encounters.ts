export type EncounterTemplate = {
  id: string;
  label: string;
  description: string;
  args?: string[];
  custom?: boolean;
  functionName?: string;
  source?: string;
  fields: EncounterTemplateField[];
};

export type EncounterTemplateInputKind =
  | 'text'
  | 'text_block'
  | 'number'
  | 'dc'
  | 'skill_name'
  | 'save_name'
  | 'encounter_kind'
  | 'url'
  | 'custom_select';

export type EncounterTemplateField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  inputType?: EncounterTemplateInputKind;
  values?: string[];
  required?: boolean;
  defaultValue?: string | number;
};

export type CompactEncounterRow = Array<
  string | number | string[] | Record<string, unknown> | null
>;

export type RollOption = {
  value: string;
  label: string;
  ability: string | null;
};

export type OutcomeOption = {
  type: string;
  label: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number';
    required: boolean;
  }>;
};

export const ABILITY_OPTIONS = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

export const SKILL_OPTIONS = [
  'Athletics',
  'Acrobatics',
  'Sleight of Hand',
  'Stealth',
  'Arcana',
  'History',
  'Investigation',
  'Nature',
  'Religion',
  'Animal Handling',
  'Insight',
  'Medicine',
  'Perception',
  'Survival',
  'Deception',
  'Intimidation',
  'Performance',
  'Persuasion',
];

export const CHECK_OPTIONS: RollOption[] = [
  { value: 'strength', label: 'Strength', ability: 'strength' },
  { value: 'athletics', label: 'Athletics', ability: 'strength' },
  { value: 'dexterity', label: 'Dexterity', ability: 'dexterity' },
  { value: 'initiative', label: 'Initiative', ability: 'dexterity' },
  { value: 'acrobatics', label: 'Acrobatics', ability: 'dexterity' },
  { value: 'sleightOfHand', label: 'Sleight of Hand', ability: 'dexterity' },
  { value: 'stealth', label: 'Stealth', ability: 'dexterity' },
  { value: 'constitution', label: 'Constitution', ability: 'constitution' },
  { value: 'intelligence', label: 'Intelligence', ability: 'intelligence' },
  { value: 'arcana', label: 'Arcana', ability: 'intelligence' },
  { value: 'history', label: 'History', ability: 'intelligence' },
  { value: 'investigation', label: 'Investigation', ability: 'intelligence' },
  { value: 'nature', label: 'Nature', ability: 'intelligence' },
  { value: 'religion', label: 'Religion', ability: 'intelligence' },
  { value: 'wisdom', label: 'Wisdom', ability: 'wisdom' },
  { value: 'animalHandling', label: 'Animal Handling', ability: 'wisdom' },
  { value: 'insight', label: 'Insight', ability: 'wisdom' },
  { value: 'medicine', label: 'Medicine', ability: 'wisdom' },
  { value: 'perception', label: 'Perception', ability: 'wisdom' },
  { value: 'survival', label: 'Survival', ability: 'wisdom' },
  { value: 'charisma', label: 'Charisma', ability: 'charisma' },
  { value: 'deception', label: 'Deception', ability: 'charisma' },
  { value: 'intimidation', label: 'Intimidation', ability: 'charisma' },
  { value: 'performance', label: 'Performance', ability: 'charisma' },
  { value: 'persuasion', label: 'Persuasion', ability: 'charisma' },
];

export const SAVE_OPTIONS: RollOption[] = [
  { value: 'strength', label: 'Strength', ability: 'strength' },
  { value: 'dexterity', label: 'Dexterity', ability: 'dexterity' },
  { value: 'constitution', label: 'Constitution', ability: 'constitution' },
  { value: 'intelligence', label: 'Intelligence', ability: 'intelligence' },
  { value: 'wisdom', label: 'Wisdom', ability: 'wisdom' },
  { value: 'charisma', label: 'Charisma', ability: 'charisma' },
  { value: 'death', label: 'Death', ability: null },
  { value: 'honor', label: 'Honor', ability: null },
  { value: 'sanity', label: 'Sanity', ability: null },
];

export const OUTCOME_OPTIONS: OutcomeOption[] = [
  {
    type: 'damage',
    label: 'Damage',
    fields: [{ key: 'total', label: 'Damage total or dice', type: 'text', required: true }],
  },
  {
    type: 'healing',
    label: 'Healing',
    fields: [{ key: 'total', label: 'Healing total or dice', type: 'text', required: true }],
  },
  {
    type: 'gold',
    label: 'Gold',
    fields: [{ key: 'total', label: 'Gold total or dice', type: 'text', required: true }],
  },
  {
    type: 'item',
    label: 'Item',
    fields: [
      { key: 'name', label: 'Item name', type: 'text', required: true },
      { key: 'total', label: 'Quantity', type: 'number', required: true },
      { key: 'bag', label: 'Bag', type: 'text', required: false },
    ],
  },
  {
    type: 'currency',
    label: 'Wallet currency',
    fields: [
      { key: 'id', label: 'Currency id', type: 'text', required: true },
      { key: 'total', label: 'Total', type: 'number', required: true },
    ],
  },
];

export const BIOME_POOL_TAGS = [
  'enc.combat',
  'enc.quest',
  'enc.gather',
  'forage.gather',
  'fish.gather',
  'mine.gather',
  'lumber.gather',
];

const ENCOUNTER_DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'deadly'];
const CHECK_LABEL_OPTIONS = CHECK_OPTIONS.map((item) => item.label);
const SAVE_LABEL_OPTIONS = SAVE_OPTIONS.map((item) => item.label);

const ENGINE_TEMPLATE_HELPERS_SOURCE = String.raw`# Engine helpers available to built-in encounter templates.
def _args(args, index, default=None):
    if args == None:
        return default
    try:
        if index < len(args):
            return args[index]
    except:
        pass
    return default

def _display_roll(roll, show_dc=False, show_result=False):
    full = roll.get("full") or roll.get("total") or "0"
    name = roll.get("name") or "Roll"
    line = f"{full} **{name}**"
    details = []
    if show_dc and roll.get("dc") not in [None, ""]:
        details.append(f"DC {roll['dc']}")
    if show_result and roll.get("passed") != None:
        details.append("Passed" if roll["passed"] else "Failed")
    if details:
        line += f" ({', '.join(details)})"
    return line

def _surprise_text(target):
    text = str(target or "").strip()
    key = text.lower()
    if key in ["you", "your party", "the party", "party", "adventurers"]:
        return "You are surprised!"
    if key in ["enemy", "enemies", "monster", "monsters", "foe", "foes", "hostile", "hostiles"]:
        return "Enemies are surprised!"
    if text == "":
        return ""
    return f"{text} is surprised!"

def _combat_banner(surprised=None):
    surprise_parts = []
    if surprised is not None:
        surprise_list = surprised if isinstance(surprised, list) else [surprised]
        for target in surprise_list:
            text = _surprise_text(target)
            if text != "":
                surprise_parts.append(text)
    line = "\u001b[1;31mCombat Initiated!\u001b[0m"
    if surprise_parts:
        line += " \u001b[1;33m" + " ".join(surprise_parts) + "\u001b[0m"
    ticks = chr(96) * 3
    return ticks + "ansi\n" + line + "\n" + ticks

def _display_combat(enemies=None, surprised=None, details=None):
    lines = [_combat_banner(surprised)]
    for detail in details or []:
        lines.append(str(detail))
    lines.append("Enemies:")
    enemy_lines = []
    for enemy in enemies or []:
        if isinstance(enemy, dict):
            enemy_lines.append(f"* {enemy.get('count', 1)}x {enemy.get('name') or enemy.get('monster')}")
        else:
            enemy_lines.append(f"* 1x {enemy}")
    return "\n".join(lines + (enemy_lines or ["* Generated enemies from target CR"]))`;

const ENGINE_TEMPLATE_SOURCE: Record<string, string> = {
  gather_item: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def gather_item(args):
    # Args: name, description, check_name, dc, item_name, total, bag?
    name = _args(args, 0, "Useful find")
    desc = _args(args, 1, "You find useful supplies in the wild.")
    check_name = _args(args, 2, "Wisdom (Survival)")
    dc = _args(args, 3, "12")
    item = _args(args, 4, "Supplies")
    total = _args(args, 5, 1)
    bag = _args(args, 6)

    outcome = {"type": "item", "name": str(item), "total": total}
    if bag != None and str(bag).strip() != "":
        outcome["bag"] = str(bag)

    def outcomes(ectx):
        rolls = ectx["rolls"]
        if rolls and rolls[0]["passed"] == True:
            return [outcome]
        return []

    return {
        "name": str(name),
        "description": str(desc),
        "rolls": [{"type": "check", "name": str(check_name), "dc": str(dc)}],
        "outcomes": outcomes,
    }`,
  skill_check: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def skill_check(args):
    # Args: name, description, check_name, dc
    return {
        "name": str(_args(args, 0, "Skill check")),
        "description": str(_args(args, 1, "A careful approach may reveal something useful.")),
        "rolls": [{
            "type": "check",
            "name": str(_args(args, 2, "Wisdom (Survival)")),
            "dc": str(_args(args, 3, "12")),
        }],
    }`,
  saving_throw: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def saving_throw(args):
    # Args: name, description, save_name, dc
    return {
        "name": str(_args(args, 0, "Saving throw")),
        "description": str(_args(args, 1, "A sudden threat demands quick reaction.")),
        "rolls": [{
            "type": "save",
            "name": str(_args(args, 2, "Dexterity")),
            "dc": str(_args(args, 3, "12")),
        }],
    }`,
  story: String.raw`def story(args):
    return {
        "name": str(_args(args, 0, "Forest sign")),
        "description": str(_args(args, 1, "You notice a quiet detail in the wild.")),
    }`,
  flavour: String.raw`def flavour(args):
    return {
        "name": str(_args(args, 0, "Forest sign")),
        "description": str(_args(args, 1, "You notice a quiet detail in the wild.")),
    }`,
  combat: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def combat_template(args):
    # Args: name, description, cr, monsters?, difficulty?
    monsters = _args(args, 3)
    enc = {
        "name": str(_args(args, 0, "Hostile creatures")),
        "description": str(_args(args, 1, "Something dangerous moves nearby.")),
        "cr": _args(args, 2, 1),
        "monsters": monsters if isinstance(monsters, list) else [str(monsters)],
    }
    enc["combat_text"] = _display_combat(enc["monsters"])
    return enc`,
  ambush: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def ambush(args):
    # Args: name, description, cr, monsters?, difficulty?, dc?
    monsters = _args(args, 3)
    enc = {
        "name": str(_args(args, 0, "Hostile creatures")),
        "description": str(_args(args, 1, "Something dangerous moves nearby.")),
        "cr": _args(args, 2, 1),
        "monsters": monsters if isinstance(monsters, list) else [str(monsters)],
    }
    dc = _args(args, 5, "12")
    enc["rolls"] = [
        {"type": "check", "name": "Perception", "ability": "wis", "dc": str(dc)},
        {"type": "check", "name": "Stealth", "ability": "dex", "dc": str(dc)},
        {"type": "passive", "name": "Perception", "ability": "wis", "dc": str(dc)},
    ]

    def combat_text(ectx):
        surprised = []
        if ectx["rolls"] and ectx["rolls"][0]["passed"] == False:
            surprised.append("You")
        return _display_combat(enc["monsters"], surprised=surprised)

    enc["combat_text"] = combat_text
    return enc`,
  damage_combat: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def damage_combat(args):
    # Args: name, description, cr, monsters?, difficulty?, total?
    monsters = _args(args, 3)
    enc = {
        "name": str(_args(args, 0, "Hostile creatures")),
        "description": str(_args(args, 1, "Something dangerous moves nearby.")),
        "cr": _args(args, 2, 1),
        "monsters": monsters if isinstance(monsters, list) else [str(monsters)],
    }
    enc["combat_text"] = _display_combat(enc["monsters"])
    enc["outcomes"] = [{"type": "damage", "total": _args(args, 5, "1d4")}]
    return enc`,
  quest: String.raw`def quest(args):
    enc = {
        "name": str(_args(args, 0, "Unfinished business")),
        "description": str(_args(args, 1, "A hook asks for follow-up.")),
    }
    reward = _args(args, 2)
    if reward != None and str(reward).strip() != "":
        enc["reward"] = str(reward)
    return enc`,
  gold: String.raw`def gold(args):
    return {
        "name": str(_args(args, 0, "Treasure cache")),
        "description": str(_args(args, 1, "Coins glint in the dirt.")),
        "outcomes": [{"type": "gold", "total": _args(args, 2, 1)}],
    }`,
  healing: String.raw`def healing(args):
    return {
        "name": str(_args(args, 0, "Restorative spring")),
        "description": str(_args(args, 1, "A restorative moment eases your wounds.")),
        "outcomes": [{"type": "healing", "total": _args(args, 2, "1d4")}],
    }`,
  healing_check: String.raw`${ENGINE_TEMPLATE_HELPERS_SOURCE}

def healing_check(args):
    return {
        "name": str(_args(args, 0, "Field medicine")),
        "description": str(_args(args, 1, "Careful treatment helps the wounded recover.")),
        "rolls": [{
            "type": "check",
            "name": str(_args(args, 2, "Medicine")),
            "dc": str(_args(args, 3, "12")),
        }],
        "outcomes": [{"type": "healing", "total": _args(args, 4, "1d4")}],
    }`,
  damage: String.raw`def damage(args):
    return {
        "name": str(_args(args, 0, "Hazard")),
        "description": str(_args(args, 1, "The area turns dangerous.")),
        "outcomes": [{"type": "damage", "total": _args(args, 2, "1d4")}],
    }`,
};

export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  {
    id: 'gather_item',
    label: 'Gather item',
    description: 'Skill check that grants an item or resource outcome.',
    functionName: 'gather_item',
    source: ENGINE_TEMPLATE_SOURCE.gather_item,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'skill', label: 'Check', type: 'select', values: CHECK_LABEL_OPTIONS },
      { key: 'dc', label: 'DC', type: 'number' },
      { key: 'item', label: 'Outcome item', type: 'text' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'bag', label: 'Bag', type: 'text' },
    ],
  },
  {
    id: 'skill_check',
    label: 'Skill check',
    description: 'Generic pass/fail exploration check.',
    functionName: 'skill_check',
    source: ENGINE_TEMPLATE_SOURCE.skill_check,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'skill', label: 'Check', type: 'select', values: CHECK_LABEL_OPTIONS },
      { key: 'dc', label: 'DC', type: 'number' },
    ],
  },
  {
    id: 'saving_throw',
    label: 'Saving throw',
    description: 'Generic pass/fail encounter save.',
    functionName: 'saving_throw',
    source: ENGINE_TEMPLATE_SOURCE.saving_throw,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'save', label: 'Save', type: 'select', values: SAVE_LABEL_OPTIONS },
      { key: 'dc', label: 'DC', type: 'number' },
    ],
  },
  {
    id: 'story',
    label: 'Story',
    description: 'Descriptive gather beat.',
    functionName: 'story',
    source: ENGINE_TEMPLATE_SOURCE.story,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
  },
  {
    id: 'flavour',
    label: 'Flavour',
    description: 'Non-reward descriptive gather beat.',
    functionName: 'flavour',
    source: ENGINE_TEMPLATE_SOURCE.flavour,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'text', label: 'Text', type: 'text' },
    ],
  },
  {
    id: 'combat',
    label: 'Combat',
    description: 'Simple monster encounter stub.',
    functionName: 'combat_template',
    source: ENGINE_TEMPLATE_SOURCE.combat,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'cr', label: 'CR', type: 'number' },
      { key: 'monster', label: 'Monster', type: 'text' },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        values: ENCOUNTER_DIFFICULTY_OPTIONS,
      },
    ],
  },
  {
    id: 'ambush',
    label: 'Ambush',
    description: 'Combat encounter with perception and stealth ambush framing.',
    functionName: 'ambush',
    source: ENGINE_TEMPLATE_SOURCE.ambush,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'cr', label: 'CR', type: 'number' },
      { key: 'monster', label: 'Monster', type: 'text' },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        values: ENCOUNTER_DIFFICULTY_OPTIONS,
      },
      { key: 'dc', label: 'DC', type: 'number' },
    ],
  },
  {
    id: 'damage_combat',
    label: 'Damage + combat',
    description: 'Combat encounter that also applies a damage outcome.',
    functionName: 'damage_combat',
    source: ENGINE_TEMPLATE_SOURCE.damage_combat,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'cr', label: 'CR', type: 'number' },
      { key: 'monster', label: 'Monster', type: 'text' },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        values: ENCOUNTER_DIFFICULTY_OPTIONS,
      },
      { key: 'total', label: 'Damage total or dice', type: 'text' },
    ],
  },
  {
    id: 'quest',
    label: 'Quest',
    description: 'Quest hook or objective stub.',
    functionName: 'quest',
    source: ENGINE_TEMPLATE_SOURCE.quest,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'hook', label: 'Hook', type: 'text' },
      { key: 'reward', label: 'Reward', type: 'text' },
    ],
  },
  {
    id: 'gold',
    label: 'Gold',
    description: 'Simple coin reward encounter.',
    functionName: 'gold',
    source: ENGINE_TEMPLATE_SOURCE.gold,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'gold', label: 'Gold', type: 'text' },
    ],
  },
  {
    id: 'healing',
    label: 'Healing',
    description: 'Simple hit point recovery encounter.',
    functionName: 'healing',
    source: ENGINE_TEMPLATE_SOURCE.healing,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'total', label: 'Healing total or dice', type: 'text' },
    ],
  },
  {
    id: 'healing_check',
    label: 'Healing check',
    description: 'Medicine-style check with a healing outcome.',
    functionName: 'healing_check',
    source: ENGINE_TEMPLATE_SOURCE.healing_check,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'skill', label: 'Check', type: 'select', values: CHECK_LABEL_OPTIONS },
      { key: 'dc', label: 'DC', type: 'number' },
      { key: 'total', label: 'Healing total or dice', type: 'text' },
    ],
  },
  {
    id: 'damage',
    label: 'Damage',
    description: 'Simple damage encounter or environmental hazard.',
    functionName: 'damage',
    source: ENGINE_TEMPLATE_SOURCE.damage,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'total', label: 'Damage total or dice', type: 'text' },
    ],
  },
];

export function defaultEncounterValues(template: EncounterTemplate) {
  return Object.fromEntries(
    template.fields.map((field) => {
      if (field.type === 'number') {
        if (field.key === 'qty') return [field.key, 1];
        if (field.key === 'cr') return [field.key, 0.25];
        if (field.key === 'dc') return [field.key, 12];
        return [field.key, 12];
      }
      if (field.key === 'skill') {
        return [field.key, template.id === 'healing_check' ? 'Medicine' : 'Survival'];
      }
      if (field.key === 'save') return [field.key, 'Dexterity'];
      if (field.key === 'difficulty') return [field.key, 'medium'];
      if (field.type === 'select') return [field.key, field.values?.[0] ?? ''];
      if (field.key === 'gold' || field.key === 'total') return [field.key, '1d4'];
      if (field.key === 'title') return [field.key, 'Wild Herbs'];
      if (field.key === 'description') {
        return [field.key, 'You find useful herbs near a damp hollow.'];
      }
      if (field.key === 'item') return [field.key, 'Herbs'];
      if (field.key === 'text') return [field.key, 'A quiet moment changes the tone of the road.'];
      if (field.key === 'monster') return [field.key, 'Wolf'];
      if (field.key === 'hook') return [field.key, 'A local asks for help.'];
      if (field.key === 'reward') return [field.key, 'Favor'];
      if (field.key === 'bag') return [field.key, 'Forage'];
      return [field.key, ''];
    }),
  ) as Record<string, string | number>;
}

export function buildCompactEncounterRow({
  template,
  values,
  useAnyPool,
  selectedPools,
}: {
  template: EncounterTemplate;
  values: Record<string, string | number>;
  useAnyPool: boolean;
  selectedPools: string[];
}): CompactEncounterRow {
  return [
    useAnyPool ? null : selectedPools,
    template.id,
    ...template.fields.map((field) => values[field.key] ?? ''),
  ];
}

export function togglePoolSelection(current: string[], tag: string, checked: boolean) {
  if (checked) return current.includes(tag) ? current : [...current, tag];
  const next = current.filter((item) => item !== tag);
  return next.length > 0 ? next : ['enc.gather'];
}
