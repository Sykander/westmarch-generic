import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { EncounterTemplate } from '../domain/encounters';
import { buildEncounterPreview } from '../lib/encounterPreview';
import { EncounterPreview, EncounterPreviewPanel } from './EncounterPreviewPanel';

const template: EncounterTemplate = {
  id: 'gather_item',
  label: 'Gather item',
  description: 'Skill check that grants an item.',
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'skill', label: 'Check', type: 'text' },
    { key: 'dc', label: 'DC', type: 'number' },
  ],
};

test('EncounterPreviewPanel renders the shared preview inputs by default', () => {
  const row = [['enc.gather'], 'gather_item', 'Wild Herbs', 'Damp hollow', 'Survival', 12];
  const preview = buildEncounterPreview({
    template,
    row,
    previewResult: 'success',
    previewRoll: '15',
  });

  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterPreviewPanel, {
        template,
        preview,
        previewResult: 'success',
        onPreviewResultChange: () => undefined,
        inputValues: {
          title: 'Wild Herbs',
          description: 'Damp hollow',
          skill: 'Survival',
          dc: 12,
        },
        onInputValueChange: () => undefined,
        rollValues: '15',
        onRollValuesChange: () => undefined,
      }),
    ),
  );

  assert.match(html, /Inputs/);
  assert.match(html, /Mocks/);
  assert.match(html, /Outputs/);
  assert.match(html, /View/);
  assert.match(html, /Template/);
  assert.match(html, /gather_item\(args\)/);
  assert.match(html, /Title/);
  assert.match(html, /Wild Herbs/);
  assert.match(html, /Template function/);
  assert.doesNotMatch(html, /Input args/);
  assert.doesNotMatch(html, /JSON row/);
  assert.doesNotMatch(html, /Generate Encounter/);
  assert.doesNotMatch(html, /Encounter embed preview/);
});

test('EncounterPreview renders the Discord-style embed view', () => {
  const row = [['enc.gather'], 'gather_item', 'Wild Herbs', 'Damp hollow', 'Survival', 12];
  const preview = {
    ...buildEncounterPreview({
      template,
      row,
      previewResult: 'success',
      previewRoll: '15',
    }),
    thumb: 'https://example.test/thumb.png',
    image: 'https://example.test/image.png',
  };

  const html = renderToStaticMarkup(createElement(EncounterPreview, { preview }));

  assert.match(html, /discord-thumb/);
  assert.match(html, /discord-image/);
  assert.match(html, /Encounter embed preview/);
  assert.match(html, /westmarch-assets\/brand\/avrae-avatar.svg/);
  assert.match(html, /Avrae/);
  assert.match(html, /APP/);
});

test('EncounterPreviewPanel keeps idle custom previews behind the View tab', () => {
  const customTemplate: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Custom template.',
    custom: true,
    functionName: 'custom_scene',
    source: 'def custom_scene(args):\n    return {"kind": "gather", "name": args[0]}',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  };
  const row = [['enc.gather'], 'custom_scene', 'Wild Herbs'];
  const preview = buildEncounterPreview({
    template: customTemplate,
    row,
    previewResult: 'success',
    previewRoll: '15',
  });

  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterPreviewPanel, {
        template: customTemplate,
        preview,
        previewResult: 'success',
        onPreviewResultChange: () => undefined,
        rollValues: '15',
        previewMode: 'idle',
        onPreviewRequest: () => undefined,
      }),
    ),
  );

  assert.match(html, /Inputs/);
  assert.match(html, /View/);
  assert.doesNotMatch(html, /Encounter preview placeholder/);
  assert.doesNotMatch(html, /Encounter embed preview/);
});
