import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import {
  BIOME_POOL_TAGS,
  CHECK_OPTIONS,
  ENCOUNTER_TEMPLATES,
  OUTCOME_OPTIONS,
  SAVE_OPTIONS,
  buildCompactEncounterRow,
  defaultEncounterValues,
  togglePoolSelection,
  type CompactEncounterRow,
  type EncounterTemplate,
} from '../domain/encounters';
import { SelectField } from './FormFields';
import { BiomeGvarEditor } from './BiomeGvarEditor';

export function EncounterRowBuilder({
  rows,
  onRowsChange,
  title = 'Encounter row builder',
  rowListTitle = 'Biome gvar JSON rows',
}: {
  rows: CompactEncounterRow[];
  onRowsChange: (rows: CompactEncounterRow[]) => void;
  title?: string;
  rowListTitle?: string;
}) {
  const [templateId, setTemplateId] = useState('gather_item');
  const template =
    ENCOUNTER_TEMPLATES.find((item) => item.id === templateId) ?? ENCOUNTER_TEMPLATES[0];
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    defaultEncounterValues(template),
  );
  const [useAnyPool, setUseAnyPool] = useState(false);
  const [selectedPools, setSelectedPools] = useState<string[]>(['enc.gather', 'forage.gather']);
  const compactRow = useMemo(
    () =>
      buildCompactEncounterRow({
        template,
        values,
        useAnyPool,
        selectedPools,
      }),
    [selectedPools, template, useAnyPool, values],
  );

  function changeTemplate(nextTemplateId: string) {
    const nextTemplate =
      ENCOUNTER_TEMPLATES.find((item) => item.id === nextTemplateId) ?? ENCOUNTER_TEMPLATES[0];
    setTemplateId(nextTemplateId);
    setValues(defaultEncounterValues(nextTemplate));
  }

  function updateEncounterField(key: string, value: string | number) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function togglePoolTag(tag: string, checked: boolean) {
    setSelectedPools((current) => togglePoolSelection(current, tag, checked));
  }

  return (
    <div className="encounter-row-builder">
      <div className="builder-head">
        <h3>{title}</h3>
        <span>Compact rows become the body of a custom biome gvar.</span>
      </div>
      <div className="form-grid">
        <SelectField
          label="Template"
          value={template.id}
          values={ENCOUNTER_TEMPLATES.map((item) => item.id)}
          onChange={changeTemplate}
          help={template.description}
        />
        {template.fields.map((field) => (
          <EncounterTemplateField
            field={field}
            value={values[field.key] ?? ''}
            onChange={(value) => updateEncounterField(field.key, value)}
            key={field.key}
          />
        ))}
        <div className="field span-2">
          <span>Pool tags</span>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={useAnyPool}
              onChange={(event) => setUseAnyPool(event.target.checked)}
            />
            <span>Any compatible pool</span>
          </label>
          {!useAnyPool ? (
            <div className="checkbox-grid compact">
              {BIOME_POOL_TAGS.map((tag) => (
                <label className="switch-line" key={tag}>
                  <input
                    type="checkbox"
                    checked={selectedPools.includes(tag)}
                    onChange={(event) => togglePoolTag(tag, event.target.checked)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
        <label className="field span-2">
          <span>Current row</span>
          <textarea className="code-input" rows={4} readOnly value={JSON.stringify(compactRow)} />
        </label>
        <div className="button-row span-2">
          <button
            type="button"
            className="primary"
            onClick={() => onRowsChange([...rows, compactRow])}
          >
            <Save size={16} aria-hidden="true" />
            Insert Row
          </button>
        </div>
      </div>
      <EncounterModelReference />
      <BiomeGvarEditor rows={rows} onRowsChange={onRowsChange} title={rowListTitle} />
    </div>
  );
}

function EncounterModelReference() {
  return (
    <details className="encounter-model-reference">
      <summary>Roll and outcome options</summary>
      <div className="encounter-reference-grid">
        <section>
          <h4>Checks</h4>
          <div className="option-pill-list">
            {CHECK_OPTIONS.map((option) => (
              <span className="option-pill" key={option.value}>
                {option.label}
              </span>
            ))}
          </div>
        </section>
        <section>
          <h4>Saves</h4>
          <div className="option-pill-list">
            {SAVE_OPTIONS.map((option) => (
              <span className="option-pill" key={option.value}>
                {option.label}
              </span>
            ))}
          </div>
        </section>
        <section className="encounter-outcomes-reference">
          <h4>Outcomes</h4>
          <div className="outcome-reference-list">
            {OUTCOME_OPTIONS.map((outcome) => (
              <div className="outcome-reference-row" key={outcome.type}>
                <strong>{outcome.label}</strong>
                <span>
                  {outcome.fields
                    .map((field) => `${field.key}${field.required ? '' : '?'}`)
                    .join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </details>
  );
}

function EncounterTemplateField({
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
      <span>{field.label}</span>
      {field.type === 'select' ? (
        <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
          {(field.values ?? []).map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
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
