import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExpandableBlockRows } from './ExpandableBlockRows';

test('ExpandableBlockRows opens only the first row by default', () => {
  const html = renderToStaticMarkup(
    createElement(ExpandableBlockRows, {
      rows: [
        {
          id: 'first',
          title: 'First',
          summary: 'Visible first',
          children: createElement('p', null, 'First body'),
        },
        {
          id: 'second',
          title: 'Second',
          summary: 'Hidden second',
          children: createElement('p', null, 'Second body'),
        },
      ],
    }),
  );

  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 1);
  assert.match(html, /First body/);
  assert.doesNotMatch(html, /Second body/);
});

test('ExpandableBlockRows supports explicit row defaults', () => {
  const html = renderToStaticMarkup(
    createElement(ExpandableBlockRows, {
      rows: [
        {
          id: 'first',
          title: 'First',
          summary: 'Closed first',
          defaultOpen: false,
          children: createElement('p', null, 'First body'),
        },
        {
          id: 'second',
          title: 'Second',
          summary: 'Open second',
          defaultOpen: true,
          children: createElement('p', null, 'Second body'),
        },
      ],
    }),
  );

  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /First body/);
  assert.match(html, /Second body/);
});
