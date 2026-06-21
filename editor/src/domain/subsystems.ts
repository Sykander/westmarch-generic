import type { SubsystemDefinition } from '../app/types';
import { DEFAULT_SUBSYSTEM_COMMANDS } from '../lib/config';

const SUBSYSTEM_DETAILS: Record<
  string,
  Pick<SubsystemDefinition, 'label' | 'implemented' | 'detail' | 'dependencies'>
> = {
  exploration: {
    label: 'Exploration',
    implemented: true,
    detail: 'Exploration activity commands are available in this MVP editor.',
    dependencies: [
      {
        label: 'Bags workshop',
        level: 'recommended',
        detail: 'Can add loot and gathering rewards to character bags when installed.',
      },
    ],
  },
  travel: {
    label: 'Travel',
    implemented: true,
    detail:
      'Travel, location, time, and weather commands are available when their world data is configured.',
    dependencies: [
      {
        label: 'vSheet',
        level: 'recommended',
        detail: 'Character sheet/location conventions are easier to keep consistent.',
      },
    ],
  },
  downtime: {
    label: 'Downtime',
    implemented: true,
    detail:
      'Downtime command toggles and policy checks are available, including crafting resource integration.',
  },
  crafting: {
    label: 'Crafting',
    implemented: true,
    detail:
      'Crafting, brewing, enchanting, and scribing controls are available with catalogue, resource, and item-output policies.',
    dependencies: [
      {
        label: 'Downtime',
        level: 'recommended',
        detail: 'Tracked downtime lets crafting commands check or deduct workdays.',
      },
      {
        label: 'Bags workshop',
        level: 'recommended',
        detail: 'Can write crafted output and check ingredients in configured character bags.',
      },
      {
        label: 'Notes workshop',
        level: 'recommended',
        detail: 'Can support recipe notes and player-facing crafting reminders when installed.',
      },
    ],
  },
  economy: {
    label: 'Economy',
    implemented: true,
    detail: 'Job, shop, selling, and wallet command toggles are available in this editor.',
  },
  content: {
    label: 'Content',
    implemented: true,
    detail: 'Library and reading command toggles are available in this editor.',
  },
  misc: {
    label: 'Misc',
    implemented: true,
    detail: 'Quest and recipe command toggles are available in this editor.',
    dependencies: [
      {
        label: 'Notes workshop',
        level: 'recommended',
        detail:
          'Can store quest notes, recipe notes, journals, and player reminders when installed.',
      },
    ],
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
