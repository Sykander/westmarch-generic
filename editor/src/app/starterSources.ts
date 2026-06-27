import starterConfigSource from '../../../src/gvars/configs/starter.gvar?raw';
import forgottenRealms2014ConfigSource from '../../../src/gvars/configs/forgotten_realms_2014.gvar?raw';

function editorPresetSource(source: string) {
  return source
    .replaceAll(
      '6c50e5a7-e36b-49fe-96e7-7e82e157bd31',
      'engine:configs/forgotten_realms_2014_locations',
    )
    .replaceAll(
      '40403500-be2c-4b1a-8170-6176adf87aa5',
      'engine:configs/forgotten_realms_2014_paths',
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
] as const;

export type StarterSource = (typeof STARTER_SOURCES)[number];

export function findStarterSource(id: string): StarterSource | undefined {
  return STARTER_SOURCES.find((source) => source.id === id);
}
