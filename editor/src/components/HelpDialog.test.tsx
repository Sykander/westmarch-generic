import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelpDialog } from './HelpDialog';

test('HelpDialog renders an accessible help trigger before the modal opens', () => {
  const html = renderToStaticMarkup(
    createElement(
      HelpDialog,
      {
        label: 'Raw gvar source help',
        title: 'Writing Config Gvars',
        description: 'Directly edit the config and related gvars.',
      },
      createElement('p', null, 'Use Python literals.'),
    ),
  );

  assert.match(html, /aria-label="Raw gvar source help"/);
  assert.doesNotMatch(html, /Writing Config Gvars/);
});
