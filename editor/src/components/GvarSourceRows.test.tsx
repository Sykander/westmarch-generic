import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { LoadedGvarSource } from '../lib/gvarSources';
import { GvarSourceRows } from './GvarSourceRows';

const BASE_ID = '11111111-1111-1111-1111-111111111111';
const BIOME_ID = '22222222-2222-2222-2222-222222222222';
const BROKEN_ID = '33333333-3333-3333-3333-333333333333';

function sampleRows(): LoadedGvarSource[] {
  return [
    {
      id: BASE_ID,
      label: 'westmarch_config',
      path: 'svar.westmarch_config',
      kind: 'config',
      value: 'display = {}',
      loaded: true,
    },
    {
      id: BIOME_ID,
      label: 'world data.biomes.forest.gvar id',
      path: 'world_data.biomes.forest.gvar_id',
      kind: 'json',
      value: 'SHOULD_NOT_RENDER_WHILE_COLLAPSED',
      loaded: true,
    },
    {
      id: BROKEN_ID,
      label: 'world data.locations.town.encounter gvar',
      path: 'world_data.locations.town.encounter_gvar',
      kind: 'gvar',
      value: '',
      loaded: false,
      error: 'Avrae could not load this gvar.',
    },
  ];
}

function renderWithTooltips(element: ReactElement) {
  return renderToStaticMarkup(createElement(TooltipProvider, null, element));
}

test('GvarSourceRows expands only the first source by default', () => {
  const html = renderWithTooltips(
    createElement(GvarSourceRows, {
      rows: sampleRows(),
      onChange: () => undefined,
      onCopy: () => undefined,
      onDownload: () => undefined,
    }),
  );

  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 2);
  assert.match(html, /westmarch_config source/);
  assert.match(html, /display = \{\}/);
  assert.match(html, /world_data\.biomes\.forest\.gvar_id/);
  assert.match(html, /Needs attention/);
  assert.doesNotMatch(html, /SHOULD_NOT_RENDER_WHILE_COLLAPSED/);
});

test('GvarSourceRows renders source action labels when handlers are present', () => {
  const html = renderWithTooltips(
    createElement(GvarSourceRows, {
      rows: [sampleRows()[0]],
      onCopy: () => undefined,
      onDownload: () => undefined,
      readOnlyIds: [BASE_ID],
    }),
  );

  assert.match(html, /Copy westmarch_config/);
  assert.match(html, /Download westmarch_config/);
  assert.match(html, /Open westmarch_config in Avrae dashboard/);
});

test('GvarSourceRows renders an empty state when no sources are available', () => {
  const html = renderWithTooltips(createElement(GvarSourceRows, { rows: [] }));

  assert.match(html, /No gvar sources loaded yet/);
});

test('GvarSourceRows explains editable placeholder sources when Avrae token is missing', () => {
  const html = renderWithTooltips(
    createElement(GvarSourceRows, {
      rows: [
        {
          id: BIOME_ID,
          label: 'world data.biomes.forest.gvar id',
          path: 'world_data.biomes.forest.gvar_id',
          kind: 'json',
          value: '',
          loaded: false,
          error:
            'Not loaded because AVRAE_TOKEN is empty. Add your Avrae token, then read from Avrae to load this gvar.',
        },
      ],
      onChange: () => undefined,
    }),
  );

  assert.match(html, /Not loaded because AVRAE_TOKEN is empty/);
  assert.match(html, /world data\.biomes\.forest\.gvar id source/);
  assert.match(html, /textarea/);
});
