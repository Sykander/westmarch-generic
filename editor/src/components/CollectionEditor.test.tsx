import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CollectionEditor } from './CollectionEditor';

test('CollectionEditor renders items and add/remove controls', () => {
  const html = renderToStaticMarkup(
    createElement(CollectionEditor<string>, {
      title: 'Example collection',
      items: ['first item'],
      emptyText: 'Nothing yet',
      addLabel: 'Add Row',
      addItem: () => 'new item',
      onChange: () => undefined,
      getKey: (item) => item,
      renderSummary: (item) => item,
      renderItem: ({ item }) => createElement('span', null, `Body: ${item}`),
    }),
  );

  assert.match(html, /Example collection/);
  assert.match(html, /Add Row/);
  assert.match(html, /first item/);
  assert.match(html, /Body: first item/);
  assert.match(html, /Remove Example collection row 1/);
});

test('CollectionEditor renders empty text when no items exist', () => {
  const html = renderToStaticMarkup(
    createElement(CollectionEditor<string>, {
      title: 'Empty collection',
      items: [],
      emptyText: 'Nothing yet',
      onChange: () => undefined,
      getKey: (item) => item,
      renderItem: ({ item }) => createElement('span', null, item),
    }),
  );

  assert.match(html, /Empty collection/);
  assert.match(html, /Nothing yet/);
});
