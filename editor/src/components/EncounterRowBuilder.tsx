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
import { buildEncounterPreview } from '../lib/encounterPreview';
import { SelectField } from './FormFields';
import { BiomeGvarEditor } from './BiomeGvarEditor';
import { EncounterPreviewPanel } from './EncounterPreviewPanel';
import { ExpandableBlockRows } from './ExpandableBlockRows';
import { HelpTip } from './HelpTip';
import { useLazyPythonTemplatePreview } from './useLazyPythonTemplatePreview';

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
    defaultEncounterValues(template),
  );
  const [useAnyPool, setUseAnyPool] = useState(false);
  const [selectedPools, setSelectedPools] = useState<string[]>(['enc.gather', 'forage.gather']);
  const [previewResult, setPreviewResult] = useState('success');
  const [previewRoll, setPreviewRoll] = useState('15');
  const [previewCharacterName, setPreviewCharacterName] = useState('Preview Character');
  const [previewCharacterLevel, setPreviewCharacterLevel] = useState('5');
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
  const pythonPreviewArgs = useMemo(() => compactRow.slice(2), [compactRow]);
  const pythonPreviewCharacter = useMemo(
    () => ({
      name: previewCharacterName.trim() || 'Preview Character',
      level: Number(previewCharacterLevel) || 1,
    }),
    [previewCharacterLevel, previewCharacterName],
  );
  const pythonPreviewEnabled = Boolean(template.custom && template.source?.trim());
  const { isPreviewLoading, pythonPreview, requestPreview } = useLazyPythonTemplatePreview({
    enabled: pythonPreviewEnabled,
    source: template.source ?? '',
    functionName: template.functionName,
    args: pythonPreviewArgs,
    previewCharacter: pythonPreviewCharacter,
  });
  const previewMode = template.custom
    ? isPreviewLoading
      ? 'loading'
      : pythonPreview
        ? 'ready'
        : pythonPreviewEnabled
          ? 'idle'
          : 'ready'
    : 'ready';
  const preview = useMemo(
    () =>
      buildEncounterPreview({
        template,
        row: compactRow,
        previewResult,
        previewRoll,
        pythonPreview,
      }),
    [compactRow, previewResult, previewRoll, pythonPreview, template],
  );

  function changeTemplate(nextTemplateId: string) {
    const nextTemplate = templates.find((item) => item.id === nextTemplateId) ?? templates[0];
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
            summary: `${template.fields.length} arguments passed into ${template.functionName ?? template.id}`,
            children: (
              <div className="form-grid encounter-builder-fields">
                {template.fields.map((field) => (
                  <EncounterTemplateField
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
            id: 'preview',
            title: 'Preview',
            summary: 'Mock args, evaluated output, and Discord-style embed',
            children: (
              <EncounterPreviewPanel
                template={template}
                preview={preview}
                compactRow={compactRow}
                previewResult={previewResult}
                onPreviewResultChange={setPreviewResult}
                previewRoll={previewRoll}
                onPreviewRollChange={setPreviewRoll}
                previewCharacterName={template.custom ? previewCharacterName : undefined}
                onPreviewCharacterNameChange={template.custom ? setPreviewCharacterName : undefined}
                previewCharacterLevel={template.custom ? previewCharacterLevel : undefined}
                onPreviewCharacterLevelChange={
                  template.custom ? setPreviewCharacterLevel : undefined
                }
                previewMode={previewMode}
                onPreviewRequest={
                  template.custom && pythonPreviewEnabled ? requestPreview : undefined
                }
                className="inline-preview-panel"
              />
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
      <span>
        {field.label}
        <HelpTip label={`${field.label} field help`}>{encounterFieldHelp(field.key)}</HelpTip>
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

function encounterFieldHelp(key: string) {
  const help: Record<string, string> = {
    title: 'Short title shown when this encounter is selected.',
    description: 'Narrative text or setup shown in the encounter embed.',
    text: 'Flavour text for descriptive templates.',
    skill: 'The ability or skill label the template should roll.',
    save: 'The saving throw label the template should roll.',
    dc: 'Difficulty class used by check, save, ambush, or outcome templates.',
    item: 'Name of the resource or item awarded by this encounter.',
    qty: 'Quantity awarded when the outcome grants an item.',
    bag: 'Character bag name used when bag integration is enabled.',
    success: 'Text shown on a successful check.',
    failure: 'Text shown on a failed check.',
    kind: 'Encounter category used by distribution pools.',
    cr: 'Challenge rating hint for monster lookup or combat scaling.',
    monster: 'Monster search name or display name.',
    difficulty: 'Encounter difficulty label for combat framing.',
    hook: 'Quest hook text shown to players.',
    reward: 'Quest reward or promise text.',
    gold: 'Coin reward; dice strings are supported by the engine template.',
    total: 'Amount or dice expression used by damage, healing, gold, or similar outcomes.',
  };
  return help[key] ?? 'Template argument emitted into the compact biome row.';
}
