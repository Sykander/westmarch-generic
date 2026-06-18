import assert from 'node:assert/strict';
import test from 'node:test';
import {
  discoverGvarReferences,
  discoverGvarReferencesFromSource,
  kindFromSource,
  sourceRowsWithBase,
  type LoadedGvarSource,
} from './gvarSources';

const FOREST_ID = '11111111-1111-1111-1111-111111111111';
const LOCATION_ID = '22222222-2222-2222-2222-222222222222';
const CATALOGUE_ID = '33333333-3333-3333-3333-333333333333';
const NESTED_ID = '44444444-4444-4444-4444-444444444444';
const SECOND_NESTED_ID = '55555555-5555-5555-5555-555555555555';

test('discoverGvarReferences finds config gvar ids with useful paths and kinds', () => {
  const references = discoverGvarReferences({
    world_data: {
      biomes: {
        forest: {
          gvar_id: FOREST_ID.toUpperCase(),
        },
      },
      engine_ref: `engine:${LOCATION_ID}`,
      locations: {
        town: {
          encounters_gvar_id: LOCATION_ID,
        },
      },
    },
    policies: {
      crafting: {
        catalogue_gvar_id: CATALOGUE_ID,
      },
    },
  });

  const forest = references.find((reference) => reference.id === FOREST_ID);
  const location = references.find((reference) => reference.id === LOCATION_ID);
  const catalogue = references.find((reference) => reference.id === CATALOGUE_ID);

  assert.equal(forest?.path, 'world_data.biomes.forest.gvar_id');
  assert.equal(forest?.label, 'world data.biomes.forest.gvar id');
  assert.equal(forest?.kind, 'json');
  assert.equal(location?.path, 'world_data.locations.town.encounters_gvar_id');
  assert.equal(location?.kind, 'gvar');
  assert.equal(catalogue?.path, 'policies.crafting.catalogue_gvar_id');
  assert.equal(catalogue?.kind, 'json');
  assert.equal(
    references.some((reference) => reference.path === 'world_data.engine_ref'),
    false,
  );
});

test('discoverGvarReferencesFromSource follows nested JSON gvar ids', () => {
  const references = discoverGvarReferencesFromSource(
    JSON.stringify({
      extra: {
        child: NESTED_ID,
        engine: `engine:${SECOND_NESTED_ID}`,
      },
    }),
    'world_data.biomes.forest',
  );

  assert.deepEqual(
    references.map((reference) => ({
      id: reference.id,
      path: reference.path,
    })),
    [
      {
        id: NESTED_ID,
        path: 'world_data.biomes.forest.extra.child',
      },
    ],
  );
});

test('discoverGvarReferencesFromSource falls back to scanning gvar source text', () => {
  const references = discoverGvarReferencesFromSource(
    `nested = "${NESTED_ID}"\nother = "${SECOND_NESTED_ID}"`,
    'world_data.locations.town.encounters_gvar_id',
  );

  assert.deepEqual(
    references.map((reference) => reference.path),
    [
      'world_data.locations.town.encounters_gvar_id.source_ref_1',
      'world_data.locations.town.encounters_gvar_id.source_ref_2',
    ],
  );
});

test('kindFromSource promotes valid JSON and otherwise keeps the fallback kind', () => {
  assert.equal(kindFromSource('{"rows":[]}', 'gvar'), 'json');
  assert.equal(kindFromSource('rows = []', 'gvar'), 'gvar');
});

test('sourceRowsWithBase prepends the base config source', () => {
  const related: LoadedGvarSource[] = [
    {
      id: FOREST_ID,
      label: 'world data.biomes.forest.gvar id',
      path: 'world_data.biomes.forest.gvar_id',
      kind: 'json',
      value: '[]',
      loaded: true,
    },
  ];

  const rows = sourceRowsWithBase({
    configId: `https://example.test/editor?westmarch_config=${LOCATION_ID}`,
    rawSource: 'display = {}',
    serialized: 'display = {"name": "Test"}',
    related,
  });

  assert.equal(rows[0].id, LOCATION_ID);
  assert.equal(rows[0].label, 'westmarch_config');
  assert.equal(rows[0].path, 'svar.westmarch_config');
  assert.equal(rows[0].value, 'display = {"name": "Test"}');
  assert.equal(rows[1], related[0]);
});
