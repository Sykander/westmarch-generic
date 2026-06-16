import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CompactEncounterRow } from '../domain/encounters';
import { BiomeGvarEditor, compactRowSummary } from './BiomeGvarEditor';

test('BiomeGvarEditor renders compact rows and generated body', () => {
  const rows: CompactEncounterRow[] = [
    [['enc.gather', 'forage.gather'], 'gather_item', 'Wild Herbs', 'Herbs', 12],
  ];
  const html = renderToStaticMarkup(
    createElement(BiomeGvarEditor, {
      rows,
      onRowsChange: () => undefined,
    }),
  );

  assert.match(html, /Biome gvar rows/);
  assert.match(html, /gather_item/);
  assert.match(html, /enc\.gather/);
  assert.match(html, /Generated biome gvar body/);
});

test('compactRowSummary describes template and pool tags', () => {
  assert.equal(compactRowSummary([['enc.combat'], 'combat', 'Wolf sign']), 'combat · enc.combat');
  assert.equal(compactRowSummary([null, 'flavour', 'Quiet glade']), 'flavour · any pool');
});
