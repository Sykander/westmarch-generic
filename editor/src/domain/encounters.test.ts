import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHECK_OPTIONS,
  ENCOUNTER_TEMPLATES,
  OUTCOME_OPTIONS,
  SAVE_OPTIONS,
  SKILL_OPTIONS,
  buildCompactEncounterRow,
  defaultEncounterValues,
} from './encounters';

test('skill options list all standard skills', () => {
  assert.deepEqual(SKILL_OPTIONS, [
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
  ]);
});

test('check options mirror rolls.gvar skill and ability keys', () => {
  assert.deepEqual(
    CHECK_OPTIONS.map((option) => option.value),
    [
      'strength',
      'athletics',
      'dexterity',
      'initiative',
      'acrobatics',
      'sleightOfHand',
      'stealth',
      'constitution',
      'intelligence',
      'arcana',
      'history',
      'investigation',
      'nature',
      'religion',
      'wisdom',
      'animalHandling',
      'insight',
      'medicine',
      'perception',
      'survival',
      'charisma',
      'deception',
      'intimidation',
      'performance',
      'persuasion',
    ],
  );
});

test('save options include ability saves and optional special saves', () => {
  assert.deepEqual(
    SAVE_OPTIONS.map((option) => option.value),
    [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
      'death',
      'honor',
      'sanity',
    ],
  );
});

test('outcome options describe configurable fields', () => {
  const itemOutcome = OUTCOME_OPTIONS.find((option) => option.type === 'item');
  assert.ok(itemOutcome);
  assert.deepEqual(
    itemOutcome.fields.map((field) => [field.key, field.required]),
    [
      ['name', true],
      ['total', true],
      ['bag', false],
    ],
  );
});

test('template defaults keep gather rows on Survival checks', () => {
  const gatherTemplate = ENCOUNTER_TEMPLATES.find((template) => template.id === 'gather_item');
  assert.ok(gatherTemplate);
  assert.equal(defaultEncounterValues(gatherTemplate).skill, 'Survival');
});

test('template catalogue includes reusable westmarch encounter patterns', () => {
  assert.deepEqual(
    ENCOUNTER_TEMPLATES.map((template) => template.id),
    [
      'gather_item',
      'skill_check',
      'saving_throw',
      'story',
      'flavour',
      'combat',
      'ambush',
      'damage_combat',
      'quest',
      'gold',
      'healing',
      'healing_check',
      'damage',
    ],
  );
});

test('ambush rows include difficulty and dc arguments', () => {
  const ambushTemplate = ENCOUNTER_TEMPLATES.find((template) => template.id === 'ambush');
  assert.ok(ambushTemplate);
  const row = buildCompactEncounterRow({
    template: ambushTemplate,
    values: defaultEncounterValues(ambushTemplate),
    useAnyPool: false,
    selectedPools: ['enc.combat'],
  });

  assert.deepEqual(row, [
    ['enc.combat'],
    'ambush',
    'Wild Herbs',
    'You find useful herbs near a damp hollow.',
    0.25,
    'Wolf',
    'medium',
    12,
  ]);
});

test('saving throw and healing check templates use the right default roll labels', () => {
  const saveTemplate = ENCOUNTER_TEMPLATES.find((template) => template.id === 'saving_throw');
  const healingTemplate = ENCOUNTER_TEMPLATES.find((template) => template.id === 'healing_check');
  assert.ok(saveTemplate);
  assert.ok(healingTemplate);

  assert.equal(defaultEncounterValues(saveTemplate).save, 'Dexterity');
  assert.equal(defaultEncounterValues(healingTemplate).skill, 'Medicine');
});
