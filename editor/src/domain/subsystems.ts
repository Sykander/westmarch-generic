import type { SubsystemDefinition } from '../app/types';
import { DEFAULT_SUBSYSTEM_COMMANDS } from '../lib/config';

const SUBSYSTEM_DETAILS: Record<
  string,
  Pick<SubsystemDefinition, 'label' | 'implemented' | 'detail'>
> = {
  exploration: {
    label: 'Exploration',
    implemented: true,
    detail: 'Exploration activity commands are available in this MVP editor.',
  },
  travel: {
    label: 'Travel',
    implemented: false,
    detail:
      'Travel, location, time, and weather controls are planned but not implemented in the browser editor yet.',
  },
  downtime: {
    label: 'Downtime',
    implemented: false,
    detail: 'Downtime controls are planned for a later pass once the command behavior is stable.',
  },
  crafting: {
    label: 'Crafting',
    implemented: false,
    detail: 'Crafting, brewing, enchanting, and scribing controls are planned but locked for now.',
  },
  economy: {
    label: 'Economy',
    implemented: false,
    detail:
      'Job, shop, selling, and wallet controls are planned but not ready for guided editing yet.',
  },
  content: {
    label: 'Content',
    implemented: false,
    detail:
      'Library and reading controls are planned but not implemented in the guided editor yet.',
  },
  misc: {
    label: 'Misc',
    implemented: false,
    detail: 'Quest and recipe controls are planned but still awaiting a proper guided workflow.',
  },
};

export const SUBSYSTEM_DEFINITIONS: SubsystemDefinition[] = Object.entries(
  DEFAULT_SUBSYSTEM_COMMANDS,
).map(([key, commands]) => ({
  key,
  commands,
  ...(SUBSYSTEM_DETAILS[key] ?? {
    label: key,
    implemented: false,
    detail: 'This subsystem is planned but not implemented in the browser editor yet.',
  }),
}));
