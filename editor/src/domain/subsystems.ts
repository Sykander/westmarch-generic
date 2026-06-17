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
        level: 'required',
        detail: 'Loot and gathering rewards can add items to character bags.',
      },
    ],
  },
  travel: {
    label: 'Travel',
    implemented: true,
    detail:
      'Travel and location commands are available. Time and weather remain planned for a later Phase 1 slice.',
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
    dependencies: [
      {
        label: 'Bard SFX',
        level: 'recommended',
        detail: 'Optional ambient/audio support for downtime scenes.',
        url: 'https://avrae.io/dashboard/workshop/638f5e434dbab671607f33a5',
      },
    ],
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
        detail: 'Bag output and ingredient checks use the configured character bags.',
      },
    ],
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
