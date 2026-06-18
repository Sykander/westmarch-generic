import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FooterBehaviourField } from './FormFields';

test('FooterBehaviourField keeps option help behind the field help dialog', () => {
  const html = renderToStaticMarkup(
    createElement(FooterBehaviourField, {
      value: 'balanced',
      onChange: () => undefined,
    }),
  );

  assert.match(html, /Footer behaviour/);
  assert.match(html, /aria-label="Footer behaviour help"/);
  assert.doesNotMatch(html, /option-help-row/);
  assert.doesNotMatch(html, /Balanced<\/span><button/);
});
