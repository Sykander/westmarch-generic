import assert from 'node:assert/strict';
import test from 'node:test';
import type { EncounterTemplate } from '../domain/encounters';
import { buildEncounterPreview } from './encounterPreview';

test('buildEncounterPreview expands built-in templates from compact row args', () => {
  const preview = buildEncounterPreview({
    template: {
      id: 'gather_item',
      label: 'Gather item',
      description: 'Gather resources.',
      fields: [],
    },
    row: [
      ['enc.gather'],
      'gather_item',
      'Wild Herbs',
      'Damp hollow.',
      'Survival',
      12,
      'Herbs',
      2,
      'Forage',
    ],
    previewResult: 'success',
    previewRoll: '18',
  });

  assert.equal(preview.name, 'Wild Herbs');
  assert.equal(preview.output?.name, 'Wild Herbs');
  assert.equal(preview.templateOutput?.name, 'Wild Herbs');
  assert.equal(preview.displayOutput?.name, 'Wild Herbs');
  assert.match(preview.rolls[0], /18 \*\*Survival\*\* \(DC 12, Passed\)/);
  assert.match(preview.outcomes[0], /Gain 2 x Herbs in Forage/);
  assert.match(preview.displayOutput?.roll_text ?? '', /18 \*\*Survival\*\* \(DC 12, Passed\)/);
  assert.equal(preview.displayOutput?.title, 'Wild Herbs');
  assert.equal(preview.displayOutput?.footer, 'Use !westmarch help for options.');
  assert.deepEqual(preview.displayOutput?.rolls[0], {
    type: 'check',
    name: 'Survival',
    ability: 'wis',
    dc: 12,
    total: 18,
    full: '18',
    passed: true,
  });
  assert.equal(preview.displayOutput?.embed.title, 'Wild Herbs');
  assert.equal(preview.displayOutput?.embed.footer, 'Use !westmarch help for options.');
  assert.match(preview.displayOutput?.outcome_text ?? '', /Gain 2 x Herbs in Forage/);
});

test('buildEncounterPreview gates gather item outcomes on first roll success', () => {
  const input = {
    template: {
      id: 'gather_item',
      label: 'Gather item',
      description: 'Gather resources.',
      fields: [],
    },
    row: [
      ['enc.gather'],
      'gather_item',
      'Wild Herbs',
      'Damp hollow.',
      'Survival',
      12,
      'Herbs',
      2,
      'Forage',
    ],
  };

  const failedPreview = buildEncounterPreview({
    ...input,
    previewResult: 'failure',
    previewRoll: '1',
  });
  const successPreview = buildEncounterPreview({
    ...input,
    previewResult: 'success',
    previewRoll: '18',
  });

  assert.equal(failedPreview.outcomes.length, 0);
  assert.equal(failedPreview.displayOutput?.outcomes.length, 0);
  assert.match(successPreview.outcomes[0], /Gain 2 x Herbs in Forage/);
});

test('buildEncounterPreview prefers exact Pyodide encounter results when available', () => {
  const template: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Fallback copy.',
    custom: true,
    functionName: 'custom_scene',
    source: 'def custom_scene(args):\n    return {"name": "From Python", "description": "Exact"}',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  };

  const preview = buildEncounterPreview({
    template,
    row: [['enc.combat'], 'custom_scene', 'Fallback title'],
    previewResult: 'neutral',
    previewRoll: '10',
    pythonPreview: {
      encounter: {
        name: 'From Pyodide',
        description: 'Exact return value',
        cr: 2,
        monsters: ['Bandit Captain'],
      },
    },
  });

  assert.equal(preview.kind, 'combat');
  assert.equal(preview.name, 'From Pyodide');
  assert.equal(preview.output?.name, 'From Pyodide');
  assert.equal(preview.templateOutput?.name, 'From Pyodide');
  assert.equal(preview.output?.kind, undefined);
  assert.equal(preview.templateOutput?.kind, undefined);
  assert.equal(preview.displayOutput?.name, 'From Pyodide');
  assert.match(preview.outcomes.join('\n'), /Bandit Captain/);
  assert.match(preview.displayOutput?.outcome_text ?? '', /Bandit Captain/);
  assert.match(preview.footer, /Pyodide/);
});

test('buildEncounterPreview renders Pyodide processed display output when available', () => {
  const preview = buildEncounterPreview({
    template: {
      id: 'gather_item',
      label: 'Gather item',
      description: 'Gather resources.',
      fields: [],
    },
    row: [['enc.gather'], 'gather_item', 'Wild Herbs'],
    previewResult: 'success',
    previewRoll: '15',
    pythonPreview: {
      encounter: {
        name: 'Wild Herbs',
        description: 'Template encounter.',
      },
      displayOutput: {
        name: 'Wild Herbs',
        description: 'Processed display.',
        roll_text: 'Survival DC 12 -> 15 (success)',
        outcome_text: 'Gain 1 x Herbs in Forage',
      },
    },
  });

  assert.equal(preview.description, 'Processed display.');
  assert.match(preview.rolls[0], /Survival DC 12 -> 15/);
  assert.match(preview.outcomes[0], /Gain 1 x Herbs in Forage/);
  assert.match(preview.footer, /Pyodide/);
});

test('buildEncounterPreview exposes encounter image fields for the preview', () => {
  const preview = buildEncounterPreview({
    template: {
      id: 'raw',
      label: 'Raw',
      description: 'Raw encounter.',
      fields: [],
    },
    row: [
      ['enc.gather'],
      'raw',
      {
        name: 'Image scene',
        description: 'A wide view.',
        thumbnail: 'https://example.test/thumb.png',
        image_url: 'https://example.test/image.png',
      },
    ],
    previewResult: 'success',
    previewRoll: '15',
  });

  assert.equal(preview.thumb, 'https://example.test/thumb.png');
  assert.equal(preview.image, 'https://example.test/image.png');
  assert.equal(preview.output?.kind, undefined);
  assert.equal(preview.displayOutput?.thumb, 'https://example.test/thumb.png');
  assert.equal(preview.displayOutput?.image, 'https://example.test/image.png');
});

test('buildEncounterPreview ignores missing media placeholder strings', () => {
  const preview = buildEncounterPreview({
    template: {
      id: 'raw',
      label: 'Raw',
      description: 'Raw encounter.',
      fields: [],
    },
    row: [
      ['enc.gather'],
      'raw',
      {
        kind: 'gather',
        name: 'No media scene',
        description: 'No image should render.',
        thumb: 'None',
        image_url: 'null',
      },
    ],
    previewResult: 'success',
    previewRoll: '15',
  });

  assert.equal(preview.thumb, undefined);
  assert.equal(preview.image, undefined);
  assert.equal(preview.output?.kind, undefined);
  assert.equal(preview.displayOutput?.thumb, undefined);
  assert.equal(preview.displayOutput?.image, undefined);
});

test('buildEncounterPreview does not approximate custom templates before Python returns', () => {
  const template: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Fallback copy.',
    custom: true,
    functionName: 'custom_scene',
    source:
      'def custom_scene(args):\n    return {"name": _arg(args, 0, "Scene"), "description": "Exact"}',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  };

  const preview = buildEncounterPreview({
    template,
    row: [['enc.quest'], 'custom_scene', 'Do not use this as fallback'],
    previewResult: 'neutral',
    previewRoll: '10',
  });

  assert.equal(preview.name, 'Preview pending');
  assert.notEqual(preview.name, 'Do not use this as fallback');
  assert.equal(preview.notice, undefined);
});
