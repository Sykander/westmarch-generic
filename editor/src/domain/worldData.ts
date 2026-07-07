import { normalizeGvarId } from '../lib/avrae';
import type { LoadedGvarSource } from '../lib/gvarSources';
import forgottenRealmsLocations from '../../../src/gvars/configs/forgotten_realms_2014_locations.gvar.json' with { type: 'json' };
import forgottenRealmsPaths from '../../../src/gvars/configs/forgotten_realms_2014_paths.gvar.json' with { type: 'json' };
import westmarchLocations from '../../../src/gvars/configs/westmarch_2014_locations.gvar.json' with { type: 'json' };
import westmarchPaths from '../../../src/gvars/configs/westmarch_2014_paths.gvar.json' with { type: 'json' };

export type AnyRecord = Record<string, unknown>;

export const ENGINE_FORGOTTEN_REALMS_LOCATIONS = 'engine:configs/forgotten_realms_2014_locations';
export const ENGINE_FORGOTTEN_REALMS_PATHS = 'engine:configs/forgotten_realms_2014_paths';
export const ENGINE_WESTMARCH_LOCATIONS = 'engine:configs/westmarch_2014_locations';
export const ENGINE_WESTMARCH_PATHS = 'engine:configs/westmarch_2014_paths';

const READ_ONLY_WORLD_GVAR_IDS = new Set([
  ENGINE_FORGOTTEN_REALMS_LOCATIONS,
  ENGINE_FORGOTTEN_REALMS_PATHS,
  ENGINE_WESTMARCH_LOCATIONS,
  ENGINE_WESTMARCH_PATHS,
  '6c50e5a7-e36b-49fe-96e7-7e82e157bd31',
  '40403500-be2c-4b1a-8170-6176adf87aa5',
  'fde0dbeb-d2e3-42fd-8f56-2d94bdf3ac58',
  '19623e1a-3a23-49a0-9d40-986fdd26d7e7',
  '97a48b87-f253-4feb-90ae-4e4675ba533d',
  'f0243c7a-79af-4ecf-a81b-c9a8df266bb3',
  '63722be3-1012-47ea-9262-88bfd26089bb',
  '62c882d0-3cd7-481a-ac10-4eaffcefb361',
]);

const LOCATION_PRESETS: Record<string, AnyRecord> = {
  [ENGINE_FORGOTTEN_REALMS_LOCATIONS]: forgottenRealmsLocations as unknown as AnyRecord,
  '6c50e5a7-e36b-49fe-96e7-7e82e157bd31': forgottenRealmsLocations as unknown as AnyRecord,
  'fde0dbeb-d2e3-42fd-8f56-2d94bdf3ac58': forgottenRealmsLocations as unknown as AnyRecord,
  [ENGINE_WESTMARCH_LOCATIONS]: westmarchLocations as unknown as AnyRecord,
  '97a48b87-f253-4feb-90ae-4e4675ba533d': westmarchLocations as unknown as AnyRecord,
  '63722be3-1012-47ea-9262-88bfd26089bb': westmarchLocations as unknown as AnyRecord,
};

const PATH_PRESETS: Record<string, unknown> = {
  [ENGINE_FORGOTTEN_REALMS_PATHS]: forgottenRealmsPaths,
  '40403500-be2c-4b1a-8170-6176adf87aa5': forgottenRealmsPaths,
  '19623e1a-3a23-49a0-9d40-986fdd26d7e7': forgottenRealmsPaths,
  [ENGINE_WESTMARCH_PATHS]: westmarchPaths,
  'f0243c7a-79af-4ecf-a81b-c9a8df266bb3': westmarchPaths,
  '62c882d0-3cd7-481a-ac10-4eaffcefb361': westmarchPaths,
};

function isPlainRecord(value: unknown): value is AnyRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sourceKey(value: unknown) {
  const text = String(value ?? '')
    .trim()
    .toLowerCase();
  if (text.startsWith('engine:')) return text;
  return normalisedGvarId(text);
}

function normalisedGvarId(value: unknown) {
  try {
    return normalizeGvarId(String(value ?? ''));
  } catch {
    return '';
  }
}

function parseJsonSource(source: LoadedGvarSource | undefined): unknown {
  if (!source?.loaded || source.error || !source.value.trim()) return undefined;

  try {
    return JSON.parse(source.value);
  } catch {
    return undefined;
  }
}

function flattenPathsByFrom(pathsByFrom: AnyRecord): unknown[] {
  const paths: unknown[] = [];
  for (const origin of Object.keys(pathsByFrom)) {
    const entries = pathsByFrom[origin];
    if (!Array.isArray(entries)) continue;
    paths.push(...entries);
  }
  return paths;
}

export function pathsFromSourceValue(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isPlainRecord(value)) return [];
  if (Array.isArray(value.paths)) return value.paths;
  if (isPlainRecord(value.paths_by_from)) return flattenPathsByFrom(value.paths_by_from);
  return [];
}

function pathsByFrom(paths: unknown[]): AnyRecord {
  const out: AnyRecord = {};
  paths.forEach((entry) => {
    const path = isPlainRecord(entry) ? entry : {};
    const from = String(path.from ?? '_unassigned')
      .trim()
      .toLowerCase();
    const key = from || '_unassigned';
    const entries = Array.isArray(out[key]) ? out[key] : [];
    entries.push(entry);
    out[key] = entries;
  });
  return out;
}

export function isReadOnlyWorldGvarId(value: unknown) {
  const key = sourceKey(value);
  return Boolean(key && READ_ONLY_WORLD_GVAR_IDS.has(key));
}

export function findLoadedGvarSource(
  relatedGvars: LoadedGvarSource[],
  idValue: unknown,
): LoadedGvarSource | undefined {
  const id = normalisedGvarId(idValue);
  if (!id) return undefined;
  return relatedGvars.find((row) => row.id === id);
}

export function locationsFromGvarSource(source: LoadedGvarSource | undefined): AnyRecord {
  const parsed = parseJsonSource(source);
  if (!isPlainRecord(parsed)) return {};

  const wrapped = parsed.locations;
  if (isPlainRecord(wrapped)) return wrapped;

  return parsed;
}

export function pathsFromGvarSource(source: LoadedGvarSource | undefined): unknown[] {
  return pathsFromSourceValue(parseJsonSource(source));
}

export function locationsFromPreset(value: unknown): AnyRecord {
  return LOCATION_PRESETS[sourceKey(value)] ?? {};
}

export function pathsFromPreset(value: unknown): unknown[] {
  const preset = PATH_PRESETS[sourceKey(value)];
  return preset == null ? [] : pathsFromSourceValue(preset);
}

export function mergeWorldLocations(externalLocations: AnyRecord, inlineLocations: AnyRecord) {
  return { ...externalLocations, ...inlineLocations };
}

export function mergeWorldPaths(externalPaths: unknown[], inlinePaths: unknown[]) {
  return [...externalPaths, ...inlinePaths];
}

export function worldLocationsSourceBody(locations: AnyRecord) {
  return JSON.stringify(locations, null, 2);
}

export function worldPathsSourceBody(paths: unknown[]) {
  return JSON.stringify({ paths_by_from: pathsByFrom(paths) }, null, 2);
}
