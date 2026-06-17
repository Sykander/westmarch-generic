export type AnyRecord = Record<string, unknown>;

export type ConfigModel = {
  config_version?: string;
  rules_version?: string;
  display: AnyRecord;
  subsystems: Record<string, AnyRecord>;
  policies: AnyRecord;
  world_data: AnyRecord;
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
const GVAR_ID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const DEFAULT_MODEL: ConfigModel = {
  display: {},
  subsystems: {},
  policies: {},
  world_data: {},
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
  const model: ConfigModel = {
    ...DEFAULT_MODEL,
    config_version: parseStringAssignment(cleaned, 'config_version'),
    rules_version: parseStringAssignment(cleaned, 'rules_version'),
    display: parseRecordAssignment(cleaned, 'display', issues),
    subsystems: mergeSubsystemDefaults(parsedSubsystems),
    policies: parseRecordAssignment(cleaned, 'policies', issues),
    world_data: parseRecordAssignment(cleaned, 'world_data', issues),
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

function validateCrafting(model: ConfigModel, issues: ConfigIssue[]) {
  const crafting = asRecord(model.subsystems.crafting);
  const commands = asRecord(crafting.commands);
  const enabledCommands = Object.entries(commands).filter(([, value]) => value === true);
  const craftingActive = crafting.enabled === true && enabledCommands.length > 0;
  const downtimeTracked =
    asRecord(asRecord(model.policies).downtime).mode === 'tracked' &&
    asRecord(model.subsystems.downtime).enabled === true;
  const craftingPolicy = asRecord(asRecord(model.policies).crafting);

  if (craftingActive && craftingPolicy.require_downtime_before_roll === true && !downtimeTracked) {
    issues.push(
      issue(
        'warning',
        'crafting.downtime_not_tracked',
        'Policies',
        'policies.crafting.require_downtime_before_roll',
        'Crafting downtime is not tracked',
        'Crafting can require downtime before rolls only when downtime mode is tracked and the downtime subsystem is enabled.',
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
    const workdaysCost = asRecord(value).workdays_cost;
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
