import { normalizeGvarId } from './avrae';
import type { ConfigModel } from './config';

export type GvarSourceKind = 'config' | 'json' | 'gvar';

export type GvarReference = {
  id: string;
  path: string;
  label: string;
  kind: GvarSourceKind;
};

export type LoadedGvarSource = GvarReference & {
  value: string;
  loaded: boolean;
  error?: string;
};

const GVAR_ID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

function sourceKindForPath(path: string): GvarSourceKind {
  const lower = path.toLowerCase();
  if (
    lower.includes('biomes.') ||
    lower.includes('book_gvar_ids') ||
    lower.includes('catalogue') ||
    lower.includes('catalogues') ||
    lower.includes('recipes')
  ) {
    return 'json';
  }
  return 'gvar';
}

function labelForPath(path: string) {
  return path.replace(/\.(\d+)(\.|$)/g, '[$1]$2').replace(/_/g, ' ');
}

function addReference(
  references: Map<string, GvarReference>,
  id: string,
  path: string,
  kind = sourceKindForPath(path),
) {
  if (!id) return;
  const normalised = normalizeGvarId(id);
  if (!references.has(normalised)) {
    references.set(normalised, {
      id: normalised,
      path,
      label: labelForPath(path),
      kind,
    });
  }
}

function visitValue(value: unknown, path: string, references: Map<string, GvarReference>) {
  if (typeof value === 'string') {
    if (value.startsWith('engine:')) return;
    const matches = value.matchAll(GVAR_ID_RE);
    for (const match of matches) {
      addReference(references, match[0], path);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => visitValue(item, `${path}.${index}`, references));
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    visitValue(entry, path ? `${path}.${key}` : key, references);
  }
}

export function discoverGvarReferences(model: ConfigModel | unknown): GvarReference[] {
  const references = new Map<string, GvarReference>();
  visitValue(model, '', references);
  return Array.from(references.values());
}

export function discoverGvarReferencesFromSource(
  source: string,
  parentPath: string,
): GvarReference[] {
  const references = new Map<string, GvarReference>();

  try {
    visitValue(JSON.parse(source), parentPath, references);
  } catch {
    let index = 0;
    for (const match of source.matchAll(GVAR_ID_RE)) {
      index += 1;
      addReference(references, match[0], `${parentPath}.source_ref_${index}`);
    }
  }

  return Array.from(references.values());
}

export function kindFromSource(source: string, fallback: GvarSourceKind): GvarSourceKind {
  try {
    JSON.parse(source);
    return 'json';
  } catch {
    return fallback;
  }
}

export function sourceRowsWithBase({
  configId,
  rawSource,
  serialized,
  related,
}: {
  configId: string;
  rawSource: string;
  serialized?: string;
  related: LoadedGvarSource[];
}): LoadedGvarSource[] {
  const baseId = (() => {
    try {
      return normalizeGvarId(configId);
    } catch {
      return configId.trim() || 'westmarch_config';
    }
  })();

  return [
    {
      id: baseId,
      label: 'westmarch_config',
      path: 'svar.westmarch_config',
      kind: 'config',
      value: serialized ?? rawSource,
      loaded: Boolean((serialized ?? rawSource).trim()),
    },
    ...related,
  ];
}
