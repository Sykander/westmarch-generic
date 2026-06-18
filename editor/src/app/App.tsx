import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import westmarchPackage from '../../../package.json';
import {
  CheckCircle2,
  Clipboard,
  Compass,
  Download,
  ExternalLink,
  FileCode2,
  FileDown,
  FileText,
  Radio,
  Save,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  applyIssueFix,
  createBlankConfig,
  parseConfig,
  readPath,
  serializeConfig,
  updatePath,
  validateConfig,
} from '../lib/config';
import type { AnyRecord, ConfigIssue, ConfigModel } from '../lib/config';
import {
  createGvar,
  fetchGvar,
  makeGvarDashboardUrl,
  normalizeGvarId,
  updateGvar,
} from '../lib/avrae';
import { AvraeTokenHelp } from '../components/AvraeTokenHelp';
import { HelpTip } from '../components/HelpTip';
import { HelpDialog } from '../components/HelpDialog';
import { JsonField } from '../components/JsonField';
import { GvarSourceRows } from '../components/GvarSourceRows';
import {
  ColourField,
  FooterBehaviourField,
  FooterTextListField,
  SectionTitle,
  SelectField,
  TextField,
} from '../components/FormFields';
import { IssueSummary, RunSteps, SectionCta, severityIcon } from '../components/WorkflowPanels';
import { EncounterRowBuilder } from '../components/EncounterRowBuilder';
import { CustomTemplateBuilder } from '../components/CustomTemplateBuilder';
import {
  ENGINE_BIOMES,
  ENGINE_BIOME_NOTES,
  customGvarError,
  engineBiomeGvarId,
  formatBiomeName,
  normaliseBiomeCode,
  presetFromGvarId,
} from '../domain/biomes';
import { DISPLAY_OVERRIDE_HELP, monsterArtSelectValue } from '../domain/display';
import { SUBSYSTEM_DEFINITIONS } from '../domain/subsystems';
import {
  ABILITY_OPTIONS,
  CHECK_OPTIONS,
  ENCOUNTER_TEMPLATES,
  SAVE_OPTIONS,
  type CompactEncounterRow,
  type EncounterTemplateField,
  type EncounterTemplate,
} from '../domain/encounters';
import { asRecord } from '../lib/records';
import {
  discoverGvarReferences,
  discoverGvarReferencesFromSource,
  kindFromSource,
  sourceRowsWithBase,
  type GvarReference,
  type LoadedGvarSource,
} from '../lib/gvarSources';
import { SECTIONS, sectionFor, type Section } from './sections';
import type { RunStep, SubsystemDefinition } from './types';

const BRAND_LOGO_URL = `${import.meta.env.BASE_URL}westmarch-assets/brand/logo.png`;
const WESTMARCH_VERSION = westmarchPackage.version;
const CRAFTING_RESOURCE_MODES = ['manual', 'check', 'deduct'];
const ITEM_HANDLING_MODES = ['manual', 'bags'];
const CRAFTING_RECIPE_MODES = ['mixed', 'raw', 'recipes'];
const CRAFTING_CATALOGUE_DEFAULTS = {
  items: 'engine:catalogues/items',
  potions: 'engine:catalogues/potions',
  spells: 'engine:catalogues/spells',
  magic_items: 'engine:catalogues/magic_items',
  recipes: null,
};
const CRAFTING_CHECK_DEFAULTS = {
  craft: { mode: 'none', skill: null, ability: null, dc: null, require_success: true },
  brew: { mode: 'none', skill: 'nature', ability: null, dc: null, require_success: true },
  enchant: { mode: 'none', skill: 'arcana', ability: null, dc: null, require_success: true },
  scribe: { mode: 'none', skill: 'arcana', ability: null, dc: null, require_success: true },
};
const CRAFTING_TOOL_POLICY_DEFAULTS = {
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
};
const HUD_FIELD_OPTIONS = [
  'coins',
  'coin',
  'coinpurse',
  'gp',
  'wallet',
  'location',
  'time',
  'weather',
];
const CRAFTING_TOOL_OPTIONS = [
  "Alchemist's Supplies",
  "Brewer's Supplies",
  "Calligrapher's Supplies",
  "Carpenter's Tools",
  "Cartographer's Tools",
  "Cobbler's Tools",
  "Cook's Utensils",
  "Glassblower's Tools",
  "Jeweler's Tools",
  "Leatherworker's Tools",
  "Mason's Tools",
  "Painter's Supplies",
  "Potter's Tools",
  "Smith's Tools",
  "Tinker's Tools",
  "Weaver's Tools",
  "Woodcarver's Tools",
  'Disguise Kit',
  'Forgery Kit',
  'Herbalism Kit',
  "Navigator's Tools",
  "Poisoner's Kit",
  "Thieves' Tools",
  'Vehicles (land)',
  'Vehicles (water)',
];
const CRAFTING_CHECK_SKILL_OPTIONS = CHECK_OPTIONS.filter((option) => option.ability).map(
  (option) => option.value,
);
const CRAFTING_CHECK_DC_OPTIONS = ['', '5', '10', '12', '13', '15', '17', '20', '25', '30'];

const STARTER_SNIPPET = `subsystems = {
    "exploration": {
        "enabled": False,
        "commands": {"enc": False, "forage": False, "fish": False, "mine": False, "lumber": False, "hunt": False, "loot": False},
        "config": {
            "enc_biome_source": "auto",
            "distribution_policy": "random",
            "distribution": {"combat": 25, "quest": 25, "gather": 50},
            "repeat_exclude_window": 5,
            "monster_images": {"hunt": "thumbnail", "loot": "thumbnail"},
            "show_check_dcs": {"hunt": True, "loot": True},
        },
    },
    "crafting": {
        "enabled": False,
        "commands": {"craft": False, "brew": False, "enchant": False, "scribe": False},
            "config": {
                "rules_version": None,
                "recipe_mode": "mixed",
                "require_known_spell": True,
                "catalogues": {
                "items": "engine:catalogues/items",
                "potions": "engine:catalogues/potions",
                "spells": "engine:catalogues/spells",
                "magic_items": "engine:catalogues/magic_items",
                "recipes": None,
            },
            "checks": {
                "craft": {"mode": "none", "skill": None, "ability": None, "dc": None, "require_success": True},
                "brew": {"mode": "none", "skill": "nature", "ability": None, "dc": None, "require_success": True},
                "enchant": {"mode": "none", "skill": "arcana", "ability": None, "dc": None, "require_success": True},
                "scribe": {"mode": "none", "skill": "arcana", "ability": None, "dc": None, "require_success": True},
            },
            "tool_policy": {
                "craft": {"mode": "off", "tools": [], "require_proficiency": True, "require_kit": False},
                "brew": {"mode": "off", "tools": ["Herbalism Kit", "Alchemist's Supplies", "Brewer's Supplies"], "require_proficiency": True, "require_kit": False},
                "enchant": {"mode": "off", "tools": [], "require_proficiency": True, "require_kit": False},
                "scribe": {"mode": "off", "tools": ["Calligrapher's Supplies"], "require_proficiency": True, "require_kit": False},
            },
            "item_handling": None,
        },
        "command_config": {"craft": {}, "brew": {}, "enchant": {}, "scribe": {}},
    },
}

world_data = {
    "biomes": {},
    "locations": {},
    "paths": [],
}

policies = {
    "exploration": {"enforce_cooldowns": True, "avoid_repeat_encounters": "off"},
    "downtime": {"mode": "off", "max_workdays": None, "acquisition": "manual"},
    "crafting": {
        "require_downtime_before_roll": True,
        "auto_deduct_materials": False,
        "auto_deduct_gold": False,
        "resources": {"gold": "manual", "materials": "manual", "items": "manual", "downtime": "check", "spell_slot": "manual"},
        "item_handling": None,
    },
    "inventory": {
        "item_handling": {
            "mode": "manual",
            "default_bag": "Equipment",
            "equipment_bag": "Equipment",
            "crafted_bag": "Equipment",
            "potions_bag": "Potions",
            "scrolls_bag": "Scrolls",
            "magic_items_bag": "Equipment",
            "materials_bag": "Materials",
        },
    },
    "display": {"footer_behaviour": "balanced", "command_thumbnail": "default", "helpful_tips": [], "credits": None},
    "player_setup": {
        "enabled": True,
        "require_character": True,
        "hud": {"enabled": True, "fields": ["coins", "wallet", "location", "time", "weather"]},
        "checks": [],
    },
}
`;

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getInitialConfigId() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('westmarch_config') ?? '';
  if (!value) return '';
  try {
    return normalizeGvarId(value);
  } catch {
    return value;
  }
}

function makeShareLink(configId: string) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  try {
    const gvarId = normalizeGvarId(configId);
    if (gvarId) url.searchParams.set('westmarch_config', gvarId);
  } catch {
    // Invalid ids cannot produce useful share links.
  }
  return url.toString();
}

function focusNextCta() {
  window.setTimeout(() => {
    document.querySelector<HTMLButtonElement>('[data-next-cta]')?.focus();
  }, 0);
}

function uniqueReferences(references: GvarReference[], rootId: string) {
  const seen = new Set([rootId].filter(Boolean));
  return references.filter((reference) => {
    if (seen.has(reference.id)) return false;
    seen.add(reference.id);
    return true;
  });
}

function gvarFilename(id: string, kind: string) {
  const suffix = kind === 'json' ? 'json' : 'gvar';
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safeId || 'westmarch_config'}.${suffix}`;
}

function fieldForTemplateArg(arg: string): EncounterTemplate['fields'][number] {
  const lower = arg.toLowerCase();
  if (['dc', 'cr', 'qty', 'quantity'].includes(lower)) {
    return {
      key: arg,
      label: titleFromSlug(arg),
      type: 'number',
      inputType: lower === 'dc' ? 'dc' : 'number',
    };
  }
  if (lower === 'kind') {
    return {
      key: arg,
      label: 'Kind',
      type: 'select',
      inputType: 'encounter_kind',
      values: ['combat', 'quest', 'gather'],
    };
  }
  if (['skill', 'check', 'check_name', 'skill_name'].includes(lower)) {
    return {
      key: arg,
      label: titleFromSlug(arg),
      type: 'select',
      inputType: 'skill_name',
      values: CHECK_OPTIONS.map((option) => option.label),
    };
  }
  if (['save', 'save_name'].includes(lower)) {
    return {
      key: arg,
      label: titleFromSlug(arg),
      type: 'select',
      inputType: 'save_name',
      values: SAVE_OPTIONS.map((option) => option.label),
    };
  }
  if (['description', 'text', 'body'].includes(lower)) {
    return { key: arg, label: titleFromSlug(arg), type: 'textarea', inputType: 'text_block' };
  }
  if (['thumb', 'thumbnail', 'image', 'image_url', 'url'].includes(lower)) {
    return { key: arg, label: titleFromSlug(arg), type: 'text', inputType: 'url' };
  }
  return { key: arg, label: titleFromSlug(arg), type: 'text', inputType: 'text' };
}

function templateFieldFromMeta(value: unknown): EncounterTemplateField | null {
  const record = asRecord(value);
  const key = String(record.key ?? '').trim();
  if (!key) return null;
  const fallback = fieldForTemplateArg(key);
  const rawType = String(record.type ?? fallback.type);
  const type = ['text', 'textarea', 'number', 'select'].includes(rawType)
    ? (rawType as EncounterTemplateField['type'])
    : fallback.type;
  const inputType = String(record.inputType ?? record.input_type ?? fallback.inputType);
  return {
    key,
    label: String(record.label ?? fallback.label),
    type,
    inputType: inputType ? (inputType as EncounterTemplateField['inputType']) : fallback.inputType,
    values: asStringList(record.values ?? fallback.values),
  };
}

function templateFieldsFromRecord(record: AnyRecord, metaRecord: AnyRecord, args: string[]) {
  const rawFields = Array.isArray(record.fields)
    ? record.fields
    : Array.isArray(metaRecord.fields)
      ? metaRecord.fields
      : null;
  const fields = rawFields
    ? rawFields
        .map(templateFieldFromMeta)
        .filter((field): field is EncounterTemplateField => Boolean(field))
    : [];
  return fields.length > 0 ? fields : args.map(fieldForTemplateArg);
}

function templateFieldToMeta(field: EncounterTemplateField) {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    inputType: field.inputType,
    values: field.values,
  };
}

function customTemplatesFromConfig(config: ConfigModel): EncounterTemplate[] {
  const templates = asRecord(readPath(config, 'encounter_templates'));
  const meta = asRecord(readPath(config, 'encounter_template_meta'));

  return Object.entries(templates).map(([id, value]) => {
    const record = asRecord(value);
    const metaRecord = asRecord(meta[id]);
    const args = asStringList(record.args ?? metaRecord.args);
    const label = String(record.label ?? metaRecord.label ?? titleFromSlug(id));
    const description = String(
      record.description ?? metaRecord.description ?? 'Custom encounter template.',
    );
    const fields = templateFieldsFromRecord(record, metaRecord, args);

    return {
      id,
      label,
      description,
      args: fields.map((field) => field.key),
      custom: true,
      functionName: String(record.function_name ?? metaRecord.function_name ?? id),
      source: String(record.source ?? ''),
      fields,
    };
  });
}

function templatesToConfig(templates: EncounterTemplate[]) {
  return Object.fromEntries(
    templates.map((template) => [
      template.id,
      {
        function_name: template.functionName ?? template.id,
        source: template.source ?? '',
        args: template.args ?? template.fields.map((field) => field.key),
        fields: template.fields.map(templateFieldToMeta),
        label: template.label,
        description: template.description,
      },
    ]),
  );
}

function templatesToMeta(templates: EncounterTemplate[]) {
  return Object.fromEntries(
    templates.map((template) => [
      template.id,
      {
        function_name: template.functionName ?? template.id,
        label: template.label,
        description: template.description,
        args: template.args ?? template.fields.map((field) => field.key),
        fields: template.fields.map(templateFieldToMeta),
      },
    ]),
  );
}

export function App() {
  const [section, setSection] = useState<Section>('setup');
  const [configId, setConfigId] = useState(getInitialConfigId);
  const [token, setToken] = useState('');
  const [rawSource, setRawSource] = useState('');
  const [relatedGvars, setRelatedGvars] = useState<LoadedGvarSource[]>([]);
  const [config, setConfig] = useState<ConfigModel | null>(null);
  const [rawMode, setRawMode] = useState(false);
  const [status, setStatus] = useState('No config loaded');
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const parsed = useMemo(() => parseConfig(rawSource), [rawSource]);

  useEffect(() => {
    if (parsed.model) setConfig(parsed.model);
  }, [parsed.model]);

  useEffect(() => {
    if (!parsed.model || token.trim()) return;
    setRelatedGvars((current) => {
      const existing = new Map(current.map((row) => [row.id, row]));
      const placeholders = uniqueReferences(discoverGvarReferences(parsed.model), '').map(
        (reference) =>
          existing.get(reference.id) ?? {
            ...reference,
            value: '',
            loaded: false,
            error:
              'Not loaded because AVRAE_TOKEN is empty. Add your Avrae token, then read from Avrae to load this gvar.',
          },
      );
      if (
        placeholders.length === current.length &&
        placeholders.every((row, index) => row.id === current[index]?.id)
      ) {
        return current;
      }
      return placeholders;
    });
  }, [parsed.model, token]);

  const issues = useMemo(() => validateConfig(config, parsed.issues), [config, parsed.issues]);

  const serialized = useMemo(
    () => (config ? serializeConfig(config) : rawSource),
    [config, rawSource],
  );
  const setupSourceRows = useMemo(
    () => sourceRowsWithBase({ configId, rawSource, related: relatedGvars }),
    [configId, rawSource, relatedGvars],
  );
  const exportSourceRows = useMemo(
    () =>
      sourceRowsWithBase({
        configId,
        rawSource,
        serialized,
        related: relatedGvars,
      }),
    [configId, rawSource, relatedGvars, serialized],
  );

  const errorCount = issues.filter((item) => item.severity === 'error').length;
  const warningCount = issues.filter((item) => item.severity === 'warning').length;
  const canMovePastSetup = Boolean(config || rawSource.trim());

  function updateConfig(path: string, value: unknown) {
    setConfig((current) => (current ? updatePath(current, path, value) : current));
  }

  function updateSourceRow(id: string, value: string) {
    const baseId = setupSourceRows[0]?.id;
    if (id === baseId) {
      setRawSource(value);
      return;
    }

    setRelatedGvars((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, value, kind: kindFromSource(value, row.kind), loaded: true }
          : row,
      ),
    );
  }

  function upsertRelatedGvar(next: LoadedGvarSource) {
    setRelatedGvars((current) => {
      const index = current.findIndex((row) => row.id === next.id);
      if (index < 0) return [...current, next];
      return current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row));
    });
  }

  async function loadRelatedGvarsForSource(
    rootId: string,
    source: string,
    model: ConfigModel | null,
  ) {
    const root = (() => {
      try {
        return normalizeGvarId(rootId);
      } catch {
        return '';
      }
    })();
    const initialReferences = uniqueReferences(
      model
        ? discoverGvarReferences(model)
        : discoverGvarReferencesFromSource(source, 'westmarch_config'),
      root,
    );

    if (!token.trim()) {
      const placeholders = initialReferences.map((reference) => ({
        ...reference,
        value: '',
        loaded: false,
        error:
          'Not loaded because AVRAE_TOKEN is empty. Add your Avrae token, then read from Avrae to load this gvar.',
      }));
      setRelatedGvars(placeholders);
      setStatus('Add AVRAE_TOKEN to load referenced gvars from Avrae.');
      return placeholders;
    }

    const queued = [...initialReferences];
    const seen = new Set(
      [root, ...initialReferences.map((reference) => reference.id)].filter(Boolean),
    );
    const loaded: LoadedGvarSource[] = [];
    const maxRelatedGvars = 40;

    while (queued.length > 0 && loaded.length < maxRelatedGvars) {
      const reference = queued.shift();
      if (!reference) continue;

      try {
        const gvar = await fetchGvar(reference.id, token.trim());
        const value = String(gvar.value ?? '');
        const entry: LoadedGvarSource = {
          ...reference,
          kind: kindFromSource(value, reference.kind),
          value,
          loaded: true,
        };
        loaded.push(entry);

        for (const child of discoverGvarReferencesFromSource(value, reference.path)) {
          if (seen.has(child.id)) continue;
          seen.add(child.id);
          queued.push(child);
        }
      } catch (error) {
        loaded.push({
          ...reference,
          value: '',
          loaded: false,
          error: error instanceof Error ? error.message : 'Could not load referenced gvar.',
        });
      }
    }

    setRelatedGvars(loaded);
    return loaded;
  }

  async function loadFromAvrae() {
    let gvarId = '';
    try {
      gvarId = normalizeGvarId(configId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid gvar id.';
      setStatus(message);
      setSteps([{ label: 'Read gvar from Avrae', state: 'failed', detail: message }]);
      return;
    }
    if (!gvarId || !token.trim()) {
      setStatus('Config id and token are required to read from Avrae.');
      return;
    }
    setConfigId(gvarId);
    setIsBusy(true);
    const nextSteps: RunStep[] = [
      { label: 'Read westmarch_config from Avrae', state: 'running' },
      { label: 'Discover referenced gvars', state: 'pending' },
      { label: 'Read referenced gvars', state: 'pending' },
    ];
    setSteps([...nextSteps]);
    try {
      const gvar = await fetchGvar(gvarId, token.trim());
      const source = String(gvar.value ?? '');
      const parsedRemote = parseConfig(source);
      setRawSource(source);
      if (parsedRemote.model) setConfig(parsedRemote.model);
      nextSteps[0] = { label: 'Read westmarch_config from Avrae', state: 'success' };
      nextSteps[1] = { label: 'Discover referenced gvars', state: 'running' };
      setSteps([...nextSteps]);

      const references = uniqueReferences(
        parsedRemote.model
          ? discoverGvarReferences(parsedRemote.model)
          : discoverGvarReferencesFromSource(source, 'westmarch_config'),
        gvarId,
      );
      nextSteps[1] = {
        label: 'Discover referenced gvars',
        state: 'success',
        detail: `${references.length} reference(s)`,
      };
      nextSteps[2] = { label: 'Read referenced gvars', state: 'running' };
      setSteps([...nextSteps]);

      const loaded = await loadRelatedGvarsForSource(gvarId, source, parsedRemote.model);
      const failed = loaded.filter((row) => row.error).length;
      nextSteps[2] = {
        label: 'Read referenced gvars',
        state: failed ? 'warning' : 'success',
        detail: loaded.length
          ? `${loaded.length - failed}/${loaded.length} loaded`
          : 'No references',
      };
      setSteps([...nextSteps]);
      setStatus(
        loaded.length
          ? `Loaded config and ${loaded.length - failed} referenced gvar(s).`
          : 'Loaded from Avrae. Review the source, then use Next to continue.',
      );
      focusNextCta();
    } catch (error) {
      const index = nextSteps.findIndex((item) => item.state === 'running');
      if (index >= 0) {
        nextSteps[index] = {
          ...nextSteps[index],
          state: 'failed',
          detail: error instanceof Error ? error.message : 'Unknown error',
        };
      }
      setStatus(error instanceof Error ? error.message : 'Avrae load failed');
      setSteps([...nextSteps]);
    } finally {
      setIsBusy(false);
    }
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setStatus(`${label} copied`);
  }

  async function publishToAvrae() {
    let gvarId = '';
    try {
      gvarId = normalizeGvarId(configId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid gvar id.';
      setStatus(message);
      setSteps([{ label: 'Publish to Avrae', state: 'failed', detail: message }]);
      return;
    }
    if (!gvarId || !token.trim()) {
      setStatus('Config id and token are required to publish.');
      return;
    }
    if (errorCount > 0) {
      setStatus('Fix blocking errors before publishing. Open Check to review them.');
      return;
    }
    setConfigId(gvarId);

    setIsBusy(true);
    const publishTargets = [
      { id: gvarId, label: 'westmarch_config', value: serialized },
      ...relatedGvars
        .filter((row) => row.loaded && !row.error && row.value.trim())
        .map((row) => ({ id: row.id, label: row.label, value: row.value })),
    ];
    const nextSteps: RunStep[] = [
      { label: 'Validate config', state: 'running' },
      { label: 'Serialize gvar body', state: 'pending' },
      ...publishTargets.map((target) => ({
        label: `Publish ${target.label}`,
        state: 'pending' as const,
      })),
      ...publishTargets.map((target) => ({
        label: `Verify ${target.label}`,
        state: 'pending' as const,
      })),
    ];
    setSteps([...nextSteps]);

    try {
      nextSteps[0] = {
        label: 'Validate config',
        state: warningCount > 0 ? 'warning' : 'success',
        detail: warningCount > 0 ? `${warningCount} warning(s)` : undefined,
      };
      nextSteps[1] = { label: 'Serialize gvar body', state: 'success' };
      for (const [index, target] of publishTargets.entries()) {
        const stepIndex = 2 + index;
        nextSteps[stepIndex] = { label: `Publish ${target.label}`, state: 'running' };
        setSteps([...nextSteps]);

        await updateGvar(target.id, token.trim(), target.value);
        nextSteps[stepIndex] = { label: `Publish ${target.label}`, state: 'success' };
        setSteps([...nextSteps]);
      }

      for (const [index, target] of publishTargets.entries()) {
        const stepIndex = 2 + publishTargets.length + index;
        nextSteps[stepIndex] = { label: `Verify ${target.label}`, state: 'running' };
        setSteps([...nextSteps]);

        const remote = await fetchGvar(target.id, token.trim());
        const verified = String(remote.value ?? '') === target.value;
        nextSteps[stepIndex] = {
          label: `Verify ${target.label}`,
          state: verified ? 'success' : 'warning',
          detail: verified ? undefined : 'Remote body did not exactly match export text.',
        };
        setSteps([...nextSteps]);
      }

      const verifyWarnings = nextSteps.filter((step) => step.state === 'warning').length;
      setStatus(
        verifyWarnings
          ? `Publish complete with ${verifyWarnings} warning(s).`
          : `Publish complete for ${publishTargets.length} gvar(s).`,
      );
    } catch (error) {
      const index = nextSteps.findIndex((item) => item.state === 'running');
      if (index >= 0) {
        nextSteps[index] = {
          ...nextSteps[index],
          state: 'failed',
          detail: error instanceof Error ? error.message : 'Unknown error',
        };
      }
      setSteps([...nextSteps]);
      setStatus(error instanceof Error ? error.message : 'Publish failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={BRAND_LOGO_URL} alt="" aria-hidden="true" />
          <div className="brand-copy">
            <h1>Westmarch Config Editor</h1>
            <span>Configuring Westmarch v{WESTMARCH_VERSION}</span>
          </div>
        </div>
        <div className="top-actions">
          <span className="status-text" role="status" aria-live="polite">
            {status}
          </span>
          <span className={errorCount ? 'badge danger' : 'badge ok'}>{errorCount} errors</span>
          <span className={warningCount ? 'badge warn' : 'badge ok'}>{warningCount} warnings</span>
          <button className="icon-button" type="button" onClick={() => setRawMode(!rawMode)}>
            <FileCode2 size={17} aria-hidden="true" />
            {rawMode ? 'Guided' : 'Raw'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <nav className="sidebar" aria-label="Editor sections">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="main-pane">
          {rawMode ? (
            <RawSourceView
              rawSource={rawSource}
              setRawSource={setRawSource}
              sourceRows={setupSourceRows}
              updateSourceRow={updateSourceRow}
              parsedMode={parsed.mode}
            />
          ) : (
            <>
              {section === 'setup' && (
                <SetupView
                  configId={configId}
                  setConfigId={setConfigId}
                  token={token}
                  setToken={setToken}
                  sourceRows={setupSourceRows}
                  updateSourceRow={updateSourceRow}
                  loadFromAvrae={loadFromAvrae}
                  isBusy={isBusy}
                  onBlank={() => {
                    const blank = createBlankConfig();
                    setConfig(blank);
                    setRawSource(serializeConfig(blank));
                    setRelatedGvars([]);
                    setStatus('Started new config. Use Next when you are ready to continue.');
                    focusNextCta();
                  }}
                  onStarter={() => {
                    setRawSource(STARTER_SNIPPET);
                    setRelatedGvars([]);
                    setStatus('Starter snippet loaded. Use Next when you are ready to continue.');
                    focusNextCta();
                  }}
                />
              )}
              {section === 'check' && (
                <CheckView
                  issues={issues}
                  setSection={setSection}
                  applyFix={(code) => {
                    if (config) setConfig(applyIssueFix(config, code));
                  }}
                />
              )}
              {section === 'display' && config && (
                <DisplayView config={config} updateConfig={updateConfig} />
              )}
              {section === 'subsystems' && config && (
                <SubsystemsView config={config} updateConfig={updateConfig} />
              )}
              {section === 'policies' && config && (
                <PoliciesView config={config} updateConfig={updateConfig} />
              )}
              {section === 'world' && config && (
                <WorldView
                  config={config}
                  updateConfig={updateConfig}
                  token={token}
                  setStatus={setStatus}
                  setSteps={setSteps}
                  upsertRelatedGvar={upsertRelatedGvar}
                  relatedGvars={relatedGvars}
                  updateRelatedGvarSource={updateSourceRow}
                />
              )}
              {section === 'biomes' && config && (
                <BiomesView
                  config={config}
                  updateConfig={updateConfig}
                  token={token}
                  setStatus={setStatus}
                  setSteps={setSteps}
                  upsertRelatedGvar={upsertRelatedGvar}
                  relatedGvars={relatedGvars}
                  updateRelatedGvarSource={updateSourceRow}
                />
              )}
              {section === 'export' && (
                <ExportView
                  serialized={serialized}
                  configId={configId}
                  shareLink={makeShareLink(configId)}
                  sourceRows={exportSourceRows}
                  steps={steps}
                  publishToAvrae={publishToAvrae}
                  copy={copy}
                  canPublish={Boolean(config && configId.trim() && token.trim())}
                  isBusy={isBusy}
                />
              )}
              {!config && section !== 'setup' && <EmptyState setSection={setSection} />}
              <SectionCta
                section={section}
                setSection={setSection}
                canMovePastSetup={canMovePastSetup}
                errorCount={errorCount}
                canPublish={Boolean(config && configId.trim() && token.trim())}
                isBusy={isBusy}
                publishToAvrae={publishToAvrae}
              />
            </>
          )}
        </main>

        <aside className="right-pane">
          <IssueSummary issues={issues} setSection={setSection} />
          <RunSteps steps={steps} />
        </aside>
      </div>
    </div>
  );
}

function SetupView(props: {
  configId: string;
  setConfigId: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
  sourceRows: LoadedGvarSource[];
  updateSourceRow: (id: string, value: string) => void;
  loadFromAvrae: () => void;
  isBusy: boolean;
  onBlank: () => void;
  onStarter: () => void;
}) {
  const gvarDashboardUrl = useMemo(() => makeGvarDashboardUrl(props.configId), [props.configId]);

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<UploadCloud size={20} />}
        title="Setup"
        help="Load with a token, paste a gvar body, or start from a small literal starter."
      />
      <div className="form-grid">
        <label className="field">
          <span>
            westmarch_config
            <HelpTip label="westmarch_config help">
              Use the bare config gvar UUID from your server svar. Pasting an editor share link is
              also okay; the editor will extract the UUID.
            </HelpTip>
          </span>
          <div className="field-with-action">
            <input
              value={props.configId}
              onChange={(event) => props.setConfigId(event.target.value)}
              placeholder="ffffffff-ffff-ffff-ffff-ffffffffffff"
            />
            <button
              type="button"
              className="field-action-button"
              onClick={() => {
                if (gvarDashboardUrl) {
                  window.open(gvarDashboardUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              disabled={!gvarDashboardUrl}
              title={
                gvarDashboardUrl
                  ? 'Open this gvar in the Avrae dashboard'
                  : 'Enter a valid gvar UUID to open it in Avrae'
              }
              aria-label="Open westmarch_config gvar in Avrae dashboard"
            >
              <ExternalLink size={16} aria-hidden="true" />
            </button>
          </div>
        </label>
        <label className="field">
          <span>
            AVRAE_TOKEN
            <AvraeTokenHelp />
          </span>
          <input
            type="password"
            value={props.token}
            onChange={(event) => props.setToken(event.target.value)}
            placeholder="Only needed for Avrae read/publish"
          />
        </label>
        <div className="button-row span-2">
          <button
            type="button"
            className="primary"
            onClick={props.loadFromAvrae}
            disabled={props.isBusy}
          >
            <UploadCloud size={16} aria-hidden="true" />
            Read From Avrae
          </button>
          <button type="button" onClick={props.onBlank}>
            <FileText size={16} aria-hidden="true" />
            New Config
          </button>
          <button type="button" onClick={props.onStarter}>
            <FileCode2 size={16} aria-hidden="true" />
            Starter Source
          </button>
        </div>
        <div className="field span-2">
          <span>
            Gvar sources
            <HelpTip label="Gvar sources help">
              The base westmarch_config row is expanded first. Referenced gvars load as separate
              rows named by the config path that pointed at them.
            </HelpTip>
          </span>
          <GvarSourceRows rows={props.sourceRows} onChange={props.updateSourceRow} />
        </div>
      </div>
    </section>
  );
}

function CheckView(props: {
  issues: ConfigIssue[];
  setSection: (section: Section) => void;
  applyFix: (code: string) => void;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<CheckCircle2 size={20} />}
        title="Check"
        help="Browser checks are the source of truth for config validation and add field-level guidance."
      />
      <div className="issue-list full">
        {props.issues.length === 0 ? (
          <article className="issue info clean-check">
            <div className="issue-head">
              {severityIcon('info')}
              <div>
                <h3>No issues found</h3>
                <span>config</span>
              </div>
            </div>
            <p>The current browser checks did not find errors or warnings.</p>
            <div className="button-row">
              <button type="button" className="primary" onClick={() => props.setSection('export')}>
                <CheckCircle2 size={15} aria-hidden="true" />
                Continue To Export
              </button>
            </div>
          </article>
        ) : null}
        {props.issues.map((item) => (
          <article className={`issue ${item.severity}`} key={`${item.code}:${item.path}`}>
            <div className="issue-head">
              {severityIcon(item.severity)}
              <div>
                <h3>{item.title}</h3>
                <span>{item.path}</span>
              </div>
            </div>
            <p>{item.detail}</p>
            {item.fix ? <p className="fix">{item.fix}</p> : null}
            <div className="button-row">
              <button type="button" onClick={() => props.setSection(sectionFor(item.section))}>
                <Radio size={15} aria-hidden="true" />
                Go To Field
              </button>
              {item.canAutoFix ? (
                <button type="button" onClick={() => props.applyFix(item.code)}>
                  <Save size={15} aria-hidden="true" />
                  Apply Fix
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DisplayView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  const footerBehaviour = String(
    readPath(config, 'policies.display.footer_behaviour') ?? 'balanced',
  );
  const footerHelp =
    footerBehaviour === 'string'
      ? 'Policies is set to Fixed text, so command embeds pick from this list.'
      : footerBehaviour === 'balanced'
        ? 'Balanced mode may pick one of these fixed footer lines.'
        : 'Configured here for Fixed text or Balanced footer policies.';

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileText size={20} />}
        title="Display"
        help="Branding values are used by embeds and configuration summaries."
      />
      <div className="form-grid">
        <TextField
          label="World name"
          value={String(config.display.name ?? '')}
          onChange={(value) => updateConfig('display.name', value)}
          help="Shown in branded embeds and config summaries."
        />
        <label className="field">
          <span>
            Rules version
            <HelpTip label="Rules version help">
              Infer omits rules_version so Avrae server settings from !servsettings are used. Choose
              2014 or 2024 only when the config should override the server default.
            </HelpTip>
          </span>
          <select
            value={String(config.rules_version ?? '')}
            onChange={(event) => updateConfig('rules_version', event.target.value || undefined)}
          >
            <option value="">Infer from !servsettings</option>
            <option value="2014">2014</option>
            <option value="2024">2024</option>
          </select>
        </label>
        <ColourField
          label="Embed colour"
          value={String(config.display.colour ?? '')}
          onChange={(value) => updateConfig('display.colour', value)}
          help="Six hex digits, with or without a leading #. Clear the text box to omit display.colour from the config."
        />
        <TextField
          label="Logo / thumbnail"
          value={String(config.display.logo ?? '')}
          onChange={(value) => updateConfig('display.logo', value || undefined)}
          help="Overrides the default westmarch-generic GitHub Pages logo used as command embed thumbnails."
        />
        <SelectField
          label="Command thumbnail"
          value={String(readPath(config, 'policies.display.command_thumbnail') ?? 'default')}
          values={['default', 'character']}
          onChange={(value) => updateConfig('policies.display.command_thumbnail', value)}
          help="Default uses the configured logo. Character uses the selected character image when available."
        />
        <FooterTextListField
          label="Fixed footer texts"
          value={config.display.footer}
          onChange={(value) => updateConfig('display.footer', value)}
          help={footerHelp}
        />
        <label className="field span-2">
          <span>Description</span>
          <textarea
            value={String(config.display.description ?? '')}
            onChange={(event) => updateConfig('display.description', event.target.value)}
            rows={5}
          />
        </label>
      </div>
    </section>
  );
}

function SubsystemsView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  const [plannedSubsystem, setPlannedSubsystem] = useState<SubsystemDefinition | null>(null);
  const knownSubsystems = new Set(SUBSYSTEM_DEFINITIONS.map((item) => item.key));
  const subsystemRows: SubsystemDefinition[] = [
    ...SUBSYSTEM_DEFINITIONS,
    ...Object.keys(config.subsystems)
      .filter((key) => !knownSubsystems.has(key))
      .map((key) => ({
        key,
        label: key,
        commands: Object.keys(asRecord(asRecord(config.subsystems[key]).commands)),
        implemented: true,
        detail: 'Custom subsystem loaded from this config.',
      })),
  ];

  function openPlanned(definition: SubsystemDefinition) {
    setPlannedSubsystem(definition);
  }

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Radio size={20} />}
        title="Subsystems"
        help="Subsystem and command toggles decide which command families are active for a server."
      />
      <div className="subsystem-list">
        {subsystemRows.map((definition) => {
          const key = definition.key;
          const block = config.subsystems[key] ?? {};
          const record = asRecord(block);
          const commands = asRecord(record.commands);
          const commandDisplay = asRecord(record.command_display);
          const commandEntries = definition.commands.length
            ? definition.commands.map((command) => [command, commands[command]] as const)
            : Object.entries(commands);
          const isPlanned = !definition.implemented;

          return (
            <div className={isPlanned ? 'subsystem-row planned' : 'subsystem-row'} key={key}>
              <div className="subsystem-head">
                {isPlanned ? (
                  <div className="switch-line">
                    <input type="checkbox" checked={record.enabled === true} disabled readOnly />
                    <span>{definition.label}</span>
                  </div>
                ) : (
                  <label className="switch-line">
                    <input
                      type="checkbox"
                      checked={record.enabled === true}
                      onChange={(event) =>
                        updateConfig(`subsystems.${key}.enabled`, event.target.checked)
                      }
                    />
                    <span>{definition.label}</span>
                  </label>
                )}
                {isPlanned ? (
                  <button
                    type="button"
                    className="badge neutral badge-button"
                    onClick={() => openPlanned(definition)}
                  >
                    Planned
                  </button>
                ) : null}
              </div>
              {isPlanned ? <p className="planned-summary">{definition.detail}</p> : null}
              {definition.dependencies?.length ? (
                <div className="dependency-list" aria-label={`${definition.label} dependencies`}>
                  <span className="dependency-intro">
                    This subsystem integrates with these other workshops. They are optional.
                  </span>
                  {definition.dependencies.map((dependency) => (
                    <span
                      className={`dependency-pill ${dependency.level}`}
                      key={`${definition.key}:${dependency.label}`}
                    >
                      <strong>
                        Integrates with{' '}
                        {dependency.url ? (
                          <a href={dependency.url} target="_blank" rel="noreferrer">
                            {dependency.label}
                            <ExternalLink size={12} aria-hidden="true" />
                          </a>
                        ) : (
                          dependency.label
                        )}
                      </strong>
                      {dependency.detail}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="toggle-grid">
                {commandEntries.map(([command, value]) =>
                  isPlanned ? (
                    <span className="check-chip disabled" key={command}>
                      <input type="checkbox" checked={value === true} disabled readOnly />
                      <span>{command}</span>
                    </span>
                  ) : (
                    <label className="check-chip" key={command}>
                      <input
                        type="checkbox"
                        checked={value === true}
                        onChange={(event) =>
                          updateConfig(
                            `subsystems.${key}.commands.${command}`,
                            event.target.checked,
                          )
                        }
                      />
                      <span>{command}</span>
                    </label>
                  ),
                )}
              </div>
              <details className="subsystem-details">
                <summary>Display and advanced settings</summary>
                <div className="subsystem-detail-body">
                  <DisplayOverrideEditor
                    title="Subsystem display override"
                    path={`subsystems.${key}.display`}
                    value={asRecord(record.display)}
                    updateConfig={updateConfig}
                  />
                  <div className="command-override-list">
                    <h3>Command display overrides</h3>
                    {commandEntries.map(([command]) => (
                      <details className="command-override" key={command}>
                        <summary>{command}</summary>
                        <DisplayOverrideEditor
                          title={`${command} display override`}
                          path={`subsystems.${key}.command_display.${command}`}
                          value={asRecord(commandDisplay[command])}
                          updateConfig={updateConfig}
                        />
                      </details>
                    ))}
                  </div>
                  <SubsystemAdvancedEditor
                    subsystemKey={key}
                    record={record}
                    commandEntries={commandEntries.map(([command]) => command)}
                    updateConfig={updateConfig}
                  />
                  <details className="advanced-json-details">
                    <summary>Advanced subsystem JSON</summary>
                    <div className="subsystem-json-grid">
                      <JsonField
                        label="Subsystem config JSON"
                        value={record.config ?? {}}
                        onCommit={(value) => updateConfig(`subsystems.${key}.config`, value)}
                        minRows={5}
                      />
                      <JsonField
                        label="Command config JSON"
                        value={record.command_config ?? {}}
                        onCommit={(value) =>
                          updateConfig(`subsystems.${key}.command_config`, value)
                        }
                        minRows={5}
                      />
                    </div>
                  </details>
                </div>
              </details>
            </div>
          );
        })}
      </div>
      {plannedSubsystem ? (
        <PlannedSubsystemModal
          subsystem={plannedSubsystem}
          onClose={() => setPlannedSubsystem(null)}
        />
      ) : null}
    </section>
  );
}

function DisplayOverrideEditor({
  title,
  path,
  value,
  updateConfig,
}: {
  title: string;
  path: string;
  value: AnyRecord;
  updateConfig: (path: string, value: unknown) => void;
}) {
  return (
    <section className="display-override">
      <div className="display-override-head">
        <h3>{title}</h3>
        <HelpTip label={`${title} help`}>{DISPLAY_OVERRIDE_HELP}</HelpTip>
      </div>
      <div className="form-grid compact">
        <TextField
          label="Title"
          value={String(value.title ?? '')}
          onChange={(next) => updateConfig(`${path}.title`, next || undefined)}
          help="Overrides the embed title for this subsystem or command."
        />
        <ColourField
          label="Colour"
          value={String(value.colour ?? '')}
          onChange={(next) => updateConfig(`${path}.colour`, next)}
          help="Overrides the inherited embed accent colour."
        />
        <TextField
          label="Image"
          value={String(value.image ?? '')}
          onChange={(next) => updateConfig(`${path}.image`, next || undefined)}
          help="Wide banner image URL."
        />
        <TextField
          label="Logo"
          value={String(value.logo ?? '')}
          onChange={(next) => updateConfig(`${path}.logo`, next || undefined)}
          help="Small thumbnail or icon URL."
        />
        <FooterTextListField
          label="Footer"
          value={value.footer}
          onChange={(next) => updateConfig(`${path}.footer`, next || undefined)}
          help="Overrides inherited fixed footer text. Multiple rows rotate when fixed text is selected."
        />
        <label className="field span-2">
          <span>
            Description
            <HelpTip label={`${title} description help`}>
              Overrides the inherited short embed description for this layer.
            </HelpTip>
          </span>
          <textarea
            value={String(value.description ?? '')}
            onChange={(event) =>
              updateConfig(`${path}.description`, event.target.value || undefined)
            }
            rows={3}
          />
        </label>
      </div>
    </section>
  );
}

function SubsystemAdvancedEditor({
  subsystemKey,
  record,
  commandEntries,
  updateConfig,
}: {
  subsystemKey: string;
  record: AnyRecord;
  commandEntries: string[];
  updateConfig: (path: string, value: unknown) => void;
}) {
  const config = asRecord(record.config);
  const commandConfig = asRecord(record.command_config);

  return (
    <section className="guided-editor">
      <div className="display-override-head">
        <h3>Guided config</h3>
        <HelpTip label={`${subsystemKey} guided config help`}>
          Common subsystem settings and command cooldowns. Use advanced JSON only for custom fields
          not represented here.
        </HelpTip>
      </div>
      {subsystemKey === 'exploration' ? (
        <div className="form-grid compact">
          <SelectField
            label="Biome source"
            value={String(config.enc_biome_source ?? 'auto')}
            values={['auto', 'argument', 'location']}
            onChange={(value) =>
              updateConfig(`subsystems.${subsystemKey}.config.enc_biome_source`, value)
            }
            help="Controls whether exploration commands take biome args or infer from location."
          />
          <TextField
            label="Repeat exclude window"
            value={String(config.repeat_exclude_window ?? '')}
            onChange={(value) =>
              updateConfig(
                `subsystems.${subsystemKey}.config.repeat_exclude_window`,
                numberOrUndefined(value),
              )
            }
            help="How many recent encounters to exclude where repeat policy applies."
          />
          <DistributionEditor
            value={asRecord(config.distribution)}
            onChange={(value) =>
              updateConfig(`subsystems.${subsystemKey}.config.distribution`, value)
            }
          />
        </div>
      ) : null}
      {subsystemKey === 'downtime' ? (
        <div className="form-grid compact">
          <TextField
            label="Workday hours"
            value={String(config.workday_hours ?? '')}
            onChange={(value) =>
              updateConfig(
                `subsystems.${subsystemKey}.config.workday_hours`,
                numberOrUndefined(value),
              )
            }
            help="Hours counted as one workday."
          />
          <TextField
            label="Workweek days"
            value={String(config.workweek_days ?? '')}
            onChange={(value) =>
              updateConfig(
                `subsystems.${subsystemKey}.config.workweek_days`,
                numberOrUndefined(value),
              )
            }
            help="Workdays counted as one workweek."
          />
        </div>
      ) : null}
      <div className="command-cooldown-grid">
        {commandEntries.map((command) => {
          const commandRecord = asRecord(commandConfig[command]);
          return (
            <TextField
              label={`${command} cooldown`}
              value={String(commandRecord.cooldown_seconds ?? '')}
              onChange={(value) =>
                updateConfig(
                  `subsystems.${subsystemKey}.command_config.${command}.cooldown_seconds`,
                  numberOrUndefined(value),
                )
              }
              help="Optional cooldown in seconds."
              key={command}
            />
          );
        })}
      </div>
    </section>
  );
}

function PlannedSubsystemModal({
  subsystem,
  onClose,
}: {
  subsystem: SubsystemDefinition;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="modal-header">
          <div className="modal-heading">
            <span className="modal-icon" aria-hidden="true">
              <Radio size={22} />
            </span>
            <div>
              <h2 id={titleId}>{subsystem.label} is not implemented yet</h2>
              <p id={descriptionId}>{subsystem.detail}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            className="icon-only"
            type="button"
            aria-label="Close planned subsystem notice"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">
          <p>
            The editor includes this subsystem in new configs as disabled so the shape is visible,
            but guided editing is locked until the feature is ready.
          </p>
          <p>
            Planned commands: <strong>{subsystem.commands.join(', ')}</strong>
          </p>
          <p>Existing hand-authored values can still be inspected or adjusted in Raw mode.</p>
          <div className="modal-actions">
            <button className="primary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function PoliciesView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  function updateOptionalNumber(path: string, value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      updateConfig(path, null);
      return;
    }
    const numeric = Number(trimmed);
    updateConfig(path, Number.isFinite(numeric) ? numeric : trimmed);
  }

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Save size={20} />}
        title="Policies"
        help="Policies tune command behavior without changing engine code."
      />
      <div className="form-grid">
        <SelectField
          label="Encounter biome source"
          value={String(
            readPath(config, 'subsystems.exploration.config.enc_biome_source') ?? 'auto',
          )}
          values={['auto', 'argument', 'location']}
          onChange={(value) =>
            updateConfig('subsystems.exploration.config.enc_biome_source', value)
          }
          help="auto chooses a safe fallback; argument requires user input; location uses travel location."
        />
        <SelectField
          label="Repeat encounters"
          value={String(readPath(config, 'policies.exploration.avoid_repeat_encounters') ?? 'off')}
          values={['off', 'same_biome', 'global']}
          onChange={(value) => updateConfig('policies.exploration.avoid_repeat_encounters', value)}
          help="Controls whether recent encounters are excluded from future rolls."
        />
        <SelectField
          label="Downtime mode"
          value={String(readPath(config, 'policies.downtime.mode') ?? 'off')}
          values={['off', 'manual', 'tracked']}
          onChange={(value) => updateConfig('policies.downtime.mode', value)}
          help="off is the default; manual keeps a player ledger; tracked lets future systems enforce costs."
        />
        <SelectField
          label="Downtime acquisition"
          value={String(readPath(config, 'policies.downtime.acquisition') ?? 'manual')}
          values={['manual', 'world_clock', 'journey']}
          onChange={(value) => updateConfig('policies.downtime.acquisition', value)}
          help="manual is implemented now; world_clock and journey are reserved for later automation."
        />
        <TextField
          label="Max workdays"
          value={String(readPath(config, 'policies.downtime.max_workdays') ?? '')}
          onChange={(value) => updateOptionalNumber('policies.downtime.max_workdays', value)}
          help="Optional cap for the downtime ledger. Leave blank for unlimited."
        />
        <label className="field">
          <span>
            Crafting rules override
            <HelpTip label="Crafting rules override help">
              Leave unset to follow the server rules edition. Set a value here when the crafting
              subsystem should use a different RAW edition.
            </HelpTip>
          </span>
          <select
            value={String(readPath(config, 'subsystems.crafting.config.rules_version') ?? '')}
            onChange={(event) =>
              updateConfig('subsystems.crafting.config.rules_version', event.target.value || null)
            }
          >
            <option value="">Server default</option>
            <option value="2014">2014</option>
            <option value="2024">2024</option>
          </select>
        </label>
        <SelectField
          label="Crafting recipes"
          value={String(readPath(config, 'subsystems.crafting.config.recipe_mode') ?? 'mixed')}
          values={CRAFTING_RECIPE_MODES}
          onChange={(value) => updateConfig('subsystems.crafting.config.recipe_mode', value)}
          help="mixed uses a matching recipe when present, raw ignores recipes, recipes requires one."
        />
        <div className="field">
          <span>
            Scribe spell requirement
            <HelpTip label="Scribe spell requirement help">
              Keep enabled for RAW scroll scribing: the spell must appear in the character
              spellbook. Disable only when your server tracks eligibility elsewhere.
            </HelpTip>
          </span>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={readPath(config, 'subsystems.crafting.config.require_known_spell') !== false}
              onChange={(event) =>
                updateConfig('subsystems.crafting.config.require_known_spell', event.target.checked)
              }
            />
            <span>Require known spell</span>
          </label>
        </div>
        <SelectField
          label="Crafting gold"
          value={String(readPath(config, 'policies.crafting.resources.gold') ?? 'manual')}
          values={CRAFTING_RESOURCE_MODES}
          onChange={(value) => updateConfig('policies.crafting.resources.gold', value)}
          help="manual prints the cost, check verifies it, deduct verifies and removes it."
        />
        <SelectField
          label="Crafting materials"
          value={String(readPath(config, 'policies.crafting.resources.materials') ?? 'manual')}
          values={CRAFTING_RESOURCE_MODES}
          onChange={(value) => updateConfig('policies.crafting.resources.materials', value)}
          help="Controls configured material or component item requirements."
        />
        <SelectField
          label="Crafting items"
          value={String(readPath(config, 'policies.crafting.resources.items') ?? 'manual')}
          values={CRAFTING_RESOURCE_MODES}
          onChange={(value) => updateConfig('policies.crafting.resources.items', value)}
          help="Controls required equipment or magic-item ingredients."
        />
        <SelectField
          label="Crafting downtime"
          value={String(readPath(config, 'policies.crafting.resources.downtime') ?? 'manual')}
          values={CRAFTING_RESOURCE_MODES}
          onChange={(value) => updateConfig('policies.crafting.resources.downtime', value)}
          help="check and deduct require tracked downtime with the downtime subsystem enabled."
        />
        <SelectField
          label="Crafting spell slots"
          value={String(readPath(config, 'policies.crafting.resources.spell_slot') ?? 'manual')}
          values={CRAFTING_RESOURCE_MODES}
          onChange={(value) => updateConfig('policies.crafting.resources.spell_slot', value)}
          help="Used by scribing when a scroll should consume a spell slot."
        />
        <SelectField
          label="Crafted item output"
          value={String(readPath(config, 'policies.inventory.item_handling.mode') ?? 'manual')}
          values={ITEM_HANDLING_MODES}
          onChange={(value) => updateConfig('policies.inventory.item_handling.mode', value)}
          help="manual prints gained items; bags writes them into the configured bag cvars."
        />
        <TextField
          label="Default item bag"
          value={String(readPath(config, 'policies.inventory.item_handling.default_bag') ?? '')}
          onChange={(value) =>
            updateConfig('policies.inventory.item_handling.default_bag', value || undefined)
          }
          help="Fallback bag name when a command does not have a more specific bag."
        />
        <TextField
          label="Equipment bag"
          value={String(readPath(config, 'policies.inventory.item_handling.equipment_bag') ?? '')}
          onChange={(value) =>
            updateConfig('policies.inventory.item_handling.equipment_bag', value || undefined)
          }
          help="Bag checked for required equipped or ingredient items."
        />
        <TextField
          label="Potions bag"
          value={String(readPath(config, 'policies.inventory.item_handling.potions_bag') ?? '')}
          onChange={(value) =>
            updateConfig('policies.inventory.item_handling.potions_bag', value || undefined)
          }
          help="Bag used for brewed potions when output mode is bags."
        />
        <TextField
          label="Scrolls bag"
          value={String(readPath(config, 'policies.inventory.item_handling.scrolls_bag') ?? '')}
          onChange={(value) =>
            updateConfig('policies.inventory.item_handling.scrolls_bag', value || undefined)
          }
          help="Bag used for spell scrolls when output mode is bags."
        />
        <TextField
          label="Magic items bag"
          value={String(readPath(config, 'policies.inventory.item_handling.magic_items_bag') ?? '')}
          onChange={(value) =>
            updateConfig('policies.inventory.item_handling.magic_items_bag', value || undefined)
          }
          help="Bag used for enchanted items when output mode is bags."
        />
        <TextField
          label="Materials bag"
          value={String(readPath(config, 'policies.inventory.item_handling.materials_bag') ?? '')}
          onChange={(value) =>
            updateConfig('policies.inventory.item_handling.materials_bag', value || undefined)
          }
          help="Bag checked for consumed ingredients when material or item policies are enforced."
        />
        <CraftingCataloguesEditor
          value={asRecord(
            readPath(config, 'subsystems.crafting.config.catalogues') ??
              CRAFTING_CATALOGUE_DEFAULTS,
          )}
          onChange={(value) => updateConfig('subsystems.crafting.config.catalogues', value)}
        />
        <CraftingChecksEditor
          value={asRecord(
            readPath(config, 'subsystems.crafting.config.checks') ?? CRAFTING_CHECK_DEFAULTS,
          )}
          onChange={(value) => updateConfig('subsystems.crafting.config.checks', value)}
        />
        <CraftingToolPolicyEditor
          value={asRecord(
            readPath(config, 'subsystems.crafting.config.tool_policy') ??
              CRAFTING_TOOL_POLICY_DEFAULTS,
          )}
          onChange={(value) => updateConfig('subsystems.crafting.config.tool_policy', value)}
        />
        <CraftingCommandOverridesEditor
          value={asRecord(readPath(config, 'subsystems.crafting.command_config') ?? {})}
          onChange={(value) => updateConfig('subsystems.crafting.command_config', value)}
        />
        <FooterBehaviourField
          value={String(readPath(config, 'policies.display.footer_behaviour') ?? 'balanced')}
          onChange={(value) => updateConfig('policies.display.footer_behaviour', value)}
        />
        <PlayerSetupEditor
          value={asRecord(
            readPath(config, 'policies.player_setup') ?? {
              enabled: true,
              require_character: true,
              hud: { enabled: true, fields: ['coins', 'wallet', 'location', 'time', 'weather'] },
              checks: [],
            },
          )}
          onChange={(value) => updateConfig('policies.player_setup', value)}
        />
        <DistributionEditor
          value={asRecord(readPath(config, 'subsystems.exploration.config.distribution') ?? {})}
          onChange={(value) => updateConfig('subsystems.exploration.config.distribution', value)}
        />
        <SelectField
          label="Hunt monster art"
          value={monsterArtSelectValue(
            readPath(config, 'subsystems.exploration.config.monster_images.hunt'),
          )}
          values={['thumbnail', 'image', 'off']}
          onChange={(value) =>
            updateConfig('subsystems.exploration.config.monster_images.hunt', value)
          }
          help="Controls where successful hunt embeds put a monster image when one exists."
        />
        <SelectField
          label="Loot monster art"
          value={monsterArtSelectValue(
            readPath(config, 'subsystems.exploration.config.monster_images.loot'),
          )}
          values={['thumbnail', 'image', 'off']}
          onChange={(value) =>
            updateConfig('subsystems.exploration.config.monster_images.loot', value)
          }
          help="Controls where loot session embeds put a monster image when one exists."
        />
        <div className="field">
          <span>
            Hunt DC visibility
            <HelpTip label="Hunt DC visibility help">
              Keep enabled to print the numeric Survival DC. Disable to roll against the same DC
              while only showing generic check text.
            </HelpTip>
          </span>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={
                readPath(config, 'subsystems.exploration.config.show_check_dcs.hunt') !== false
              }
              onChange={(event) =>
                updateConfig(
                  'subsystems.exploration.config.show_check_dcs.hunt',
                  event.target.checked,
                )
              }
            />
            <span>Show hunt DC</span>
          </label>
        </div>
        <div className="field">
          <span>
            Loot DC visibility
            <HelpTip label="Loot DC visibility help">
              Keep enabled to print numeric loot DCs in session and roll text. Disable to show only
              generic check labels.
            </HelpTip>
          </span>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={
                readPath(config, 'subsystems.exploration.config.show_check_dcs.loot') !== false
              }
              onChange={(event) =>
                updateConfig(
                  'subsystems.exploration.config.show_check_dcs.loot',
                  event.target.checked,
                )
              }
            />
            <span>Show loot DCs</span>
          </label>
        </div>
      </div>
    </section>
  );
}

const CRAFTING_COMMANDS = ['craft', 'brew', 'enchant', 'scribe'];
const CRAFTING_RESOURCE_KEYS = ['gold', 'materials', 'items', 'downtime', 'spell_slot'];

function CraftingCataloguesEditor({
  value,
  onChange,
}: {
  value: AnyRecord;
  onChange: (value: AnyRecord) => void;
}) {
  const catalogueKeys = ['items', 'potions', 'spells', 'magic_items', 'recipes'];

  function engineSlug(key: string) {
    const source = CRAFTING_CATALOGUE_DEFAULTS[key as keyof typeof CRAFTING_CATALOGUE_DEFAULTS];
    return typeof source === 'string' && source.startsWith('engine:') ? source : '';
  }

  function catalogueDraft(entry: unknown, key: string) {
    const engine = engineSlug(key);
    const gvarIds: string[] = [];
    let includeEngine = false;

    if (typeof entry === 'string') {
      includeEngine = Boolean(engine && entry === engine);
      if (entry.trim() && !entry.startsWith('engine:')) gvarIds.push(entry.trim());
    } else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const record = asRecord(entry);
      includeEngine = record.include_engine === true;
      const gvarId = String(record.gvar_id ?? '').trim();
      if (gvarId && !gvarId.startsWith('engine:')) gvarIds.push(gvarId);
      for (const keyName of ['gvar_ids', 'gvars']) {
        const ids = record[keyName];
        if (Array.isArray(ids)) {
          gvarIds.push(...ids.map((item) => String(item).trim()).filter(Boolean));
        }
      }
    }

    return { includeEngine, gvarIds: Array.from(new Set(gvarIds)) };
  }

  function catalogueValue(entry: unknown, key: string, includeEngine: boolean, gvarIds: string[]) {
    const engine = engineSlug(key);
    const cleanIds = gvarIds.map((item) => item.trim()).filter(Boolean);
    const currentRecord = asRecord(entry);
    const entries = Array.isArray(currentRecord.entries) ? currentRecord.entries : undefined;

    if (!includeEngine && cleanIds.length === 0) {
      return entries ? { entries } : null;
    }

    if (includeEngine && engine && cleanIds.length === 0 && !entries) return engine;
    if (!includeEngine && cleanIds.length === 1 && !entries) return cleanIds[0];

    const next: AnyRecord = {};
    if (entries) next.entries = entries;
    if (includeEngine && engine) next.include_engine = true;
    if (cleanIds.length === 1) next.gvar_id = cleanIds[0];
    if (cleanIds.length > 1) next.gvar_ids = cleanIds;
    return next;
  }

  function updateSource(key: string, includeEngine: boolean, gvarIds: string[]) {
    onChange({
      ...value,
      [key]: catalogueValue(value[key], key, includeEngine, gvarIds),
    });
  }

  return (
    <section className="field span-2 guided-editor">
      <span>
        Crafting catalogue sources
        <HelpTip label="Crafting catalogue sources help">
          Engine source slugs, custom gvar UUIDs, or blank when a catalogue is not used.
        </HelpTip>
      </span>
      <div className="catalogue-grid">
        {catalogueKeys.map((key) => {
          const engine = engineSlug(key);
          const { includeEngine, gvarIds } = catalogueDraft(value[key], key);
          const visibleIds = [...gvarIds, ''];
          return (
            <div className="catalogue-row structured" key={key}>
              <strong>{key}</strong>
              <label className="field">
                <span>Engine source</span>
                <select
                  value={includeEngine && engine ? engine : ''}
                  onChange={(event) => updateSource(key, Boolean(event.target.value), gvarIds)}
                >
                  <option value="">No engine catalogue</option>
                  {engine ? <option value={engine}>{engine}</option> : null}
                </select>
              </label>
              <div className="field">
                <span>
                  Custom gvar sources
                  <HelpTip label={`${key} custom catalogue gvars help`}>
                    Add one or more owner gvar UUIDs for custom catalogue data.
                  </HelpTip>
                </span>
                <div className="gvar-id-list">
                  {visibleIds.map((id, index) => (
                    <div className="gvar-id-row" key={index}>
                      <input
                        value={id}
                        onChange={(event) => {
                          const nextIds = [...visibleIds];
                          nextIds[index] = event.target.value;
                          updateSource(key, includeEngine, nextIds);
                        }}
                        placeholder="custom gvar UUID"
                        aria-label={`${key} custom gvar ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="field-action-button"
                        onClick={() =>
                          updateSource(
                            key,
                            includeEngine,
                            visibleIds.filter((_, row) => row !== index),
                          )
                        }
                        aria-label={`Remove ${key} custom gvar ${index + 1}`}
                        title="Remove custom gvar"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CraftingChecksEditor({
  value,
  onChange,
}: {
  value: AnyRecord;
  onChange: (value: AnyRecord) => void;
}) {
  function updateCommand(command: string, patch: AnyRecord) {
    onChange({ ...value, [command]: { ...asRecord(value[command]), ...patch } });
  }

  return (
    <section className="field span-2 guided-editor">
      <span>
        Crafting checks
        <HelpTip label="Crafting checks help">
          Per-command roll policy. None skips rolls, manual prints guidance, and roll enforces a DC.
        </HelpTip>
      </span>
      <div className="matrix-editor crafting-checks">
        {CRAFTING_COMMANDS.map((command) => {
          const record = asRecord(value[command]);
          return (
            <div className="matrix-row" key={command}>
              <strong>{command}</strong>
              <select
                value={String(record.mode ?? 'none')}
                onChange={(event) => updateCommand(command, { mode: event.target.value })}
                aria-label={`${command} check mode`}
              >
                {['none', 'manual', 'roll', 'off'].map((mode) => (
                  <option value={mode} key={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <select
                value={String(record.skill ?? '')}
                onChange={(event) => updateCommand(command, { skill: event.target.value || null })}
                aria-label={`${command} check skill`}
              >
                {optionsWithSelected(
                  ['', ...CRAFTING_CHECK_SKILL_OPTIONS],
                  [String(record.skill ?? '')].filter(Boolean),
                ).map((skill) => (
                  <option value={skill} key={skill || 'unset'}>
                    {skill || 'skill'}
                  </option>
                ))}
              </select>
              <select
                value={String(record.ability ?? '')}
                onChange={(event) =>
                  updateCommand(command, { ability: event.target.value || null })
                }
                aria-label={`${command} check ability`}
              >
                {optionsWithSelected(
                  ['', ...ABILITY_OPTIONS],
                  [String(record.ability ?? '')].filter(Boolean),
                ).map((ability) => (
                  <option value={ability} key={ability || 'unset'}>
                    {ability || 'ability'}
                  </option>
                ))}
              </select>
              <select
                value={String(record.dc ?? '')}
                onChange={(event) =>
                  updateCommand(command, { dc: numberOrNull(event.target.value) })
                }
                aria-label={`${command} check DC`}
              >
                {optionsWithSelected(
                  CRAFTING_CHECK_DC_OPTIONS,
                  [String(record.dc ?? '')].filter(Boolean),
                ).map((dc) => (
                  <option value={dc} key={dc || 'unset'}>
                    {dc || 'DC'}
                  </option>
                ))}
              </select>
              <label className="switch-line">
                <input
                  type="checkbox"
                  checked={record.require_success !== false}
                  onChange={(event) =>
                    updateCommand(command, { require_success: event.target.checked })
                  }
                />
                <span>Require success</span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CraftingToolPolicyEditor({
  value,
  onChange,
}: {
  value: AnyRecord;
  onChange: (value: AnyRecord) => void;
}) {
  function updateCommand(command: string, patch: AnyRecord) {
    onChange({ ...value, [command]: { ...asRecord(value[command]), ...patch } });
  }

  return (
    <section className="field span-2 guided-editor">
      <span>
        Crafting tool policy
        <HelpTip label="Crafting tool policy help">
          Per-command tool reminders or checks against proficiencies and optional kit items.
        </HelpTip>
      </span>
      <div className="matrix-editor tool-policy">
        {CRAFTING_COMMANDS.map((command) => {
          const record = asRecord(value[command]);
          return (
            <div className="matrix-row" key={command}>
              <strong>{command}</strong>
              <select
                value={String(record.mode ?? 'off')}
                onChange={(event) => updateCommand(command, { mode: event.target.value })}
                aria-label={`${command} tool mode`}
              >
                {['off', 'manual', 'check'].map((mode) => (
                  <option value={mode} key={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <CheckboxDropdown
                label={`${command} tools`}
                value={asStringList(record.tools)}
                options={CRAFTING_TOOL_OPTIONS}
                onChange={(tools) => updateCommand(command, { tools })}
              />
              <label className="switch-line">
                <input
                  type="checkbox"
                  checked={record.require_proficiency !== false}
                  onChange={(event) =>
                    updateCommand(command, { require_proficiency: event.target.checked })
                  }
                />
                <span>Proficiency</span>
              </label>
              <label className="switch-line">
                <input
                  type="checkbox"
                  checked={record.require_kit === true}
                  onChange={(event) =>
                    updateCommand(command, { require_kit: event.target.checked })
                  }
                />
                <span>Kit item</span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CraftingCommandOverridesEditor({
  value,
  onChange,
}: {
  value: AnyRecord;
  onChange: (value: AnyRecord) => void;
}) {
  function updateCommand(command: string, patch: AnyRecord) {
    onChange({ ...value, [command]: { ...asRecord(value[command]), ...patch } });
  }

  return (
    <section className="field span-2 guided-editor">
      <span>
        Crafting command overrides
        <HelpTip label="Crafting command overrides help">
          Optional per-command cooldowns, resource policies, and output mode overrides.
        </HelpTip>
      </span>
      <div className="command-override-matrix">
        {CRAFTING_COMMANDS.map((command) => {
          const record = asRecord(value[command]);
          const resources = asRecord(record.resources);
          return (
            <details className="command-override" key={command}>
              <summary>{command}</summary>
              <div className="form-grid compact">
                <TextField
                  label="Cooldown seconds"
                  value={String(record.cooldown_seconds ?? '')}
                  onChange={(next) =>
                    updateCommand(command, { cooldown_seconds: numberOrUndefined(next) })
                  }
                  help="Optional per-command cooldown."
                />
                <SelectField
                  label="Output mode"
                  value={String(record.item_handling ?? '')}
                  values={['', 'manual', 'bags']}
                  onChange={(next) => updateCommand(command, { item_handling: next || undefined })}
                  help="Override crafted item output for this command."
                />
                {CRAFTING_RESOURCE_KEYS.map((key) => (
                  <SelectField
                    label={key}
                    value={String(resources[key] ?? '')}
                    values={['', ...CRAFTING_RESOURCE_MODES]}
                    onChange={(next) =>
                      updateCommand(command, {
                        resources: { ...resources, [key]: next || undefined },
                      })
                    }
                    help={`Override ${key} resource handling for ${command}.`}
                    key={key}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function PlayerSetupEditor({
  value,
  onChange,
}: {
  value: AnyRecord;
  onChange: (value: AnyRecord) => void;
}) {
  const hud = asRecord(value.hud);

  return (
    <section className="field span-2 guided-editor">
      <span>
        Player setup and HUD
        <HelpTip label="Player setup help">
          Controls preflight checks and compact HUD fields shown to players.
        </HelpTip>
      </span>
      <div className="form-grid compact">
        <label className="switch-line">
          <input
            type="checkbox"
            checked={value.enabled !== false}
            onChange={(event) => onChange({ ...value, enabled: event.target.checked })}
          />
          <span>Enable player setup</span>
        </label>
        <label className="switch-line">
          <input
            type="checkbox"
            checked={value.require_character !== false}
            onChange={(event) => onChange({ ...value, require_character: event.target.checked })}
          />
          <span>Require character</span>
        </label>
        <label className="switch-line">
          <input
            type="checkbox"
            checked={hud.enabled !== false}
            onChange={(event) =>
              onChange({ ...value, hud: { ...hud, enabled: event.target.checked } })
            }
          />
          <span>Enable HUD</span>
        </label>
        <CheckboxGroupField
          label="HUD fields"
          value={asStringList(hud.fields)}
          options={HUD_FIELD_OPTIONS}
          onChange={(fields) => onChange({ ...value, hud: { ...hud, fields } })}
          help="Built-in player HUD fields to show in compact status output."
        />
      </div>
      <details className="advanced-json-details">
        <summary>Advanced setup checks JSON</summary>
        <JsonField
          label="Setup checks"
          value={value.checks ?? []}
          onCommit={(checks) => onChange({ ...value, checks })}
          minRows={6}
        />
      </details>
    </section>
  );
}

function DistributionEditor({
  value,
  onChange,
}: {
  value: AnyRecord;
  onChange: (value: AnyRecord) => void;
}) {
  const combat = Number(value.combat ?? 0);
  const quest = Number(value.quest ?? 0);
  const gather = Number(value.gather ?? 0);
  const total = combat + quest + gather;

  function update(key: string, next: string) {
    onChange({ ...value, [key]: numberOrUndefined(next) ?? 0 });
  }

  return (
    <section className="field span-2 guided-editor">
      <span>
        Exploration distribution
        <HelpTip label="Exploration distribution help">
          Percent weights for encounter kind selection. The total should be 100.
        </HelpTip>
      </span>
      <div className="distribution-grid">
        {['combat', 'quest', 'gather'].map((key) => (
          <label className="field" key={key}>
            <span>{key}</span>
            <input
              type="number"
              min="0"
              value={String(value[key] ?? 0)}
              onChange={(event) => update(key, event.target.value)}
            />
          </label>
        ))}
        <span className={total === 100 ? 'badge ok' : 'badge warn'}>Total {total}</span>
      </div>
    </section>
  );
}

function WorldView({
  config,
  updateConfig,
  token,
  setStatus,
  setSteps,
  upsertRelatedGvar,
  relatedGvars,
  updateRelatedGvarSource,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
  token: string;
  setStatus: (value: string) => void;
  setSteps: (value: RunStep[]) => void;
  upsertRelatedGvar: (source: LoadedGvarSource) => void;
  relatedGvars: LoadedGvarSource[];
  updateRelatedGvarSource: (id: string, value: string) => void;
}) {
  const locations = asRecord(config.world_data.locations);
  const paths = Array.isArray(config.world_data.paths) ? config.world_data.paths : [];
  const biomeOptions = Object.keys(asRecord(config.world_data.biomes)).sort();

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Compass size={20} />}
        title="World"
        help="World data connects locations, travel paths, calendars, and biome lookup."
      />
      <div className="form-grid">
        <LocationSelect
          label="Default location"
          value={String(config.world_data.default_location ?? '')}
          locationIds={Object.keys(locations)}
          onChange={(value) => updateConfig('world_data.default_location', value || undefined)}
          help="Used by travel/location commands when no character location is known."
        />
      </div>
      <LocationEditor
        locations={locations}
        biomeOptions={biomeOptions}
        updateConfig={updateConfig}
        token={token}
        setStatus={setStatus}
        setSteps={setSteps}
        upsertRelatedGvar={upsertRelatedGvar}
        relatedGvars={relatedGvars}
        updateRelatedGvarSource={updateRelatedGvarSource}
      />
      <PathBuilder paths={paths} locations={locations} updateConfig={updateConfig} />
      <details className="advanced-json-details">
        <summary>Advanced world JSON</summary>
        <JsonField
          label="Locations JSON"
          value={config.world_data.locations ?? {}}
          onCommit={(value) => updateConfig('world_data.locations', value)}
        />
        <JsonField
          label="Paths JSON"
          value={config.world_data.paths ?? []}
          onCommit={(value) => updateConfig('world_data.paths', value)}
        />
      </details>
    </section>
  );
}

const EXPLORATION_LOCATION_COMMANDS = ['enc', 'forage', 'fish', 'mine', 'lumber', 'hunt', 'loot'];
const SERVICE_LOCATION_COMMANDS = [
  'job',
  'buy',
  'sell',
  'craft',
  'brew',
  'enchant',
  'scribe',
  'library',
  'read',
];

function LocationEditor({
  locations,
  biomeOptions,
  updateConfig,
  token,
  setStatus,
  setSteps,
  upsertRelatedGvar,
  relatedGvars,
  updateRelatedGvarSource,
}: {
  locations: AnyRecord;
  biomeOptions: string[];
  updateConfig: (path: string, value: unknown) => void;
  token: string;
  setStatus: (value: string) => void;
  setSteps: (value: RunStep[]) => void;
  upsertRelatedGvar: (source: LoadedGvarSource) => void;
  relatedGvars: LoadedGvarSource[];
  updateRelatedGvarSource: (id: string, value: string) => void;
}) {
  const [newLocationId, setNewLocationId] = useState('river_town');

  function addLocation() {
    const id = slugValue(newLocationId);
    if (!id) return;
    updateConfig('world_data.locations', {
      ...locations,
      [id]: { name: titleFromSlug(id), commands: {} },
    });
  }

  function updateLocation(id: string, value: AnyRecord) {
    updateConfig('world_data.locations', { ...locations, [id]: value });
  }

  function removeLocation(id: string) {
    updateConfig(
      'world_data.locations',
      Object.fromEntries(Object.entries(locations).filter(([key]) => key !== id)),
    );
  }

  return (
    <section className="world-editor">
      <div className="collection-editor-head">
        <h3>Locations</h3>
        <div className="inline-add">
          <input
            value={newLocationId}
            onChange={(event) => setNewLocationId(event.target.value)}
            placeholder="river_town"
            aria-label="New location id"
          />
          <button type="button" onClick={addLocation}>
            <Save size={16} aria-hidden="true" />
            Add Location
          </button>
        </div>
      </div>
      <div className="collection-list">
        {Object.entries(locations).map(([id, value], index) => (
          <details className="collection-item" open={index === 0} key={id}>
            <summary className="collection-item-head">
              <div>
                <strong>{String(asRecord(value).name ?? titleFromSlug(id))}</strong>
                <span>{id}</span>
              </div>
              <button
                type="button"
                className="field-action-button"
                onClick={(event) => {
                  event.preventDefault();
                  removeLocation(id);
                }}
                aria-label={`Remove ${id}`}
                title="Remove location"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </summary>
            <LocationFields
              id={id}
              location={asRecord(value)}
              biomeOptions={biomeOptions}
              onChange={(next) => updateLocation(id, next)}
              token={token}
              setStatus={setStatus}
              setSteps={setSteps}
              upsertRelatedGvar={upsertRelatedGvar}
              relatedGvars={relatedGvars}
              updateRelatedGvarSource={updateRelatedGvarSource}
            />
          </details>
        ))}
        {Object.keys(locations).length === 0 ? (
          <p className="collection-empty">
            No locations yet. Add one to enable location-aware travel.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function LocationFields({
  id,
  location,
  biomeOptions,
  onChange,
  token,
  setStatus,
  setSteps,
  upsertRelatedGvar,
  relatedGvars,
  updateRelatedGvarSource,
}: {
  id: string;
  location: AnyRecord;
  biomeOptions: string[];
  onChange: (location: AnyRecord) => void;
  token: string;
  setStatus: (value: string) => void;
  setSteps: (value: RunStep[]) => void;
  upsertRelatedGvar: (source: LoadedGvarSource) => void;
  relatedGvars: LoadedGvarSource[];
  updateRelatedGvarSource: (id: string, value: string) => void;
}) {
  const commands = asRecord(location.commands);
  const primaryBiomeOptions = optionsWithSelected(biomeOptions, asStringList(location.biome));

  function updateField(key: string, value: unknown) {
    const nextValue = Array.isArray(value) && value.length === 0 ? undefined : value || undefined;
    onChange({ ...location, [key]: nextValue });
  }

  function updateCommand(command: string, value: unknown) {
    const nextCommands = { ...commands, [command]: value };
    if (value == null || value === false || (Array.isArray(value) && value.length === 0)) {
      delete nextCommands[command];
    }
    onChange({ ...location, commands: nextCommands });
  }

  return (
    <div className="form-grid compact">
      <TextField
        label="Name"
        value={String(location.name ?? titleFromSlug(id))}
        onChange={(value) => updateField('name', value)}
        help="Player-facing location name."
      />
      <label className="field">
        <span>
          Primary biome
          <HelpTip label="Primary biome help">
            Fallback biome code when a command does not list specific biome pools.
          </HelpTip>
        </span>
        <select
          value={String(location.biome ?? '')}
          onChange={(event) => updateField('biome', event.target.value)}
        >
          <option value="">None</option>
          {primaryBiomeOptions.map((code) => (
            <option value={code} key={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
      <TextField
        label="Image"
        value={String(location.image ?? '')}
        onChange={(value) => updateField('image', value)}
        help="Optional embed image URL for location/travel output."
      />
      <TextField
        label="Channel link"
        value={String(location.link ?? '')}
        onChange={(value) => updateField('link', value)}
        help="Optional Discord channel URL shown with location output."
      />
      <LocationEncounterGvarField
        locationId={id}
        value={String(location.encounters_gvar_id ?? '')}
        onChange={(value) => updateField('encounters_gvar_id', value)}
        token={token}
        setStatus={setStatus}
        setSteps={setSteps}
        upsertRelatedGvar={upsertRelatedGvar}
        relatedGvars={relatedGvars}
        updateRelatedGvarSource={updateRelatedGvarSource}
      />
      <TextField
        label="Calendar id"
        value={String(location.calendar_id ?? '')}
        onChange={(value) => updateField('calendar_id', value)}
        help="Optional key from world_data.calendars for this location."
      />
      <label className="field span-2">
        <span>
          Description
          <HelpTip label="Location description help">
            General player-facing flavour for the location command.
          </HelpTip>
        </span>
        <textarea
          value={String(location.description ?? '')}
          onChange={(event) => updateField('description', event.target.value)}
          rows={3}
        />
      </label>
      <label className="field span-2">
        <span>
          Travel description
          <HelpTip label="Travel description help">
            Extra prose or warnings shown during travel to or from this location.
          </HelpTip>
        </span>
        <textarea
          value={String(location.travel_description ?? '')}
          onChange={(event) => updateField('travel_description', event.target.value)}
          rows={3}
        />
      </label>
      <div className="field span-2">
        <span>
          Exploration command biomes
          <HelpTip label="Exploration command biomes help">
            Checked biome codes are available for that command at this location.
          </HelpTip>
        </span>
        <div className="command-biome-grid">
          {EXPLORATION_LOCATION_COMMANDS.map((command) => {
            const selected = asStringList(commands[command]);
            const options = optionsWithSelected(biomeOptions, selected);

            return (
              <div className="command-biome-group" key={command}>
                <strong>{command}</strong>
                {options.length ? (
                  <div className="checkbox-grid compact biome-checkboxes">
                    {options.map((code) => (
                      <label className="option-tile" key={code}>
                        <input
                          type="checkbox"
                          checked={selected.includes(code)}
                          onChange={(event) =>
                            updateCommand(
                              command,
                              toggleStringListValue(selected, code, event.target.checked),
                            )
                          }
                        />
                        <span>{code}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="field-note">Add biome registry entries before wiring commands.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="field span-2">
        <span>
          Service commands
          <HelpTip label="Service commands help">
            Checked commands are available at this location without a biome list.
          </HelpTip>
        </span>
        <div className="checkbox-grid compact">
          {SERVICE_LOCATION_COMMANDS.map((command) => (
            <label className="switch-line" key={command}>
              <input
                type="checkbox"
                checked={commands[command] === true}
                onChange={(event) => updateCommand(command, event.target.checked || undefined)}
              />
              <span>{command}</span>
            </label>
          ))}
        </div>
      </div>
      <CsvTextField
        label="Services"
        value={location.services}
        onChange={(value) => updateField('services', value)}
        help="Comma-separated shop or service ids present here."
      />
      <CsvTextField
        label="Library topics"
        value={location.library_topics}
        onChange={(value) => updateField('library_topics', value)}
        help="Comma-separated topic hints for library inference."
      />
    </div>
  );
}

function CsvTextField({
  label,
  value,
  onChange,
  help,
  placeholder,
}: {
  label: string;
  value: unknown;
  onChange: (value: string[]) => void;
  help?: string;
  placeholder?: string;
}) {
  const externalDraft = useMemo(() => arrayToCsv(value), [value]);
  const [draft, setDraft] = useState(externalDraft);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setDraft(externalDraft);
  }, [externalDraft, isEditing]);

  function commit(text: string) {
    onChange(csvToArray(text));
  }

  return (
    <label className="field">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      <input
        value={draft}
        onFocus={() => setIsEditing(true)}
        onChange={(event) => {
          setDraft(event.target.value);
          commit(event.target.value);
        }}
        onBlur={() => {
          const cleaned = csvToArray(draft);
          setIsEditing(false);
          setDraft(arrayToCsv(cleaned));
          onChange(cleaned);
        }}
        placeholder={placeholder}
      />
    </label>
  );
}

function LocationEncounterGvarField({
  locationId,
  value,
  onChange,
  token,
  setStatus,
  setSteps,
  upsertRelatedGvar,
  relatedGvars,
  updateRelatedGvarSource,
}: {
  locationId: string;
  value: string;
  onChange: (value: string | undefined) => void;
  token: string;
  setStatus: (value: string) => void;
  setSteps: (value: RunStep[]) => void;
  upsertRelatedGvar: (source: LoadedGvarSource) => void;
  relatedGvars: LoadedGvarSource[];
  updateRelatedGvarSource: (id: string, value: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const gvarId = validGvarId(value);
  const hasValue = value.trim() !== '';
  const error = hasValue && !gvarId ? 'Encounter gvar ids must be Avrae workshop UUIDs.' : '';
  const path = `world_data.locations.${locationId}.encounters_gvar_id`;
  const label = `world data.locations.${locationId}.encounters gvar id`;
  const source = gvarId ? relatedGvars.find((row) => row.id === gvarId) : undefined;
  const dashboardUrl = makeGvarDashboardUrl(value);

  async function loadEncounterGvar() {
    let id = '';
    try {
      id = normalizeGvarId(value);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Invalid gvar id.';
      setStatus(message);
      setSteps([{ label: `Read ${label}`, state: 'failed', detail: message }]);
      return;
    }

    if (!id) {
      setStatus('Enter an encounter gvar id before loading.');
      return;
    }

    if (!token.trim()) {
      const message = 'Add AVRAE_TOKEN to load this encounter gvar from Avrae.';
      upsertRelatedGvar({
        id,
        label,
        path,
        kind: 'gvar',
        value: '',
        loaded: false,
        error: message,
      });
      setStatus(message);
      setSteps([{ label: `Read ${label}`, state: 'failed', detail: 'AVRAE_TOKEN is empty.' }]);
      return;
    }

    const nextSteps: RunStep[] = [{ label: `Read ${label}`, state: 'running' }];
    setSteps([...nextSteps]);
    setIsLoading(true);

    try {
      const gvar = await fetchGvar(id, token.trim());
      const body = String(gvar.value ?? '');
      upsertRelatedGvar({
        id,
        label,
        path,
        kind: kindFromSource(body, 'gvar'),
        value: body,
        loaded: true,
      });
      nextSteps[0] = { label: `Read ${label}`, state: 'success' };
      setSteps([...nextSteps]);
      setStatus(`Loaded encounter gvar for ${locationId}.`);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Could not load encounter gvar.';
      upsertRelatedGvar({
        id,
        label,
        path,
        kind: 'gvar',
        value: '',
        loaded: false,
        error: message,
      });
      nextSteps[0] = { label: `Read ${label}`, state: 'failed', detail: message };
      setSteps([...nextSteps]);
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="field span-2">
      <span>
        Encounter gvar id
        <HelpTip label="Encounter gvar id help">
          Optional place-specific encounter module gvar UUID.
        </HelpTip>
      </span>
      <div className="field-with-actions">
        <input
          className={error ? 'invalid' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value || undefined)}
          onBlur={() => {
            if (!value.trim()) return;
            const id = validGvarId(value);
            if (id) onChange(id);
          }}
          placeholder="ffffffff-ffff-ffff-ffff-ffffffffffff"
        />
        <button
          type="button"
          className="field-action-button"
          onClick={loadEncounterGvar}
          disabled={!gvarId || isLoading}
          title={gvarId ? 'Read this encounter gvar from Avrae' : 'Enter a valid gvar UUID'}
        >
          <UploadCloud size={16} aria-hidden="true" />
          Load
        </button>
        <button
          type="button"
          className="field-action-button"
          onClick={() => {
            if (dashboardUrl) window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
          }}
          disabled={!dashboardUrl}
          title="Open in Avrae dashboard"
          aria-label="Open encounter gvar in Avrae dashboard"
        >
          <ExternalLink size={16} aria-hidden="true" />
        </button>
      </div>
      {error ? <small className="field-note">{error}</small> : null}
      {source ? (
        <div className="location-gvar-preview">
          <GvarSourceRows rows={[source]} onChange={updateRelatedGvarSource} />
        </div>
      ) : null}
    </div>
  );
}

function PathBuilder({
  paths,
  locations,
  updateConfig,
}: {
  paths: unknown[];
  locations: AnyRecord;
  updateConfig: (path: string, value: unknown) => void;
}) {
  const locationIds = Object.keys(locations);

  function updatePathItem(index: number, value: AnyRecord) {
    updateConfig(
      'world_data.paths',
      paths.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function removePath(index: number) {
    updateConfig(
      'world_data.paths',
      paths.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  return (
    <section className="world-editor">
      <div className="collection-editor-head">
        <h3>Paths</h3>
        <button
          type="button"
          onClick={() =>
            updateConfig('world_data.paths', [
              ...paths,
              {
                from: locationIds[0] ?? '',
                to: locationIds[1] ?? locationIds[0] ?? '',
                steps: [{ type: 'encounter', biome: '' }],
              },
            ])
          }
        >
          <Save size={16} aria-hidden="true" />
          Add Path
        </button>
      </div>
      <div className="collection-list">
        {paths.map((path, index) => {
          const record = asRecord(path);
          return (
            <details className="collection-item" open={index === 0} key={index}>
              <summary className="collection-item-head">
                <div>
                  <strong>
                    {String(record.from ?? 'unknown')} to {String(record.to ?? 'unknown')}
                  </strong>
                  <span>{String(record.label ?? 'route')}</span>
                </div>
                <button
                  type="button"
                  className="field-action-button"
                  onClick={(event) => {
                    event.preventDefault();
                    removePath(index);
                  }}
                  aria-label={`Remove path ${index + 1}`}
                  title="Remove path"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </summary>
              <PathFields
                path={record}
                locationIds={locationIds}
                onChange={(next) => updatePathItem(index, next)}
              />
            </details>
          );
        })}
        {paths.length === 0 ? (
          <p className="collection-empty">No paths yet. Add one to build travel routes.</p>
        ) : null}
      </div>
    </section>
  );
}

function PathFields({
  path,
  locationIds,
  onChange,
}: {
  path: AnyRecord;
  locationIds: string[];
  onChange: (path: AnyRecord) => void;
}) {
  const requirements = asRecord(path.requirements);
  const cost = asRecord(path.cost);
  const steps = Array.isArray(path.steps) ? path.steps.map(asRecord) : [];

  function updateField(key: string, value: unknown) {
    onChange({ ...path, [key]: value || undefined });
  }

  function updateStep(index: number, step: AnyRecord) {
    onChange({
      ...path,
      steps: steps.map((item, itemIndex) => (itemIndex === index ? step : item)),
    });
  }

  return (
    <div className="form-grid compact">
      <LocationSelect
        label="From"
        value={String(path.from ?? '')}
        locationIds={locationIds}
        onChange={(value) => updateField('from', value)}
      />
      <LocationSelect
        label="To"
        value={String(path.to ?? '')}
        locationIds={locationIds}
        onChange={(value) => updateField('to', value)}
      />
      <TextField
        label="Label"
        value={String(path.label ?? '')}
        onChange={(value) => updateField('label', value)}
        help="Optional display hint for this route."
      />
      <TextField
        label="Transport requirement"
        value={arrayToCsv(requirements.transport)}
        onChange={(value) =>
          updateField('requirements', {
            ...requirements,
            transport: csvToSingleOrArray(value),
          })
        }
        help="Transport id or ids required for this path."
      />
      <TextField
        label="Gold cost"
        value={String(cost.gold ?? '')}
        onChange={(value) => updateField('cost', { ...cost, gold: numberOrUndefined(value) })}
        help="Optional lump gold cost for this route."
      />
      <div className="field span-2">
        <span>
          Journey steps
          <HelpTip label="Journey steps help">
            Ordered route steps: encounter, cost, or proceed.
          </HelpTip>
        </span>
        <div className="path-step-list">
          {steps.map((step, index) => (
            <div className="path-step-row" key={index}>
              <select
                value={String(step.type ?? 'encounter')}
                onChange={(event) => updateStep(index, { type: event.target.value })}
                aria-label={`Step ${index + 1} type`}
              >
                <option value="encounter">encounter</option>
                <option value="cost">cost</option>
                <option value="proceed">proceed</option>
              </select>
              {String(step.type ?? 'encounter') === 'encounter' ? (
                <>
                  <input
                    value={String(step.activity ?? '')}
                    onChange={(event) =>
                      updateStep(index, { ...step, activity: event.target.value || undefined })
                    }
                    placeholder="activity"
                    aria-label={`Step ${index + 1} activity`}
                  />
                  <input
                    value={String(step.biome ?? '')}
                    onChange={(event) => updateStep(index, { ...step, biome: event.target.value })}
                    placeholder="biome"
                    aria-label={`Step ${index + 1} biome`}
                  />
                </>
              ) : null}
              {step.type === 'cost' ? (
                <input
                  value={String(step.gold ?? '')}
                  onChange={(event) =>
                    updateStep(index, { ...step, gold: numberOrUndefined(event.target.value) })
                  }
                  placeholder="gold"
                  aria-label={`Step ${index + 1} gold`}
                />
              ) : null}
              {step.type === 'proceed' ? (
                <input
                  value={String(step.description ?? '')}
                  onChange={(event) =>
                    updateStep(index, { ...step, description: event.target.value })
                  }
                  placeholder="description"
                  aria-label={`Step ${index + 1} description`}
                />
              ) : null}
              <button
                type="button"
                className="field-action-button"
                onClick={() =>
                  onChange({ ...path, steps: steps.filter((_, row) => row !== index) })
                }
                aria-label={`Remove step ${index + 1}`}
                title="Remove step"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <div className="button-row">
          <button
            type="button"
            onClick={() =>
              onChange({ ...path, steps: [...steps, { type: 'encounter', biome: '' }] })
            }
          >
            <Save size={16} aria-hidden="true" />
            Add Step
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationSelect({
  label,
  value,
  locationIds,
  onChange,
  help = 'Location id for this route endpoint.',
}: {
  label: string;
  value: string;
  locationIds: string[];
  onChange: (value: string) => void;
  help?: string;
}) {
  const isKnownValue = !value || locationIds.includes(value);
  return (
    <label className="field">
      <span>
        {label}
        <HelpTip label={`${label} location help`}>{help}</HelpTip>
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {!isKnownValue ? <option value={value}>Unknown: {value}</option> : null}
        <option value="">Unset</option>
        {locationIds.map((id) => (
          <option value={id} key={id}>
            {id}
          </option>
        ))}
      </select>
    </label>
  );
}

function slugValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .replace(/\s+/g, '_');
}

function titleFromSlug(value: string) {
  return value
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function csvToArray(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function csvToSingleOrArray(value: string) {
  const entries = csvToArray(value);
  if (entries.length === 0) return undefined;
  return entries.length === 1 ? entries[0] : entries;
}

function asStringList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function toggleStringListValue(current: string[], option: string, checked: boolean) {
  if (checked) return current.includes(option) ? current : [...current, option];
  return current.filter((item) => item !== option);
}

function optionsWithSelected(options: string[], selected: string[]) {
  const seen = new Set(options);
  return [...options, ...selected.filter((item) => !seen.has(item))];
}

function arrayToCsv(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function numberOrUndefined(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}

function numberOrNull(value: string) {
  const parsed = numberOrUndefined(value);
  return parsed === undefined ? null : parsed;
}

function CheckboxGroupField({
  label,
  value,
  options,
  onChange,
  help,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  help?: string;
}) {
  const renderedOptions = optionsWithSelected(options, value);

  return (
    <div className="field span-2">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      <div className="checkbox-grid option-grid">
        {renderedOptions.map((option) => (
          <label className="option-tile" key={option}>
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(event) =>
                onChange(toggleStringListValue(value, option, event.target.checked))
              }
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}) {
  const renderedOptions = optionsWithSelected(options, value);
  const summary = value.length ? `${value.length} selected` : 'None selected';

  return (
    <details className="multi-select">
      <summary>{summary}</summary>
      <div className="multi-select-menu" role="group" aria-label={label}>
        {renderedOptions.map((option) => (
          <label className="option-tile" key={option}>
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(event) =>
                onChange(toggleStringListValue(value, option, event.target.checked))
              }
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

function BiomesView({
  config,
  updateConfig,
  token,
  setStatus,
  setSteps,
  upsertRelatedGvar,
  relatedGvars,
  updateRelatedGvarSource,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
  token: string;
  setStatus: (value: string) => void;
  setSteps: (value: RunStep[]) => void;
  upsertRelatedGvar: (source: LoadedGvarSource) => void;
  relatedGvars: LoadedGvarSource[];
  updateRelatedGvarSource: (id: string, value: string) => void;
}) {
  const biomes = asRecord(config.world_data.biomes);
  const [newCode, setNewCode] = useState('forest');
  const [newPreset, setNewPreset] = useState('forest');
  const [biomeRows, setBiomeRows] = useState<CompactEncounterRow[]>([]);
  const [editingBiome, setEditingBiome] = useState<string | null>(null);
  const [localBiomeRows, setLocalBiomeRows] = useState<Record<string, CompactEncounterRow[]>>({});
  const customTemplates = useMemo(() => customTemplatesFromConfig(config), [config]);
  const templates = useMemo(() => [...ENCOUNTER_TEMPLATES, ...customTemplates], [customTemplates]);

  function saveCustomTemplates(nextTemplates: EncounterTemplate[]) {
    updateConfig('encounter_templates', templatesToConfig(nextTemplates));
    updateConfig('encounter_template_meta', templatesToMeta(nextTemplates));
  }

  function addBiome() {
    const code = normaliseBiomeCode(newCode);
    if (!code) return;
    updateConfig(`world_data.biomes.${code}`, {
      name: formatBiomeName(code),
      gvar_id: engineBiomeGvarId(newPreset),
    });
  }

  async function addCustomBiome() {
    const code = normaliseBiomeCode(newCode);
    if (!code) return;

    const name = formatBiomeName(code);
    if (!token.trim()) {
      updateConfig(`world_data.biomes.${code}`, {
        name,
        gvar_id: undefined,
      });
      setStatus('Added a custom biome draft. Add an Avrae token to create its backing gvar.');
      return;
    }

    const nextSteps: RunStep[] = [
      { label: `Create ${name} biome gvar`, state: 'running' },
      { label: 'Insert biome gvar id into config', state: 'pending' },
    ];
    setSteps([...nextSteps]);

    try {
      const body = JSON.stringify([], null, 2);
      const created = await createGvar(token.trim(), body, `${name} biome`);
      const id = normalizeGvarId(String(created.id ?? ''));
      nextSteps[0] = { label: `Create ${name} biome gvar`, state: 'success', detail: id };
      nextSteps[1] = { label: 'Insert biome gvar id into config', state: 'running' };
      setSteps([...nextSteps]);

      updateConfig(`world_data.biomes.${code}`, { name, gvar_id: id });
      upsertRelatedGvar({
        id,
        label: `world_data.biomes.${code}.gvar_id`,
        path: `world_data.biomes.${code}.gvar_id`,
        kind: 'json',
        value: body,
        loaded: true,
      });
      nextSteps[1] = { label: 'Insert biome gvar id into config', state: 'success' };
      setSteps([...nextSteps]);
      setStatus(`Created custom biome gvar for ${name}.`);
      setEditingBiome(code);
    } catch (error) {
      const index = nextSteps.findIndex((item) => item.state === 'running');
      if (index >= 0) {
        nextSteps[index] = {
          ...nextSteps[index],
          state: 'failed',
          detail: error instanceof Error ? error.message : 'Unknown error',
        };
      }
      setSteps([...nextSteps]);
      setStatus(error instanceof Error ? error.message : 'Could not create custom biome gvar.');
    }
  }

  function rowsForBiome(code: string, gvarId: string) {
    const source = relatedGvars.find((row) => row.id === gvarId);
    if (source?.value) return compactRowsFromSource(source.value);
    return localBiomeRows[code] ?? [];
  }

  function updateRowsForBiome(code: string, gvarId: string, rows: CompactEncounterRow[]) {
    const validId = validGvarId(gvarId);
    if (validId) {
      updateRelatedGvarSource(validId, JSON.stringify(rows, null, 2));
      return;
    }

    setLocalBiomeRows((current) => ({ ...current, [code]: rows }));
  }

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Compass size={20} />}
        title="Biomes & Encounters"
        help="Biome registry entries map short codes to engine or custom biome gvars. Encounter rows become custom biome gvar bodies."
      />
      <div className="biome-add-row">
        <label className="field">
          <span>
            Biome code
            <HelpTip label="Biome code help">
              Stable lowercase key used by locations, paths, and exploration commands.
            </HelpTip>
          </span>
          <input
            value={newCode}
            onChange={(event) => setNewCode(event.target.value)}
            placeholder="forest or misty_forest"
          />
        </label>
        <label className="field">
          <span>
            Preset source
            <HelpTip label="Preset source help">
              Engine biome preset to reference when adding a non-custom biome.
            </HelpTip>
          </span>
          <select value={newPreset} onChange={(event) => setNewPreset(event.target.value)}>
            {ENGINE_BIOMES.map((code) => (
              <option key={code} value={code}>
                {formatBiomeName(code)} - {ENGINE_BIOME_NOTES[code]}
              </option>
            ))}
          </select>
        </label>
        <div className="button-row biome-add-actions">
          <button type="button" onClick={addBiome}>
            <Save size={16} aria-hidden="true" />
            Add Preset Biome
          </button>
          <button type="button" onClick={addCustomBiome}>
            <FileCode2 size={16} aria-hidden="true" />
            Add Custom Biome
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Use preset</th>
              <th>Preset / custom gvar</th>
              <th>Builder</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(biomes).map(([code, value]) => {
              const biome = asRecord(value);
              const preset = presetFromGvarId(biome.gvar_id);
              const usePreset = Boolean(preset);
              const gvarId = String(biome.gvar_id ?? '');
              const error = usePreset ? '' : customGvarError(gvarId);
              const customReady = !usePreset && String(biome.name ?? '').trim();

              return (
                <tr key={code}>
                  <td>{code}</td>
                  <td>
                    <input
                      value={String(biome.name ?? '')}
                      onChange={(event) =>
                        updateConfig(`world_data.biomes.${code}.name`, event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <label className="switch-line">
                      <input
                        type="checkbox"
                        checked={usePreset}
                        onChange={(event) =>
                          updateConfig(
                            `world_data.biomes.${code}.gvar_id`,
                            event.target.checked ? engineBiomeGvarId(ENGINE_BIOMES[0]) : undefined,
                          )
                        }
                      />
                      <span>use preset</span>
                    </label>
                  </td>
                  <td>
                    {usePreset ? (
                      <select
                        value={preset}
                        onChange={(event) =>
                          updateConfig(
                            `world_data.biomes.${code}.gvar_id`,
                            engineBiomeGvarId(event.target.value),
                          )
                        }
                      >
                        {ENGINE_BIOMES.map((presetCode) => (
                          <option key={presetCode} value={presetCode}>
                            {formatBiomeName(presetCode)} - {ENGINE_BIOME_NOTES[presetCode]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="stacked-field">
                        <input
                          className={error && gvarId.trim() ? 'invalid' : undefined}
                          value={gvarId}
                          onChange={(event) =>
                            updateConfig(
                              `world_data.biomes.${code}.gvar_id`,
                              event.target.value || undefined,
                            )
                          }
                          onBlur={() => {
                            if (!gvarId.trim()) return;
                            try {
                              updateConfig(
                                `world_data.biomes.${code}.gvar_id`,
                                normalizeGvarId(gvarId),
                              );
                            } catch {
                              // Validation text below handles this without changing input.
                            }
                          }}
                          placeholder="custom biome gvar UUID"
                        />
                        {error ? <small className="field-note">{error}</small> : null}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        const validId = validGvarId(gvarId);
                        if (validId && !relatedGvars.some((row) => row.id === validId)) {
                          upsertRelatedGvar({
                            id: validId,
                            label: `world_data.biomes.${code}.gvar_id`,
                            path: `world_data.biomes.${code}.gvar_id`,
                            kind: 'json',
                            value: '[]',
                            loaded: true,
                          });
                        }
                        setEditingBiome(code);
                      }}
                      disabled={!customReady}
                    >
                      <FileCode2 size={16} aria-hidden="true" />
                      Open Builder
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <JsonField
        label="Biome registry JSON"
        value={biomes}
        onCommit={(value) => updateConfig('world_data.biomes', value)}
      />
      <div className="biome-gvar-workbench">
        <EncounterRowBuilder
          rows={biomeRows}
          onRowsChange={setBiomeRows}
          title="Scratch encounter row builder"
          rowListTitle="Scratch biome gvar body"
          templates={templates}
        />
        <CustomTemplateBuilder
          templates={customTemplates}
          onTemplatesChange={saveCustomTemplates}
        />
      </div>
      {editingBiome ? (
        <BiomeEncounterModal
          code={editingBiome}
          biome={asRecord(biomes[editingBiome])}
          rows={rowsForBiome(
            editingBiome,
            validGvarId(String(asRecord(biomes[editingBiome]).gvar_id ?? '')),
          )}
          onRowsChange={(rows) =>
            updateRowsForBiome(
              editingBiome,
              String(asRecord(biomes[editingBiome]).gvar_id ?? ''),
              rows,
            )
          }
          templates={templates}
          onClose={() => setEditingBiome(null)}
        />
      ) : null}
    </section>
  );
}

function compactRowsFromSource(source: string): CompactEncounterRow[] {
  try {
    const parsed = JSON.parse(source);
    return Array.isArray(parsed) ? (parsed as CompactEncounterRow[]) : [];
  } catch {
    return [];
  }
}

function validGvarId(value: string) {
  try {
    return normalizeGvarId(value);
  } catch {
    return '';
  }
}

function BiomeEncounterModal({
  code,
  biome,
  rows,
  onRowsChange,
  templates,
  onClose,
}: {
  code: string;
  biome: AnyRecord;
  rows: CompactEncounterRow[];
  onRowsChange: (rows: CompactEncounterRow[]) => void;
  templates: EncounterTemplate[];
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const gvarId = String(biome.gvar_id ?? '');

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal wide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal-header">
          <div className="modal-heading">
            <span className="modal-icon" aria-hidden="true">
              <Compass size={22} />
            </span>
            <div>
              <h2 id={titleId}>{String(biome.name ?? formatBiomeName(code))}</h2>
              <p>
                {gvarId
                  ? `Editing biome gvar ${gvarId}.`
                  : 'Editing a local draft until this biome has a gvar id.'}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            className="icon-only"
            type="button"
            aria-label="Close biome encounter builder"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">
          <EncounterRowBuilder
            rows={rows}
            onRowsChange={onRowsChange}
            title="Encounter row builder"
            rowListTitle="Biome gvar body"
            templates={templates}
          />
          <div className="modal-actions">
            <button className="primary" type="button" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function ExportView(props: {
  serialized: string;
  configId: string;
  shareLink: string;
  sourceRows: LoadedGvarSource[];
  steps: RunStep[];
  publishToAvrae: () => void;
  copy: (text: string, label: string) => Promise<void>;
  canPublish: boolean;
  isBusy: boolean;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileDown size={20} />}
        title="Export"
        help="Exports never include tokens. Publishing uses the token only from the current browser form."
      />
      <div className="button-row">
        <button type="button" onClick={() => props.copy(props.serialized, 'Gvar body')}>
          <Clipboard size={16} aria-hidden="true" />
          Copy Base Gvar
        </button>
        <button
          type="button"
          onClick={() => downloadText('westmarch_config.gvar', props.serialized)}
        >
          <Download size={16} aria-hidden="true" />
          Download Gvar
        </button>
        <button type="button" onClick={() => props.copy(props.shareLink, 'Share link')}>
          <Clipboard size={16} aria-hidden="true" />
          Copy Link
        </button>
        <button
          type="button"
          className="primary"
          onClick={props.publishToAvrae}
          disabled={!props.canPublish || props.isBusy}
        >
          <UploadCloud size={16} aria-hidden="true" />
          Publish
        </button>
      </div>
      <label className="field">
        <span>Share link</span>
        <input readOnly value={props.shareLink} />
      </label>
      <div className="field">
        <span>Generated and loaded gvar bodies</span>
        <GvarSourceRows
          rows={props.sourceRows}
          readOnlyIds={props.sourceRows.map((row) => row.id)}
          onCopy={(value, label) => void props.copy(value, label)}
          onDownload={(id, value) =>
            downloadText(
              gvarFilename(id, props.sourceRows.find((row) => row.id === id)?.kind ?? 'gvar'),
              value,
            )
          }
        />
      </div>
      <RunSteps steps={props.steps} />
    </section>
  );
}

function RawSourceView({
  rawSource,
  setRawSource,
  sourceRows,
  updateSourceRow,
  parsedMode,
}: {
  rawSource: string;
  setRawSource: (value: string) => void;
  sourceRows: LoadedGvarSource[];
  updateSourceRow: (id: string, value: string) => void;
  parsedMode: string;
}) {
  const rows = sourceRows.length
    ? sourceRows
    : sourceRowsWithBase({ configId: '', rawSource, related: [] });

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileCode2 size={20} />}
        title="Raw Source"
        help="Directly edit the base config and referenced gvars with syntax highlighting, JSON linting, and Drac2 diagnostics."
      />
      <span className="badge neutral">Parse mode: {parsedMode}</span>
      <div className="field span-2">
        <span>
          Raw gvar sources
          <RawSourceHelp />
        </span>
        <GvarSourceRows
          rows={rows}
          onChange={(id, value) => {
            if (id === rows[0]?.id) {
              setRawSource(value);
              return;
            }
            updateSourceRow(id, value);
          }}
        />
      </div>
    </section>
  );
}

function RawSourceHelp() {
  return (
    <HelpDialog
      label="Raw gvar source help"
      title="Writing Config Gvars"
      description="Directly edit the config and related gvars with syntax highlighting and Drac2 diagnostics."
    >
      <div className="help-option-list">
        <article className="help-option">
          <strong>Config files are owner gvars</strong>
          <p>
            The base config is a Python-style Drac2 module. Define top-level values such as{' '}
            <code>display</code>, <code>subsystems</code>, <code>world_data</code>, and{' '}
            <code>policies</code>.
          </p>
        </article>
        <article className="help-option">
          <strong>Use Python literals</strong>
          <p>
            Use dictionaries, lists, strings, numbers, <code>True</code>, <code>False</code>, and{' '}
            <code>None</code>. The guided editor can parse literal assignments and preserve custom
            function blocks.
          </p>
        </article>
        <article className="help-option">
          <strong>Keep large data in separate gvars</strong>
          <p>
            Put biome pools, catalogues, books, recipes, and other large JSON bodies in related
            gvars, then reference their UUIDs from config fields. Each referenced gvar appears as
            its own collapsible editor row.
          </p>
        </article>
      </div>
    </HelpDialog>
  );
}

function EmptyState({ setSection }: { setSection: (section: Section) => void }) {
  return (
    <section className="section-panel empty">
      <FileText size={28} aria-hidden="true" />
      <h2>No Config Loaded</h2>
      <button type="button" onClick={() => setSection('setup')}>
        <UploadCloud size={16} aria-hidden="true" />
        Open Setup
      </button>
    </section>
  );
}
