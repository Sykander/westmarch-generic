export type Section =
  | 'setup'
  | 'check'
  | 'display'
  | 'subsystems'
  | 'policies'
  | 'world'
  | 'biomes'
  | 'encounters'
  | 'export';

export const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: 'setup', label: 'Setup' },
  { id: 'display', label: 'Display' },
  { id: 'subsystems', label: 'Subsystems' },
  { id: 'policies', label: 'Policies' },
  { id: 'world', label: 'World' },
  { id: 'biomes', label: 'Biomes' },
  { id: 'encounters', label: 'Encounters' },
  { id: 'check', label: 'Check' },
  { id: 'export', label: 'Export' },
];

export const SECTION_DESCRIPTIONS: Record<Section, string> = {
  setup: 'Load from Avrae, paste source, or start a new config.',
  display: 'Set world branding, rules edition, embed colour, footer, and description.',
  subsystems: 'Choose command families, command toggles, and subsystem display overrides.',
  policies: 'Tune encounter, repeat, footer, and distribution behavior.',
  world: 'Configure locations, paths, and world-level travel data.',
  biomes: 'Wire biome presets or custom biome gvars into the world registry.',
  encounters: 'Build biome JSON rows from pool tags and encounter templates.',
  check: 'Review browser validation before exporting or publishing.',
  export: 'Copy, download, or publish the generated gvar contents.',
};

export function sectionFor(section: string): Section {
  const match = SECTIONS.find((item) => item.label === section || item.id === section);
  return match?.id ?? 'check';
}
