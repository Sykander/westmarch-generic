import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ENGINE_FORGOTTEN_REALMS_LOCATIONS,
  ENGINE_FORGOTTEN_REALMS_PATHS,
  findLoadedGvarSource,
  isReadOnlyWorldGvarId,
  locationsFromGvarSource,
  locationsFromPreset,
  mergeWorldLocations,
  mergeWorldPaths,
  pathsFromGvarSource,
  pathsFromPreset,
  worldLocationsSourceBody,
  worldPathsSourceBody,
} from './worldData';
import type { LoadedGvarSource } from '../lib/gvarSources';

const LOCATIONS_ID = '6c50e5a7-e36b-49fe-96e7-7e82e157bd31';
const PATHS_ID = '40403500-be2c-4b1a-8170-6176adf87aa5';
const CUSTOM_ID = '11111111-1111-1111-1111-111111111111';

function source(id: string, value: unknown): LoadedGvarSource {
  return {
    id,
    label: 'world data source',
    path: 'world_data.locations_gvar_id',
    kind: 'json',
    value: typeof value === 'string' ? value : JSON.stringify(value),
    loaded: true,
  };
}

test('world data helpers mark shipped location and path gvars read-only', () => {
  assert.equal(isReadOnlyWorldGvarId(LOCATIONS_ID), true);
  assert.equal(isReadOnlyWorldGvarId(PATHS_ID), true);
  assert.equal(isReadOnlyWorldGvarId(ENGINE_FORGOTTEN_REALMS_LOCATIONS), true);
  assert.equal(isReadOnlyWorldGvarId(ENGINE_FORGOTTEN_REALMS_PATHS), true);
  assert.equal(isReadOnlyWorldGvarId(CUSTOM_ID), false);
});

test('world data helpers expose shipped presets without loaded related gvars', () => {
  const locations = locationsFromPreset(ENGINE_FORGOTTEN_REALMS_LOCATIONS);
  const paths = pathsFromPreset(ENGINE_FORGOTTEN_REALMS_PATHS);

  assert.equal(String((locations.waterdeep as Record<string, unknown>).name), 'Waterdeep');
  assert.ok(paths.length > 120);
});

test('world data helpers resolve loaded gvar sources by configured id', () => {
  const rows = [source(CUSTOM_ID, {})];
  assert.equal(findLoadedGvarSource(rows, CUSTOM_ID.toUpperCase())?.id, CUSTOM_ID);
  assert.equal(findLoadedGvarSource(rows, ''), undefined);
});

test('locationsFromGvarSource accepts direct and wrapped location maps', () => {
  assert.deepEqual(
    locationsFromGvarSource(source(CUSTOM_ID, { waterdeep: { name: 'Waterdeep' } })),
    {
      waterdeep: { name: 'Waterdeep' },
    },
  );
  assert.deepEqual(
    locationsFromGvarSource(source(CUSTOM_ID, { locations: { phandalin: { name: 'Phandalin' } } })),
    { phandalin: { name: 'Phandalin' } },
  );
});

test('pathsFromGvarSource accepts direct and wrapped path lists', () => {
  assert.deepEqual(pathsFromGvarSource(source(CUSTOM_ID, [{ from: 'a', to: 'b' }])), [
    { from: 'a', to: 'b' },
  ]);
  assert.deepEqual(pathsFromGvarSource(source(CUSTOM_ID, { paths: [{ from: 'b', to: 'c' }] })), [
    { from: 'b', to: 'c' },
  ]);
});

test('world data helpers merge external data before inline overrides', () => {
  assert.deepEqual(
    mergeWorldLocations({ waterdeep: { name: 'Old' } }, { waterdeep: { name: 'New' } }),
    { waterdeep: { name: 'New' } },
  );
  assert.deepEqual(mergeWorldPaths([{ from: 'a' }], [{ from: 'b' }]), [
    { from: 'a' },
    { from: 'b' },
  ]);
});

test('world source bodies serialise canonical editable gvar shapes', () => {
  assert.equal(
    worldLocationsSourceBody({ waterdeep: { name: 'Waterdeep' } }),
    '{\n  "waterdeep": {\n    "name": "Waterdeep"\n  }\n}',
  );
  assert.equal(
    worldPathsSourceBody([{ from: 'a', to: 'b' }]),
    '[\n  {\n    "from": "a",\n    "to": "b"\n  }\n]',
  );
});
