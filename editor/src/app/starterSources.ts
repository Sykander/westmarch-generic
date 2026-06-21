import starterConfigSource from '../../../src/gvars/configs/starter.gvar?raw';
import forgottenRealms2014ConfigSource from '../../../src/gvars/configs/forgotten_realms_2014.gvar?raw';

export const STARTER_SOURCES = [
  {
    id: 'starter',
    label: 'Starter config',
    source: starterConfigSource,
  },
  {
    id: 'forgotten-realms-2014',
    label: 'Forgotten Realms 2014 config',
    source: forgottenRealms2014ConfigSource,
  },
] as const;

export type StarterSource = (typeof STARTER_SOURCES)[number];

export function findStarterSource(id: string): StarterSource | undefined {
  return STARTER_SOURCES.find((source) => source.id === id);
}
