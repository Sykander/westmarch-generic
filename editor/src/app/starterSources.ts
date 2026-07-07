import starterConfigSource from '../../../src/gvars/configs/starter.gvar?raw';
import forgottenRealms2014ConfigSource from '../../../src/gvars/configs/forgotten_realms_2014.gvar?raw';
import westmarch2014ConfigSource from '../../../src/gvars/configs/westmarch_2014.gvar?raw';

const EDITOR_PRESET_REPLACEMENTS: [string, string][] = [
  ['6c50e5a7-e36b-49fe-96e7-7e82e157bd31', 'engine:configs/forgotten_realms_2014_locations'],
  ['40403500-be2c-4b1a-8170-6176adf87aa5', 'engine:configs/forgotten_realms_2014_paths'],
  ['97a48b87-f253-4feb-90ae-4e4675ba533d', 'engine:configs/westmarch_2014_locations'],
  ['f0243c7a-79af-4ecf-a81b-c9a8df266bb3', 'engine:configs/westmarch_2014_paths'],
];

function editorPresetSource(source: string) {
  return EDITOR_PRESET_REPLACEMENTS.reduce(
    (body, [runtimeId, editorId]) => body.replaceAll(runtimeId, editorId),
    source,
  );
}

export const STARTER_SOURCES = [
  {
    id: 'starter',
    label: 'Starter config',
    source: starterConfigSource,
  },
  {
    id: 'forgotten-realms-2014',
    label: 'Forgotten Realms 2014 config',
    source: editorPresetSource(forgottenRealms2014ConfigSource),
  },
  {
    id: 'westmarch-2014',
    label: 'Westmarch 2014 config',
    source: editorPresetSource(westmarch2014ConfigSource),
  },
] as const;

export type StarterSource = (typeof STARTER_SOURCES)[number];

export function findStarterSource(id: string): StarterSource | undefined {
  return STARTER_SOURCES.find((source) => source.id === id);
}
