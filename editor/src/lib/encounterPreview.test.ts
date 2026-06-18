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
  assert.match(preview.rolls[0], /Survival DC 12 -> 18/);
  assert.match(preview.outcomes[0], /Gain 2 x Herbs in Forage/);
});

test('buildEncounterPreview prefers exact Pyodide encounter results when available', () => {
  const template: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Fallback copy.',
    custom: true,
    functionName: 'custom_scene',
    source:
      'def custom_scene(args):\n    return {"kind": "quest", "name": "From Python", "description": "Exact"}',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  };

  const preview = buildEncounterPreview({
    template,
    row: [['enc.quest'], 'custom_scene', 'Fallback title'],
    previewResult: 'neutral',
    previewRoll: '10',
    pythonPreview: {
      encounter: {
        kind: 'combat',
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
  assert.match(preview.outcomes[0], /Bandit Captain/);
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
        kind: 'gather',
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
});

test('buildEncounterPreview does not approximate custom templates before Python returns', () => {
  const template: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Fallback copy.',
    custom: true,
    functionName: 'custom_scene',
    source:
      'def custom_scene(args):\n    return {"kind": "quest", "name": args[0], "description": "Exact"}',
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
