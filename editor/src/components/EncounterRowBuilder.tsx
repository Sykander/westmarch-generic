import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Save, Trash2 } from 'lucide-react';
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
import { CompactRowJsonEditor } from './BiomeGvarEditor';
import { EncounterTemplatePreview } from './EncounterTemplatePreview';
import { ExpandableBlockRows } from './ExpandableBlockRows';
import {
  TemplatePreviewArgField,
  defaultPreviewValue,
  defaultPreviewValues,
} from './TemplatePreviewArgField';

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
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({ template: true });
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
    setOpenRows((current) => ({ ...current, fields: true }));
  }

  function updateEncounterField(key: string, value: string | number) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function togglePoolTag(tag: string, checked: boolean) {
    setSelectedPools((current) => togglePoolSelection(current, tag, checked));
  }

  function hydrateRow(index: number, mode: 'edit' | 'preview') {
    const row = rows[index];
    if (!row) return;
    const nextTemplateId = String(row[1] ?? '');
    const nextTemplate = templates.find((item) => item.id === nextTemplateId) ?? templates[0];
    const poolState = poolStateFromRow(row);
    setActiveRowIndex(index);
    setTemplateId(nextTemplate.id);
    setValues(valuesFromRow(row, nextTemplate));
    setUseAnyPool(poolState.useAnyPool);
    setSelectedPools(poolState.selectedPools);
    setOpenRows(
      mode === 'preview'
        ? { template: false, fields: false, preview: true, pools: false }
        : { template: false, fields: true, preview: false, pools: true },
    );
  }

  function startNewRow() {
    const nextTemplate = templates[0];
    setActiveRowIndex(null);
    setTemplateId(nextTemplate.id);
    setValues(defaultPreviewValues(nextTemplate));
    setUseAnyPool(false);
    setSelectedPools(['enc.gather', 'forage.gather']);
    setOpenRows({ template: true, fields: true, preview: false, pools: true });
  }

  function saveCurrentRow() {
    if (activeRowIndex != null && rows[activeRowIndex]) {
      onRowsChange(rows.map((row, index) => (index === activeRowIndex ? compactRow : row)));
      return;
    }
    onRowsChange([...rows, compactRow]);
    setActiveRowIndex(rows.length);
  }

  function removeRow(index: number) {
    onRowsChange(rows.filter((_, rowIndex) => rowIndex !== index));
    if (activeRowIndex == null) return;
    if (activeRowIndex === index) setActiveRowIndex(null);
    else if (activeRowIndex > index) setActiveRowIndex(activeRowIndex - 1);
  }

  return (
    <div className="encounter-row-builder">
      <div className="builder-head">
        <h3>{title}</h3>
        <span>Compact rows become the body of a custom biome gvar.</span>
      </div>
      <EncounterRowTable
        rows={rows}
        activeRowIndex={activeRowIndex}
        onEdit={(index) => hydrateRow(index, 'edit')}
        onPreview={(index) => hydrateRow(index, 'preview')}
        onRemove={removeRow}
        onNew={startNewRow}
        title={rowListTitle}
      />
      <ExpandableBlockRows
        openRows={openRows}
        onOpenRowsChange={setOpenRows}
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
                primaryCtaLabel={activeRowIndex == null ? 'Insert Row' : 'Save Row'}
                onPrimaryCta={saveCurrentRow}
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
                  <label className="pool-tag-option">
                    <input
                      type="checkbox"
                      checked={useAnyPool}
                      onChange={(event) => setUseAnyPool(event.target.checked)}
                    />
                    <span>Any compatible pool</span>
                  </label>
                  {!useAnyPool
                    ? BIOME_POOL_TAGS.map((tag) => (
                        <label className="pool-tag-option" key={tag}>
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
        ]}
      />
      <EncounterModelReference />
      <RawJsonParts
        rows={rows}
        activeRowIndex={activeRowIndex}
        compactRow={compactRow}
        onRowsChange={onRowsChange}
        onSaveCurrentRow={saveCurrentRow}
      />
    </div>
  );
}

function EncounterRowTable({
  rows,
  activeRowIndex,
  onEdit,
  onPreview,
  onRemove,
  onNew,
  title,
}: {
  rows: CompactEncounterRow[];
  activeRowIndex: number | null;
  onEdit: (index: number) => void;
  onPreview: (index: number) => void;
  onRemove: (index: number) => void;
  onNew: () => void;
  title: string;
}) {
  return (
    <section className="encounter-row-management" aria-label={title}>
      <div className="collection-editor-head">
        <h3>{title}</h3>
        <button type="button" onClick={onNew}>
          <Plus size={16} aria-hidden="true" />
          New Row
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="collection-empty">No rows yet. Build a row below or add a blank row.</p>
      ) : (
        <div className="table-wrap compact-row-table-wrap">
          <table className="compact-row-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Template</th>
                <th>Pools</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  className={activeRowIndex === index ? 'active' : undefined}
                  key={rowKey(row, index)}
                >
                  <td>{index + 1}</td>
                  <td>{String(row[1] ?? 'unknown')}</td>
                  <td>{poolSummary(row)}</td>
                  <td>{String(row[2] ?? '')}</td>
                  <td>
                    <div className="row-action-buttons">
                      <button type="button" onClick={() => onEdit(index)}>
                        <Pencil size={16} aria-hidden="true" />
                        Edit
                      </button>
                      <button type="button" onClick={() => onPreview(index)}>
                        <Eye size={16} aria-hidden="true" />
                        Preview
                      </button>
                      <button
                        type="button"
                        className="field-action-button"
                        onClick={() => onRemove(index)}
                        aria-label={`Remove encounter row ${index + 1}`}
                        title="Remove row"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RawJsonParts({
  rows,
  activeRowIndex,
  compactRow,
  onRowsChange,
  onSaveCurrentRow,
}: {
  rows: CompactEncounterRow[];
  activeRowIndex: number | null;
  compactRow: CompactEncounterRow;
  onRowsChange: (rows: CompactEncounterRow[]) => void;
  onSaveCurrentRow: () => void;
}) {
  const selectedRow = activeRowIndex != null ? rows[activeRowIndex] : null;

  return (
    <section className="raw-json-parts">
      <div className="builder-head compact-head">
        <h3>Raw JSON</h3>
        <span>Generated rows and biome gvar body.</span>
      </div>
      <label className="field">
        <span>Current builder row</span>
        <textarea className="code-input" rows={4} readOnly value={JSON.stringify(compactRow)} />
      </label>
      <div className="button-row">
        <button type="button" className="primary" onClick={onSaveCurrentRow}>
          <Save size={16} aria-hidden="true" />
          {activeRowIndex == null ? 'Insert Row' : 'Save Row'}
        </button>
      </div>
      {selectedRow ? (
        <CompactRowJsonEditor
          row={selectedRow}
          onChange={(row) =>
            onRowsChange(rows.map((current, index) => (index === activeRowIndex ? row : current)))
          }
        />
      ) : null}
      <label className="field span-2">
        <span>Generated biome gvar body</span>
        <textarea
          className="code-input"
          rows={Math.max(6, rows.length * 2 + 2)}
          readOnly
          value={JSON.stringify(rows, null, 2)}
        />
      </label>
    </section>
  );
}

function valuesFromRow(row: CompactEncounterRow, template: EncounterTemplate) {
  const defaults = defaultPreviewValues(template);
  return Object.fromEntries(
    template.fields.map((field, index) => [
      field.key,
      row[2 + index] == null ? (defaults[field.key] ?? defaultPreviewValue(field)) : row[2 + index],
    ]),
  ) as Record<string, string | number>;
}

function poolStateFromRow(row: CompactEncounterRow) {
  const poolTags = row[0];
  if (poolTags == null) {
    return { useAnyPool: true, selectedPools: ['enc.gather'] };
  }
  if (Array.isArray(poolTags)) {
    const selectedPools = poolTags.map((tag) => String(tag)).filter(Boolean);
    return {
      useAnyPool: false,
      selectedPools: selectedPools.length ? selectedPools : ['enc.gather'],
    };
  }
  const tag = String(poolTags || '').trim();
  return { useAnyPool: false, selectedPools: tag ? [tag] : ['enc.gather'] };
}

function rowKey(row: CompactEncounterRow, index: number) {
  return `${index}:${String(row[1] ?? 'row')}:${String(row[2] ?? '')}`;
}

function poolSummary(row: CompactEncounterRow) {
  const poolTags = row[0];
  if (Array.isArray(poolTags)) return poolTags.join(', ');
  return 'any pool';
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
