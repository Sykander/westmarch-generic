import { normalizeGvarId } from '../lib/avrae';

export const ENGINE_BIOMES = [
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

export const ENGINE_BIOME_NOTES: Record<string, string> = {
  beach: 'Coast, tidal zones',
  forest: 'Temperate woodland',
  mountain: 'Peaks, high trails',
  cave: 'Natural underground',
  ruins: 'Ruined structures, dungeons',
  road: 'Highways, trade routes',
  urban: 'Cities, towns',
  river: 'Rivers, lakeshores',
  sea: 'Open ocean',
  plains: 'Grassland, farms',
  desert: 'Arid regions',
  swamp: 'Marshes, bayous',
  sky: 'Aerial or high altitude',
  deep_seas: 'Deep underwater',
  underdark: 'Subterranean realms',
  tundra: 'Arctic wastes',
  jungle: 'Tropical forest',
  volcanic: 'Lava fields, calderas',
  astral: 'Spelljammer or wildspace',
};

const ENGINE_BIOME_PREFIX = 'engine:configs/biomes/';

export function engineBiomeGvarId(code: string) {
  return `${ENGINE_BIOME_PREFIX}${code}`;
}

export function formatBiomeName(code: string) {
  return code
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function presetFromGvarId(value: unknown) {
  const text = String(value ?? '');
  if (!text.startsWith(ENGINE_BIOME_PREFIX)) return '';
  const code = text.slice(ENGINE_BIOME_PREFIX.length);
  return ENGINE_BIOMES.includes(code) ? code : '';
}

export function normaliseBiomeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .replace(/\s+/g, '_');
}

export function customGvarError(value: string) {
  if (!value.trim())
    return 'No gvar id yet. Paste a UUID, or use the planned generate-gvar workflow later.';
  try {
    normalizeGvarId(value);
    return '';
  } catch {
    return 'Custom biome gvar ids must be Avrae workshop UUIDs.';
  }
}
