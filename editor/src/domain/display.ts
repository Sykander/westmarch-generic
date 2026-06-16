export const FOOTER_BEHAVIOUR_OPTIONS = [
  {
    value: 'balanced',
    label: 'Balanced',
    help: 'Randomly uses helpful tips, fixed footer texts, help prompts, or credits.',
  },
  {
    value: 'helpful_tips',
    label: 'Helpful tips',
    help: 'Uses a random owner tip, or the engine default tips when none are configured.',
  },
  {
    value: 'string',
    label: 'Fixed text',
    help: 'Uses one configured fixed footer text, then falls back to the title or world name.',
  },
  {
    value: 'help',
    label: 'Help prompt',
    help: 'Uses a short command-help prompt for the command family that produced the embed.',
  },
  {
    value: 'credits',
    label: 'Credits',
    help: 'Uses owner-configured credits, or the engine default credits line.',
  },
];

export const FOOTER_BEHAVIOUR_HELP =
  'Controls command embed footers. Balanced is the recommended default; fixed text is best when embeds should use your configured footer text pool.';

export const DISPLAY_OVERRIDE_HELP =
  'Overrides embed display fields for this layer. Empty fields inherit from the broader display settings.';

export function monsterArtSelectValue(value: unknown): string {
  const mode = String(value ?? 'thumbnail')
    .trim()
    .toLowerCase();
  if (mode === 'thumb') return 'thumbnail';
  if (mode === 'none') return 'off';
  if (['thumbnail', 'image', 'off'].includes(mode)) return mode;
  return 'thumbnail';
}
