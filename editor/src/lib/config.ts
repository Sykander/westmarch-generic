export type AnyRecord = Record<string, unknown>;

export type ConfigModel = {
  config_version?: string;
  rules_version?: string;
  display: AnyRecord;
  subsystems: Record<string, AnyRecord>;
  policies: AnyRecord;
  world_data: AnyRecord;
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

const SUBSYSTEMS = Object.keys(DEFAULT_SUBSYSTEM_COMMANDS);

const VALID_ENC_BIOME = ['auto', 'argument', 'location'];
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
const VALID_PLAYER_SETUP_CHECK_TYPES = ['cvar', 'uvar', 'svar', 'cc', 'counter', 'custom_counter'];
const VALID_PLAYER_SETUP_HUD_FIELDS = [
  'coins',
  'coin',
  'coinpurse',
  'gp',
  'wallet',
  'location',
  'time',
  'weather',
];
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
};
const CRAFTING_REQUIRED_CATALOGUES: Record<string, string> = {
  craft: 'items',
  brew: 'potions',
  scribe: 'spells',
  enchant: 'magic_items',
};
const CRAFTING_RESOURCE_KEYS = ['gold', 'materials', 'items', 'downtime', 'spell_slot'];
const GVAR_ID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const DEFAULT_MODEL: ConfigModel = {
  display: {},
  subsystems: {},
  policies: {},
  world_data: {},
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
        repeat_exclude_window: 5,
        monster_images: { hunt: 'thumbnail', loot: 'thumbnail' },
        show_check_dcs: { hunt: true, loot: true },
      },
    },
    travel: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.travel),
    },
    downtime: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.downtime),
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
        item_handling: null,
      },
      command_config: { craft: {}, brew: {}, enchant: {}, scribe: {} },
    },
    economy: {
      enabled: false,
      commands: defaultCommands(DEFAULT_SUBSYSTEM_COMMANDS.economy),
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
    world_data: parseRecordAssignment(cleaned, 'world_data', issues),
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
  const compactWorldData = compactValue(model.world_data) as AnyRecord;
  const compactPolicies = compactValue(model.policies) as AnyRecord;
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

  lines.push(`policies = ${jsonToPy(compactPolicies)}`, '');
  return `${lines.join('\n').trimEnd()}\n`;
}

function isPlainRecord(value: unknown): value is AnyRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asRecord(value: unknown): AnyRecord {
  return isPlainRecord(value) ? value : {};
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
  validateWorld(model, issues);
  validateTravel(model, issues);
  validateDowntime(model, issues);
  validateCrafting(model, issues);
  validateContent(model, issues);

  return issues;
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
        'Use {"enabled": True, "fields": ["coins", "location"]}.',
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
            'Built-in HUD fields are coins, wallet, location, time, and weather.',
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
          'Use "coins" or {"type": "cvar", "key": "renown", "label": "Renown"}.',
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
  for (const [id, value] of Object.entries(locations)) {
    const location = asRecord(value);
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
        'Policies',
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

  const distribution = asRecord(config.distribution);
  const total = ['combat', 'quest', 'gather'].reduce((sum, key) => {
    const value = distribution[key];
    if (value == null) return sum;
    if (!isNonNegativeInteger(value)) {
      issues.push(
        issue(
          'error',
          'exploration.distribution_value',
          'Policies',
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
        'Policies',
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
        'Policies',
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
          'Policies',
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
          'Policies',
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
        'Policies',
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
          'Policies',
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
          'Policies',
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
          'Policies',
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
          'Policies',
          `subsystems.exploration.command_config.${command}.cooldown_seconds`,
          'Cooldown must be non-negative',
          'Cooldown seconds must be a non-negative integer.',
        ),
      );
    }
  }

  const repeat = asRecord(model.policies.exploration).avoid_repeat_encounters;
  if (typeof repeat === 'string' && !VALID_REPEAT.includes(repeat)) {
    issues.push(
      issue(
        'error',
        'policies.exploration.repeat',
        'Policies',
        'policies.exploration.avoid_repeat_encounters',
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
  if (travel.enabled !== true) return;
  const commands = asRecord(travel.commands);
  const locationCommandOn = commands.location === true;
  const travelCommandOn = commands.travel === true;
  const implementedTravelOn = locationCommandOn || travelCommandOn;
  const locations = asRecord(model.world_data.locations);
  const defaultLocation = model.world_data.default_location;

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
  if (implementedTravelOn && Object.keys(locations).length === 0) {
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

  const rawPaths = model.world_data.paths;
  if (travelCommandOn && rawPaths != null && !Array.isArray(rawPaths)) {
    issues.push(
      issue(
        'error',
        'world.paths.type',
        'World',
        'world_data.paths',
        'Paths must be a list',
        '`!travel` route planning expects `world_data.paths` to be a list of path objects.',
      ),
    );
  }
  if (travelCommandOn && Array.isArray(rawPaths)) {
    rawPaths.forEach((entry, index) => {
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
      if (Object.keys(locations).length > 0 && (!locations[from] || !locations[to])) {
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
    });
  }
  if (commands.time === true) {
    issues.push(
      issue(
        'warning',
        'travel.time_planned',
        'Subsystems',
        'subsystems.travel.commands.time',
        'Time command is still planned',
        '`!time` is not part of the current travel/location implementation slice.',
      ),
    );
  }
  if (commands.weather === true) {
    issues.push(
      issue(
        'warning',
        'travel.weather_planned',
        'Subsystems',
        'subsystems.travel.commands.weather',
        'Weather command is still planned',
        '`!weather` is not part of the current travel/location implementation slice.',
      ),
    );
  }
}

function validateDowntime(model: ConfigModel, issues: ConfigIssue[]) {
  const downtime = asRecord(model.subsystems.downtime);
  const policy = asRecord(asRecord(model.policies).downtime);
  const mode = policy.mode;
  const acquisition = policy.acquisition;

  if (typeof mode === 'string' && !VALID_DOWNTIME_MODES.includes(mode)) {
    issues.push(
      issue(
        'error',
        'downtime.mode',
        'Policies',
        'policies.downtime.mode',
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
        'Policies',
        'subsystems.downtime.enabled',
        'Tracked downtime needs the subsystem enabled',
        '`policies.downtime.mode: tracked` uses the downtime cvar ledger.',
        'Enable the downtime subsystem, or switch downtime mode to off/manual.',
      ),
    );
  }

  const maxWorkdays = policy.max_workdays;
  if (maxWorkdays != null && (!isNonNegativeInteger(maxWorkdays) || Number(maxWorkdays) < 1)) {
    issues.push(
      issue(
        'error',
        'downtime.max_workdays',
        'Policies',
        'policies.downtime.max_workdays',
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
        'Policies',
        'policies.downtime.acquisition',
        'Invalid downtime acquisition mode',
        '`acquisition` must be manual, world_clock, or journey.',
      ),
    );
  }
  if (acquisition === 'world_clock' && asRecord(model.policies.time).mode !== 'world_clock') {
    issues.push(
      issue(
        'warning',
        'downtime.acquisition_world_clock',
        'Policies',
        'policies.downtime.acquisition',
        'World-clock downtime needs world-clock time',
        'Downtime acquisition from time is deferred unless `policies.time.mode` is world_clock.',
      ),
    );
  }
  if (acquisition === 'journey' && asRecord(model.subsystems.travel).enabled !== true) {
    issues.push(
      issue(
        'warning',
        'downtime.acquisition_journey',
        'Policies',
        'policies.downtime.acquisition',
        'Journey downtime needs travel enabled',
        'Downtime acquisition from journeys needs the travel subsystem.',
      ),
    );
  }

  const config = asRecord(downtime.config);
  for (const key of ['workday_hours', 'workweek_days']) {
    const value = config[key];
    if (value != null && (!isNonNegativeInteger(value) || Number(value) < 1)) {
      issues.push(
        issue(
          'error',
          `downtime.${key}`,
          'Policies',
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
        'Policies',
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
        'Policies',
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
        'Policies',
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
        'Policies',
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
        'Policies',
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
          'Policies',
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
            'Policies',
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
          'Policies',
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
          'Policies',
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
          'Policies',
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
          'Policies',
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
          'Policies',
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
        'Policies',
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
          'Policies',
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
            'Policies',
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
          'Policies',
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
          'Policies',
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
            'Policies',
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
            'Policies',
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
            'Policies',
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
          'Policies',
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
          : 'Recipes do not have a built-in engine catalogue source.',
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
        'Policies',
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
        'Policies',
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
        'Policies',
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
          'Policies',
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
          'Policies',
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
        'Policies',
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
        'Policies',
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
          'Policies',
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
    asRecord(asRecord(model.policies).downtime).mode === 'tracked' &&
    asRecord(model.subsystems.downtime).enabled === true;
  const craftingPolicy = asRecord(asRecord(model.policies).crafting);
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
    null,
    false,
    issues,
  );

  validateCraftingResourceModes(craftingPolicy.resources, 'policies.crafting.resources', issues);
  validateItemHandling(craftingPolicy.item_handling, 'policies.crafting.item_handling', issues);
  validateItemHandling(
    craftingConfig.item_handling,
    'subsystems.crafting.config.item_handling',
    issues,
  );
  validateItemHandling(
    asRecord(asRecord(model.policies).inventory).item_handling,
    'policies.inventory.item_handling',
    issues,
  );

  const globalResources = asRecord(craftingPolicy.resources);
  const legacyDowntimeCheck = craftingPolicy.require_downtime_before_roll === true;
  const activeNeedsDowntime = enabledCommands.some((command) => {
    const commandResources = asRecord(
      asRecord(asRecord(crafting.command_config)[command]).resources,
    );
    const mode =
      commandResources.downtime ??
      globalResources.downtime ??
      (legacyDowntimeCheck ? 'check' : 'manual');
    return mode === 'check' || mode === 'deduct';
  });

  if (craftingActive && activeNeedsDowntime && !downtimeTracked) {
    issues.push(
      issue(
        'warning',
        'crafting.downtime_not_tracked',
        'Policies',
        globalResources.downtime != null
          ? 'policies.crafting.resources.downtime'
          : 'policies.crafting.require_downtime_before_roll',
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
          'Policies',
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
          'Policies',
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
          'Policies',
          `subsystems.crafting.command_config.${command}.workdays_cost`,
          'Crafting workdays need tracked downtime',
          'Workday costs can only be enforced when downtime mode is tracked and the downtime subsystem is enabled.',
        ),
      );
    }
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
    policies: {
      exploration: { enforce_cooldowns: true, avoid_repeat_encounters: 'off' },
      downtime: { mode: 'off', max_workdays: null, acquisition: 'manual' },
      crafting: {
        require_downtime_before_roll: true,
        auto_deduct_materials: false,
        auto_deduct_gold: false,
        resources: {
          gold: 'manual',
          materials: 'manual',
          items: 'manual',
          downtime: 'check',
          spell_slot: 'manual',
        },
        item_handling: null,
      },
      inventory: {
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
      display: {
        footer_behaviour: 'balanced',
        command_thumbnail: 'default',
        helpful_tips: [],
        credits: null,
      },
      player_setup: {
        enabled: true,
        require_character: true,
        hud: { enabled: true, fields: ['coins', 'wallet', 'location', 'time', 'weather'] },
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
