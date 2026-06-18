import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { CodeIde, getDrac2Diagnostics } from './CodeIde';

test('getDrac2Diagnostics flags imports and unsupported builtins', () => {
  const diagnostics = getDrac2Diagnostics(`
import os
using("module")
value = type(target)
unsafe = __import__("os")
open("file")
`);

  assert.deepEqual(
    diagnostics.map((diagnostic) => diagnostic.severity),
    ['error', 'warning', 'warning', 'error', 'error'],
  );
  assert.match(diagnostics[0].message, /Imports are not valid/);
  assert.match(diagnostics[1].message, /explicit gvar id fields/);
  assert.match(diagnostics[2].message, /type\(\.\.\.\)/);
  assert.match(diagnostics[3].message, /__import__/);
  assert.match(diagnostics[4].message, /safe Drac2 authoring subset/);
});

test('getDrac2Diagnostics allows ordinary config assignment text', () => {
  assert.deepEqual(getDrac2Diagnostics('display = {"name": "Test"}'), []);
});

test('CodeIde renders a textarea fallback during server-side tests', () => {
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(CodeIde, {
        label: 'Gvar source',
        value: 'display = {}',
        onChange: () => undefined,
        language: 'gvar',
        help: 'Editor help',
      }),
    ),
  );

  assert.match(html, /Gvar source/);
  assert.match(html, /textarea/);
  assert.match(html, /display = \{\}/);
});
