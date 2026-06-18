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
  const row = [
    ['enc.gather'],
    'gather_item',
    'Wild Herbs',
    'Damp **hollow** with [map](https://example.test/map) and `moss`.\n-# Tiny Discord subtext.',
    'Survival',
    12,
  ];
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
      createElement(EncounterPreview, {
        preview,
      }),
    ),
  );

  assert.match(html, /discord-thumb/);
  assert.match(html, /discord-image/);
  assert.match(html, /Encounter embed preview/);
  assert.match(html, /Preview accuracy help/);
  assert.match(html, /discord-assets\/avrae-profile.webp/);
  assert.match(html, /discord-assets\/cat_profile.png/);
  assert.match(html, /Avrae/);
  assert.match(html, /APP/);
  assert.match(html, /Today at 8:53 PM/);
  assert.match(html, /CoolGuy2026/);
  assert.match(html, /Use !westmarch help for options\./);
  assert.match(html, /<strong>hollow<\/strong>/);
  assert.match(html, /href="https:\/\/example.test\/map"/);
  assert.match(html, /<code>moss<\/code>/);
  assert.match(html, /discord-markdown-subtext/);
  assert.match(html, /Tiny Discord subtext/);
  assert.doesNotMatch(html, /-# Tiny Discord subtext/);
  assert.doesNotMatch(html, /Encounter preview output/);
  assert.match(html, /<strong>Survival DC 12<\/strong>/);
});

test('EncounterPreviewPanel keeps idle custom previews behind the View tab', () => {
  const customTemplate: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Custom template.',
    custom: true,
    functionName: 'custom_scene',
    source: 'def custom_scene(args):\n    return {"name": _arg(args, 0, "Scene")}',
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
