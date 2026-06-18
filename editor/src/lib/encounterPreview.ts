import type { CompactEncounterRow, EncounterTemplate } from '../domain/encounters';

export type EncounterRecord = Record<string, unknown>;
type PreviewArg = CompactEncounterRow[number];

export type EncounterPreviewModel = {
  kind: string;
  name: string;
  description: string;
  rolls: string[];
  outcomes: string[];
  footer: string;
  thumb?: string;
  image?: string;
  output?: EncounterRecord;
  notice?: string;
};

type PreviewInput = {
  template: EncounterTemplate;
  row: CompactEncounterRow;
  previewResult: string;
  previewRoll: string;
  pythonPreview?: {
    encounter?: EncounterRecord;
    error?: string;
    loading?: boolean;
  } | null;
};

type EvaluationResult = {
  encounter?: EncounterRecord;
  error?: string;
  evaluated: boolean;
  source?: 'javascript' | 'pyodide';
};

const KIND_FALLBACKS = ['combat', 'quest', 'gather'];

export function buildEncounterPreview({
  template,
  row,
  previewResult,
  previewRoll,
  pythonPreview,
}: PreviewInput): EncounterPreviewModel {
  const args = row.slice(2) as PreviewArg[];
  const result: EvaluationResult = template.custom
    ? customTemplatePreviewResult(template, pythonPreview)
    : expandEncounterTemplate(template, args);
  const encounter = result.encounter ?? unavailableEncounter(template);

  return {
    kind: textField(encounter.kind, 'gather'),
    name: textField(encounter.name, template.label),
    description: textField(encounter.description, template.description),
    rolls: previewRolls(encounter.rolls, previewRoll, previewResult),
    outcomes: previewOutcomes(encounter),
    footer: previewFooter(template, result),
    thumb: optionalText(encounter.thumb) ?? optionalText(encounter.thumbnail),
    image: optionalText(encounter.image) ?? optionalText(encounter.image_url),
    output: result.encounter,
    notice: result.error,
  };
}

function customTemplatePreviewResult(
  template: EncounterTemplate,
  pythonPreview: PreviewInput['pythonPreview'],
): EvaluationResult {
  if (!template.source?.trim()) {
    return {
      evaluated: false,
      error: 'No function source is available for this custom template.',
    };
  }
  if (pythonPreview?.encounter) {
    return { encounter: pythonPreview.encounter, evaluated: true, source: 'pyodide' };
  }
  if (pythonPreview?.error) {
    return {
      evaluated: false,
      error: `Python preview: ${pythonPreview.error}`,
    };
  }
  if (pythonPreview?.loading) {
    return {
      evaluated: false,
      error: 'Rendering Python preview with Pyodide.',
    };
  }
  return {
    evaluated: false,
  };
}

export function expandEncounterTemplate(
  template: EncounterTemplate,
  args: PreviewArg[],
): EvaluationResult {
  if (template.custom) {
    return {
      evaluated: false,
      error: 'Custom templates are evaluated with Pyodide for previews.',
    };
  }

  const encounter = expandBuiltInTemplate(template.id, args);
  if (encounter) return { encounter, evaluated: true, source: 'javascript' };
  return {
    evaluated: false,
    error: 'This template is not implemented in the browser preview yet.',
  };
}

function expandBuiltInTemplate(templateId: string, args: PreviewArg[]): EncounterRecord | null {
  const key = templateId.trim().toLowerCase();
  if (key === 'gather_item' || key === 'gather') return gatherItem(args);
  if (key === 'skill_check' || key === 'check') return skillCheck(args);
  if (key === 'saving_throw' || key === 'save') return savingThrow(args);
  if (['flavour', 'flavor', 'static', 'story'].includes(key)) return story(args);
  if (key === 'combat') return combatTemplate(args);
  if (key === 'damage_combat') return damageCombat(args);
  if (key === 'ambush') return ambush(args);
  if (key === 'quest') return quest(args);
  if (key === 'gold') return gold(args);
  if (key === 'healing') return healing(args);
  if (key === 'healing_check') return healingCheck(args);
  if (key === 'damage') return damage(args);
  if (key === 'raw' && isRecord(arg(args, 0))) return arg(args, 0) as EncounterRecord;
  return null;
}

function gatherItem(args: PreviewArg[]) {
  let name: unknown;
  let description: unknown;
  let checkName: unknown;
  let dc: unknown;
  let item: unknown;
  let total: unknown;
  let bag: unknown;

  if (args.length >= 5 && isNumberish(arg(args, 2))) {
    name = arg(args, 0, 'Useful find');
    checkName = arg(args, 1, 'Wisdom (Survival)');
    dc = arg(args, 2, '12');
    item = arg(args, 3, 'Supplies');
    total = arg(args, 4, 1);
    description = `You gather **${text(item, 'Supplies')}** from the area.`;
  } else {
    name = arg(args, 0, 'Useful find');
    description = arg(args, 1, 'You find useful supplies in the wild.');
    checkName = arg(args, 2, 'Wisdom (Survival)');
    dc = arg(args, 3, '12');
    item = arg(args, 4, 'Supplies');
    total = arg(args, 5, 1);
    bag = arg(args, 6);
  }

  const outcome: EncounterRecord = {
    type: 'item',
    name: text(item, 'Supplies'),
    total: intOrText(total, 1),
  };
  if (bag !== undefined && text(bag).trim() !== '') outcome.bag = text(bag);
  return {
    ...base('gather', name, description),
    rolls: [roll(checkName, dc)],
    outcomes: [outcome],
  };
}

function skillCheck(args: PreviewArg[]) {
  const encounter: EncounterRecord = {
    ...base(
      'gather',
      arg(args, 0, 'Skill check'),
      arg(args, 1, 'A careful approach may reveal something useful.'),
    ),
    rolls: [roll(arg(args, 2, 'Wisdom (Survival)'), arg(args, 3, '12'))],
  };
  if (arg(args, 4) !== undefined) encounter.success = text(arg(args, 4));
  if (arg(args, 5) !== undefined) encounter.failure = text(arg(args, 5));
  return encounter;
}

function savingThrow(args: PreviewArg[]) {
  const encounter: EncounterRecord = {
    ...base(
      'gather',
      arg(args, 0, 'Saving throw'),
      arg(args, 1, 'A sudden threat demands quick reaction.'),
    ),
    rolls: [save(arg(args, 2, 'Dexterity'), arg(args, 3, '12'))],
  };
  if (arg(args, 4) !== undefined) encounter.success = text(arg(args, 4));
  if (arg(args, 5) !== undefined) encounter.failure = text(arg(args, 5));
  return encounter;
}

function story(args: PreviewArg[]) {
  const kind = cleanKind(arg(args, 2, 'gather'));
  return base(
    kind,
    arg(args, 0, 'Forest sign'),
    arg(args, 1, 'You notice a quiet detail in the wild.'),
  );
}

function combatTemplate(args: PreviewArg[]) {
  const encounter: EncounterRecord = {
    ...base(
      'combat',
      arg(args, 0, 'Hostile creatures'),
      arg(args, 1, 'Something dangerous moves nearby.'),
    ),
    cr: arg(args, 2, 1),
  };
  const monsters = arg(args, 3);
  const difficulty = arg(args, 4);
  if (Array.isArray(monsters)) encounter.monsters = monsters;
  else if (text(monsters).trim() !== '') encounter.monsters = [text(monsters)];
  if (text(difficulty).trim() !== '') encounter.difficulty = text(difficulty);
  return encounter;
}

function damageCombat(args: PreviewArg[]) {
  return {
    ...combatTemplate(args),
    outcomes: [{ type: 'damage', total: intOrText(arg(args, 5, '1d4'), '1d4') }],
  };
}

function ambush(args: PreviewArg[]) {
  return {
    ...combatTemplate(args),
    rolls: [
      roll('Perception', arg(args, 5, '12')),
      roll('Stealth', arg(args, 5, '12')),
      { type: 'passive', name: 'Perception', ability: 'wis', dc: text(arg(args, 5, '12'), '12') },
    ],
  };
}

function quest(args: PreviewArg[]) {
  const encounter = base(
    'quest',
    arg(args, 0, 'Unfinished business'),
    arg(args, 1, 'A hook asks for follow-up.'),
  );
  if (text(arg(args, 2)).trim() !== '') encounter.reward = text(arg(args, 2));
  return encounter;
}

function gold(args: PreviewArg[]) {
  return {
    ...base('gather', arg(args, 0, 'Treasure cache'), arg(args, 1, 'Coins glint in the dirt.')),
    outcomes: [{ type: 'gold', total: intOrText(arg(args, 2, 1), 1) }],
  };
}

function healing(args: PreviewArg[]) {
  return {
    ...base(
      'gather',
      arg(args, 0, 'Restorative spring'),
      arg(args, 1, 'A restorative moment eases your wounds.'),
    ),
    outcomes: [{ type: 'healing', total: intOrText(arg(args, 2, '1d4'), '1d4') }],
  };
}

function healingCheck(args: PreviewArg[]) {
  return {
    ...base(
      'gather',
      arg(args, 0, 'Field medicine'),
      arg(args, 1, 'Careful treatment helps the wounded recover.'),
    ),
    rolls: [roll(arg(args, 2, 'Medicine'), arg(args, 3, '12'))],
    outcomes: [{ type: 'healing', total: intOrText(arg(args, 4, '1d4'), '1d4') }],
  };
}

function damage(args: PreviewArg[]) {
  return {
    ...base('gather', arg(args, 0, 'Hazard'), arg(args, 1, 'The area turns dangerous.')),
    outcomes: [{ type: 'damage', total: intOrText(arg(args, 2, '1d4'), '1d4') }],
  };
}

function unavailableEncounter(template: EncounterTemplate): EncounterRecord {
  return {
    kind: 'gather',
    name: template.custom ? 'Preview pending' : template.label,
    description: template.custom
      ? 'Refresh the preview to evaluate the template function.'
      : template.description,
  };
}

function previewFooter(template: EncounterTemplate, result: EvaluationResult) {
  if (template.custom && result.evaluated && result.source === 'pyodide') {
    return `Custom template evaluated with Pyodide: ${template.functionName ?? template.id}(args)`;
  }
  if (template.custom)
    return `Custom template preview: ${template.functionName ?? template.id}(args)`;
  if (result.evaluated) return `Template evaluated in browser: ${template.id}`;
  return `Template unavailable: ${template.id}`;
}

function previewRolls(value: unknown, previewRoll: string, previewResult: string) {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((rollRecord) => {
    const type = text(rollRecord.type, 'check');
    const name = text(rollRecord.name, type);
    const dc = text(rollRecord.dc);
    const dcText = dc ? ` DC ${dc}` : '';
    return `${name}${dcText} -> ${previewRoll} (${previewResult})`;
  });
}

function previewOutcomes(encounter: EncounterRecord) {
  const outcomes: string[] = [];
  if (text(encounter.reward).trim() !== '') outcomes.push(`Reward: ${text(encounter.reward)}`);
  if (text(encounter.cr).trim() !== '') {
    const monsters = Array.isArray(encounter.monsters)
      ? encounter.monsters
          .map((item) => text(item))
          .filter(Boolean)
          .join(', ')
      : '';
    const difficulty = text(encounter.difficulty).trim();
    outcomes.push(
      `Combat: CR ${text(encounter.cr)}${monsters ? `, ${monsters}` : ''}${difficulty ? ` (${difficulty})` : ''}`,
    );
  }
  if (!Array.isArray(encounter.outcomes)) return outcomes;

  for (const outcome of encounter.outcomes) {
    if (!isRecord(outcome)) continue;
    const type = text(outcome.type);
    if (type === 'item') {
      outcomes.push(
        `Gain ${text(outcome.total, '1')} x ${text(outcome.name, 'item')}${text(outcome.bag) ? ` in ${text(outcome.bag)}` : ''}`,
      );
    } else if (type === 'gold') {
      outcomes.push(`Gain ${text(outcome.total, '1')} gp`);
    } else if (type === 'healing') {
      outcomes.push(`Recover ${text(outcome.total, '1d4')} HP`);
    } else if (type === 'damage') {
      outcomes.push(`Take ${text(outcome.total, '1d4')} damage`);
    } else if (type === 'currency') {
      outcomes.push(`Gain ${text(outcome.total, '1')} ${text(outcome.id, 'currency')}`);
    } else if (type) {
      outcomes.push(`${type}: ${JSON.stringify(outcome)}`);
    }
  }
  return outcomes;
}

function base(kind: string, name: unknown, description: unknown): EncounterRecord {
  return {
    kind,
    name: text(name, 'Encounter'),
    description: text(description),
  };
}

function roll(checkName: unknown, dc: unknown): EncounterRecord {
  return {
    type: 'check',
    name: text(checkName, 'Wisdom (Survival)'),
    ability: abilityForCheck(checkName),
    dc: text(dc, '12'),
  };
}

function save(saveName: unknown, dc: unknown): EncounterRecord {
  const result: EncounterRecord = {
    type: 'save',
    name: text(saveName, 'Dexterity'),
    dc: text(dc, '12'),
  };
  const ability = abilityForSave(saveName);
  if (ability) result.ability = ability;
  return result;
}

function abilityForCheck(checkName: unknown) {
  const key = text(checkName).toLowerCase().replace(/[ _-]/g, '');
  const abilityMap: Record<string, string> = {
    strength: 'str',
    athletics: 'str',
    dexterity: 'dex',
    initiative: 'dex',
    acrobatics: 'dex',
    sleightofhand: 'dex',
    stealth: 'dex',
    constitution: 'con',
    intelligence: 'int',
    arcana: 'int',
    history: 'int',
    investigation: 'int',
    nature: 'int',
    religion: 'int',
    wisdom: 'wis',
    animalhandling: 'wis',
    insight: 'wis',
    medicine: 'wis',
    perception: 'wis',
    survival: 'wis',
    charisma: 'cha',
    deception: 'cha',
    intimidation: 'cha',
    performance: 'cha',
    persuasion: 'cha',
  };
  return abilityMap[key] ?? 'wis';
}

function abilityForSave(saveName: unknown) {
  const key = text(saveName).toLowerCase().replace(/[ _-]/g, '');
  const abilityMap: Record<string, string> = {
    strength: 'str',
    dexterity: 'dex',
    constitution: 'con',
    intelligence: 'int',
    wisdom: 'wis',
    charisma: 'cha',
  };
  return abilityMap[key];
}

function arg(args: PreviewArg[], index: number, fallback?: unknown) {
  return index < args.length ? args[index] : fallback;
}

function text(value: unknown, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function textField(value: unknown, fallback: string) {
  const result = text(value).trim();
  return result || fallback;
}

function optionalText(value: unknown) {
  const result = text(value).trim();
  return result || undefined;
}

function intOrText(value: unknown, fallback: unknown) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  return Number.isInteger(number) ? number : value;
}

function isNumberish(value: unknown) {
  return value !== null && value !== undefined && value !== '' && !Number.isNaN(Number(value));
}

function cleanKind(value: unknown) {
  const kind = text(value, 'gather').trim().toLowerCase();
  return KIND_FALLBACKS.includes(kind) ? kind : 'gather';
}

function isRecord(value: unknown): value is EncounterRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
