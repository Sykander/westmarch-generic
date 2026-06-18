import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { EncounterTemplate } from '../domain/encounters';
import { EncounterRowBuilder } from './EncounterRowBuilder';

const customTemplate: EncounterTemplate = {
  id: 'travel_clue',
  label: 'Travel clue',
  description: 'A clue discovered while travelling.',
  custom: true,
  functionName: 'travel_clue',
  source:
    'def travel_clue(args):\n    return {"kind": "quest", "name": args[0], "description": "Follow the clue.", "reward": "Map mark"}',
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'clue', label: 'Clue text', type: 'text' },
    { key: 'tone', label: 'Tone', type: 'select', values: ['safe', 'ominous'] },
  ],
};

test('EncounterRowBuilder renders supplied custom templates', () => {
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterRowBuilder, {
        rows: [],
        onRowsChange: () => undefined,
        templates: [customTemplate],
      }),
    ),
  );

  assert.match(html, /travel_clue/);
  assert.match(html, /Encounter fields/);
  assert.match(html, /3 arguments passed into travel_clue/);
  assert.match(html, /Current row/);
  assert.match(html, /Biome gvar JSON rows/);
});

test('EncounterRowBuilder renders preview and current-row summaries while collapsed', () => {
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterRowBuilder, {
        rows: [],
        onRowsChange: () => undefined,
        templates: [customTemplate],
      }),
    ),
  );

  assert.match(html, /Preview/);
  assert.match(html, /Mock args, evaluated output, and Discord-style embed/);
  assert.match(html, /Current row/);
  assert.match(html, /travel_clue/);
  assert.doesNotMatch(html, /Encounter embed preview/);
});

test('EncounterRowBuilder uses vertical expandable rows for the builder sections', () => {
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterRowBuilder, {
        rows: [],
        onRowsChange: () => undefined,
        templates: [customTemplate],
      }),
    ),
  );

  assert.match(html, /Encounter fields/);
  assert.match(html, /Pool tags/);
  assert.match(html, /Preview/);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 4);
});
