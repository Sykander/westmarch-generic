import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { EncounterTemplate } from '../domain/encounters';
import { CustomTemplateBuilder } from './CustomTemplateBuilder';

const existingTemplate: EncounterTemplate = {
  id: 'travel_clue',
  label: 'Travel clue',
  description: 'A clue discovered while travelling.',
  args: ['title'],
  custom: true,
  functionName: 'travel_clue',
  source: 'def travel_clue(args):\n    return {"name": _arg(args, 0, "Clue")}',
  fields: [{ key: 'title', label: 'Title', type: 'text' }],
};

function renderWithTooltips(element: ReactElement) {
  return renderToStaticMarkup(createElement(TooltipProvider, null, element));
}

test('CustomTemplateBuilder renders expandable template sections', () => {
  const html = renderWithTooltips(
    createElement(CustomTemplateBuilder, {
      templates: [],
      onTemplatesChange: () => undefined,
    }),
  );

  assert.match(html, /Custom template builder/);
  assert.match(html, /Template id/);
  assert.match(html, /custom_scene/);
  assert.match(html, /Row input schema/);
  assert.match(html, /9 configured row inputs/);
  assert.match(html, /Template function/);
  assert.match(html, /Preview/);
  assert.match(html, /Inputs, mocks, outputs, and Discord-style embed/);
  assert.match(html, /Save and metadata/);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 5);
  assert.doesNotMatch(html, /def custom_scene\(args\):/);
  assert.doesNotMatch(html, /Encounter embed preview/);
});

test('CustomTemplateBuilder lists saved custom template ids', () => {
  const html = renderWithTooltips(
    createElement(CustomTemplateBuilder, {
      templates: [existingTemplate],
      onTemplatesChange: () => undefined,
    }),
  );

  assert.match(html, /Saved templates/);
  assert.match(html, /1 custom templates/);
});
