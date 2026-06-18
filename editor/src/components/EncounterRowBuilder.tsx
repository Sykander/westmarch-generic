import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import {
  BIOME_POOL_TAGS,
  CHECK_OPTIONS,
  ENCOUNTER_TEMPLATES,
  OUTCOME_OPTIONS,
  SAVE_OPTIONS,
  buildCompactEncounterRow,
  togglePoolSelection,
  type CompactEncounterRow,
  type EncounterTemplate,
} from '../domain/encounters';
import { SelectField } from './FormFields';
import { BiomeGvarEditor } from './BiomeGvarEditor';
import { EncounterTemplatePreview } from './EncounterTemplatePreview';
import { ExpandableBlockRows } from './ExpandableBlockRows';
import { TemplatePreviewArgField, defaultPreviewValues } from './TemplatePreviewArgField';

export function EncounterRowBuilder({
  rows,
  onRowsChange,
  title = 'Encounter row builder',
  rowListTitle = 'Biome gvar JSON rows',
  templates = ENCOUNTER_TEMPLATES,
}: {
  rows: CompactEncounterRow[];
  onRowsChange: (rows: CompactEncounterRow[]) => void;
  title?: string;
  rowListTitle?: string;
  templates?: EncounterTemplate[];
}) {
  const [templateId, setTemplateId] = useState('gather_item');
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    defaultPreviewValues(template),
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
    const nextTemplate = templates.find((item) => item.id === nextTemplateId) ?? templates[0];
    setTemplateId(nextTemplateId);
    setValues(defaultPreviewValues(nextTemplate));
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
      <ExpandableBlockRows
        rows={[
          {
            id: 'template',
            title: 'Template',
            summary: template.description,
            children: (
              <div className="encounter-template-strip">
                <SelectField
                  label="Template"
                  value={template.id}
                  values={templates.map((item) => item.id)}
                  onChange={changeTemplate}
                  help={template.description}
                />
              </div>
            ),
          },
          {
            id: 'fields',
            title: 'Encounter fields',
            summary: `${template.fields.length} values synced with preview inputs`,
            children: (
              <div className="form-grid encounter-builder-fields">
                {template.fields.map((field) => (
                  <TemplatePreviewArgField
                    field={field}
                    value={values[field.key] ?? ''}
                    onChange={(value) => updateEncounterField(field.key, value)}
                    key={field.key}
                  />
                ))}
              </div>
            ),
          },
          {
            id: 'preview',
            title: 'Preview',
            summary: 'Inputs, mocks, outputs, and Discord-style embed',
            children: (
              <EncounterTemplatePreview
                template={template}
                compactRow={compactRow}
                inputValues={values}
                onInputValueChange={updateEncounterField}
                primaryCtaLabel="Create Encounter"
                onPrimaryCta={() => onRowsChange([...rows, compactRow])}
                className="inline-preview-panel"
              />
            ),
          },
          {
            id: 'pools',
            title: 'Pool tags',
            summary: useAnyPool ? 'Any compatible pool' : selectedPools.join(', '),
            children: (
              <div className="field">
                <span>Pool tags</span>
                <div className="pool-tag-list">
                  <label className="switch-line compact-switch">
                    <input
                      type="checkbox"
                      checked={useAnyPool}
                      onChange={(event) => setUseAnyPool(event.target.checked)}
                    />
                    <span>Any compatible pool</span>
                  </label>
                  {!useAnyPool
                    ? BIOME_POOL_TAGS.map((tag) => (
                        <label className="switch-line compact-switch" key={tag}>
                          <input
                            type="checkbox"
                            checked={selectedPools.includes(tag)}
                            onChange={(event) => togglePoolTag(tag, event.target.checked)}
                          />
                          <span>{tag}</span>
                        </label>
                      ))
                    : null}
                </div>
              </div>
            ),
          },
          {
            id: 'current-row',
            title: 'Current row',
            summary: JSON.stringify(compactRow),
            children: (
              <>
                <label className="field">
                  <span>Current row</span>
                  <textarea
                    className="code-input"
                    rows={4}
                    readOnly
                    value={JSON.stringify(compactRow)}
                  />
                </label>
                <div className="button-row">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => onRowsChange([...rows, compactRow])}
                  >
                    <Save size={16} aria-hidden="true" />
                    Insert Row
                  </button>
                </div>
              </>
            ),
          },
        ]}
      />
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
