import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { EncounterTemplate } from '../domain/encounters';
import { buildEncounterPreview } from '../lib/encounterPreview';
import { EncounterPreviewPanel } from './EncounterPreviewPanel';

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

test('EncounterPreviewPanel renders template, args, output, and embed preview', () => {
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

  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterPreviewPanel, {
        template,
        preview,
        compactRow: row,
        previewResult: 'success',
        onPreviewResultChange: () => undefined,
        previewRoll: '15',
        onPreviewRollChange: () => undefined,
      }),
    ),
  );

  assert.match(html, /Template/);
  assert.match(html, /gather_item\(args\)/);
  assert.match(html, /Input args/);
  assert.match(html, /Wild Herbs/);
  assert.match(html, /Template output/);
  assert.match(html, /&quot;kind&quot;/);
  assert.match(html, /discord-thumb/);
  assert.match(html, /discord-image/);
  assert.match(html, /Encounter embed preview/);
  assert.match(html, /Avrae preview/);
});

test('EncounterPreviewPanel renders an explicit refresh placeholder for idle custom previews', () => {
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
        compactRow: row,
        previewResult: 'success',
        onPreviewResultChange: () => undefined,
        previewRoll: '15',
        onPreviewRollChange: () => undefined,
        previewMode: 'idle',
        onPreviewRequest: () => undefined,
      }),
    ),
  );

  assert.match(html, /Encounter preview placeholder/);
  assert.match(html, /Refresh Python preview/);
  assert.match(html, /Preview has not been rendered yet/);
  assert.doesNotMatch(html, /Avrae preview/);
});
