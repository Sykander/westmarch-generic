import assert from 'node:assert/strict';
import test from 'node:test';
import { parseConfig, validateConfig } from './config';

function issueCodes(source: string): string[] {
  const parsed = parseConfig(source);
  const issues = validateConfig(parsed.model, parsed.issues);
  return issues.map((entry) => entry.code);
}

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

test('tracked downtime requires downtime subsystem', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "downtime": {"enabled": False},
}

policies = {
    "downtime": {"mode": "tracked", "max_workdays": None, "acquisition": "manual"},
}
`).includes('downtime.tracked_requires_subsystem'),
  );
});

test('downtime cap must be positive when set', () => {
  assert.ok(
    issueCodes(`
policies = {
    "downtime": {"mode": "manual", "max_workdays": 0, "acquisition": "manual"},
}
`).includes('downtime.max_workdays'),
  );
});

test('crafting warns when downtime is required but not tracked', () => {
  assert.ok(
    issueCodes(`
subsystems = {
    "downtime": {"enabled": True},
    "crafting": {
        "enabled": True,
        "commands": {"craft": True},
    },
}

policies = {
    "downtime": {"mode": "manual", "max_workdays": None, "acquisition": "manual"},
    "crafting": {"require_downtime_before_roll": True},
}
`).includes('crafting.downtime_not_tracked'),
  );
});

test('tracked downtime with enabled subsystem satisfies crafting dependency', () => {
  const codes = issueCodes(`
subsystems = {
    "downtime": {"enabled": True},
    "crafting": {
        "enabled": True,
        "commands": {"craft": True},
    },
}

policies = {
    "downtime": {"mode": "tracked", "max_workdays": None, "acquisition": "manual"},
    "crafting": {"require_downtime_before_roll": True},
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

test('crafting resource policies use manual check or deduct', () => {
  assert.ok(
    issueCodes(`
policies = {
    "crafting": {"resources": {"gold": "auto"}},
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
policies = {
    "inventory": {"item_handling": {"mode": "warehouse"}},
}
`).includes('inventory.item_handling_mode'),
  );
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
