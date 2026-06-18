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

export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  {
    id: 'gather_item',
    label: 'Gather item',
    description: 'Skill check that grants an item or resource outcome.',
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
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
  },
  {
    id: 'flavour',
    label: 'Flavour',
    description: 'Non-reward descriptive gather beat.',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'text', label: 'Text', type: 'text' },
    ],
  },
  {
    id: 'combat',
    label: 'Combat',
    description: 'Simple monster encounter stub.',
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
