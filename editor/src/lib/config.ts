export type AnyRecord = Record<string, unknown>;

export type ConfigModel = {
  config_version?: string;
  rules_version?: string;
  display: AnyRecord;
  subsystems: Record<string, AnyRecord>;
  policies: AnyRecord;
  world_data: AnyRecord;
  currencies?: AnyRecord;
  shops?: AnyRecord;
  books?: AnyRecord;
  encounter_templates?: AnyRecord;
  encounter_template_meta?: AnyRecord;
};

export type ConfigIssue = {
  severity: 'error' | 'warning' | 'info';
  code: string;
  path: string;
  section: string;
  title: string;
  detail: string;
  fix?: string;
  canAutoFix?: boolean;
};

export type ParseResult = {
  model: ConfigModel | null;
  issues: ConfigIssue[];
  mode: 'empty' | 'literal' | 'raw';
};

const EXPLORATION_COMMANDS = ['enc', 'forage', 'fish', 'mine', 'lumber', 'hunt', 'loot'];

export const DEFAULT_SUBSYSTEM_COMMANDS: Record<string, string[]> = {
  exploration: EXPLORATION_COMMANDS,
  travel: ['travel', 'location', 'time', 'weather'],
  downtime: ['downtime'],
  crafting: ['craft', 'brew', 'enchant', 'scribe'],
  economy: ['job', 'buy', 'sell', 'wallet'],
  content: ['library', 'read'],
  misc: ['quest', 'recipe'],
};

const COOLDOWN_COMMANDS = new Set([...EXPLORATION_COMMANDS, 'job', 'library', 'read']);

export function commandSupportsCooldown(_subsystem: string, command: string): boolean {
  return COOLDOWN_COMMANDS.has(command);
}

const SUBSYSTEMS = Object.keys(DEFAULT_SUBSYSTEM_COMMANDS);

const VALID_ENC_BIOME = ['auto', 'argument', 'location'];
const VALID_HUNT_LOCATION_POLICY = ['off', 'location', 'monsters'];
const VALID_PATH_BIOME_POLICY = ['from_location', 'off'];
const VALID_ROUTE_PRIORITY = ['least_encs', 'least_travel_time', 'least_cost', 'custom'];
const VALID_JOB_LOCATION_POLICY = ['off', 'warn', 'check'];
const VALID_RULES_VERSION = ['2014', '2024'];
const VALID_FOOTER = ['helpful_tips', 'string', 'help', 'credits', 'balanced'];
const VALID_COMMAND_THUMBNAIL = ['default', 'character', 'pc', 'current_character', 'current_pc'];
const VALID_REPEAT = ['off', 'same_biome', 'global'];
const VALID_LIBRARY_TOPIC = ['inferred', 'balanced', 'manual', 'restricted'];
const VALID_MONSTER_IMAGE_MODES = ['thumbnail', 'thumb', 'image', 'off', 'none'];
const VALID_DOWNTIME_MODES = ['tracked', 'manual', 'off'];
const VALID_DOWNTIME_ACQUISITION = ['manual', 'world_clock', 'journey'];
const VALID_CRAFTING_RECIPE_MODES = ['raw', 'recipes', 'mixed'];
const VALID_CRAFTING_CHECK_MODES = ['none', 'manual', 'roll', 'off'];
const VALID_CRAFTING_TOOL_MODES = ['off', 'manual', 'check'];
const VALID_CRAFTING_RESOURCE_MODES = ['manual', 'check', 'deduct'];
const VALID_ITEM_HANDLING_MODES = ['manual', 'bags'];
const REQUIRED_TRANSPORT_ICONS = [
  'walk',
  'horse',
  'cart',
  'boat',
  'ship',
  'fly',
  'swim',
  'portal',
  'teleportation_circle',
];
const VALID_PLAYER_SETUP_CHECK_TYPES = ['cvar', 'uvar', 'svar', 'cc', 'counter', 'custom_counter'];
const VALID_PLAYER_SETUP_HUD_FIELDS = ['coinpurse', 'wallet', 'location', 'time', 'weather'];
const VALID_ENGINE_BIOMES = [
  'beach',
  'forest',
  'mountain',
  'cave',
  'ruins',
  'road',
  'urban',
  'river',
  'sea',
  'plains',
  'desert',
  'swamp',
  'sky',
  'deep_seas',
  'underdark',
  'tundra',
  'jungle',
  'volcanic',
  'astral',
];
const VALID_CRAFTING_ENGINE_CATALOGUES: Record<string, string> = {
  items: 'engine:catalogues/items',
  potions: 'engine:catalogues/potions',
  spells: 'engine:catalogues/spells',
  magic_items: 'engine:catalogues/magic_items',
  recipes: 'engine:configs/recipes/recipes_list',
};
const CRAFTING_REQUIRED_CATALOGUES: Record<string, string> = {
  craft: 'items',
  brew: 'potions',
  scribe: 'spells',
  enchant: 'magic_items',
};
const CRAFTING_RESOURCE_KEYS = ['gold', 'materials', 'items', 'downtime', 'spell_slot'];
const GVAR_ID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const FORGOTTEN_REALMS_BOOK_SHARD_GVARS = [
  [
    'forgotten_realms_a',
    'a7771172-0ee2-49a0-b892-bb3c9d6842e3',
    'db6387b7-6856-4346-8601-8a326d856885',
  ],
  [
    'forgotten_realms_b',
    '50e7b4e1-3109-430a-b7a0-46914c57e7fe',
    '02119878-36c4-4f9d-8aa7-468a440521a5',
  ],
  [
    'forgotten_realms_c',
    'e598419a-a631-4ada-8a54-a5cac0302b6b',
    'e0ef1522-71ab-41f0-929b-71c397af8615',
  ],
  [
    'forgotten_realms_d',
    '09a3182a-5062-404f-99f3-be317978b020',
    '725818d3-b318-4e3f-ae7d-cf31f1209cf7',
  ],
  [
    'forgotten_realms_e',
    '328a409c-beec-4fc4-9674-4f4fa0ae46f6',
    'c4750f55-7874-4b82-b006-36b93859aa4c',
  ],
  [
    'forgotten_realms_f',
    '07f95c94-ec44-4b32-bfb8-6f7ca22007d2',
    '5b25fbcb-9308-45a4-8ba0-8c1b8c4ca4d3',
  ],
  [
    'forgotten_realms_g',
    'e31ce04e-980c-4922-84c4-1477fc1c46f3',
    '3bcf6923-b626-491d-a655-0a9c1634ba2c',
  ],
  [
    'forgotten_realms_h',
    '87e3d839-a982-4f2b-9ca3-fb9f7f63f87f',
    'aedf732b-75e5-465a-aef9-6bfbc75cf260',
  ],
  [
    'forgotten_realms_i',
    '4ab16b9d-3ef5-4750-97c4-bdd681362229',
    '396f9804-c1c4-46d2-a99a-c77f82ad6418',
  ],
  [
    'forgotten_realms_j',
    '716db491-cd03-4f32-858c-366c87aee584',
    '68f0c308-318a-446c-a0ad-c9d92ad0c779',
  ],
  [
    'forgotten_realms_k',
    'cff98ad8-4cdd-4d0b-93a6-6be0b4adc495',
    'dd39c394-f150-48e2-8500-22f0417f331a',
  ],
  [
    'forgotten_realms_l',
    '4bdbb056-e670-4f41-8375-908a37eac5d3',
    '5d9b408c-1b2d-4acd-947d-212dec6d41f9',
  ],
  [
    'forgotten_realms_m',
    '8d7d0cbc-7c7d-4b48-80cd-a09480d73959',
    '82f08053-8f69-4a07-ad7d-4cbec703cac9',
  ],
  [
    'forgotten_realms_n',
    '9e16c2f8-88ea-46a4-a37f-5a3641fbef2c',
    '083b1b68-fa3c-491b-b726-9ce13d4c9568',
  ],
  [
    'forgotten_realms_o',
    '29172224-ef6c-4eca-9133-e9d899177130',
    '08b9df10-df71-44dc-aede-89c402e11abc',
  ],
  [
    'forgotten_realms_pq',
    'fce1d254-d6b4-43d1-9c48-7f5cf11b054f',
    '55de7183-afd4-443d-8acb-4b1804f1ca45',
  ],
  [
    'forgotten_realms_r',
    '50aabbac-94c4-4a59-a65c-5f520ae51305',
    'bc9c0712-c675-4c8a-9826-1e40959f61a5',
  ],
  [
    'forgotten_realms_s',
    '3dda0999-78aa-43b8-855b-5e92bea1ba16',
    'b4e96cb2-7ff8-49a0-9cec-8aaa51a7fba9',
  ],
  [
    'forgotten_realms_t',
    'e8c5cada-0e8d-42b4-9f1a-71cad233fc71',
    'ea9c7fab-8538-42c2-a0df-e537a20531be',
  ],
  [
    'forgotten_realms_v',
    '5fbbf320-0d2c-4e82-9f06-e85573077977',
    'c5eef426-8036-41cf-8c7b-cf6e0d57eaf8',
  ],
  [
    'forgotten_realms_w',
    'c49f88c2-6922-4eed-b020-82fedbe297a0',
    'ea8973e5-0590-4252-9a1d-b6121f8ebd0f',
  ],
] as const;
const engineSlugForBookShard = (name: string) => `engine:configs/books/${name}`;
const FORGOTTEN_REALMS_BOOK_ENGINE_TO_RUNTIME_UUID = Object.fromEntries(
  FORGOTTEN_REALMS_BOOK_SHARD_GVARS.map(([name, , prodId]) => [
    engineSlugForBookShard(name),
    prodId,
  ]),
) as Record<string, string>;
const FORGOTTEN_REALMS_BOOK_UUID_TO_ENGINE = Object.fromEntries(
  FORGOTTEN_REALMS_BOOK_SHARD_GVARS.flatMap(([name, devId, prodId]) => {
    const slug = engineSlugForBookShard(name);
    return [
      [devId, slug],
      [prodId, slug],
    ];
  }),
) as Record<string, string>;
const VALID_WORLD_ENGINE_GVARS = [
  'engine:configs/forgotten_realms_2014_locations',
  'engine:configs/forgotten_realms_2014_paths',
];
const VALID_BOOK_ENGINE_GVARS = Object.keys(FORGOTTEN_REALMS_BOOK_ENGINE_TO_RUNTIME_UUID);
const WORLD_GVAR_UUID_TO_ENGINE: Record<string, string> = {
  '6c50e5a7-e36b-49fe-96e7-7e82e157bd31': 'engine:configs/forgotten_realms_2014_locations',
  'fde0dbeb-d2e3-42fd-8f56-2d94bdf3ac58': 'engine:configs/forgotten_realms_2014_locations',
  '40403500-be2c-4b1a-8170-6176adf87aa5': 'engine:configs/forgotten_realms_2014_paths',
  '19623e1a-3a23-49a0-9d40-986fdd26d7e7': 'engine:configs/forgotten_realms_2014_paths',
  ...FORGOTTEN_REALMS_BOOK_UUID_TO_ENGINE,
};
const WORLD_ENGINE_TO_RUNTIME_UUID: Record<string, string> = {
  'engine:configs/forgotten_realms_2014_locations': '6c50e5a7-e36b-49fe-96e7-7e82e157bd31',
  'engine:configs/forgotten_realms_2014_paths': '40403500-be2c-4b1a-8170-6176adf87aa5',
  ...FORGOTTEN_REALMS_BOOK_ENGINE_TO_RUNTIME_UUID,
};

const DEFAULT_MODEL: ConfigModel = {
  display: {},
  subsystems: {},
  policies: {},
  world_data: {},
  currencies: {},
  shops: {},
  books: {},
  encounter_templates: {},
  encounter_template_meta: {},
};

function issue(
  severity: ConfigIssue['severity'],
  code: string,
  section: string,
  path: string,
  title: string,
  detail: string,
  fix?: string,
  canAutoFix = false,
): ConfigIssue {
  return { severity, code, section, path, title, detail, fix, canAutoFix };
}

function sectionForConfigPath(path: string): string {
  if (path.startsWith('subsystems.')) return 'Subsystems';
  return 'Policies';
}

function stripComments(source: string): string {
  let out = '';
  let quote: string | null = null;
  let triple: string | null = null;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next3 = source.slice(i, i + 3);

    if (triple) {
      if (next3 === triple) {
        triple = null;
        i += 2;
      }
      continue;
    }

    if (!quote && (next3 === '"""' || next3 === "'''")) {
      triple = next3;
      i += 2;
      continue;
    }

    if (quote) {
      out += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }

    if (ch === '#') {
      while (i < source.length && source[i] !== '\n') i += 1;
      out += '\n';
      continue;
    }

    out += ch;
  }

  return out;
}

function findAssignment(source: string, name: string): string | undefined {
  const re = new RegExp(`(^|\\n)\\s*${name}\\s*=\\s*`, 'm');
  const match = re.exec(source);
  if (!match) return undefined;

  let index = match.index + match[0].length;
  while (/\s/.test(source[index] ?? '')) index += 1;

  const first = source[index];
  if (first === '{' || first === '[') {
    const close = first === '{' ? '}' : ']';
    let depth = 0;
    let quote: string | null = null;
    let escaped = false;

    for (let i = index; i < source.length; i += 1) {
      const ch = source[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === first) depth += 1;
      if (ch === close) {
        depth -= 1;
        if (depth === 0) return source.slice(index, i + 1);
      }
    }
    return source.slice(index);
  }

  const lineEnd = source.indexOf('\n', index);
  return source.slice(index, lineEnd === -1 ? undefined : lineEnd).trim();
}

function pyLiteralToJsonish(value: string): string {
  let out = '';
  let quote: string | null = null;
  let escaped = false;
  let stringBuffer = '';

  function flushString() {
    out += JSON.stringify(stringBuffer);
    stringBuffer = '';
  }

  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];

    if (quote) {
      if (escaped) {
        stringBuffer += ch;
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
        flushString();
      } else {
        stringBuffer += ch;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      stringBuffer = '';
      continue;
    }

    out += ch;
  }

  return out
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/,\s*([}\]])/g, '$1');
}

function parseLiteral(value: string): unknown {
  return JSON.parse(pyLiteralToJsonish(value));
}

function parseStringAssignment(source: string, name: string): string | undefined {
  const value = findAssignment(source, name);
  if (!value) return undefined;
  try {
    const parsed = parseLiteral(value);
    return typeof parsed === 'string' ? parsed : undefined;
  } catch {
    return value.replace(/^["']|["']$/g, '');
  }
}

function findTopLevelFunction(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) =>
    new RegExp(`^def\\s+${name}\\s*\\(`).test(line.trimEnd()),
  );
  if (start < 0) return '';

  const out = [lines[start]];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && line.trim()) break;
    out.push(line);
  }
  return out.join('\n').trimEnd();
}

function parseEncounterTemplateConfig(source: string, meta: AnyRecord) {
  const assignment = findAssignment(source, 'encounter_templates');
  if (!assignment) return {};

  const templates: AnyRecord = {};
  const entryRe = /["']([a-zA-Z0-9_-]+)["']\s*:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g;
  for (const match of assignment.matchAll(entryRe)) {
    const id = match[1];
    const functionName = match[2];
    const metadata = asRecord(meta[id]);
    templates[id] = {
      function_name: functionName,
      source: findTopLevelFunction(source, functionName),
      args: Array.isArray(metadata.args) ? metadata.args : [],
      fields: Array.isArray(metadata.fields) ? metadata.fields : undefined,
      label: metadata.label ?? id,
      description: metadata.description ?? 'Custom encounter template.',
    };
  }
  return templates;
}

function parseRecordAssignment(source: string, name: string, issues: ConfigIssue[]): AnyRecord {
  const value = findAssignment(source, name);
  if (!value) return {};
  try {
    const parsed = parseLiteral(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as AnyRecord)
      : {};
  } catch (error) {
    issues.push(
      issue(
        'warning',
        `parse.${name}`,
        'Source',
        name,
        `Could not parse ${name}`,
        error instanceof Error ? error.message : 'Unsupported literal syntax.',
        'Use raw mode for this section or simplify it to literal dict/list syntax.',
      ),
    );
    return {};
  }
}

function defaultCommands(commands: string[]): AnyRecord {
  return Object.fromEntries(commands.map((key) => [key, false]));
}

function createDefaultSubsystems(): Record<string, AnyRecord> {
  return {
    exploration: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.exploration),
      config: {
        enc_biome_source: 'auto',
        distribution_policy: 'random',
        distribution: { combat: 25, quest: 25, gather: 50 },
        avoid_repeat_encounters: 'off',
        repeat_exclude_window: 5,
        hunt_location_policy: 'off',
        monster_images: { hunt: 'thumbnail', loot: 'thumbnail' },
        show_check_dcs: { hunt: true, loot: true },
      },
    },
    travel: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.travel),
      config: {
        location_biome_override: true,
        path_biome_policy: 'from_location',
        route_priority: 'least_encs',
        show_arrival_time: false,
        show_arrival_weather: false,
        show_shops_on_travel: true,
        transport_icons: {
          walk: '🚶',
          fly: '🪽',
          horse: '🐎',
          boat: '⛵',
          cart: '🛞',
          ship: '⛵',
          swim: '🌊',
          portal: '🌀',
          teleportation_circle: '🌀',
        },
      },
    },
    downtime: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.downtime),
      config: { mode: 'off', max_workdays: null, acquisition: 'manual' },
    },
    crafting: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.crafting),
      config: {
        rules_version: null,
        recipe_mode: 'mixed',
        require_known_spell: true,
        catalogues: {
          items: 'engine:catalogues/items',
          potions: 'engine:catalogues/potions',
          spells: 'engine:catalogues/spells',
          magic_items: 'engine:catalogues/magic_items',
          recipes: null,
        },
        checks: {
          craft: { mode: 'none', skill: null, ability: null, dc: null, require_success: true },
          brew: { mode: 'none', skill: 'nature', ability: null, dc: null, require_success: true },
          enchant: {
            mode: 'none',
            skill: 'arcana',
            ability: null,
            dc: null,
            require_success: true,
          },
          scribe: { mode: 'none', skill: 'arcana', ability: null, dc: null, require_success: true },
        },
        tool_policy: {
          craft: { mode: 'off', tools: [], require_proficiency: true, require_kit: false },
          brew: {
            mode: 'off',
            tools: ['Herbalism Kit', "Alchemist's Supplies", "Brewer's Supplies"],
            require_proficiency: true,
            require_kit: false,
          },
          enchant: { mode: 'off', tools: [], require_proficiency: true, require_kit: false },
          scribe: {
            mode: 'off',
            tools: ["Calligrapher's Supplies"],
            require_proficiency: true,
            require_kit: false,
          },
        },
        resources: {
          gold: 'manual',
          materials: 'manual',
          items: 'manual',
          downtime: 'manual',
          spell_slot: 'manual',
        },
        item_handling: {
          mode: 'manual',
          default_bag: 'Equipment',
          equipment_bag: 'Equipment',
          crafted_bag: 'Equipment',
          potions_bag: 'Potions',
          scrolls_bag: 'Scrolls',
          magic_items_bag: 'Equipment',
          materials_bag: 'Materials',
        },
      },
      command_config: { craft: {}, brew: {}, enchant: {}, scribe: {} },
    },
    economy: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.economy),
      config: {
        job_location_policy: 'off',
        ask_to_confirm_purchases: true,
        jobs: [],
      },
      command_config: {
        job: {
          cooldown_seconds: 28800,
          workdays_cost: 0,
          payout_bands: [
            { max: 0, roll: '0' },
            { max: 5, roll: '1d4-1' },
            { max: 10, roll: '1d4+1' },
            { max: 15, roll: '1d6+1' },
            { max: 20, roll: '1d8+2' },
            { roll: '1d8+3' },
          ],
        },
      },
    },
    content: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.content),
      config: { library_topic_source: 'manual', allowed_topics: [] },
    },
    misc: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.misc),
    },
  };
}

function mergeSubsystemDefaults(subsystems: Record<string, AnyRecord>): Record<string, AnyRecord> {
  const defaults = createDefaultSubsystems();
  const next: Record<string, AnyRecord> = {};

  for (const key of SUBSYSTEMS) {
    const defaultBlock = asRecord(defaults[key]);
    const existingBlock = asRecord(subsystems[key]);
    next[key] = {
      ...defaultBlock,
      ...existingBlock,
      commands: {
        ...asRecord(defaultBlock.commands),
        ...asRecord(existingBlock.commands),
      },
    };
    if (defaultBlock.config || existingBlock.config) {
      next[key].config = mergeRecordDefaults(
        asRecord(existingBlock.config),
        asRecord(defaultBlock.config),
      );
    }
    if (defaultBlock.command_config || existingBlock.command_config) {
      next[key].command_config = mergeRecordDefaults(
        asRecord(existingBlock.command_config),
        asRecord(defaultBlock.command_config),
      );
    }
  }

  for (const [key, value] of Object.entries(subsystems)) {
    if (!next[key]) next[key] = value;
  }

  return next;
}

function mergeRecordDefaults(owner: AnyRecord, defaults: AnyRecord): AnyRecord {
  const merged: AnyRecord = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const ownerValue = owner[key];
    if (defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
      if (ownerValue == null) {
        merged[key] = mergeRecordDefaults({}, asRecord(defaultValue));
      } else if (ownerValue && typeof ownerValue === 'object' && !Array.isArray(ownerValue)) {
        merged[key] = mergeRecordDefaults(asRecord(ownerValue), asRecord(defaultValue));
      } else {
        merged[key] = ownerValue;
      }
    } else {
      merged[key] = ownerValue ?? defaultValue;
    }
  }
  for (const [key, ownerValue] of Object.entries(owner)) {
    if (!(key in merged)) merged[key] = ownerValue;
  }
  return merged;
}

export function parseConfig(source: string): ParseResult {
  const issues: ConfigIssue[] = [];
  if (!source.trim()) {
    return { model: null, issues, mode: 'empty' };
  }

  const cleaned = stripComments(source);
  const parsedSubsystems = parseRecordAssignment(cleaned, 'subsystems', issues) as Record<
    string,
    AnyRecord
  >;
  const encounterTemplateMeta = parseRecordAssignment(cleaned, 'encounter_template_meta', issues);
  const model: ConfigModel = {
    ...DEFAULT_MODEL,
    config_version: parseStringAssignment(cleaned, 'config_version'),
    rules_version: parseStringAssignment(cleaned, 'rules_version'),
    display: parseRecordAssignment(cleaned, 'display', issues),
    subsystems: mergeSubsystemDefaults(parsedSubsystems),
    policies: parseRecordAssignment(cleaned, 'policies', issues),
    world_data: worldDataForEditor(parseRecordAssignment(cleaned, 'world_data', issues)),
    currencies: parseRecordAssignment(cleaned, 'currencies', issues),
    shops: parseRecordAssignment(cleaned, 'shops', issues),
    books: parseRecordAssignment(cleaned, 'books', issues),
    encounter_templates: parseEncounterTemplateConfig(source, encounterTemplateMeta),
    encounter_template_meta: encounterTemplateMeta,
  };

  if (Object.keys(parsedSubsystems).length === 0) {
    issues.push(
      issue(
        'warning',
        'parse.subsystems.missing',
        'Subsystems',
        'subsystems',
        'No subsystem block parsed',
        'The editor can still export raw source, but guided subsystem controls need a literal `subsystems = { ... }` block.',
      ),
    );
  }

  return {
    model,
    issues,
    mode: issues.some((item) => item.code.startsWith('parse.')) ? 'raw' : 'literal',
  };
}

function jsonToPy(value: unknown): string {
  const json = JSON.stringify(value, null, 4);
  let out = '';
  let quote = false;
  let escaped = false;

  for (let i = 0; i < json.length; i += 1) {
    const ch = json[i];
    if (quote) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') quote = false;
      continue;
    }
    if (ch === '"') {
      quote = true;
      out += ch;
      continue;
    }
    out += ch;
  }

  return out
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False')
    .replace(/\bnull\b/g, 'None');
}

function compactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(compactValue);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as AnyRecord)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, compactValue(entryValue)]),
  );
}

function functionNameFromSource(source: string) {
  return /^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m.exec(source)?.[1];
}

function functionNameFromTemplate(id: string, value: AnyRecord) {
  const sourceName = functionNameFromSource(String(value.source ?? ''));
  const raw = String(sourceName ?? value.function_name ?? id)
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[a-zA-Z_]/.test(raw)) return raw;
  return `template_${raw || 'custom'}`;
}

const CUSTOM_ENCOUNTER_TEMPLATE_HELPERS = `def _arg(args, index, default=None):
    if args == None:
        return default
    try:
        if index < len(args):
            return args[index]
    except:
        pass
    return default`;

function customEncounterTemplateExport(model: ConfigModel) {
  const templates = asRecord(model.encounter_templates);
  const entries = Object.entries(templates)
    .map(([id, value]) => [id, asRecord(value)] as const)
    .filter(([, value]) => String(value.source ?? '').trim());
  if (entries.length === 0) return [] as string[];

  const lines: string[] = [];
  lines.push(CUSTOM_ENCOUNTER_TEMPLATE_HELPERS, '');
  for (const [, value] of entries) {
    const source = String(value.source ?? '').trimEnd();
    lines.push(source, '');
  }

  lines.push('encounter_templates = {');
  for (const [id, value] of entries) {
    lines.push(`    ${JSON.stringify(id)}: ${functionNameFromTemplate(id, value)},`);
  }
  lines.push('}', '');

  const meta = compactValue(model.encounter_template_meta) as AnyRecord;
  if (Object.keys(meta).length > 0) {
    lines.push(`encounter_template_meta = ${jsonToPy(meta)}`, '');
  }

  return lines;
}

export function serializeConfig(model: ConfigModel): string {
  const compactDisplay = compactValue(model.display) as AnyRecord;
  const compactSubsystems = compactValue(model.subsystems) as Record<string, AnyRecord>;
  const compactWorldData = worldDataForRuntime(compactValue(model.world_data) as AnyRecord);
  const compactPolicies = compactValue(model.policies) as AnyRecord;
  const compactCurrencies = compactValue(model.currencies ?? {}) as AnyRecord;
  const compactShops = compactValue(model.shops ?? {}) as AnyRecord;
  const compactBooks = compactValue(model.books ?? {}) as AnyRecord;
  const lines = ['"""Generated by westmarch-generic web config editor."""', ''];

  if (model.config_version) {
    lines.push(`config_version = ${JSON.stringify(model.config_version)}`, '');
  }
  if (model.rules_version) {
    lines.push(`rules_version = ${JSON.stringify(model.rules_version)}`, '');
  }

  lines.push(...customEncounterTemplateExport(model));

  if (Object.keys(compactDisplay).length > 0) {
    lines.push(`display = ${jsonToPy(compactDisplay)}`, '');
  }

  lines.push(`subsystems = ${jsonToPy(compactSubsystems)}`, '');

  if (Object.keys(compactWorldData).length > 0) {
    lines.push(`world_data = ${jsonToPy(compactWorldData)}`, '');
  }

  if (Object.keys(compactCurrencies).length > 0) {
    lines.push(`currencies = ${jsonToPy(compactCurrencies)}`, '');
  }

  if (Object.keys(compactShops).length > 0) {
    lines.push(`shops = ${jsonToPy(compactShops)}`, '');
  }

  if (Object.keys(compactBooks).length > 0) {
    lines.push(`books = ${jsonToPy(compactBooks)}`, '');
  }

  lines.push(`policies = ${jsonToPy(compactPolicies)}`, '');
  return `${lines.join('\n').trimEnd()}\n`;
}

function isPlainRecord(value: unknown): value is AnyRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asRecord(value: unknown): AnyRecord {
  return isPlainRecord(value) ? value : {};
}

function pathListFromSourceValue(value: unknown): unknown[] | undefined {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (!isPlainRecord(value)) return undefined;
  if (Array.isArray(value.paths)) return value.paths;
  const pathsByFrom = asRecord(value.paths_by_from);
  if (Object.keys(pathsByFrom).length > 0) {
    const paths: unknown[] = [];
    for (const origin of Object.keys(pathsByFrom)) {
      const entries = pathsByFrom[origin];
      if (Array.isArray(entries)) paths.push(...entries);
    }
    return paths;
  }
  return undefined;
}

function weatherAreasFromWorldData(worldData: AnyRecord): AnyRecord {
  const weather = asRecord(worldData.weather);
  if (weather.by_area != null) return asRecord(weather.by_area);
  if (weather.areas != null) return asRecord(weather.areas);
  return weather;
}

function normalizedLookupId(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function isValidGvarPointer(value: unknown, validEngineGvars: string[]): boolean {
  const text = String(value ?? '').trim();
  if (GVAR_ID_RE.test(text)) return true;
  return validEngineGvars.includes(text.toLowerCase());
}

function isValidWorldGvarPointer(value: unknown): boolean {
  return isValidGvarPointer(value, VALID_WORLD_ENGINE_GVARS);
}

function isValidBookGvarPointer(value: unknown): boolean {
  return isValidGvarPointer(value, VALID_BOOK_ENGINE_GVARS);
}

function mappedWorldGvarPointer(value: unknown, map: Record<string, string>): unknown {
  if (Array.isArray(value)) return value.map((entry) => mappedWorldGvarPointer(entry, map));
  const text = String(value ?? '')
    .trim()
    .toLowerCase();
  return map[text] ?? value;
}

function transportLabelsFromWorldData(worldData: AnyRecord): Set<string> {
  const labels = new Set<string>();
  const transport = asRecord(worldData.transport);
  for (const [id, rawEntry] of Object.entries(transport)) {
    const entry = asRecord(rawEntry);
    labels.add(normalizedLookupId(id));
    if (typeof entry.name === 'string' && entry.name.trim()) {
      labels.add(normalizedLookupId(entry.name));
    }
    if (Array.isArray(entry.aliases)) {
      for (const alias of entry.aliases) {
        if (typeof alias === 'string' && alias.trim()) {
          labels.add(normalizedLookupId(alias));
        }
      }
    }
  }
  labels.delete('');
  return labels;
}

function worldDataForEditor(worldData: AnyRecord): AnyRecord {
  const next = { ...worldData };
  for (const key of ['locations_gvar_id', 'paths_gvar_id', 'book_gvar_ids', 'book_gvars']) {
    next[key] = mappedWorldGvarPointer(next[key], WORLD_GVAR_UUID_TO_ENGINE);
  }
  return next;
}

function worldDataForRuntime(worldData: AnyRecord): AnyRecord {
  const next = { ...worldData };
  for (const key of ['locations_gvar_id', 'paths_gvar_id', 'book_gvar_ids', 'book_gvars']) {
    next[key] = mappedWorldGvarPointer(next[key], WORLD_ENGINE_TO_RUNTIME_UUID);
  }
  return next;
}

function normalizedStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizedLookupId(item)).filter(Boolean);
}

function locationAllowedBiomes(location: AnyRecord, command: string): string[] {
  const commands = asRecord(location.commands);
  const activities = asRecord(location.activities);
  const encs = asRecord(location.encs);
  const raw = commands[command] ?? activities[command] ?? encs[command];
  const listed = normalizedStringList(raw);
  if (listed.length > 0) return listed;
  if (command === 'enc') {
    const biome = normalizedLookupId(location.biome);
    if (biome) return [biome];
  }
  return [];
}

function isHexColour(value: unknown): boolean {
  if (value == null || value === '') return true;
  const text = String(value).replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(text);
}

function isNonNegativeInteger(value: unknown): boolean {
  return Number.isInteger(value) && Number(value) >= 0;
}

function footerTextCount(value: unknown): number {
  if (typeof value === 'string') return value.trim() ? 1 : 0;
  if (!Array.isArray(value)) return 0;
  return value.filter((item) => typeof item === 'string' && item.trim()).length;
}

function validateFooterValue(
  value: unknown,
  section: string,
  path: string,
  label: string,
  issues: ConfigIssue[],
) {
  if (value == null || value === '') return;
  if (typeof value === 'string') return;
  if (Array.isArray(value)) {
    const hasInvalidItem = value.some((item) => typeof item !== 'string' || item.trim() === '');
    if (hasInvalidItem) {
      issues.push(
        issue(
          'warning',
          'display.footer.list',
          section,
          path,
          `${label} footer list has empty entries`,
          'Footer lists should contain non-empty text strings.',
          'Remove blank footer rows before exporting or publishing.',
        ),
      );
    }
    return;
  }

  issues.push(
    issue(
      'warning',
      'display.footer.type',
      section,
      path,
      `${label} footer has an unsupported shape`,
      'Footer must be a text string or a list of text strings.',
      'Use the guided footer text list or switch to Raw mode to correct the value.',
    ),
  );
}

function validateDisplayLayer(
  value: AnyRecord,
  section: string,
  path: string,
  label: string,
  issues: ConfigIssue[],
) {
  if (!isHexColour(value.colour)) {
    issues.push(
      issue(
        'error',
        'display.colour',
        section,
        `${path}.colour`,
        `Invalid ${label} colour`,
        'Embed colours must be six hex digits, with or without `#`.',
        'Use a value such as #5865F2 or leave the colour unset.',
      ),
    );
  }
  validateFooterValue(value.footer, section, `${path}.footer`, label, issues);
}

function hasAnyFooterText(model: ConfigModel): boolean {
  if (footerTextCount(model.display.footer) > 0) return true;

  for (const block of Object.values(model.subsystems)) {
    const subsystem = asRecord(block);
    if (footerTextCount(asRecord(subsystem.display).footer) > 0) return true;

    const commandDisplay = asRecord(subsystem.command_display);
    for (const display of Object.values(commandDisplay)) {
      if (footerTextCount(asRecord(display).footer) > 0) return true;
    }
  }

  return false;
}

export function validateConfig(model: ConfigModel | null, parseIssues: ConfigIssue[]) {
  const issues: ConfigIssue[] = [...parseIssues];

  if (!model) {
    issues.push(
      issue(
        'info',
        'source.empty',
        'Setup',
        'source',
        'No config loaded',
        'Paste a gvar body or load one from Avrae to run checks.',
      ),
    );
    return issues;
  }

  if (model.rules_version && !VALID_RULES_VERSION.includes(model.rules_version)) {
    issues.push(
      issue(
        'warning',
        'rules.version',
        'Display',
        'rules_version',
        'Unknown rules version',
        '`rules_version` should be `2014` or `2024` when set.',
        'Choose 2014, 2024, or omit it to infer from !servsettings.',
      ),
    );
  }

  validateDisplayLayer(model.display, 'Display', 'display', 'Base display', issues);

  const footerBehaviour = asRecord(model.policies.display).footer_behaviour;
  if (typeof footerBehaviour === 'string' && !VALID_FOOTER.includes(footerBehaviour)) {
    issues.push(
      issue(
        'warning',
        'policies.display.footer_behaviour',
        'Policies',
        'policies.display.footer_behaviour',
        'Unknown footer behavior',
        '`footer_behaviour` should be helpful_tips, string, help, credits, or balanced.',
      ),
    );
  }
  const commandThumbnail = asRecord(model.policies.display).command_thumbnail;
  if (commandThumbnail != null && typeof commandThumbnail !== 'string') {
    issues.push(
      issue(
        'error',
        'policies.display.command_thumbnail_type',
        'Policies',
        'policies.display.command_thumbnail',
        'Command thumbnail mode must be text',
        'Use default or character.',
      ),
    );
  }
  if (
    typeof commandThumbnail === 'string' &&
    !VALID_COMMAND_THUMBNAIL.includes(commandThumbnail.trim().toLowerCase())
  ) {
    issues.push(
      issue(
        'warning',
        'policies.display.command_thumbnail',
        'Policies',
        'policies.display.command_thumbnail',
        'Unknown command thumbnail mode',
        '`command_thumbnail` should be default or character.',
      ),
    );
  }
  const errorEmbeds = asRecord(model.policies.display).error_embeds;
  if (errorEmbeds != null && typeof errorEmbeds !== 'boolean' && !isPlainRecord(errorEmbeds)) {
    issues.push(
      issue(
        'error',
        'policies.display.error_embeds_type',
        'Policies',
        'policies.display.error_embeds',
        'Error embed policy must be an object',
        'Use {"auto_delete": true, "timeout_seconds": 60}, or set auto_delete false to keep error messages.',
      ),
    );
  }
  if (isPlainRecord(errorEmbeds)) {
    const autoDelete = errorEmbeds.auto_delete;
    if (autoDelete != null && typeof autoDelete !== 'boolean') {
      issues.push(
        issue(
          'error',
          'policies.display.error_auto_delete_type',
          'Policies',
          'policies.display.error_embeds.auto_delete',
          'Error auto-delete must be true or false',
          '`auto_delete` controls whether command error embeds delete themselves.',
        ),
      );
    }
    const timeoutSeconds = errorEmbeds.timeout_seconds;
    if (
      timeoutSeconds != null &&
      (!isNonNegativeInteger(timeoutSeconds) || Number(timeoutSeconds) < 1)
    ) {
      issues.push(
        issue(
          'error',
          'policies.display.error_timeout_seconds',
          'Policies',
          'policies.display.error_embeds.timeout_seconds',
          'Error timeout must be positive seconds',
          'Use a positive whole number, such as 5, 60, or 120.',
        ),
      );
    }
  }
  if (footerBehaviour === 'string' && !hasAnyFooterText(model)) {
    issues.push(
      issue(
        'warning',
        'policies.display.footer_missing',
        'Display',
        'display.footer',
        'String footer needs footer text',
        '`footer_behaviour: string` expects `display.footer` to be configured.',
        'Add footer text or switch footer behavior to balanced.',
      ),
    );
  }

  const subsystemKeys = Object.keys(model.subsystems);
  if (subsystemKeys.length === 0) {
    issues.push(
      issue(
        'error',
        'subsystems.missing',
        'Subsystems',
        'subsystems',
        'Subsystems are missing',
        'A config should define `subsystems` so commands know what is enabled.',
      ),
    );
  }

  for (const key of subsystemKeys) {
    if (!SUBSYSTEMS.includes(key)) {
      issues.push(
        issue(
          'warning',
          'subsystems.unknown',
          'Subsystems',
          `subsystems.${key}`,
          `Unknown subsystem ${key}`,
          'Unknown subsystem keys are ignored by the current engine.',
          'Remove it or document the custom extension.',
        ),
      );
    }

    const block = asRecord(model.subsystems[key]);
    const commands = asRecord(block.commands);
    validateDisplayLayer(
      asRecord(block.display),
      'Subsystems',
      `subsystems.${key}.display`,
      `${key} display`,
      issues,
    );
    const commandDisplay = asRecord(block.command_display);
    for (const [command, display] of Object.entries(commandDisplay)) {
      if (!(command in commands)) {
        issues.push(
          issue(
            'warning',
            'subsystems.command_display_unknown',
            'Subsystems',
            `subsystems.${key}.command_display.${command}`,
            `${key} has an unknown command display override`,
            'command_display keys should match commands in the same subsystem.',
            'Rename the override or add the matching command key.',
          ),
        );
      }
      validateDisplayLayer(
        asRecord(display),
        'Subsystems',
        `subsystems.${key}.command_display.${command}`,
        `${key}.${command} display`,
        issues,
      );
    }
    const enabledCommands = Object.entries(commands).filter(([, on]) => on === true);
    if (block.enabled === true && enabledCommands.length === 0) {
      issues.push(
        issue(
          'warning',
          'subsystems.enabled_no_commands',
          'Subsystems',
          `subsystems.${key}.commands`,
          `${key} has no enabled commands`,
          'The subsystem is on, but every command toggle is off.',
          'Enable at least one command or turn the subsystem off.',
        ),
      );
    }
    if (block.enabled !== true && enabledCommands.length > 0) {
      issues.push(
        issue(
          'warning',
          'subsystems.commands_without_parent',
          'Subsystems',
          `subsystems.${key}.enabled`,
          `${key} commands are on while subsystem is off`,
          'Commands only make sense when their parent subsystem is enabled.',
          'Turn the subsystem on or disable the commands.',
        ),
      );
    }
  }

  validateExploration(model, issues);
  validatePlayerSetup(model, issues);
  validateUnsupportedCommandOptions(model, issues);
  validateDeferredPolicies(model, issues);
  validateWorld(model, issues);
  validateTravel(model, issues);
  validateDowntime(model, issues);
  validateCrafting(model, issues);
  validateEconomy(model, issues);
  validateContent(model, issues);

  return issues;
}

function commandEnabled(model: ConfigModel, subsystemKey: string, command: string): boolean {
  const subsystem = asRecord(model.subsystems[subsystemKey]);
  const commands = asRecord(subsystem.commands);
  return commands[command] === true;
}

function configuredShops(model: ConfigModel): AnyRecord {
  const topLevel = asRecord(model.shops);
  if (Object.keys(topLevel).length > 0) return topLevel;
  return asRecord(model.world_data.shops);
}

function validateUnsupportedCommandOptions(model: ConfigModel, issues: ConfigIssue[]) {
  for (const [subsystem, commands] of Object.entries(DEFAULT_SUBSYSTEM_COMMANDS)) {
    const block = asRecord(model.subsystems[subsystem]);
    const commandConfig = asRecord(block.command_config);
    for (const [command, value] of Object.entries(commandConfig)) {
      if (!commands.includes(command)) continue;
      const cooldown = asRecord(value).cooldown_seconds;
      if (cooldown == null || commandSupportsCooldown(subsystem, command)) continue;
      issues.push(
        issue(
          'warning',
          'command.cooldown_unsupported',
          'Subsystems',
          `subsystems.${subsystem}.command_config.${command}.cooldown_seconds`,
          'Cooldown is not implemented for this command',
          `The current runtime only checks cooldowns for exploration commands, job, library, and read.`,
          'Remove this cooldown or leave a note outside the active config.',
        ),
      );
    }
  }
}

function validateDeferredPolicies(model: ConfigModel, issues: ConfigIssue[]) {
  const policies = asRecord(model.policies);
  const travel = asRecord(policies.travel);
  for (const key of ['apply_path_costs', 'consume_rations']) {
    if (travel[key] === true) {
      issues.push(
        issue(
          'warning',
          `travel.${key}_deferred`,
          'Policies',
          `policies.travel.${key}`,
          'Travel resource enforcement is deferred',
          `${key} is reserved, but the current travel runtime does not deduct path costs or rations.`,
          'Keep this False until the travel resource enforcement slice lands.',
        ),
      );
    }
  }
  if (travel.consume_rations === true) {
    const rationsItem = travel.rations_item;
    if (typeof rationsItem !== 'string' || rationsItem.trim() === '') {
      issues.push(
        issue(
          'warning',
          'travel.rations_item_missing',
          'Policies',
          'policies.travel.rations_item',
          'Ration item name is missing',
          'Ration consumption will need a non-empty item name once enforcement is implemented.',
          'Set a ration item name, or disable consume_rations.',
        ),
      );
    }
  }

  const inventory = asRecord(policies.inventory);
  for (const key of ['enforce_encumbrance', 'enforce_attunement', 'enforce_magic_item_limit']) {
    if (inventory[key] === true) {
      issues.push(
        issue(
          'warning',
          `inventory.${key}_deferred`,
          'Policies',
          `policies.inventory.${key}`,
          'Inventory enforcement is deferred',
          `${key} is reserved, but current runtime does not enforce this limit.`,
          'Keep this False until inventory enforcement lands.',
        ),
      );
    }
  }

  const combat = asRecord(policies.combat);
  if (combat.scale_encounters_to_level === true) {
    issues.push(
      issue(
        'warning',
        'combat.scaling_deferred',
        'Policies',
        'policies.combat.scale_encounters_to_level',
        'Combat scaling is deferred',
        'Encounter CR scaling is a reserved policy; current encounter pools use configured entries as-is.',
        'Keep this False until combat scaling is implemented.',
      ),
    );
  }

  const quest = asRecord(policies.quest);
  if (quest.self_assign === true) {
    const misc = asRecord(model.subsystems.misc);
    const commands = asRecord(misc.commands);
    if (misc.enabled !== true || commands.quest !== true) {
      issues.push(
        issue(
          'error',
          'quest.self_assign_requires_command',
          'Policies',
          'policies.quest.self_assign',
          'Quest self-assign needs the quest command',
          'Auto-assigning quest encounter outcomes depends on the quest command surface being enabled.',
          'Enable misc.quest, or set self_assign to False.',
        ),
      );
    }
  }

  const economy = asRecord(policies.economy);
  const startingGold = economy.starting_gold;
  if (startingGold != null && (!isNonNegativeInteger(startingGold) || Number(startingGold) < 0)) {
    issues.push(
      issue(
        'error',
        'economy.starting_gold',
        'Policies',
        'policies.economy.starting_gold',
        'Starting gold must be non-negative',
        'Use a whole number of gp, or None to disable the one-time grant.',
      ),
    );
  }
  if (economy.enforce_wallet_caps === true) {
    const currencies = asRecord(model.currencies);
    for (const [currencyId, value] of Object.entries(currencies)) {
      const currency = asRecord(value);
      const maxBalance = currency.max_balance;
      if (maxBalance == null) {
        issues.push(
          issue(
            'warning',
            'economy.wallet_cap_missing',
            'Policies',
            `currencies.${currencyId}.max_balance`,
            'Wallet cap is missing',
            'Wallet cap enforcement skips currencies that do not define max_balance.',
            'Add max_balance for this currency, or disable enforce_wallet_caps.',
          ),
        );
      } else if (!isNonNegativeInteger(maxBalance)) {
        issues.push(
          issue(
            'error',
            'economy.wallet_cap_invalid',
            'Policies',
            `currencies.${currencyId}.max_balance`,
            'Wallet cap must be non-negative',
            'Use a non-negative whole number.',
          ),
        );
      }
    }
  }
}

function validatePlayerSetup(model: ConfigModel, issues: ConfigIssue[]) {
  const rawPlayerSetup = asRecord(model.policies).player_setup;
  if (rawPlayerSetup == null) return;
  if (!isPlainRecord(rawPlayerSetup)) {
    issues.push(
      issue(
        'error',
        'player_setup.object',
        'Policies',
        'policies.player_setup',
        'Player setup must be an object',
        'Use enabled, require_character, and checks fields.',
      ),
    );
    return;
  }

  const playerSetup = asRecord(rawPlayerSetup);
  if (playerSetup.enabled != null && typeof playerSetup.enabled !== 'boolean') {
    issues.push(
      issue(
        'error',
        'player_setup.enabled',
        'Policies',
        'policies.player_setup.enabled',
        'Player setup enabled must be boolean',
        'Use True or False.',
      ),
    );
  }
  if (playerSetup.require_character != null && typeof playerSetup.require_character !== 'boolean') {
    issues.push(
      issue(
        'error',
        'player_setup.require_character',
        'Policies',
        'policies.player_setup.require_character',
        'Player setup character requirement must be boolean',
        'Use True or False.',
      ),
    );
  }

  validatePlayerSetupHud(playerSetup, issues);

  if (playerSetup.checks == null) return;
  if (!Array.isArray(playerSetup.checks)) {
    issues.push(
      issue(
        'error',
        'player_setup.checks_list',
        'Policies',
        'policies.player_setup.checks',
        'Player setup checks must be a list',
        'Each check should be an object with type, key, label, and message.',
      ),
    );
    return;
  }

  playerSetup.checks.forEach((entry, index) => {
    const path = `policies.player_setup.checks.${index}`;
    if (!isPlainRecord(entry)) {
      issues.push(
        issue(
          'error',
          'player_setup.check_object',
          'Policies',
          path,
          'Player setup check must be an object',
          'Use a dict such as {"type": "cvar", "key": "wg_downtime", "label": "Downtime"}.',
        ),
      );
      return;
    }

    const check = asRecord(entry);
    const type = String(check.type ?? 'cvar')
      .trim()
      .toLowerCase();
    if (!VALID_PLAYER_SETUP_CHECK_TYPES.includes(type)) {
      issues.push(
        issue(
          'error',
          'player_setup.check_type',
          'Policies',
          `${path}.type`,
          'Unknown player setup check type',
          'Supported types are cvar, uvar, svar, and custom counter.',
        ),
      );
    }
    if (typeof check.key !== 'string' || check.key.trim() === '') {
      issues.push(
        issue(
          'error',
          'player_setup.check_key',
          'Policies',
          `${path}.key`,
          'Player setup check needs a key',
          'The key is the cvar, uvar, svar, or custom counter name to inspect.',
        ),
      );
    }
    if (check.one_of != null && !Array.isArray(check.one_of)) {
      issues.push(
        issue(
          'error',
          'player_setup.one_of',
          'Policies',
          `${path}.one_of`,
          'Player setup one_of must be a list',
          'Use a list of accepted text values, or omit one_of to only require a non-empty value.',
        ),
      );
    }
    if (check.when_subsystem != null && !SUBSYSTEMS.includes(String(check.when_subsystem))) {
      issues.push(
        issue(
          'warning',
          'player_setup.when_subsystem',
          'Policies',
          `${path}.when_subsystem`,
          'Player setup check references an unknown subsystem',
          'Use a known subsystem key or remove the gate.',
        ),
      );
    }
    if (check.when_command != null) {
      const commandGate = String(check.when_command);
      const [subsystem, command] = commandGate.split('.');
      const validCommands = DEFAULT_SUBSYSTEM_COMMANDS[subsystem] ?? [];
      if (!subsystem || !command || !validCommands.includes(command)) {
        issues.push(
          issue(
            'warning',
            'player_setup.when_command',
            'Policies',
            `${path}.when_command`,
            'Player setup check references an unknown command',
            'Use a gate such as exploration.loot or remove the gate.',
          ),
        );
      }
    }
    if (
      ['cvar', 'cc', 'counter', 'custom_counter'].includes(type) &&
      playerSetup.require_character === false
    ) {
      issues.push(
        issue(
          'warning',
          'player_setup.character_scope',
          'Policies',
          'policies.player_setup.require_character',
          'Character-scoped setup checks need a selected character',
          'Keep require_character enabled when checking cvars or custom counters.',
        ),
      );
    }
  });
}

function validatePlayerSetupHud(playerSetup: AnyRecord, issues: ConfigIssue[]) {
  const hud = playerSetup.hud;
  if (hud == null || typeof hud === 'boolean') return;

  let fields: unknown;
  if (Array.isArray(hud)) {
    fields = hud;
  } else if (isPlainRecord(hud)) {
    const hudRecord = asRecord(hud);
    if (hudRecord.enabled != null && typeof hudRecord.enabled !== 'boolean') {
      issues.push(
        issue(
          'error',
          'player_setup.hud_enabled',
          'Policies',
          'policies.player_setup.hud.enabled',
          'HUD enabled must be boolean',
          'Use True or False.',
        ),
      );
    }
    fields = hudRecord.fields;
  } else {
    issues.push(
      issue(
        'error',
        'player_setup.hud_object',
        'Policies',
        'policies.player_setup.hud',
        'Player setup HUD must be an object or list',
        'Use {"enabled": True, "fields": ["coinpurse", "location"]}.',
      ),
    );
    return;
  }

  if (fields == null) return;
  if (!Array.isArray(fields)) {
    issues.push(
      issue(
        'error',
        'player_setup.hud_fields_list',
        'Policies',
        'policies.player_setup.hud.fields',
        'HUD fields must be a list',
        'Use built-in field names or cvar field objects.',
      ),
    );
    return;
  }

  fields.forEach((entry, index) => {
    const path = `policies.player_setup.hud.fields.${index}`;
    if (typeof entry === 'string') {
      const key = entry.trim().toLowerCase();
      if (!VALID_PLAYER_SETUP_HUD_FIELDS.includes(key)) {
        issues.push(
          issue(
            'warning',
            'player_setup.hud_field',
            'Policies',
            path,
            'Unknown HUD field',
            'Built-in HUD fields are coinpurse, wallet, location, time, and weather.',
          ),
        );
      }
      return;
    }
    if (!isPlainRecord(entry)) {
      issues.push(
        issue(
          'error',
          'player_setup.hud_field_object',
          'Policies',
          path,
          'HUD field must be text or an object',
          'Use "coinpurse" or {"type": "cvar", "key": "renown", "label": "Renown"}.',
        ),
      );
      return;
    }
    const field = asRecord(entry);
    const type = String(field.type ?? 'cvar')
      .trim()
      .toLowerCase();
    if (
      !['builtin', 'field', ...VALID_PLAYER_SETUP_CHECK_TYPES].includes(type) &&
      !VALID_PLAYER_SETUP_HUD_FIELDS.includes(type)
    ) {
      issues.push(
        issue(
          'warning',
          'player_setup.hud_field_type',
          'Policies',
          `${path}.type`,
          'Unknown HUD field type',
          'Use builtin, cvar, uvar, svar, custom counter, or a built-in HUD field name.',
        ),
      );
    }
    if (typeof field.key !== 'string' || field.key.trim() === '') {
      issues.push(
        issue(
          'error',
          'player_setup.hud_field_key',
          'Policies',
          `${path}.key`,
          'HUD field object needs a key',
          'For built-ins use a key such as location; for cvars use the cvar name.',
        ),
      );
    }
  });
}

function validateWorld(model: ConfigModel, issues: ConfigIssue[]) {
  const biomes = asRecord(model.world_data.biomes);
  const calendars = asRecord(model.world_data.calendars);
  const weatherAreas = weatherAreasFromWorldData(model.world_data);

  for (const [key, label] of [
    ['locations_gvar_id', 'Locations'],
    ['paths_gvar_id', 'Paths'],
  ] as const) {
    const value = model.world_data[key];
    if (value == null || String(value).trim() === '') continue;
    if (!isValidWorldGvarPointer(value)) {
      issues.push(
        issue(
          'error',
          `world.${key}.invalid`,
          'World',
          `world_data.${key}`,
          `${label} gvar id is invalid`,
          `${label} gvar ids must be Avrae workshop UUIDs or a supported engine preset slug.`,
          'Paste a UUID from the Avrae gvar dashboard, or use a supported engine preset.',
        ),
      );
    }
  }

  for (const key of ['book_gvar_ids', 'book_gvars'] as const) {
    const value = model.world_data[key];
    if (value == null || String(value).trim() === '') continue;
    if (!Array.isArray(value)) {
      issues.push(
        issue(
          'error',
          `world.${key}.shape`,
          'World',
          `world_data.${key}`,
          'Book gvars must be a list',
          '`book_gvar_ids` and `book_gvars` should be lists of Avrae workshop UUIDs or supported engine preset slugs.',
          'Use a list such as ["engine:configs/books/forgotten_realms_a"].',
        ),
      );
      continue;
    }
    value.forEach((entry, index) => {
      if (entry == null || String(entry).trim() === '') return;
      if (!isValidBookGvarPointer(entry)) {
        issues.push(
          issue(
            'error',
            `world.${key}.invalid`,
            'World',
            `world_data.${key}.${index}`,
            'Book gvar id is invalid',
            'Book gvar ids must be Avrae workshop UUIDs or supported engine preset slugs.',
            'Paste a UUID from the Avrae gvar dashboard, or use a supported engine preset.',
          ),
        );
      }
    });
  }

  for (const [code, value] of Object.entries(biomes)) {
    const biome = asRecord(value);
    const gvarId = biome.gvar_id;
    if (gvarId == null || String(gvarId).trim() === '') {
      issues.push(
        issue(
          'error',
          'world.biome.gvar_missing',
          'Biomes',
          `world_data.biomes.${code}.gvar_id`,
          `${code} has no biome gvar`,
          'A biome registry entry needs an engine preset slug or a custom Avrae gvar UUID before publish.',
          'Use a preset, paste a UUID, or export and generate the biome gvar manually.',
        ),
      );
      continue;
    }

    const text = String(gvarId);
    const enginePrefix = 'engine:configs/biomes/';
    if (text.startsWith(enginePrefix)) {
      const preset = text.slice(enginePrefix.length);
      if (!VALID_ENGINE_BIOMES.includes(preset)) {
        issues.push(
          issue(
            'error',
            'world.biome.engine_unknown',
            'Biomes',
            `world_data.biomes.${code}.gvar_id`,
            `${code} uses an unknown engine biome`,
            'Engine biome slugs must match a shipped preset.',
            'Choose one of the preset values from the Biomes page.',
          ),
        );
      }
      continue;
    }

    if (!GVAR_ID_RE.test(text)) {
      issues.push(
        issue(
          'error',
          'world.biome.gvar_invalid',
          'Biomes',
          `world_data.biomes.${code}.gvar_id`,
          `${code} has an invalid custom gvar id`,
          'Custom biome gvar ids must be Avrae workshop UUIDs.',
          'Paste a UUID, or use an engine preset slug.',
        ),
      );
    }
  }

  const locations = asRecord(model.world_data.locations);
  const explorationConfig = asRecord(asRecord(model.subsystems.exploration).config);
  const huntPolicy = String(explorationConfig.hunt_location_policy ?? 'off');
  for (const [id, value] of Object.entries(locations)) {
    const location = asRecord(value);
    const huntables =
      location.huntable_monsters ??
      location.huntable_creatures ??
      location.available_monsters ??
      location.available_creatures;
    if (huntables != null && !Array.isArray(huntables)) {
      issues.push(
        issue(
          'error',
          'world.location.huntables_list',
          'World',
          `world_data.locations.${id}.huntable_monsters`,
          `${id} huntable monsters must be a list`,
          'Use a list of monster names or objects with a name, monster, or creature field.',
        ),
      );
    }
    if (Array.isArray(huntables)) {
      huntables.forEach((entry, index) => {
        if (typeof entry === 'string') return;
        const record = asRecord(entry);
        if (
          typeof record.name === 'string' ||
          typeof record.monster === 'string' ||
          typeof record.creature === 'string'
        ) {
          return;
        }
        issues.push(
          issue(
            'error',
            'world.location.huntable_entry',
            'World',
            `world_data.locations.${id}.huntable_monsters.${index}`,
            `${id} has an invalid huntable monster entry`,
            'Each entry must be a monster name or an object with name, monster, or creature.',
          ),
        );
      });
    }
    const huntRaw =
      asRecord(location.commands).hunt ??
      asRecord(location.activities).hunt ??
      asRecord(location.encs).hunt;
    const huntAvailable = huntRaw === true || locationAllowedBiomes(location, 'hunt').length > 0;
    if (huntPolicy === 'monsters' && huntAvailable && huntables == null) {
      issues.push(
        issue(
          'warning',
          'world.location.huntables_missing',
          'World',
          `world_data.locations.${id}.huntable_monsters`,
          `${id} has hunt enabled but no huntable monsters`,
          '`hunt_location_policy: monsters` checks this list before allowing !hunt.',
          'Add huntable_monsters or switch the policy to location/off.',
        ),
      );
    }
    const calendarId = location.calendar_id;
    if (
      typeof calendarId === 'string' &&
      calendarId.trim() !== '' &&
      Object.keys(calendars).length > 0 &&
      !calendars[calendarId.trim()]
    ) {
      issues.push(
        issue(
          'error',
          'world.location.calendar_unknown',
          'World',
          `world_data.locations.${id}.calendar_id`,
          `${id} uses an unknown calendar`,
          '`calendar_id` must match a key in `world_data.calendars`.',
          'Choose a configured calendar on the World page, or clear this field.',
        ),
      );
    }

    const weatherArea = location.weather_area ?? location.area_code;
    if (
      typeof weatherArea === 'string' &&
      weatherArea.trim() !== '' &&
      Object.keys(weatherAreas).length > 0 &&
      !weatherAreas[weatherArea.trim()]
    ) {
      issues.push(
        issue(
          'error',
          'world.location.weather_area_unknown',
          'World',
          `world_data.locations.${id}.weather_area`,
          `${id} uses an unknown weather area`,
          '`weather_area` must match a key in `world_data.weather.by_area`.',
          'Choose a configured weather area on the World page, or clear this field.',
        ),
      );
    }

    const encountersGvarId = location.encounters_gvar_id;
    if (encountersGvarId == null || String(encountersGvarId).trim() === '') continue;

    if (!GVAR_ID_RE.test(String(encountersGvarId).trim())) {
      issues.push(
        issue(
          'error',
          'world.location.encounters_gvar_invalid',
          'World',
          `world_data.locations.${id}.encounters_gvar_id`,
          `${id} has an invalid encounter gvar id`,
          'Location encounter gvar ids must be Avrae workshop UUIDs.',
          'Paste a UUID from the Avrae gvar dashboard.',
        ),
      );
    }
  }
}

function validateExploration(model: ConfigModel, issues: ConfigIssue[]) {
  const exploration = asRecord(model.subsystems.exploration);
  if (Object.keys(exploration).length === 0) return;

  const config = asRecord(exploration.config);
  const source = config.enc_biome_source;
  if (typeof source === 'string' && !VALID_ENC_BIOME.includes(source)) {
    issues.push(
      issue(
        'error',
        'exploration.enc_biome_source',
        'Subsystems',
        'subsystems.exploration.config.enc_biome_source',
        'Invalid biome source',
        '`enc_biome_source` must be auto, argument, or location.',
      ),
    );
  }

  if (source === 'location') {
    const travel = asRecord(model.subsystems.travel);
    if (travel.enabled !== true) {
      issues.push(
        issue(
          'error',
          'exploration.location_requires_travel',
          'World',
          'subsystems.travel.enabled',
          'Location biome source needs travel',
          '`enc_biome_source: location` relies on the travel subsystem and world_data.locations.',
        ),
      );
    }
  }

  const huntLocationPolicy = config.hunt_location_policy;
  if (
    typeof huntLocationPolicy === 'string' &&
    !VALID_HUNT_LOCATION_POLICY.includes(huntLocationPolicy)
  ) {
    issues.push(
      issue(
        'error',
        'exploration.hunt_location_policy',
        'Subsystems',
        'subsystems.exploration.config.hunt_location_policy',
        'Invalid hunt location policy',
        '`hunt_location_policy` must be off, location, or monsters.',
      ),
    );
  }

  const distribution = asRecord(config.distribution);
  const total = ['combat', 'quest', 'gather'].reduce((sum, key) => {
    const value = distribution[key];
    if (value == null) return sum;
    if (!isNonNegativeInteger(value)) {
      issues.push(
        issue(
          'error',
          'exploration.distribution_value',
          'Subsystems',
          `subsystems.exploration.config.distribution.${key}`,
          'Distribution values must be non-negative integers',
          `${key} is not a non-negative integer.`,
        ),
      );
      return sum;
    }
    return sum + Number(value);
  }, 0);

  if (Object.keys(distribution).length > 0 && total !== 100) {
    issues.push(
      issue(
        'error',
        'exploration.distribution_total',
        'Subsystems',
        'subsystems.exploration.config.distribution',
        'Exploration distribution must total 100',
        `The current total is ${total}.`,
        'Adjust combat, quest, and gather percentages.',
      ),
    );
  }

  if (config.monster_images != null && !isPlainRecord(config.monster_images)) {
    issues.push(
      issue(
        'error',
        'exploration.monster_images_object',
        'Subsystems',
        'subsystems.exploration.config.monster_images',
        'Monster image config must be an object',
        'Use keys for hunt and loot.',
      ),
    );
  }
  const monsterImages = asRecord(config.monster_images);
  for (const [command, value] of Object.entries(monsterImages)) {
    if (!['hunt', 'loot'].includes(command)) {
      issues.push(
        issue(
          'warning',
          'exploration.monster_images_unknown',
          'Subsystems',
          `subsystems.exploration.config.monster_images.${command}`,
          'Unknown monster image command',
          'Only hunt and loot use monster image config.',
        ),
      );
      continue;
    }
    const mode = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!VALID_MONSTER_IMAGE_MODES.includes(mode)) {
      issues.push(
        issue(
          'error',
          'exploration.monster_images_mode',
          'Subsystems',
          `subsystems.exploration.config.monster_images.${command}`,
          'Invalid monster image mode',
          'Use thumbnail, image, or off.',
        ),
      );
    }
  }

  if (config.show_check_dcs != null && !isPlainRecord(config.show_check_dcs)) {
    issues.push(
      issue(
        'error',
        'exploration.show_check_dcs_object',
        'Subsystems',
        'subsystems.exploration.config.show_check_dcs',
        'DC visibility config must be an object',
        'Use boolean keys for hunt and loot.',
      ),
    );
  }
  const showCheckDcs = asRecord(config.show_check_dcs);
  for (const [command, value] of Object.entries(showCheckDcs)) {
    if (!['hunt', 'loot'].includes(command)) {
      issues.push(
        issue(
          'warning',
          'exploration.show_check_dcs_unknown',
          'Subsystems',
          `subsystems.exploration.config.show_check_dcs.${command}`,
          'Unknown DC visibility command',
          'Only hunt and loot use check DC visibility config.',
        ),
      );
      continue;
    }
    if (typeof value !== 'boolean') {
      issues.push(
        issue(
          'error',
          'exploration.show_check_dcs_bool',
          'Subsystems',
          `subsystems.exploration.config.show_check_dcs.${command}`,
          'DC visibility must be boolean',
          'Use True or False.',
        ),
      );
    }
  }

  const commandConfig = asRecord(exploration.command_config);
  for (const [command, value] of Object.entries(commandConfig)) {
    if (!EXPLORATION_COMMANDS.includes(command)) {
      issues.push(
        issue(
          'warning',
          'exploration.command_config_unknown',
          'Subsystems',
          `subsystems.exploration.command_config.${command}`,
          'Unknown exploration command config',
          'This command config key does not match an exploration command.',
        ),
      );
      continue;
    }
    const cooldown = asRecord(value).cooldown_seconds;
    if (cooldown != null && !isNonNegativeInteger(cooldown)) {
      issues.push(
        issue(
          'error',
          'exploration.cooldown',
          'Subsystems',
          `subsystems.exploration.command_config.${command}.cooldown_seconds`,
          'Cooldown must be non-negative',
          'Cooldown seconds must be a non-negative integer.',
        ),
      );
    }
  }

  const repeat = config.avoid_repeat_encounters;
  if (typeof repeat === 'string' && !VALID_REPEAT.includes(repeat)) {
    issues.push(
      issue(
        'error',
        'exploration.repeat',
        'Subsystems',
        'subsystems.exploration.config.avoid_repeat_encounters',
        'Invalid repeat encounter policy',
        '`avoid_repeat_encounters` must be off, same_biome, or global.',
      ),
    );
  }

  if (exploration.enabled === true && Object.keys(asRecord(model.world_data.biomes)).length === 0) {
    issues.push(
      issue(
        'warning',
        'world.biomes.empty',
        'Biomes',
        'world_data.biomes',
        'No biome registry configured',
        'Exploration can run with manual fallbacks, but biome-aware commands need `world_data.biomes`.',
      ),
    );
  }
}

function validateTravel(model: ConfigModel, issues: ConfigIssue[]) {
  const travel = asRecord(model.subsystems.travel);
  const commands = asRecord(travel.commands);
  const travelConfig = asRecord(travel.config);
  const locationBiomeOverride = travelConfig.location_biome_override;
  if (locationBiomeOverride != null && typeof locationBiomeOverride !== 'boolean') {
    issues.push(
      issue(
        'error',
        'travel.location_biome_override',
        'Subsystems',
        'subsystems.travel.config.location_biome_override',
        'Location biome override must be true or false',
        '`location_biome_override` controls whether exact biome args override location inference.',
      ),
    );
  }
  const pathBiomePolicy = String(travelConfig.path_biome_policy ?? 'from_location')
    .trim()
    .toLowerCase();
  if (!VALID_PATH_BIOME_POLICY.includes(pathBiomePolicy)) {
    issues.push(
      issue(
        'error',
        'travel.path_biome_policy',
        'Subsystems',
        'subsystems.travel.config.path_biome_policy',
        'Invalid path biome policy',
        '`path_biome_policy` must be from_location or off.',
      ),
    );
  }
  const routePriority = String(travelConfig.route_priority ?? 'least_encs')
    .trim()
    .toLowerCase();
  if (!VALID_ROUTE_PRIORITY.includes(routePriority)) {
    issues.push(
      issue(
        'error',
        'travel.route_priority',
        'Subsystems',
        'subsystems.travel.config.route_priority',
        'Invalid route priority',
        '`route_priority` must be least_encs, least_travel_time, least_cost, or custom.',
      ),
    );
  }
  const routeWeights = travelConfig.route_weights;
  if (routeWeights != null) {
    if (!isPlainRecord(routeWeights)) {
      issues.push(
        issue(
          'error',
          'travel.route_weights',
          'Subsystems',
          'subsystems.travel.config.route_weights',
          'Route weights must be a mapping',
          '`route_weights` must map route dimensions or step types to numbers.',
        ),
      );
    }
    if (isPlainRecord(routeWeights)) {
      for (const key of Object.keys(routeWeights)) {
        if (typeof routeWeights[key] !== 'number' || !Number.isFinite(routeWeights[key])) {
          issues.push(
            issue(
              'error',
              'travel.route_weight_number',
              'Subsystems',
              `subsystems.travel.config.route_weights.${key}`,
              'Route weight must be numeric',
              'Each custom route weight must be a finite number.',
            ),
          );
        }
      }
    }
  }
  for (const key of ['show_arrival_time', 'show_arrival_weather', 'show_shops_on_travel']) {
    const value = travelConfig[key];
    if (value != null && typeof value !== 'boolean') {
      issues.push(
        issue(
          'error',
          'travel.arrival_display_bool',
          'Subsystems',
          `subsystems.travel.config.${key}`,
          'Travel display setting must be boolean',
          `${key} must be True or False.`,
        ),
      );
    }
  }
  const transportIcons = asRecord(travelConfig.transport_icons);
  for (const key of REQUIRED_TRANSPORT_ICONS) {
    const icon = transportIcons[key];
    if (typeof icon !== 'string' || icon.trim() === '') {
      issues.push(
        issue(
          'error',
          'travel.transport_icon_missing',
          'Subsystems',
          `subsystems.travel.config.transport_icons.${key}`,
          'Transport icon is missing',
          `The ${key} transport display icon should be non-empty.`,
          'Choose one of the defaults or paste a Discord emoji.',
        ),
      );
    }
  }
  if (travel.enabled !== true) return;
  const locationCommandOn = commands.location === true;
  const travelCommandOn = commands.travel === true;
  const implementedTravelOn = locationCommandOn || travelCommandOn;
  const locations = asRecord(model.world_data.locations);
  const hasLocationGvar = String(model.world_data.locations_gvar_id ?? '').trim() !== '';
  const hasLocationSource = Object.keys(locations).length > 0 || hasLocationGvar;
  const defaultLocation = model.world_data.default_location;
  const calendars = asRecord(model.world_data.calendars);
  const weatherAreas = weatherAreasFromWorldData(model.world_data);
  const transportLabels = transportLabelsFromWorldData(model.world_data);

  if (implementedTravelOn && !defaultLocation) {
    issues.push(
      issue(
        'error',
        'world.default_location',
        'World',
        'world_data.default_location',
        'Travel has no default location',
        '`!travel` and `!location` need a default location for characters with no location cvar.',
      ),
    );
  }
  if (implementedTravelOn && !hasLocationSource) {
    issues.push(
      issue(
        'error',
        'world.locations.empty',
        'World',
        'world_data.locations',
        'Travel has no locations',
        'The travel subsystem needs locations to describe where players can go.',
      ),
    );
  }
  if (
    typeof defaultLocation === 'string' &&
    defaultLocation.trim() !== '' &&
    !hasLocationGvar &&
    Object.keys(locations).length > 0 &&
    !locations[defaultLocation.trim().toLowerCase()]
  ) {
    issues.push(
      issue(
        'error',
        'world.default_location_unknown',
        'World',
        'world_data.default_location',
        'Default location is not in locations',
        '`world_data.default_location` must match a key in `world_data.locations`.',
      ),
    );
  }

  if (commands.time === true && Object.keys(calendars).length === 0) {
    issues.push(
      issue(
        'error',
        'world.calendars.empty',
        'World',
        'world_data.calendars',
        'Time command has no calendars',
        '`!time` needs at least one calendar under `world_data.calendars`.',
        'Add a calendar on the World page, or disable the time command.',
      ),
    );
  }

  if (commands.weather === true && Object.keys(weatherAreas).length === 0) {
    issues.push(
      issue(
        'error',
        'world.weather.empty',
        'World',
        'world_data.weather',
        'Weather command has no weather areas',
        '`!weather` needs configured areas under `world_data.weather.by_area`.',
        'Add weather areas on the World page, or disable the weather command.',
      ),
    );
  }

  const rawPaths = model.world_data.paths;
  const paths = pathListFromSourceValue(rawPaths);
  if (travelCommandOn && rawPaths != null && paths == null) {
    issues.push(
      issue(
        'error',
        'world.paths.type',
        'World',
        'world_data.paths',
        'Paths must be a list or indexed map',
        '`!travel` route planning expects `world_data.paths` to be a list of path objects or `{paths_by_from:{...}}`.',
      ),
    );
  }
  if (travelCommandOn && paths != null) {
    const explorationConfig = asRecord(asRecord(model.subsystems.exploration).config);
    const biomeSource = String(explorationConfig.enc_biome_source ?? 'auto')
      .trim()
      .toLowerCase();
    paths.forEach((entry, index) => {
      const path = asRecord(entry);
      const from = typeof path.from === 'string' ? path.from.trim().toLowerCase() : '';
      const to = typeof path.to === 'string' ? path.to.trim().toLowerCase() : '';
      if (!from || !to) {
        issues.push(
          issue(
            'error',
            'world.path.endpoint_missing',
            'World',
            `world_data.paths.${index}`,
            'Path needs from and to locations',
            'Each travel path must define string `from` and `to` location ids.',
          ),
        );
        return;
      }
      if (
        !hasLocationGvar &&
        Object.keys(locations).length > 0 &&
        (!locations[from] || !locations[to])
      ) {
        issues.push(
          issue(
            'error',
            'world.path.endpoint_unknown',
            'World',
            `world_data.paths.${index}`,
            'Path references an unknown location',
            '`from` and `to` must match keys in `world_data.locations`.',
          ),
        );
      }
      [
        ['distance_miles', 'Distance miles'],
        ['travel_hours', 'Travel hours'],
        ['travel_steps', 'Travel steps'],
        ['route_cost', 'Route cost'],
      ].forEach(([field, label]) => {
        const metric = path[field];
        if (metric == null || metric === '') return;
        if (typeof metric === 'number' && Number.isFinite(metric) && metric >= 0) return;
        issues.push(
          issue(
            'error',
            'world.path.travel_metric',
            'World',
            `world_data.paths.${index}.${field}`,
            `${label} must be a non-negative number`,
            'Travel route metrics are used for route planning without adding repeated journey steps.',
          ),
        );
      });
      const requirements = asRecord(path.requirements);
      const transportRequirement = requirements.transport ?? path.transport;
      const transportRequirements =
        transportRequirement == null
          ? []
          : Array.isArray(transportRequirement)
            ? transportRequirement
            : [transportRequirement];
      if (transportLabels.size > 0) {
        transportRequirements.forEach((requirement, requirementIndex) => {
          const requirementId = normalizedLookupId(requirement);
          if (!requirementId) return;
          if (transportLabels.has(requirementId)) return;
          issues.push(
            issue(
              'error',
              'world.path.transport_unknown',
              'World',
              Array.isArray(transportRequirement)
                ? `world_data.paths.${index}.requirements.transport.${requirementIndex}`
                : `world_data.paths.${index}.requirements.transport`,
              'Path references an unknown transport',
              '`requirements.transport` must match a configured transport id or alias.',
              'Add the transport under `world_data.transport`, or update the path requirement.',
            ),
          );
        });
      }
      const rawSteps = path.steps;
      if (rawSteps != null && !Array.isArray(rawSteps)) {
        issues.push(
          issue(
            'error',
            'world.path.steps_type',
            'World',
            `world_data.paths.${index}.steps`,
            'Path steps must be a list',
            'Travel path steps should be encounter, cost, or proceed objects.',
          ),
        );
        return;
      }
      if (Array.isArray(rawSteps)) {
        rawSteps.forEach((rawStep, stepIndex) => {
          const stepPath = `world_data.paths.${index}.steps.${stepIndex}`;
          if (!isPlainRecord(rawStep)) {
            issues.push(
              issue(
                'error',
                'world.path.step_shape',
                'World',
                stepPath,
                'Path step must be an object',
                'Use fields such as type, biome, activity, gold, or description.',
              ),
            );
            return;
          }
          const step = asRecord(rawStep);
          const stepType = String(step.type ?? (step.biome != null ? 'encounter' : 'proceed'))
            .trim()
            .toLowerCase();
          const biome = String(step.biome ?? step.code ?? '').trim();
          if (stepType === 'encounter' && biomeSource !== 'location') {
            if (!biome) {
              issues.push(
                issue(
                  'warning',
                  'world.path.encounter_biome_missing',
                  'World',
                  `${stepPath}.biome`,
                  'Encounter step has no biome',
                  'Empty-biome encounter steps rely on location-inferred exploration.',
                  'Set a biome on the step, or set exploration biome source to location.',
                ),
              );
            }
          }
          if (pathBiomePolicy === 'from_location' && stepType === 'encounter' && biome) {
            const fromLocation = asRecord(locations[from]);
            const command = String(step.activity ?? 'enc')
              .trim()
              .toLowerCase();
            const allowedBiomes = locationAllowedBiomes(fromLocation, command);
            const biomeId = normalizedLookupId(biome);
            if (
              Object.keys(fromLocation).length > 0 &&
              allowedBiomes.length > 0 &&
              !allowedBiomes.includes(biomeId)
            ) {
              issues.push(
                issue(
                  'error',
                  'world.path.biome_not_allowed',
                  'World',
                  `${stepPath}.biome`,
                  'Path step biome is not allowed at the origin',
                  `The ${command} biome ${biomeId} is not listed on ${from}.`,
                  'Add the biome to the origin location command list, change the step biome, or set travel path_biome_policy to off.',
                ),
              );
            }
          }
        });
      }
    });
  }
}

function validateDowntime(model: ConfigModel, issues: ConfigIssue[]) {
  const downtime = asRecord(model.subsystems.downtime);
  const config = asRecord(downtime.config);
  const mode = config.mode;
  const acquisition = config.acquisition;

  if (typeof mode === 'string' && !VALID_DOWNTIME_MODES.includes(mode)) {
    issues.push(
      issue(
        'error',
        'downtime.mode',
        'Subsystems',
        'subsystems.downtime.config.mode',
        'Invalid downtime mode',
        '`mode` must be tracked, manual, or off.',
      ),
    );
  }

  if (mode === 'tracked' && downtime.enabled !== true) {
    issues.push(
      issue(
        'error',
        'downtime.tracked_requires_subsystem',
        'Subsystems',
        'subsystems.downtime.enabled',
        'Tracked downtime needs the subsystem enabled',
        '`subsystems.downtime.config.mode: tracked` uses the downtime cvar ledger.',
        'Enable the downtime subsystem, or switch downtime mode to off/manual.',
      ),
    );
  }

  const maxWorkdays = config.max_workdays;
  if (maxWorkdays != null && (!isNonNegativeInteger(maxWorkdays) || Number(maxWorkdays) < 1)) {
    issues.push(
      issue(
        'error',
        'downtime.max_workdays',
        'Subsystems',
        'subsystems.downtime.config.max_workdays',
        'Downtime cap must be positive',
        '`max_workdays` must be a positive whole number, or None for unlimited.',
      ),
    );
  }

  if (typeof acquisition === 'string' && !VALID_DOWNTIME_ACQUISITION.includes(acquisition)) {
    issues.push(
      issue(
        'error',
        'downtime.acquisition',
        'Subsystems',
        'subsystems.downtime.config.acquisition',
        'Invalid downtime acquisition mode',
        '`acquisition` must be manual, world_clock, or journey.',
      ),
    );
  }
  if (acquisition === 'world_clock' && commandEnabled(model, 'travel', 'time') !== true) {
    issues.push(
      issue(
        'warning',
        'downtime.acquisition_world_clock',
        'Subsystems',
        'subsystems.downtime.config.acquisition',
        'World-clock downtime needs world-clock time',
        'Downtime acquisition from time needs the travel time command.',
      ),
    );
  }
  if (acquisition === 'journey' && asRecord(model.subsystems.travel).enabled !== true) {
    issues.push(
      issue(
        'warning',
        'downtime.acquisition_journey',
        'Subsystems',
        'subsystems.downtime.config.acquisition',
        'Journey downtime needs travel enabled',
        'Downtime acquisition from journeys needs the travel subsystem.',
      ),
    );
  }

  for (const key of ['workday_hours', 'workweek_days']) {
    const value = config[key];
    if (value != null && (!isNonNegativeInteger(value) || Number(value) < 1)) {
      issues.push(
        issue(
          'error',
          `downtime.${key}`,
          'Subsystems',
          `subsystems.downtime.config.${key}`,
          'Downtime schedule values must be positive',
          `${key} must be a positive whole number.`,
        ),
      );
    }
  }

  const commandConfig = asRecord(downtime.command_config);
  const cooldown = asRecord(commandConfig.downtime).cooldown_seconds;
  if (cooldown != null && !isNonNegativeInteger(cooldown)) {
    issues.push(
      issue(
        'error',
        'downtime.cooldown',
        'Subsystems',
        'subsystems.downtime.command_config.downtime.cooldown_seconds',
        'Downtime cooldown must be non-negative',
        'Cooldown seconds must be a non-negative integer.',
      ),
    );
  }
}

function validateCraftingRulesVersion(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null || value === '') return;
  if (typeof value !== 'string' || !VALID_RULES_VERSION.includes(value)) {
    issues.push(
      issue(
        'error',
        'crafting.rules_version',
        sectionForConfigPath(path),
        path,
        'Invalid crafting rules version',
        'Crafting rules overrides must be 2014 or 2024.',
      ),
    );
  }
}

function validateCraftingRecipeMode(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null || value === '') return;
  if (typeof value !== 'string' || !VALID_CRAFTING_RECIPE_MODES.includes(value)) {
    issues.push(
      issue(
        'error',
        'crafting.recipe_mode',
        sectionForConfigPath(path),
        path,
        'Invalid crafting recipe mode',
        'Recipe mode must be raw, recipes, or mixed.',
      ),
    );
  }
}

function validateCraftingKnownSpell(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null) return;
  if (typeof value !== 'boolean') {
    issues.push(
      issue(
        'error',
        'crafting.require_known_spell',
        sectionForConfigPath(path),
        path,
        'Scribe spell-known requirement must be boolean',
        'Use True to require the spell in the character spellbook, or False to disable this RAW gate.',
      ),
    );
  }
}

function validateCraftingCheckPolicies(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null) return;
  if (!isPlainRecord(value)) {
    issues.push(
      issue(
        'error',
        'crafting.checks_object',
        sectionForConfigPath(path),
        path,
        'Crafting checks must be an object',
        'Use command keys such as craft, brew, enchant, and scribe.',
      ),
    );
    return;
  }

  for (const [command, rawPolicy] of Object.entries(asRecord(value))) {
    const commandPath = `${path}.${command}`;
    if (!DEFAULT_SUBSYSTEM_COMMANDS.crafting.includes(command)) {
      issues.push(
        issue(
          'warning',
          'crafting.checks_unknown',
          sectionForConfigPath(commandPath),
          commandPath,
          'Unknown crafting check command',
          'Check policy keys should match craft, brew, enchant, or scribe.',
        ),
      );
      continue;
    }
    if (typeof rawPolicy === 'boolean' || typeof rawPolicy === 'string') {
      const mode = typeof rawPolicy === 'string' ? rawPolicy : rawPolicy ? 'roll' : 'none';
      if (!VALID_CRAFTING_CHECK_MODES.includes(mode)) {
        issues.push(
          issue(
            'error',
            'crafting.check_mode',
            sectionForConfigPath(commandPath),
            commandPath,
            'Invalid crafting check mode',
            'Check modes must be none, manual, or roll.',
          ),
        );
      }
      continue;
    }
    if (!isPlainRecord(rawPolicy)) {
      issues.push(
        issue(
          'error',
          'crafting.check_object',
          sectionForConfigPath(commandPath),
          commandPath,
          'Crafting check policy must be an object or mode',
          'Use {"mode": "roll", "skill": "arcana", "dc": 15}.',
        ),
      );
      continue;
    }
    const policy = asRecord(rawPolicy);
    const mode = policy.mode;
    if (mode != null && (typeof mode !== 'string' || !VALID_CRAFTING_CHECK_MODES.includes(mode))) {
      issues.push(
        issue(
          'error',
          'crafting.check_mode',
          sectionForConfigPath(commandPath),
          `${commandPath}.mode`,
          'Invalid crafting check mode',
          'Check modes must be none, manual, or roll.',
        ),
      );
    }
    if (policy.dc != null && (!isNonNegativeInteger(policy.dc) || Number(policy.dc) < 1)) {
      issues.push(
        issue(
          'error',
          'crafting.check_dc',
          sectionForConfigPath(commandPath),
          `${commandPath}.dc`,
          'Crafting check DC must be positive',
          'Use a positive whole number, or None to roll without a DC.',
        ),
      );
    }
    if (policy.skill != null && typeof policy.skill !== 'string') {
      issues.push(
        issue(
          'error',
          'crafting.check_skill',
          sectionForConfigPath(commandPath),
          `${commandPath}.skill`,
          'Crafting check skill must be text',
          'Use an Avrae skill key such as arcana or nature.',
        ),
      );
    }
    if (policy.require_success != null && typeof policy.require_success !== 'boolean') {
      issues.push(
        issue(
          'error',
          'crafting.check_require_success',
          sectionForConfigPath(commandPath),
          `${commandPath}.require_success`,
          'Crafting check success flag must be boolean',
          'Use True or False.',
        ),
      );
    }
  }
}

function looksLikeCraftingCheckEntry(value: unknown): boolean {
  if (!isPlainRecord(value)) return false;
  const policy = asRecord(value);
  return ['mode', 'skill', 'ability', 'dc', 'require_success'].some((key) => key in policy);
}

function validateCraftingCheckOverride(
  value: unknown,
  path: string,
  command: string,
  issues: ConfigIssue[],
) {
  if (value == null) return;
  if (
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    looksLikeCraftingCheckEntry(value)
  ) {
    validateCraftingCheckPolicies({ [command]: value }, path, issues);
    return;
  }
  validateCraftingCheckPolicies(value, path, issues);
}

function validateCraftingToolPolicies(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null) return;
  if (!isPlainRecord(value)) {
    issues.push(
      issue(
        'error',
        'crafting.tool_policy_object',
        sectionForConfigPath(path),
        path,
        'Crafting tool policy must be an object',
        'Use command keys such as craft, brew, enchant, and scribe.',
      ),
    );
    return;
  }

  for (const [command, rawPolicy] of Object.entries(asRecord(value))) {
    const commandPath = `${path}.${command}`;
    if (!DEFAULT_SUBSYSTEM_COMMANDS.crafting.includes(command)) {
      issues.push(
        issue(
          'warning',
          'crafting.tool_policy_unknown',
          sectionForConfigPath(commandPath),
          commandPath,
          'Unknown crafting tool command',
          'Tool policy keys should match craft, brew, enchant, or scribe.',
        ),
      );
      continue;
    }
    if (typeof rawPolicy === 'boolean' || typeof rawPolicy === 'string') {
      const mode = typeof rawPolicy === 'string' ? rawPolicy : rawPolicy ? 'check' : 'off';
      if (!VALID_CRAFTING_TOOL_MODES.includes(mode)) {
        issues.push(
          issue(
            'error',
            'crafting.tool_mode',
            sectionForConfigPath(commandPath),
            commandPath,
            'Invalid crafting tool mode',
            'Tool modes must be off, manual, or check.',
          ),
        );
      }
      continue;
    }
    if (!isPlainRecord(rawPolicy)) {
      issues.push(
        issue(
          'error',
          'crafting.tool_policy_entry',
          sectionForConfigPath(commandPath),
          commandPath,
          'Crafting tool policy must be an object or mode',
          'Use {"mode": "check", "tools": ["Calligrapher\'s Supplies"]}.',
        ),
      );
      continue;
    }
    const policy = asRecord(rawPolicy);
    const mode = policy.mode;
    if (mode != null && (typeof mode !== 'string' || !VALID_CRAFTING_TOOL_MODES.includes(mode))) {
      issues.push(
        issue(
          'error',
          'crafting.tool_mode',
          sectionForConfigPath(commandPath),
          `${commandPath}.mode`,
          'Invalid crafting tool mode',
          'Tool modes must be off, manual, or check.',
        ),
      );
    }
    if (policy.tools != null) {
      if (!Array.isArray(policy.tools)) {
        issues.push(
          issue(
            'error',
            'crafting.tool_list',
            sectionForConfigPath(commandPath),
            `${commandPath}.tools`,
            'Crafting tools must be a list',
            'Use a list of tool names.',
          ),
        );
      } else if (policy.tools.some((item) => typeof item !== 'string' || item.trim() === '')) {
        issues.push(
          issue(
            'error',
            'crafting.tool_name',
            sectionForConfigPath(commandPath),
            `${commandPath}.tools`,
            'Crafting tool names must be text',
            'Remove blank tool names.',
          ),
        );
      }
    }
    for (const boolKey of ['require_proficiency', 'require_kit']) {
      if (policy[boolKey] != null && typeof policy[boolKey] !== 'boolean') {
        issues.push(
          issue(
            'error',
            'crafting.tool_bool',
            sectionForConfigPath(commandPath),
            `${commandPath}.${boolKey}`,
            'Crafting tool flags must be boolean',
            'Use True or False.',
          ),
        );
      }
    }
    if (
      policy.kit_bag != null &&
      (typeof policy.kit_bag !== 'string' || policy.kit_bag.trim() === '')
    ) {
      issues.push(
        issue(
          'error',
          'crafting.tool_bag',
          sectionForConfigPath(commandPath),
          `${commandPath}.kit_bag`,
          'Tool kit bag must be text',
          'Use a non-empty bag name.',
        ),
      );
    }
  }
}

function catalogueSourceStatus(
  value: unknown,
  catalogueKey: string | null,
): { hasSource: boolean; valid: boolean; detail: string } {
  if (value == null) {
    return { hasSource: false, valid: true, detail: '' };
  }

  if (Array.isArray(value)) {
    return { hasSource: value.length > 0, valid: true, detail: '' };
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return { hasSource: false, valid: true, detail: '' };
    if (text.startsWith('engine:')) {
      const expected = catalogueKey ? VALID_CRAFTING_ENGINE_CATALOGUES[catalogueKey] : undefined;
      return {
        hasSource: true,
        valid: Boolean(expected && text === expected),
        detail: expected
          ? `Use ${expected} for this catalogue, or provide a custom gvar UUID.`
          : 'Use a supported engine catalogue slug or provide a custom gvar UUID.',
      };
    }
    return {
      hasSource: true,
      valid: GVAR_ID_RE.test(text),
      detail: 'Custom catalogue sources must be Avrae workshop UUIDs.',
    };
  }

  if (!isPlainRecord(value)) {
    return {
      hasSource: true,
      valid: false,
      detail:
        'Catalogue sources must be a UUID string, engine slug, inline list, or source object.',
    };
  }

  const record = asRecord(value);
  let hasSource = false;
  let valid = true;
  let detail = '';

  if (record.include_engine === true) {
    hasSource = true;
    if (!catalogueKey || !VALID_CRAFTING_ENGINE_CATALOGUES[catalogueKey]) {
      valid = false;
      detail =
        'include_engine is only supported for item, potion, spell, and magic item catalogues.';
    }
  }

  if (record.entries != null) {
    if (!Array.isArray(record.entries)) {
      valid = false;
      detail = 'Catalogue source entries must be a list.';
    } else if (record.entries.length > 0) {
      hasSource = true;
    }
  }

  if (record.gvar_id != null) {
    const nested = catalogueSourceStatus(record.gvar_id, catalogueKey);
    hasSource = hasSource || nested.hasSource;
    if (!nested.valid) {
      valid = false;
      detail = nested.detail;
    }
  }

  for (const key of ['gvar_ids', 'gvars']) {
    if (record[key] == null) continue;
    if (!Array.isArray(record[key])) {
      valid = false;
      detail = `${key} must be a list of Avrae workshop UUIDs.`;
      continue;
    }
    const ids = record[key] as unknown[];
    if (ids.length > 0) hasSource = true;
    if (ids.some((item) => typeof item !== 'string' || !GVAR_ID_RE.test(item.trim()))) {
      valid = false;
      detail = `${key} must contain only Avrae workshop UUIDs.`;
    }
  }

  return { hasSource, valid, detail };
}

function validateCatalogueSource(
  value: unknown,
  path: string,
  catalogueKey: string | null,
  required: boolean,
  issues: ConfigIssue[],
) {
  const provided = value != null && !(typeof value === 'string' && value.trim() === '');
  const status = catalogueSourceStatus(value, catalogueKey);
  if (required && !status.hasSource) {
    issues.push(
      issue(
        'error',
        'crafting.catalogue_missing',
        sectionForConfigPath(path),
        path,
        'Crafting catalogue is required',
        'Enabled crafting commands need their matching catalogue source.',
        'Use an engine source, custom gvar UUID, or inline entries.',
      ),
    );
    return;
  }
  if (provided && (!status.hasSource || !status.valid)) {
    issues.push(
      issue(
        'error',
        'crafting.catalogue_source',
        sectionForConfigPath(path),
        path,
        'Invalid crafting catalogue source',
        status.detail || 'The catalogue source does not point at any entries.',
        'Use an engine source, custom gvar UUID, or inline entries.',
      ),
    );
  }
}

function looksLikeCraftingToolEntry(value: unknown): boolean {
  if (!isPlainRecord(value)) return false;
  const policy = asRecord(value);
  return [
    'mode',
    'tools',
    'tool',
    'tool_options',
    'require_proficiency',
    'require_kit',
    'kit_bag',
  ].some((key) => key in policy);
}

function validateCraftingToolOverride(
  value: unknown,
  path: string,
  command: string,
  issues: ConfigIssue[],
) {
  if (value == null) return;
  if (
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    looksLikeCraftingToolEntry(value)
  ) {
    validateCraftingToolPolicies({ [command]: value }, path, issues);
    return;
  }
  validateCraftingToolPolicies(value, path, issues);
}

function validateCraftingResourceModes(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null) return;
  if (!isPlainRecord(value)) {
    issues.push(
      issue(
        'error',
        'crafting.resources_object',
        sectionForConfigPath(path),
        path,
        'Crafting resource policy must be an object',
        'Use keys such as gold, materials, items, downtime, and spell_slot.',
      ),
    );
    return;
  }

  const resources = asRecord(value);
  for (const key of CRAFTING_RESOURCE_KEYS) {
    const mode = resources[key];
    if (mode == null) continue;
    if (typeof mode !== 'string' || !VALID_CRAFTING_RESOURCE_MODES.includes(mode)) {
      issues.push(
        issue(
          'error',
          'crafting.resource_mode',
          sectionForConfigPath(path),
          `${path}.${key}`,
          'Invalid crafting resource mode',
          'Resource modes must be manual, check, or deduct.',
        ),
      );
    }
  }
}

function validateItemHandling(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null) return;

  if (typeof value === 'string') {
    if (!VALID_ITEM_HANDLING_MODES.includes(value.trim().toLowerCase())) {
      issues.push(
        issue(
          'error',
          'inventory.item_handling_mode',
          sectionForConfigPath(path),
          path,
          'Invalid item handling mode',
          'Item handling mode must be manual or bags.',
        ),
      );
    }
    return;
  }

  if (!isPlainRecord(value)) {
    issues.push(
      issue(
        'error',
        'inventory.item_handling_object',
        sectionForConfigPath(path),
        path,
        'Item handling policy must be an object or mode string',
        'Use {"mode": "manual"} or {"mode": "bags", "scrolls_bag": "Scrolls"}.',
      ),
    );
    return;
  }

  const policy = asRecord(value);
  const mode = policy.mode;
  if (mode != null && (typeof mode !== 'string' || !VALID_ITEM_HANDLING_MODES.includes(mode))) {
    issues.push(
      issue(
        'error',
        'inventory.item_handling_mode',
        sectionForConfigPath(path),
        `${path}.mode`,
        'Invalid item handling mode',
        'Item handling mode must be manual or bags.',
      ),
    );
  }

  for (const bagKey of [
    'default_bag',
    'equipment_bag',
    'crafted_bag',
    'potions_bag',
    'scrolls_bag',
    'magic_items_bag',
    'materials_bag',
  ]) {
    const bagName = policy[bagKey];
    if (bagName != null && (typeof bagName !== 'string' || bagName.trim() === '')) {
      issues.push(
        issue(
          'error',
          'inventory.item_handling_bag',
          sectionForConfigPath(path),
          `${path}.${bagKey}`,
          'Bag name must be text',
          'Bag policy names should be non-empty strings.',
        ),
      );
    }
  }
}

function validateCrafting(model: ConfigModel, issues: ConfigIssue[]) {
  const crafting = asRecord(model.subsystems.crafting);
  const commands = asRecord(crafting.commands);
  const enabledCommands = Object.entries(commands)
    .filter(
      ([command, value]) => value === true && DEFAULT_SUBSYSTEM_COMMANDS.crafting.includes(command),
    )
    .map(([command]) => command);
  const craftingActive = crafting.enabled === true && enabledCommands.length > 0;
  const downtimeTracked =
    asRecord(asRecord(model.subsystems.downtime).config).mode === 'tracked' &&
    asRecord(model.subsystems.downtime).enabled === true;
  const craftingConfig = asRecord(crafting.config);
  const catalogues = asRecord(craftingConfig.catalogues);

  validateCraftingRulesVersion(
    craftingConfig.rules_version,
    'subsystems.crafting.config.rules_version',
    issues,
  );
  validateCraftingRecipeMode(
    craftingConfig.recipe_mode,
    'subsystems.crafting.config.recipe_mode',
    issues,
  );
  validateCraftingKnownSpell(
    craftingConfig.require_known_spell,
    'subsystems.crafting.config.require_known_spell',
    issues,
  );
  validateCraftingCheckPolicies(craftingConfig.checks, 'subsystems.crafting.config.checks', issues);
  validateCraftingCheckPolicies(
    craftingConfig.check_policy,
    'subsystems.crafting.config.check_policy',
    issues,
  );
  validateCraftingToolPolicies(
    craftingConfig.tool_policy,
    'subsystems.crafting.config.tool_policy',
    issues,
  );

  for (const [command, catalogueKey] of Object.entries(CRAFTING_REQUIRED_CATALOGUES)) {
    const required = craftingActive && commands[command] === true;
    const source = catalogues[catalogueKey];
    validateCatalogueSource(
      source,
      `subsystems.crafting.config.catalogues.${catalogueKey}`,
      catalogueKey,
      required,
      issues,
    );
  }
  validateCatalogueSource(
    catalogues.recipes,
    'subsystems.crafting.config.catalogues.recipes',
    'recipes',
    false,
    issues,
  );

  validateCraftingResourceModes(
    craftingConfig.resources,
    'subsystems.crafting.config.resources',
    issues,
  );
  validateItemHandling(
    craftingConfig.item_handling,
    'subsystems.crafting.config.item_handling',
    issues,
  );

  const globalResources = asRecord(craftingConfig.resources);
  const activeNeedsDowntime = enabledCommands.some((command) => {
    const commandResources = asRecord(
      asRecord(asRecord(crafting.command_config)[command]).resources,
    );
    const mode = commandResources.downtime ?? globalResources.downtime ?? 'manual';
    return mode === 'check' || mode === 'deduct';
  });

  if (craftingActive && activeNeedsDowntime && !downtimeTracked) {
    issues.push(
      issue(
        'warning',
        'crafting.downtime_not_tracked',
        'Subsystems',
        'subsystems.crafting.config.resources.downtime',
        'Crafting downtime is not tracked',
        'Crafting can check or deduct downtime only when downtime mode is tracked and the downtime subsystem is enabled.',
      ),
    );
  }

  const commandConfig = asRecord(crafting.command_config);
  for (const [command, value] of Object.entries(commandConfig)) {
    if (!DEFAULT_SUBSYSTEM_COMMANDS.crafting.includes(command)) {
      issues.push(
        issue(
          'warning',
          'crafting.command_config_unknown',
          'Subsystems',
          `subsystems.crafting.command_config.${command}`,
          'Unknown crafting command config',
          'This command config key does not match a crafting command.',
        ),
      );
      continue;
    }
    const commandPolicy = asRecord(value);
    validateCraftingRulesVersion(
      commandPolicy.rules_version,
      `subsystems.crafting.command_config.${command}.rules_version`,
      issues,
    );
    validateCraftingRecipeMode(
      commandPolicy.recipe_mode,
      `subsystems.crafting.command_config.${command}.recipe_mode`,
      issues,
    );
    validateCraftingKnownSpell(
      commandPolicy.require_known_spell,
      `subsystems.crafting.command_config.${command}.require_known_spell`,
      issues,
    );
    validateCraftingCheckOverride(
      commandPolicy.checks,
      `subsystems.crafting.command_config.${command}.checks`,
      command,
      issues,
    );
    validateCraftingCheckOverride(
      commandPolicy.check,
      `subsystems.crafting.command_config.${command}.check`,
      command,
      issues,
    );
    validateCraftingToolOverride(
      commandPolicy.tool_policy,
      `subsystems.crafting.command_config.${command}.tool_policy`,
      command,
      issues,
    );
    validateCraftingResourceModes(
      commandPolicy.resources,
      `subsystems.crafting.command_config.${command}.resources`,
      issues,
    );
    validateItemHandling(
      commandPolicy.item_handling,
      `subsystems.crafting.command_config.${command}.item_handling`,
      issues,
    );
    validateItemHandling(
      commandPolicy.output,
      `subsystems.crafting.command_config.${command}.output`,
      issues,
    );

    const workdaysCost = commandPolicy.workdays_cost;
    if (workdaysCost != null && !isNonNegativeInteger(workdaysCost)) {
      issues.push(
        issue(
          'error',
          'crafting.workdays_cost',
          'Subsystems',
          `subsystems.crafting.command_config.${command}.workdays_cost`,
          'Crafting workday cost must be non-negative',
          'Use a non-negative whole number.',
        ),
      );
    }
    if (
      craftingActive &&
      commands[command] === true &&
      typeof workdaysCost === 'number' &&
      workdaysCost > 0 &&
      !downtimeTracked
    ) {
      issues.push(
        issue(
          'warning',
          'crafting.workdays_without_tracked_downtime',
          'Subsystems',
          `subsystems.crafting.command_config.${command}.workdays_cost`,
          'Crafting workdays need tracked downtime',
          'Workday costs can only be enforced when downtime mode is tracked and the downtime subsystem is enabled.',
        ),
      );
    }
  }
}

function hasConfiguredPrice(value: AnyRecord): boolean {
  return value.price != null || value.sell_price != null;
}

function validateShopPriceShape(value: unknown, path: string, issues: ConfigIssue[]) {
  if (value == null) return;
  if (typeof value === 'number' || typeof value === 'string') return;
  if (!isPlainRecord(value)) {
    issues.push(
      issue(
        'error',
        'economy.stock_price_shape',
        'World',
        path,
        'Stock price has an unsupported shape',
        'Use a number, text value, or object keyed by currency id.',
      ),
    );
    return;
  }
  if (Object.keys(asRecord(value)).length === 0) {
    issues.push(
      issue(
        'warning',
        'economy.stock_price_empty',
        'World',
        path,
        'Stock price is empty',
        'Empty price objects rely on catalogue values and can be hard for owners to audit.',
      ),
    );
  }
}

function validateEconomyJobEntry(value: unknown, path: string, issues: ConfigIssue[]) {
  if (!isPlainRecord(value)) {
    issues.push(
      issue(
        'error',
        'economy.job_shape',
        'Subsystems',
        path,
        'Job must be an object',
        'Use fields such as name, skills, location_id, locations, and description.',
      ),
    );
    return;
  }
  const job = asRecord(value);
  for (const key of ['skills', 'locations']) {
    const raw = job[key];
    if (raw == null) continue;
    if (
      !Array.isArray(raw) ||
      raw.some((entry) => typeof entry !== 'string' || entry.trim() === '')
    ) {
      issues.push(
        issue(
          'error',
          `economy.job_${key}`,
          'Subsystems',
          `${path}.${key}`,
          `Job ${key} must be a text list`,
          `Use a list of non-empty strings for ${key}.`,
        ),
      );
    }
  }
  if (job.skill != null && typeof job.skill !== 'string') {
    issues.push(
      issue(
        'error',
        'economy.job_skill',
        'Subsystems',
        `${path}.skill`,
        'Job skill must be text',
        'Use a skill name such as "survival".',
      ),
    );
  }
  if (job.location_id != null && typeof job.location_id !== 'string') {
    issues.push(
      issue(
        'error',
        'economy.job_location_id',
        'Subsystems',
        `${path}.location_id`,
        'Job location must be text',
        'Use a location id from world_data.locations.',
      ),
    );
  }
}

function validateEconomy(model: ConfigModel, issues: ConfigIssue[]) {
  const economy = asRecord(model.subsystems.economy);
  const economyConfig = asRecord(economy.config);
  const policy = economyConfig.job_location_policy;
  if (policy != null) {
    const normalized = String(policy).trim().toLowerCase();
    if (!VALID_JOB_LOCATION_POLICY.includes(normalized)) {
      issues.push(
        issue(
          'error',
          'economy.job_location_policy',
          'Subsystems',
          'subsystems.economy.config.job_location_policy',
          'Invalid job location policy',
          '`job_location_policy` must be off, warn, or check.',
        ),
      );
    }
  }
  const jobs = economyConfig.jobs;
  const askToConfirm = economyConfig.ask_to_confirm_purchases;
  if (askToConfirm != null && typeof askToConfirm !== 'boolean') {
    issues.push(
      issue(
        'error',
        'economy.ask_to_confirm_purchases_bool',
        'Subsystems',
        'subsystems.economy.config.ask_to_confirm_purchases',
        'Purchase confirmation setting must be boolean',
        'ask_to_confirm_purchases must be True or False.',
      ),
    );
  }
  if (jobs != null) {
    if (Array.isArray(jobs)) {
      jobs.forEach((entry, index) =>
        validateEconomyJobEntry(entry, `subsystems.economy.config.jobs.${index}`, issues),
      );
    } else if (isPlainRecord(jobs)) {
      for (const [jobId, entry] of Object.entries(jobs)) {
        validateEconomyJobEntry(entry, `subsystems.economy.config.jobs.${jobId}`, issues);
      }
    } else {
      issues.push(
        issue(
          'error',
          'economy.jobs_shape',
          'Subsystems',
          'subsystems.economy.config.jobs',
          'Jobs must be a list or object',
          'Use a list of job objects or an object keyed by job id.',
        ),
      );
    }
  }

  const shops = configuredShops(model);

  for (const [shopId, value] of Object.entries(shops)) {
    const path = `shops.${shopId}`;
    if (!isPlainRecord(value)) {
      issues.push(
        issue(
          'error',
          'economy.shop_shape',
          'World',
          path,
          'Shop must be an object',
          'Use fields such as name, location_id, accepts_sells, and stock.',
        ),
      );
      continue;
    }
    const shop = asRecord(value);
    if (shop.stock == null) continue;
    if (!Array.isArray(shop.stock)) {
      issues.push(
        issue(
          'error',
          'economy.stock_list',
          'World',
          `${path}.stock`,
          'Shop stock must be a list',
          'Each stock row should be an object with item, price, optional qty, display_name, and fulfillment.',
        ),
      );
      continue;
    }
    shop.stock.forEach((rawStock, index) => {
      const stockPath = `${path}.stock.${index}`;
      if (!isPlainRecord(rawStock)) {
        issues.push(
          issue(
            'error',
            'economy.stock_shape',
            'World',
            stockPath,
            'Stock row must be an object',
            'Use {"item": "Rope, Hemp (50 ft)", "price": {"gold": 1}}.',
          ),
        );
        return;
      }
      const stock = asRecord(rawStock);
      if (typeof stock.item !== 'string' || stock.item.trim() === '') {
        issues.push(
          issue(
            'error',
            'economy.stock_item',
            'World',
            `${stockPath}.item`,
            'Stock row needs an item name',
            'The item should match a configured item catalogue entry.',
          ),
        );
      }
      for (const displayKey of ['display_name', 'display', 'name']) {
        const displayValue = stock[displayKey];
        if (displayValue != null && typeof displayValue !== 'string') {
          issues.push(
            issue(
              'error',
              'economy.stock_display_name',
              'World',
              `${stockPath}.${displayKey}`,
              'Stock display name must be text',
              'Use text when the shop-facing name should differ from the delivered item.',
            ),
          );
        }
      }
      const fulfillment = stock.fulfillment;
      if (fulfillment != null) {
        const normalized = String(fulfillment).trim().toLowerCase();
        if (typeof fulfillment !== 'string' || !['item', 'service'].includes(normalized)) {
          issues.push(
            issue(
              'error',
              'economy.stock_fulfillment',
              'World',
              `${stockPath}.fulfillment`,
              'Stock fulfillment must be item or service',
              'Use "item" for inventory purchases or "service" for purchases that should not add a bag item.',
            ),
          );
        }
      }
      if (!hasConfiguredPrice(stock)) {
        issues.push(
          issue(
            'warning',
            'economy.stock_price_missing',
            'World',
            stockPath,
            'Stock row has no explicit price',
            'Runtime can fall back to catalogue value for buys, but explicit prices make shop setup clearer.',
            'Add price or sell_price if this shop row should be traded.',
          ),
        );
      }
      validateShopPriceShape(stock.price, `${stockPath}.price`, issues);
      validateShopPriceShape(stock.sell_price, `${stockPath}.sell_price`, issues);
    });
  }
}

function validateContent(model: ConfigModel, issues: ConfigIssue[]) {
  const content = asRecord(model.subsystems.content);
  const contentConfig = asRecord(content.config);
  const topicSource = contentConfig.library_topic_source;

  if (typeof topicSource === 'string' && !VALID_LIBRARY_TOPIC.includes(topicSource)) {
    issues.push(
      issue(
        'error',
        'content.library_topic_source',
        'Content',
        'subsystems.content.config.library_topic_source',
        'Invalid library topic source',
        'Use inferred, balanced, manual, or restricted.',
      ),
    );
  }

  if (
    topicSource === 'restricted' &&
    (!Array.isArray(contentConfig.allowed_topics) || contentConfig.allowed_topics.length === 0)
  ) {
    issues.push(
      issue(
        'warning',
        'content.allowed_topics',
        'Content',
        'subsystems.content.config.allowed_topics',
        'Restricted library needs allowed topics',
        'Restricted search should define at least one allowed topic.',
      ),
    );
  }
}

export function applyIssueFix(model: ConfigModel, issueCode: string): ConfigModel {
  const next = structuredClone(model) as ConfigModel;

  if (issueCode === 'display.colour') {
    next.display.colour = '#5865F2';
  }
  if (issueCode === 'exploration.distribution_total') {
    const exploration = asRecord(next.subsystems.exploration);
    exploration.config = {
      ...asRecord(exploration.config),
      distribution: { combat: 25, quest: 25, gather: 50 },
    };
    next.subsystems.exploration = exploration;
  }

  return next;
}

export function createBlankConfig(): ConfigModel {
  return structuredClone({
    config_version: '1.0',
    display: {
      name: 'My Westmarch',
      footer: 'My Westmarch',
      colour: '#5865F2',
    },
    subsystems: createDefaultSubsystems(),
    encounter_templates: {},
    encounter_template_meta: {},
    world_data: {
      biomes: {},
      locations: {},
      paths: [],
    },
    currencies: {},
    shops: {},
    books: {},
    policies: {
      display: {
        footer_behaviour: 'balanced',
        command_thumbnail: 'default',
        error_embeds: { auto_delete: true, timeout_seconds: 60 },
        helpful_tips: [],
        credits: null,
      },
      player_setup: {
        enabled: true,
        require_character: true,
        hud: { enabled: true, fields: ['coinpurse', 'wallet', 'location'] },
        checks: [],
      },
    },
  });
}

export function updatePath(model: ConfigModel, path: string, value: unknown): ConfigModel {
  const next = structuredClone(model) as AnyRecord;
  const parts = path.split('.');
  let cursor: AnyRecord = next;
  for (const part of parts.slice(0, -1)) {
    if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
    cursor = cursor[part] as AnyRecord;
  }
  cursor[parts[parts.length - 1]] = value;
  return next as ConfigModel;
}

export function readPath(model: ConfigModel, path: string): unknown {
  return path.split('.').reduce<unknown>((cursor, part) => {
    if (!cursor || typeof cursor !== 'object') return undefined;
    return (cursor as AnyRecord)[part];
  }, model);
}

export function safeJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

export function parseJsonField(text: string): unknown {
  return JSON.parse(text);
}
