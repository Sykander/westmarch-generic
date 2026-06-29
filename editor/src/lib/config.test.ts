import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseConfig, serializeConfig, validateConfig, type ConfigModel } from './config';
import { STARTER_SOURCES } from '../app/starterSources';

function issuesFor(source: string) {
  const parsed = parseConfig(source);
  return validateConfig(parsed.model, parsed.issues);
}

function issueCodes(source: string): string[] {
  return issuesFor(source).map((entry) => entry.code);
}

function normalizedConfigSource(source: string) {
  const parsed = parseConfig(source);
  const parseIssues = parsed.issues.filter((entry) => entry.code.startsWith('parse.'));

  assert.deepEqual(parseIssues, []);
  assert.ok(parsed.model);

  return serializeConfig(parsed.model);
}

test('editor starter source matches canonical starter config', () => {
  const canonicalStarter = readFileSync(
    new URL('../../../src/gvars/configs/starter.gvar', import.meta.url),
    'utf8',
  );
  const editorStarter = STARTER_SOURCES.find((source) => source.id === 'starter');

  assert.ok(editorStarter);
  assert.equal(
    normalizedConfigSource(editorStarter.source),
    normalizedConfigSource(canonicalStarter),
  );
});

test('editor starter sources parse cleanly', () => {
  for (const starterSource of STARTER_SOURCES) {
    const parsed = parseConfig(starterSource.source);

    assert.deepEqual(
      parsed.issues.filter((entry) => entry.code.startsWith('parse.')),
      [],
      `${starterSource.label} should parse without parse issues`,
    );
    assert.ok(parsed.model, `${starterSource.label} should produce a guided editor model`);
  }
});

test('forgotten realms starter has travel, economy, content, and media baseline', () => {
  const starterSource = STARTER_SOURCES.find((source) => source.id === 'forgotten-realms-2014');
  assert.ok(starterSource);

  const parsed = parseConfig(starterSource.source);
  assert.ok(parsed.model);

  const issues = validateConfig(parsed.model, parsed.issues);
  const errorCodes = issues
    .filter((entry) => entry.severity === 'error')
    .map((entry) => entry.code);
  assert.deepEqual(errorCodes, []);

  const model = parsed.model as ConfigModel;
  assert.equal(model.rules_version, '2014');
  assert.equal(model.display.name, 'Forgotten Realms');
  assert.equal(model.display.footer, 'Forgotten Realms');

  const travel = model.subsystems.travel as Record<string, unknown>;
  const commands = travel.commands as Record<string, unknown>;
  const travelConfig = travel.config as Record<string, unknown>;
  assert.equal(travel.enabled, true);
  assert.equal(commands.travel, true);
  assert.equal(commands.location, true);
  assert.equal(commands.time, true);
  assert.equal(commands.weather, true);
  assert.equal(travelConfig.show_arrival_time, true);
  assert.equal(travelConfig.show_arrival_weather, true);
  assert.equal(travelConfig.show_shops_on_travel, false);

  const economy = model.subsystems.economy as Record<string, unknown>;
  const economyCommands = economy.commands as Record<string, unknown>;
  const economyConfig = economy.config as Record<string, unknown>;
  assert.equal(economy.enabled, true);
  assert.equal(economyCommands.job, true);
  assert.equal(economyCommands.buy, true);
  assert.equal(economyCommands.sell, true);
  assert.equal(economyCommands.wallet, false);
  assert.equal(economyConfig.job_location_policy, 'check');
  assert.equal(economyConfig.ask_to_confirm_purchases, true);
  assert.ok((economyConfig.jobs as unknown[]).length >= 4);
  assert.ok(Object.keys(model.shops ?? {}).length > 30);
  assert.equal(
    (model.shops?.waterdeep_general_market as Record<string, unknown>).location_id,
    'waterdeep',
  );

  const content = model.subsystems.content as Record<string, unknown>;
  const contentCommands = content.commands as Record<string, unknown>;
  const contentConfig = content.config as Record<string, unknown>;
  assert.equal(content.enabled, true);
  assert.equal(contentCommands.library, true);
  assert.equal(contentCommands.read, true);
  assert.equal(contentConfig.library_topic_source, 'balanced');

  const worldData = model.world_data as Record<string, unknown>;
  assert.equal(worldData.default_location, 'waterdeep');
  assert.equal(worldData.locations_gvar_id, 'engine:configs/forgotten_realms_2014_locations');
  assert.equal(worldData.paths_gvar_id, 'engine:configs/forgotten_realms_2014_paths');
  assert.equal((worldData.book_gvar_ids as unknown[]).length, 21);
  assert.equal(
    (worldData.book_gvar_ids as unknown[])[0],
    'engine:configs/books/forgotten_realms_a',
  );
  assert.ok(
    (worldData.book_gvar_ids as unknown[]).includes('engine:configs/books/forgotten_realms_pq'),
  );
  assert.ok((worldData.calendars as Record<string, unknown>).primary);
  assert.ok(
    ((worldData.weather as Record<string, unknown>).by_area as Record<string, unknown>).coast,
  );
  const locations = JSON.parse(
    readFileSync(
      new URL(
        '../../../src/gvars/configs/forgotten_realms_2014_locations.gvar.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as Record<string, unknown>;
  assert.ok(locations.neverwinter);
  assert.ok(locations.long_road);
  assert.ok(locations.high_forest);
  assert.ok(locations.sea_of_swords);
  assert.ok(Object.keys(locations).length > 70);
  const locationImages = new Set<unknown>();
  for (const [id, location] of Object.entries(locations)) {
    assert.equal(typeof location, 'object', `${id} should be an object`);
    assert.notEqual(location, null, `${id} should not be null`);
    const image = (location as Record<string, unknown>).image;
    locationImages.add(image);
    assert.equal(typeof image, 'string', `${id} should have an image URL`);
    assert.match(image, /^https:\/\/www\.dndbeyond\.com\/attachments\//);
  }
  assert.ok(locationImages.size > 30);
  const waterdeep = locations.waterdeep as Record<string, unknown>;
  const waterdeepCommands = waterdeep.commands as Record<string, unknown>;
  assert.equal(waterdeepCommands.job, true);
  assert.equal(waterdeepCommands.buy, true);
  assert.equal(waterdeepCommands.sell, true);
  assert.equal(waterdeepCommands.library, true);
  assert.equal(waterdeepCommands.read, true);
  assert.ok((waterdeep.library_topics as unknown[]).includes('waterdeep'));
  assert.deepEqual(waterdeep.services, [
    'waterdeep_general_market',
    'waterdeep_stables',
    'waterdeep_docks',
    'waterdeep_healers',
  ]);
  const candlekeepCommands = (locations.candlekeep as Record<string, unknown>).commands as Record<
    string,
    unknown
  >;
  assert.equal(candlekeepCommands.library, true);
  assert.equal(candlekeepCommands.read, true);

  const pathsPayload = JSON.parse(
    readFileSync(
      new URL('../../../src/gvars/configs/forgotten_realms_2014_paths.gvar.json', import.meta.url),
      'utf8',
    ),
  ) as Record<string, unknown>;
  const pathsByFrom = pathsPayload.paths_by_from as Record<string, Record<string, unknown>[]>;
  const paths = Object.values(pathsByFrom).flat();
  function transportMatches(path: Record<string, unknown>, transport: string) {
    const requirements = path.requirements as Record<string, unknown> | undefined;
    const raw = requirements?.transport ?? path.transport;
    return Array.isArray(raw) ? raw.includes(transport) : raw === transport;
  }
  function hasUnrestrictedPath(from: string, to: string) {
    return paths.some((path) => {
      const requirements = path.requirements as Record<string, unknown> | undefined;
      return path.from === from && path.to === to && requirements?.transport == null;
    });
  }
  function hasPath(from: string, to: string, transport: string) {
    return paths.some(
      (path) => path.from === from && path.to === to && transportMatches(path, transport),
    );
  }
  function hasStepText(from: string, to: string, text: string) {
    return paths.some((path) => {
      if (path.from !== from || path.to !== to || !Array.isArray(path.steps)) return false;
      return path.steps.some(
        (step) =>
          typeof step === 'object' &&
          step !== null &&
          String((step as Record<string, unknown>).description ?? '').includes(text),
      );
    });
  }

  assert.ok(paths.length > 120);
  assert.ok(Array.isArray(pathsByFrom.waterdeep));
  assert.ok(hasUnrestrictedPath('waterdeep', 'high_road'));
  assert.ok(hasUnrestrictedPath('high_road', 'triboar_trail'));
  assert.ok(hasUnrestrictedPath('triboar_trail', 'phandalin'));
  assert.ok(hasUnrestrictedPath('baldurs_gate', 'risen_road'));
  assert.ok(hasPath('waterdeep', 'sea_of_swords', 'ship'));
  assert.ok(hasPath('baldurs_gate', 'river_chionthar', 'boat'));
  assert.ok(hasPath('waterdeep', 'neverwinter', 'fly'));
  assert.ok(hasPath('waterdeep', 'silverymoon', 'teleportation_circle'));
  assert.ok(
    paths.every(
      (path) => typeof path.distance_miles === 'number' && typeof path.travel_hours === 'number',
    ),
  );
  assert.ok(hasStepText('baldurs_gate', 'risen_road', "Wyrm's Crossing"));

  const transport = worldData.transport as Record<string, Record<string, unknown>>;
  assert.equal(transport.walk.default, true);
  assert.ok((transport.walk.aliases as string[]).includes('walking'));
  assert.ok(transport.horse);
  assert.ok((transport.horse.aliases as string[]).includes('riding_horse'));
  assert.ok(transport.ship);
  assert.ok(transport.teleportation_circle);

  const codes = issues.map((entry) => entry.code);
  assert.equal(codes.includes('world.calendars.empty'), false);
  assert.equal(codes.includes('world.weather.empty'), false);
  assert.equal(codes.includes('world.path.transport_unknown'), false);

  const serialized = serializeConfig(model);
  assert.match(serialized, /"locations_gvar_id": "6c50e5a7-e36b-49fe-96e7-7e82e157bd31"/);
  assert.match(serialized, /"paths_gvar_id": "40403500-be2c-4b1a-8170-6176adf87aa5"/);
  assert.match(serialized, /"db6387b7-6856-4346-8601-8a326d856885"/);
  assert.match(serialized, /"55de7183-afd4-443d-8acb-4b1804f1ca45"/);
  const serializedParsed = parseConfig(serialized);
  assert.deepEqual(
    serializedParsed.issues.filter((entry) => entry.code.startsWith('parse.')),
    [],
  );
  assert.ok(serializedParsed.model);
  assert.deepEqual(
    validateConfig(serializedParsed.model, serializedParsed.issues)
      .filter((entry) => entry.severity === 'error')
      .map((entry) => entry.code),
    [],
  );
});

test('starter-style exploration config validates cleanly for phase 0 checks', () => {
  const codes = issueCodes(`
display = {"name": "Test March", "colour": "#5865F2"}

subsystems = {
    "exploration": {
        "enabled": True,
        "commands": {"enc": True},
        "config": {
            "enc_biome_source": "argument",
            "distribution": {"combat": 0, "quest": 0, "gather": 100},
        },
    },
}

world_data = {
    "biomes": {
        "forest": {
            "name": "Forest",
            "gvar_id": "11111111-1111-1111-1111-111111111111",
        },
    },
}
`);

  assert.equal(codes.includes('exploration.distribution_total'), false);
  assert.equal(codes.includes('exploration.location_requires_travel'), false);
  assert.equal(codes.includes('world.biomes.empty'), false);
});

test('exploration distribution must total 100', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "exploration": {
        "enabled": True,
        "commands": {"enc": True},
        "config": {
            "distribution": {"combat": 10, "quest": 10, "gather": 10},
        },
    },
}
`).includes('exploration.distribution_total'),
  );
});

test('subsystem config issues are reported under subsystem section', () => {
  const issues = issuesFor(`
subsystems = {
    "exploration": {
        "config": {
            "distribution": {"combat": 10, "quest": 10, "gather": 10},
            "monster_images": {"hunt": "banner"},
        },
    },
    "crafting": {
        "config": {
            "recipe_mode": "formula",
            "catalogues": {"spells": []},
        },
        "command_config": {"scribe": {"workdays_cost": "soon"}},
    },
}
`);

  for (const code of [
    'exploration.distribution_total',
    'exploration.monster_images_mode',
    'crafting.recipe_mode',
    'crafting.catalogue_source',
    'crafting.workdays_cost',
  ]) {
    assert.equal(
      issues.find((entry) => entry.code === code)?.section,
      'Subsystems',
      `${code} should point at the subsystem editor`,
    );
  }
});

test('location biome source requires travel to be enabled', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "exploration": {
        "enabled": True,
        "commands": {"enc": True},
        "config": {"enc_biome_source": "location"},
    },
}
`).includes('exploration.location_requires_travel'),
  );
});

test('travel and location validate with default location and known path endpoints', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True, "time": False, "weather": False},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);

  assert.equal(codes.includes('world.default_location'), false);
  assert.equal(codes.includes('world.locations.empty'), false);
  assert.equal(codes.includes('world.path.endpoint_unknown'), false);
});

test('enabled travel/location commands require world location data', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}
`);

  assert.ok(codes.includes('world.default_location'));
  assert.ok(codes.includes('world.locations.empty'));
});

test('travel accepts external world data gvar pointers', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations_gvar_id": "11111111-1111-1111-1111-111111111111",
    "paths_gvar_id": "22222222-2222-2222-2222-222222222222",
}
`);

  assert.equal(codes.includes('world.locations.empty'), false);
  assert.equal(codes.includes('world.locations_gvar_id.invalid'), false);
  assert.equal(codes.includes('world.paths_gvar_id.invalid'), false);
});

test('travel accepts engine world data preset pointers', () => {
  const codes = issueCodes(`
world_data = {
    "locations_gvar_id": "engine:configs/forgotten_realms_2014_locations",
    "paths_gvar_id": "engine:configs/forgotten_realms_2014_paths",
}
`);

  assert.equal(codes.includes('world.locations_gvar_id.invalid'), false);
  assert.equal(codes.includes('world.paths_gvar_id.invalid'), false);
});

test('content accepts engine book gvar preset pointers', () => {
  const codes = issueCodes(`
world_data = {
    "book_gvar_ids": [
        "engine:configs/books/forgotten_realms_a",
        "engine:configs/books/forgotten_realms_pq",
    ],
}
`);

  assert.equal(codes.includes('world.book_gvar_ids.shape'), false);
  assert.equal(codes.includes('world.book_gvar_ids.invalid'), false);
});

test('travel does not accept engine book gvar pointers as world data presets', () => {
  const codes = issueCodes(`
world_data = {
    "locations_gvar_id": "engine:configs/books/forgotten_realms_a",
}
`);

  assert.ok(codes.includes('world.locations_gvar_id.invalid'));
});

test('travel does not reject external default locations when inline locations are additions', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "waterdeep",
    "locations_gvar_id": "11111111-1111-1111-1111-111111111111",
    "locations": {
        "custom_camp": {"name": "Custom Camp"},
    },
    "paths": [
        {"from": "waterdeep", "to": "custom_camp", "steps": [{"type": "encounter", "biome": "road"}]},
    ],
}
`);

  assert.equal(codes.includes('world.default_location_unknown'), false);
  assert.equal(codes.includes('world.path.endpoint_unknown'), false);
});

test('world data gvar pointers must be valid uuids or engine presets', () => {
  const codes = issueCodes(`
world_data = {
    "locations_gvar_id": "locations",
    "paths_gvar_id": "paths",
}
`);

  assert.ok(codes.includes('world.locations_gvar_id.invalid'));
  assert.ok(codes.includes('world.paths_gvar_id.invalid'));
});

test('travel paths must reference configured locations', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`).includes('world.path.endpoint_unknown'),
  );
});

test('travel paths accept indexed paths_by_from shape', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": {
        "paths_by_from": {
            "river_town": [
                {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": "forest"}]},
            ],
        },
    },
}
`);

  assert.equal(codes.includes('world.paths.type'), false);
  assert.equal(codes.includes('world.path.endpoint_unknown'), false);
});

test('travel path transport requirements must match configured transport', () => {
  const unknownCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "transport": {
        "walk": {"name": "Walking", "default": True, "aliases": ["walking"]},
        "horse": {"name": "Horse or mount", "aliases": ["riding_horse", "warhorse", "pony"]},
    },
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "requirements": {"transport": "griffon"}, "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);

  assert.ok(unknownCodes.includes('world.path.transport_unknown'));

  const aliasCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "transport": {
        "walk": {"name": "Walking", "default": True, "aliases": ["walking"]},
        "horse": {"name": "Horse or mount", "aliases": ["riding_horse", "warhorse", "pony"]},
    },
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "requirements": {"transport": "riding_horse"}, "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);

  assert.equal(aliasCodes.includes('world.path.transport_unknown'), false);
});

test('travel path route metrics must be numeric when present', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "distance_miles": "far", "steps": [{"type": "encounter", "biome": "forest"}]},
        {"from": "oakwood", "to": "river_town", "travel_hours": -1, "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);

  assert.ok(codes.includes('world.path.travel_metric'));

  const validCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "distance_miles": 24, "travel_hours": 8, "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);

  assert.equal(validCodes.includes('world.path.travel_metric'), false);
});

test('travel config validates biome policy fields', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "config": {
            "location_biome_override": "yes",
            "path_biome_policy": "strict",
        },
    },
}
`);

  assert.ok(codes.includes('travel.location_biome_override'));
  assert.ok(codes.includes('travel.path_biome_policy'));
});

test('travel path biomes must be allowed by the origin location when policy is on', () => {
  const blockedCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town", "commands": {"enc": ["road"]}},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);
  assert.ok(blockedCodes.includes('world.path.biome_not_allowed'));

  const allowedCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town", "commands": {"enc": ["forest"]}},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);
  assert.equal(allowedCodes.includes('world.path.biome_not_allowed'), false);

  const offCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True, "location": True},
        "config": {"path_biome_policy": "off"},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town", "commands": {"enc": ["road"]}},
        "oakwood": {"name": "Oakwood Forest"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": "forest"}]},
    ],
}
`);
  assert.equal(offCodes.includes('world.path.biome_not_allowed'), false);
});

test('time and weather commands require configured world data', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"time": True, "weather": True},
    },
}
`);

  assert.ok(codes.includes('world.calendars.empty'));
  assert.ok(codes.includes('world.weather.empty'));
});

test('location calendar and weather area ids must match configured world data', () => {
  const codes = issueCodes(`
world_data = {
    "calendars": {"primary": {"name": "Primary"}},
    "weather": {"by_area": {"forest": {"default": ["Clear skies."]}}},
    "locations": {
        "oakwood": {
            "name": "Oakwood",
            "calendar_id": "missing_calendar",
            "weather_area": "missing_weather",
        },
    },
}
`);

  assert.ok(codes.includes('world.location.calendar_unknown'));
  assert.ok(codes.includes('world.location.weather_area_unknown'));
});

test('travel validation warns for empty encounter biome unless location inference is configured', () => {
  const missingBiomeCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True},
    },
    "exploration": {
        "config": {"enc_biome_source": "argument"},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": ""}]},
    ],
}
`);
  assert.ok(missingBiomeCodes.includes('world.path.encounter_biome_missing'));

  const inferredCodes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": True,
        "commands": {"travel": True},
    },
    "exploration": {
        "config": {"enc_biome_source": "location"},
    },
}

world_data = {
    "default_location": "river_town",
    "locations": {
        "river_town": {"name": "River Town"},
        "oakwood": {"name": "Oakwood"},
    },
    "paths": [
        {"from": "river_town", "to": "oakwood", "steps": [{"type": "encounter", "biome": ""}]},
    ],
}
`);
  assert.equal(inferredCodes.includes('world.path.encounter_biome_missing'), false);
});

test('travel transport icons must be non-empty', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "travel": {
        "config": {"transport_icons": {"walk": ""}},
    },
}
`).includes('travel.transport_icon_missing'),
  );
});

test('time and weather toggles are implemented command toggles', () => {
  const codes = issueCodes(`
subsystems = {
    "travel": {
        "enabled": False,
        "commands": {"time": True, "weather": True},
    },
}
`);

  assert.equal(codes.includes('travel.time_planned'), false);
  assert.equal(codes.includes('travel.weather_planned'), false);
});

test('travel arrival display settings validate boolean values', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "travel": {
        "config": {"show_arrival_time": "yes", "show_arrival_weather": 1, "show_shops_on_travel": "no"},
    },
}
`).includes('travel.arrival_display_bool'),
  );
});

test('unsupported raw cooldown config is reported without hiding supported cooldowns', () => {
  const codes = issueCodes(`
subsystems = {
    "crafting": {
        "command_config": {"scribe": {"cooldown_seconds": 60}},
    },
    "economy": {
        "command_config": {"job": {"cooldown_seconds": 120}},
    },
}
`);

  assert.ok(codes.includes('command.cooldown_unsupported'));
  assert.equal(codes.filter((code) => code === 'command.cooldown_unsupported').length, 1);
});

test('location encounter gvar ids must be UUIDs', () => {
  assert.ok(
    issueCodes(`
world_data = {
    "locations": {
        "oakwood": {
            "name": "Oakwood",
            "encounters_gvar_id": "not-a-gvar",
        },
    },
}
`).includes('world.location.encounters_gvar_invalid'),
  );
});

test('tracked downtime requires downtime subsystem', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "downtime": {"enabled": False, "config": {"mode": "tracked"}},
}
`).includes('downtime.tracked_requires_subsystem'),
  );
});

test('downtime cap must be positive when set', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "downtime": {"config": {"mode": "manual", "max_workdays": 0, "acquisition": "manual"}},
}
`).includes('downtime.max_workdays'),
  );
});

test('crafting warns when downtime is required but not tracked', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "downtime": {"enabled": True, "config": {"mode": "manual"}},
    "crafting": {
        "enabled": True,
        "commands": {"craft": True},
        "config": {"resources": {"downtime": "check"}},
    },
}
`).includes('crafting.downtime_not_tracked'),
  );
});

test('tracked downtime with enabled subsystem satisfies crafting dependency', () => {
  const codes = issueCodes(`
subsystems = {
    "downtime": {"enabled": True, "config": {"mode": "tracked"}},
    "crafting": {
        "enabled": True,
        "commands": {"craft": True},
        "config": {"resources": {"downtime": "check"}},
    },
}
`);

  assert.equal(codes.includes('downtime.tracked_requires_subsystem'), false);
  assert.equal(codes.includes('crafting.downtime_not_tracked'), false);
});

test('enabled crafting command requires a usable catalogue source', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "crafting": {
        "enabled": True,
        "commands": {"scribe": True},
        "config": {"catalogues": {"spells": []}},
    },
}
`).includes('crafting.catalogue_missing'),
  );
});

test('built-in crafting catalogues validate cleanly', () => {
  const codes = issueCodes(`
subsystems = {
    "crafting": {
        "enabled": True,
        "commands": {"craft": True, "brew": True, "scribe": True, "enchant": True},
        "config": {
            "catalogues": {
                "items": "engine:catalogues/items",
                "potions": "engine:catalogues/potions",
                "spells": "engine:catalogues/spells",
                "magic_items": "engine:catalogues/magic_items",
            },
        },
    },
}
`);

  assert.equal(codes.includes('crafting.catalogue_missing'), false);
  assert.equal(codes.includes('crafting.catalogue_source'), false);
});

test('crafting catalogues can reference multiple owner gvars', () => {
  const codes = issueCodes(`
subsystems = {
    "crafting": {
        "enabled": True,
        "commands": {"craft": True, "scribe": True},
        "config": {
            "catalogues": {
                "items": {
                    "include_engine": True,
                    "gvar_ids": [
                        "11111111-1111-1111-1111-111111111111",
                        "22222222-2222-2222-2222-222222222222",
                    ],
                },
                "spells": {
                    "gvars": ["33333333-3333-3333-3333-333333333333"],
                },
            },
        },
    },
}
`);

  assert.equal(codes.includes('crafting.catalogue_missing'), false);
  assert.equal(codes.includes('crafting.catalogue_source'), false);
});

test('crafting resource policies use manual check or deduct', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "crafting": {"config": {"resources": {"gold": "auto"}}},
}
`).includes('crafting.resource_mode'),
  );
});

test('crafting recipe mode validates known modes', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "crafting": {
        "config": {"recipe_mode": "formula"},
    },
}
`).includes('crafting.recipe_mode'),
  );
});

test('crafting known spell requirement validates boolean values', () => {
  const codes = issueCodes(`
subsystems = {
    "crafting": {
        "config": {"require_known_spell": "yes"},
        "command_config": {"scribe": {"require_known_spell": "no"}},
    },
}
`);

  assert.equal(codes.filter((code) => code === 'crafting.require_known_spell').length, 2);
});

test('crafting check policies validate mode and dc', () => {
  const codes = issueCodes(`
subsystems = {
    "crafting": {
        "config": {"checks": {"scribe": {"mode": "contest", "dc": 0}}},
    },
}
`);

  assert.ok(codes.includes('crafting.check_mode'));
  assert.ok(codes.includes('crafting.check_dc'));
});

test('crafting tool policies validate mode and tool list', () => {
  const codes = issueCodes(`
subsystems = {
    "crafting": {
        "config": {"tool_policy": {"scribe": {"mode": "strict", "tools": "Calligrapher's Supplies"}}},
    },
}
`);

  assert.ok(codes.includes('crafting.tool_mode'));
  assert.ok(codes.includes('crafting.tool_list'));
});

test('item handling policy validates known output modes', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "crafting": {"config": {"item_handling": {"mode": "warehouse"}}},
}
`).includes('inventory.item_handling_mode'),
  );
});

test('display error embed policy validates shape and timeout', () => {
  const codes = issueCodes(`
policies = {
    "display": {"error_embeds": {"auto_delete": "yes", "timeout_seconds": 0}},
}
`);

  assert.ok(codes.includes('policies.display.error_auto_delete_type'));
  assert.ok(codes.includes('policies.display.error_timeout_seconds'));
});

test('deferred policy flags report validation issues when enabled', () => {
  const codes = issueCodes(`
policies = {
    "travel": {"apply_path_costs": True, "consume_rations": True, "rations_item": ""},
    "inventory": {"enforce_encumbrance": True},
    "combat": {"scale_encounters_to_level": True},
    "quest": {"self_assign": True},
    "economy": {"starting_gold": -1},
}
`);

  assert.ok(codes.includes('travel.apply_path_costs_deferred'));
  assert.ok(codes.includes('travel.consume_rations_deferred'));
  assert.ok(codes.includes('travel.rations_item_missing'));
  assert.ok(codes.includes('inventory.enforce_encumbrance_deferred'));
  assert.ok(codes.includes('combat.scaling_deferred'));
  assert.ok(codes.includes('quest.self_assign_requires_command'));
  assert.ok(codes.includes('economy.starting_gold'));
});

test('top-level currencies serialize round trip and wallet caps validate completeness', () => {
  const source = `
subsystems = {}
currencies = {
    "shards": {"name": "Shard"},
    "marks": {"name": "Mark", "max_balance": "many"},
}
policies = {
    "economy": {"enforce_wallet_caps": True},
}
`;
  const parsed = parseConfig(source);
  assert.deepEqual(parsed.model?.currencies?.shards, { name: 'Shard' });
  assert.match(serializeConfig(parsed.model as ConfigModel), /currencies = /);

  const codes = validateConfig(parsed.model, parsed.issues).map((entry) => entry.code);
  assert.ok(codes.includes('economy.wallet_cap_missing'));
  assert.ok(codes.includes('economy.wallet_cap_invalid'));
});

test('economy commands do not require setup data', () => {
  const codes = issueCodes(`
subsystems = {
    "economy": {
        "enabled": True,
        "commands": {"wallet": True, "buy": True, "sell": True},
    },
}
`);

  assert.equal(codes.includes('economy.currencies_missing'), false);
  assert.equal(codes.includes('economy.shops_missing'), false);
});

test('economy job location config validates policy and job rows', () => {
  const codes = issueCodes(`
subsystems = {
    "economy": {
        "config": {
            "job_location_policy": "strict",
            "jobs": [
                {"name": "Guard", "skills": "athletics"},
                "bad job row",
            ],
        },
    },
}
`);

  assert.ok(codes.includes('economy.job_location_policy'));
  assert.ok(codes.includes('economy.job_skills'));
  assert.ok(codes.includes('economy.job_shape'));
});

test('economy purchase confirmation config validates boolean values', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "economy": {
        "config": {"ask_to_confirm_purchases": "yes"},
    },
}
`).includes('economy.ask_to_confirm_purchases_bool'),
  );
});

test('economy shop validation catches malformed stock', () => {
  const codes = issueCodes(`
subsystems = {
    "economy": {
        "enabled": True,
        "commands": {"sell": True},
    },
}
shops = {
    "general": {
        "name": "General Store",
        "accepts_sells": False,
        "stock": [
            {"price": {"gold": 1}},
            {"item": "Rope, Hemp (50 ft)"},
            {"item": "Dagger", "price": []},
            {"item": "Stabling (1 day)", "price": {"gold": 1}, "fulfillment": "receipt"},
            {"item": "Ring of Protection", "display_name": 7, "price": {"gold": 20}},
        ],
    },
}
`);

  assert.ok(codes.includes('economy.stock_item'));
  assert.ok(codes.includes('economy.stock_price_missing'));
  assert.ok(codes.includes('economy.stock_price_shape'));
  assert.ok(codes.includes('economy.stock_fulfillment'));
  assert.ok(codes.includes('economy.stock_display_name'));
});

test('crafting command rules override must be a supported edition', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "crafting": {
        "command_config": {"scribe": {"rules_version": "2030"}},
    },
}
`).includes('crafting.rules_version'),
  );
});

test('custom encounter template functions serialize and parse back into editor metadata', () => {
  const model: ConfigModel = {
    display: {},
    subsystems: {},
    policies: {},
    world_data: {},
    encounter_templates: {
      custom_scene: {
        function_name: 'custom_scene',
        source:
          'def custom_scene(args):\n    title = _arg(args, 0)\n    skill = _arg(args, 1, "Survival")\n    return {"name": title, "description": skill}',
        args: ['title', 'skill'],
        fields: [
          { key: 'title', label: 'Title', type: 'text', inputType: 'text', required: true },
          {
            key: 'skill',
            label: 'Skill',
            type: 'select',
            inputType: 'skill_name',
            values: ['Survival', 'Nature'],
            required: false,
            defaultValue: 'Survival',
          },
        ],
        label: 'Custom scene',
        description: 'Custom function template.',
      },
    },
    encounter_template_meta: {
      custom_scene: {
        function_name: 'custom_scene',
        label: 'Custom scene',
        description: 'Custom function template.',
        args: ['title', 'skill'],
        fields: [
          { key: 'title', label: 'Title', type: 'text', inputType: 'text', required: true },
          {
            key: 'skill',
            label: 'Skill',
            type: 'select',
            inputType: 'skill_name',
            values: ['Survival', 'Nature'],
            required: false,
            defaultValue: 'Survival',
          },
        ],
      },
    },
  };

  const source = serializeConfig(model);
  assert.match(source, /def _arg\(args, index, default=None\):/);
  assert.match(source, /def custom_scene\(args\):/);
  assert.match(source, /encounter_templates = \{/);
  assert.match(source, /"custom_scene": custom_scene/);

  const parsed = parseConfig(source);
  const template = parsed.model?.encounter_templates?.custom_scene;
  assert.equal(typeof template, 'object');
  assert.match(String((template as Record<string, unknown>).source), /def custom_scene/);
  assert.deepEqual((template as Record<string, unknown>).args, ['title', 'skill']);
  assert.deepEqual((template as Record<string, unknown>).fields, [
    { key: 'title', label: 'Title', type: 'text', inputType: 'text', required: true },
    {
      key: 'skill',
      label: 'Skill',
      type: 'select',
      inputType: 'skill_name',
      values: ['Survival', 'Nature'],
      required: false,
      defaultValue: 'Survival',
    },
  ]);
});
