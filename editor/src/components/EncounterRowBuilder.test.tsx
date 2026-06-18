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
    'def travel_clue(args):\n    return {"name": _arg(args, 0, "Clue"), "description": "Follow the clue.", "reward": "Map mark"}',
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
  assert.match(html, /3 values synced with preview inputs/);
  assert.match(html, /Preview/);
  assert.match(html, /Inputs, mocks, outputs, and Discord-style embed/);
  assert.match(html, /Current builder row/);
  assert.match(html, /Biome gvar JSON rows/);
  assert.match(html, /Raw JSON/);
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

  assert.match(html, /Encounter fields/);
  assert.match(html, /Preview/);
  assert.match(html, /Inputs, mocks, outputs, and Discord-style embed/);
  assert.match(html, /Current builder row/);
  assert.match(html, /travel_clue/);
  assert.doesNotMatch(html, /Encounter embed preview/);
});

test('EncounterRowBuilder renders a row management table above the builder', () => {
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(EncounterRowBuilder, {
        rows: [[['enc.quest'], 'travel_clue', 'Trail Riddle', 'Follow the clue.', 'ominous']],
        onRowsChange: () => undefined,
        templates: [customTemplate],
      }),
    ),
  );

  assert.match(html, /Biome gvar JSON rows/);
  assert.match(html, /Template/);
  assert.match(html, /Pools/);
  assert.match(html, /Title/);
  assert.match(html, /Trail Riddle/);
  assert.match(html, /Edit/);
  assert.match(html, /Preview/);
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
  assert.match(html, /Preview/);
  assert.match(html, /Pool tags/);
  assert.match(html, /Current builder row/);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 3);
});
