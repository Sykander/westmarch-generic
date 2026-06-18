import type { EncounterTemplate } from '../domain/encounters';
import { HelpTip } from './HelpTip';

export function TemplatePreviewArgField({
  field,
  value,
  onChange,
}: {
  field: EncounterTemplate['fields'][number];
  value: string | number;
  onChange: (value: string | number) => void;
}) {
  return (
    <label className="field">
      <span>
        {field.label}
        <HelpTip label={`${field.label} preview argument help`}>
          This preview value is passed to the template as the corresponding positional args entry.
        </HelpTip>
      </span>
      {field.type === 'select' ? (
        <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
          {(field.values ?? []).map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          rows={4}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type={field.type}
          value={value}
          onChange={(event) =>
            onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)
          }
        />
      )}
    </label>
  );
}

export function defaultPreviewValue(field: EncounterTemplate['fields'][number]) {
  if (field.defaultValue != null) return field.defaultValue;
  if (field.type === 'number') {
    if (field.key === 'qty') return 1;
    if (field.key === 'cr') return 0.25;
    if (field.key === 'dc') return 12;
    if (field.inputType === 'dc') return 12;
    return 1;
  }
  if (field.key === 'title') return 'Wild Herbs';
  if (field.key === 'description') return 'You find useful herbs near a damp hollow.';
  if (field.key === 'kind') return 'gather';
  if (field.inputType === 'text_block') return 'You find useful herbs near a damp hollow.';
  if (field.inputType === 'encounter_kind') return 'gather';
  if (field.inputType === 'skill_name') return 'Survival';
  if (field.inputType === 'save_name') return 'Dexterity';
  if (field.key === 'check') return 'Survival';
  if (field.key === 'skill') return 'Survival';
  if (field.key === 'save') return 'Dexterity';
  if (field.key === 'difficulty') return 'medium';
  if (field.key === 'item') return 'Herbs';
  if (field.key === 'bag') return 'Forage';
  if (field.key === 'thumb') return 'https://example.test/thumb.png';
  if (field.key === 'image') return 'https://example.test/scene.png';
  if (field.type === 'select') return field.values?.[0] ?? '';
  return '';
}

export function defaultPreviewValues(template: EncounterTemplate) {
  return Object.fromEntries(
    template.fields.map((field) => [field.key, defaultPreviewValue(field)]),
  ) as Record<string, string | number>;
}
