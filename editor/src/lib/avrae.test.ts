import assert from 'node:assert/strict';
import test from 'node:test';
import { createdGvarIdFromResponse } from './avrae';

const GVAR_ID = 'f7b4a4ed-2b39-486e-b2ac-e951690e4438';

test('createdGvarIdFromResponse extracts ids from Avrae plain text create responses', () => {
  assert.equal(createdGvarIdFromResponse(`Gvar ${GVAR_ID} created.`), GVAR_ID);
});

test('createdGvarIdFromResponse extracts ids from nested JSON create responses', () => {
  assert.equal(createdGvarIdFromResponse({ data: { uuid: GVAR_ID } }), GVAR_ID);
  assert.equal(createdGvarIdFromResponse({ gvar: { id: GVAR_ID.toUpperCase() } }), GVAR_ID);
});

test('createdGvarIdFromResponse returns null when no id is present', () => {
  assert.equal(createdGvarIdFromResponse('created'), null);
  assert.equal(createdGvarIdFromResponse({ ok: true }), null);
});
