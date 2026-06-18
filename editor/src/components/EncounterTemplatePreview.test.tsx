import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { CompactEncounterRow, EncounterTemplate } from '../domain/encounters';
import { EncounterTemplatePreview } from './EncounterTemplatePreview';

const gatherTemplate: EncounterTemplate = {
  id: 'gather_item',
  label: 'Gather item',
  description: 'Skill check that grants an item.',
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'skill', label: 'Check', type: 'text' },
    { key: 'dc', label: 'DC', type: 'number' },
    { key: 'item', label: 'Outcome item', type: 'text' },
    { key: 'qty', label: 'Quantity', type: 'number' },
    { key: 'bag', label: 'Bag', type: 'text' },
  ],
};

function renderPreview(template: EncounterTemplate, compactRow: CompactEncounterRow) {
  return renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterTemplatePreview, {
        template,
        compactRow,
        className: 'inline-preview-panel',
      }),
    ),
  );
}

test('EncounterTemplatePreview starts built-in templates on the shared input tab', () => {
  const html = renderPreview(gatherTemplate, [
    ['enc.gather'],
    'gather_item',
    'Wild Herbs',
    'Damp hollow.',
    'Survival',
    12,
    'Herbs',
    1,
    'Forage',
  ]);

  assert.match(html, /Inputs/);
  assert.match(html, /Mocks/);
  assert.match(html, /Outputs/);
  assert.match(html, /View/);
  assert.match(html, /Template function/);
  assert.doesNotMatch(html, /Input args/);
  assert.doesNotMatch(html, /JSON row/);
  assert.doesNotMatch(html, /Generate Encounter/);
  assert.doesNotMatch(html, /Encounter embed preview/);
});

test('EncounterTemplatePreview uses the same input tab for custom templates', () => {
  const customTemplate: EncounterTemplate = {
    id: 'custom_scene',
    label: 'Custom scene',
    description: 'Custom template.',
    custom: true,
    functionName: 'custom_scene',
    source: 'def custom_scene(args):\n    return {"kind": "gather", "name": args[0]}',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  };

  const html = renderPreview(customTemplate, [['enc.gather'], 'custom_scene', 'Wild Herbs']);

  assert.match(html, /Inputs/);
  assert.match(html, /Mocks/);
  assert.match(html, /Outputs/);
  assert.match(html, /View/);
  assert.match(html, /custom_scene\(args\)/);
  assert.doesNotMatch(html, /Generate Encounter/);
});
