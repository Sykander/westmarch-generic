import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, FileCode2, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import {
  CHECK_OPTIONS,
  SAVE_OPTIONS,
  buildCompactEncounterRow,
  type CompactEncounterRow,
  type EncounterTemplate,
  type EncounterTemplateField,
  type EncounterTemplateInputKind,
} from '../domain/encounters';
import { CodeIde } from './CodeIde';
import { EncounterTemplatePreview } from './EncounterTemplatePreview';
import { ExpandableBlockRows } from './ExpandableBlockRows';
import { HelpDialog } from './HelpDialog';
import { HelpTip } from './HelpTip';
import { defaultPreviewValue } from './TemplatePreviewArgField';

function slugValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .replace(/\s+/g, '_');
}

function functionNameFromId(id: string) {
  const name = slugValue(id).replace(/[^a-z0-9_]/g, '_');
  return /^[a-z_]/.test(name) ? name : `template_${name || 'custom'}`;
}

function titleFromSlug(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

const PYTHON_KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
]);

function argumentName(value: string, fallback: string) {
  const slug = slugValue(value).replace(/[^a-z0-9_]/g, '_') || fallback;
  const safe = /^[a-z_]/.test(slug) ? slug : `arg_${slug}`;
  return PYTHON_KEYWORDS.has(safe) ? `${safe}_value` : safe;
}

function pythonLiteral(value: string | number | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return JSON.stringify(value ?? '');
}

function defaultValueForField(field: EncounterTemplateField): string | number {
  if (field.defaultValue != null) return field.defaultValue;
  if (field.type === 'number') {
    if (field.key === 'qty') return 1;
    if (field.key === 'cr') return 0.25;
    if (field.key === 'dc' || field.inputType === 'dc') return 12;
    return 0;
  }
  if (field.inputType === 'skill_name' || field.key === 'check' || field.key === 'skill')
    return 'Survival';
  if (field.inputType === 'save_name' || field.key === 'save') return 'Dexterity';
  if (field.key === 'difficulty') return 'medium';
  if (field.key === 'bag') return 'Forage';
  if (field.type === 'select') return field.values?.[0] ?? '';
  return '';
}

function defaultValueForDraft(draft: TemplateInputDraft) {
  return String(defaultValueForField(fieldFromInputDraft({ ...draft, required: false })));
}

function functionSignature() {
  return 'args';
}

function fieldVariable(fields: EncounterTemplateField[], keys: string[]) {
  for (const key of keys) {
    const index = fields.findIndex((field) => field.key === key);
    if (index >= 0) return argumentName(fields[index].key, `arg_${index + 1}`);
  }
  return undefined;
}

function sourceFromSchema(functionName: string, fields: EncounterTemplateField[]) {
  const assignments = fields.map((field, index) => {
    const name = argumentName(field.key, `arg_${index + 1}`);
    const defaultArg =
      field.required === false ? `, ${pythonLiteral(defaultValueForField(field))}` : '';
    return `    ${name} = _arg(args, ${index}${defaultArg})`;
  });
  const nameArg = fieldVariable(fields, ['title', 'name']) ?? pythonLiteral('Custom encounter');
  const descriptionArg =
    fieldVariable(fields, ['description', 'text']) ?? pythonLiteral('Describe what happens.');
  const checkArg = fieldVariable(fields, ['check', 'skill', 'check_name']);
  const saveArg = fieldVariable(fields, ['save', 'save_name']);
  const dcArg = fieldVariable(fields, ['dc']);
  const itemArg = fieldVariable(fields, ['item', 'item_name']);
  const totalArg = fieldVariable(fields, ['qty', 'quantity', 'total', 'amount']);
  const bagArg = fieldVariable(fields, ['bag']);
  const goldArg = fieldVariable(fields, ['gold']);
  const healingArg = fieldVariable(fields, ['healing']);
  const damageArg = fieldVariable(fields, ['damage']);
  const thumbArg = fieldVariable(fields, ['thumb', 'thumbnail']);
  const imageArg = fieldVariable(fields, ['image', 'image_url']);
  const body = [
    `def ${functionName}(args):`,
    ...assignments,
    ...(assignments.length > 0 ? [''] : []),
    '    encounter = {',
    `        "name": ${nameArg},`,
    `        "description": ${descriptionArg},`,
    '    }',
  ];
  if ((checkArg || saveArg) && dcArg) {
    if (checkArg) {
      body.push(
        `    encounter["rolls"] = [{"type": "check", "name": ${checkArg}, "ability": "wis", "dc": str(${dcArg})}]`,
      );
    } else if (saveArg) {
      body.push(
        `    encounter["rolls"] = [{"type": "save", "name": ${saveArg}, "dc": str(${dcArg})}]`,
      );
    }
  }
  if (itemArg || goldArg || healingArg || damageArg) {
    body.push('    outcomes = []');
    if (itemArg) {
      const total = totalArg ?? '1';
      if (bagArg) {
        body.push(
          `    outcomes.append({"type": "item", "name": ${itemArg}, "total": ${total}, "bag": ${bagArg}})`,
        );
      } else {
        body.push(`    outcomes.append({"type": "item", "name": ${itemArg}, "total": ${total}})`);
      }
    }
    if (goldArg) body.push(`    outcomes.append({"type": "gold", "total": ${goldArg}})`);
    if (healingArg) body.push(`    outcomes.append({"type": "healing", "total": ${healingArg}})`);
    if (damageArg) body.push(`    outcomes.append({"type": "damage", "total": ${damageArg}})`);
    body.push('    if len(outcomes) > 0:', '        encounter["outcomes"] = outcomes');
  }
  if (thumbArg) {
    body.push(
      `    if str(${thumbArg}).strip() != "":`,
      `        encounter["thumb"] = str(${thumbArg}).strip()`,
    );
  }
  if (imageArg) {
    body.push(
      `    if str(${imageArg}).strip() != "":`,
      `        encounter["image"] = str(${imageArg}).strip()`,
    );
  }
  body.push('    return encounter', '');
  return body.join('\n');
}

type TemplateInputDraft = {
  draftId: string;
  key: string;
  label: string;
  inputType: EncounterTemplateInputKind;
  options: string;
  required: boolean;
  defaultValue: string;
};

const TEMPLATE_INPUT_TYPES: Array<{ value: EncounterTemplateInputKind; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'text_block', label: 'Text block' },
  { value: 'number', label: 'Number' },
  { value: 'dc', label: 'DC' },
  { value: 'skill_name', label: 'Skill name' },
  { value: 'save_name', label: 'Save name' },
  { value: 'encounter_kind', label: 'Encounter kind' },
  { value: 'url', label: 'URL' },
  { value: 'custom_select', label: 'Custom select' },
];

const DEFAULT_INPUT_DRAFTS: TemplateInputDraft[] = [
  {
    draftId: 'default-title',
    key: 'title',
    label: 'Title',
    inputType: 'text',
    options: '',
    required: true,
    defaultValue: '',
  },
  {
    draftId: 'default-description',
    key: 'description',
    label: 'Description',
    inputType: 'text_block',
    options: '',
    required: true,
    defaultValue: '',
  },
  {
    draftId: 'default-check',
    key: 'check',
    label: 'Check',
    inputType: 'skill_name',
    options: '',
    required: true,
    defaultValue: 'Survival',
  },
  {
    draftId: 'default-dc',
    key: 'dc',
    label: 'DC',
    inputType: 'dc',
    options: '',
    required: true,
    defaultValue: '12',
  },
  {
    draftId: 'default-item',
    key: 'item',
    label: 'Outcome item',
    inputType: 'text',
    options: '',
    required: true,
    defaultValue: '',
  },
  {
    draftId: 'default-qty',
    key: 'qty',
    label: 'Quantity',
    inputType: 'number',
    options: '',
    required: true,
    defaultValue: '1',
  },
  {
    draftId: 'default-bag',
    key: 'bag',
    label: 'Bag',
    inputType: 'text',
    options: '',
    required: false,
    defaultValue: 'Forage',
  },
  {
    draftId: 'default-thumb',
    key: 'thumb',
    label: 'Thumbnail URL',
    inputType: 'url',
    options: '',
    required: false,
    defaultValue: '',
  },
  {
    draftId: 'default-image',
    key: 'image',
    label: 'Image URL',
    inputType: 'url',
    options: '',
    required: false,
    defaultValue: '',
  },
];

const DEFAULT_TEMPLATE_FIELDS = DEFAULT_INPUT_DRAFTS.map(fieldFromInputDraft);

let nextTemplateInputDraftId = DEFAULT_INPUT_DRAFTS.length;

function createTemplateInputDraft(index: number): TemplateInputDraft {
  nextTemplateInputDraftId += 1;
  return {
    draftId: `custom-${nextTemplateInputDraftId}`,
    key: `arg_${index + 1}`,
    label: `Arg ${index + 1}`,
    inputType: 'text',
    options: '',
    required: true,
    defaultValue: '',
  };
}

function optionValues(text: string) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function fieldFromInputDraft(draft: TemplateInputDraft): EncounterTemplateField {
  const key = slugValue(draft.key) || 'arg';
  const label = draft.label.trim() || titleFromSlug(key) || key;
  const base = draft.required
    ? { required: true }
    : {
        required: false,
        defaultValue:
          draft.inputType === 'number' || draft.inputType === 'dc'
            ? Number(draft.defaultValue || 0)
            : draft.defaultValue,
      };
  if (draft.inputType === 'text_block')
    return { key, label, type: 'textarea', inputType: 'text_block', ...base };
  if (draft.inputType === 'number')
    return { key, label, type: 'number', inputType: 'number', ...base };
  if (draft.inputType === 'dc') return { key, label, type: 'number', inputType: 'dc', ...base };
  if (draft.inputType === 'skill_name') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'skill_name',
      values: CHECK_OPTIONS.map((option) => option.label),
      ...base,
    };
  }
  if (draft.inputType === 'save_name') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'save_name',
      values: SAVE_OPTIONS.map((option) => option.label),
      ...base,
    };
  }
  if (draft.inputType === 'encounter_kind') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'encounter_kind',
      values: ['combat', 'quest', 'gather'],
      ...base,
    };
  }
  if (draft.inputType === 'custom_select') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'custom_select',
      values: optionValues(draft.options).length > 0 ? optionValues(draft.options) : [''],
      ...base,
    };
  }
  return {
    key,
    label,
    type: 'text',
    inputType: draft.inputType === 'url' ? 'url' : 'text',
    ...base,
  };
}

export function CustomTemplateBuilder({
  templates,
  onTemplatesChange,
}: {
  templates: EncounterTemplate[];
  onTemplatesChange: (templates: EncounterTemplate[]) => void;
}) {
  const [id, setId] = useState('custom_scene');
  const [label, setLabel] = useState('Custom scene');
  const [description, setDescription] = useState('Custom compact encounter row template.');
  const [inputDrafts, setInputDrafts] = useState<TemplateInputDraft[]>(DEFAULT_INPUT_DRAFTS);
  const functionName = functionNameFromId(id);
  const [source, setSource] = useState(() =>
    sourceFromSchema(functionName, DEFAULT_TEMPLATE_FIELDS),
  );
  const fields = useMemo(() => inputDrafts.map(fieldFromInputDraft), [inputDrafts]);
  const args = useMemo(() => fields.map((field) => field.key), [fields]);
  const template = useMemo<EncounterTemplate>(
    () => ({
      id: slugValue(id) || 'custom_template',
      label: label.trim() || titleFromSlug(slugValue(id)) || 'Custom template',
      description: description.trim() || 'Custom compact encounter row template.',
      args,
      custom: true,
      functionName,
      source,
      fields,
    }),
    [args, description, fields, functionName, id, label, source],
  );
  const [previewValues, setPreviewValues] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, defaultPreviewValue(field)])),
  );
  const [draggedInputIndex, setDraggedInputIndex] = useState<number | null>(null);
  const previewRow = useMemo<CompactEncounterRow>(
    () =>
      buildCompactEncounterRow({
        template,
        values: previewValues,
        useAnyPool: false,
        selectedPools: ['enc.gather'],
      }),
    [previewValues, template],
  );

  useEffect(() => {
    setPreviewValues((current) => {
      const next: Record<string, string | number> = {};
      for (const field of fields) {
        next[field.key] = current[field.key] ?? defaultPreviewValue(field);
      }
      return next;
    });
  }, [fields]);

  function saveTemplate() {
    const withoutExisting = templates.filter((item) => item.id !== template.id);
    onTemplatesChange([...withoutExisting, template]);
  }

  function resetFunctionName(nextId: string) {
    const nextFunctionName = functionNameFromId(nextId);
    setId(nextId);
    setSource((current) => {
      if (current.trim() === sourceFromSchema(functionName, fields).trim())
        return sourceFromSchema(nextFunctionName, fields);
      return current;
    });
  }

  function updateInputDraft(index: number, patch: Partial<TemplateInputDraft>) {
    setInputDrafts((current) =>
      current.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...patch } : draft)),
    );
  }

  function addInputDraft() {
    setInputDrafts((current) => [...current, createTemplateInputDraft(current.length)]);
  }

  function removeInputDraft(index: number) {
    setInputDrafts((current) =>
      current.length <= 1 ? current : current.filter((_, draftIndex) => draftIndex !== index),
    );
  }

  function moveInputDraft(index: number, direction: -1 | 1) {
    setInputDrafts((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  function moveInputDraftTo(index: number, nextIndex: number) {
    setInputDrafts((current) => {
      if (index === nextIndex || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  return (
    <section className="custom-template-builder">
      <div className="builder-head">
        <h3>Custom template builder</h3>
        <span>Config-owned Drac2 functions become selectable encounter row templates.</span>
      </div>
      <ExpandableBlockRows
        rows={[
          {
            id: 'metadata',
            title: 'Template details',
            summary: `${template.id} as ${template.functionName}(${functionSignature()})`,
            children: (
              <div className="form-grid">
                <label className="field">
                  <span>
                    Template id
                    <HelpTip label="Template id help">
                      Stable snake_case id used as the compact row template name.
                    </HelpTip>
                  </span>
                  <input value={id} onChange={(event) => resetFunctionName(event.target.value)} />
                </label>
                <label className="field">
                  <span>
                    Label
                    <HelpTip label="Template label help">
                      Human-readable name shown in the editor selector.
                    </HelpTip>
                  </span>
                  <input value={label} onChange={(event) => setLabel(event.target.value)} />
                </label>
                <label className="field span-2">
                  <span>
                    Description
                    <HelpTip label="Template description help">
                      Short tooltip that explains when authors should use this template.
                    </HelpTip>
                  </span>
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'input-schema',
            title: 'Row input schema',
            summary: `${fields.length} configured row inputs after pools and template name`,
            children: (
              <div className="template-input-schema">
                <p className="field-note">
                  Compact rows always start with pools and the template id. These inputs define the
                  remaining values read from <code>{template.functionName}(args)</code>.
                </p>
                <div className="template-input-list">
                  {inputDrafts.map((draft, index) => (
                    <TemplateInputEditor
                      draft={draft}
                      index={index}
                      onChange={(patch) => updateInputDraft(index, patch)}
                      onRemove={() => removeInputDraft(index)}
                      onMoveUp={() => moveInputDraft(index, -1)}
                      onMoveDown={() => moveInputDraft(index, 1)}
                      onDragStart={() => setDraggedInputIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedInputIndex != null) moveInputDraftTo(draggedInputIndex, index);
                        setDraggedInputIndex(null);
                      }}
                      onDragEnd={() => setDraggedInputIndex(null)}
                      canRemove={inputDrafts.length > 1}
                      canMoveUp={index > 0}
                      canMoveDown={index < inputDrafts.length - 1}
                      key={draft.draftId}
                    />
                  ))}
                </div>
                <button type="button" className="add-row-button" onClick={addInputDraft}>
                  <Plus size={16} aria-hidden="true" />
                  Add input
                </button>
              </div>
            ),
          },
          {
            id: 'function',
            title: 'Template function',
            summary: 'Drac2 function source evaluated by Pyodide for previews',
            children: (
              <>
                <div className="button-row template-function-actions">
                  <button
                    type="button"
                    onClick={() => setSource(sourceFromSchema(functionName, fields))}
                  >
                    <FileCode2 size={16} aria-hidden="true" />
                    Start from Row Input Schema
                  </button>
                </div>
                <CodeIde
                  label="Template function"
                  value={source}
                  onChange={setSource}
                  language="gvar"
                  minLines={15}
                  help="Define one Drac2 function that accepts args, the compact row values after the template id, and returns an encounter dict."
                />
              </>
            ),
          },
          {
            id: 'preview',
            title: 'Preview',
            summary: 'Inputs, mocks, outputs, and Discord-style embed',
            children: (
              <EncounterTemplatePreview
                template={template}
                compactRow={previewRow}
                inputValues={previewValues}
                onInputValueChange={(key, value) =>
                  setPreviewValues((current) => ({ ...current, [key]: value }))
                }
                primaryCtaLabel="Create Encounter Template"
                onPrimaryCta={saveTemplate}
                className="inline-preview-panel"
              />
            ),
          },
          {
            id: 'save',
            title: 'Save and metadata',
            summary: 'Save the function and inspect exported editor metadata',
            children: (
              <>
                <div className="button-row">
                  <TemplateContractHelp />
                  <button type="button" className="primary" onClick={saveTemplate}>
                    <Save size={16} aria-hidden="true" />
                    Save Template Function
                  </button>
                </div>
                <CodeIde
                  label="Current editor metadata JSON"
                  value={JSON.stringify(
                    {
                      id: template.id,
                      function_name: template.functionName,
                      label: template.label,
                      description: template.description,
                      args: template.args,
                      fields: template.fields,
                    },
                    null,
                    2,
                  )}
                  onChange={() => undefined}
                  language="json"
                  minLines={8}
                  readOnly
                />
              </>
            ),
          },
          {
            id: 'saved-templates',
            title: 'Saved templates',
            summary: templates.length ? `${templates.length} custom templates` : 'None saved yet',
            children: templates.length ? (
              <div className="option-pill-list">
                {templates.map((item) => (
                  <span className="option-pill" key={item.id}>
                    {item.id}
                  </span>
                ))}
              </div>
            ) : (
              <p className="collection-empty">No custom templates saved yet.</p>
            ),
          },
        ]}
      />
    </section>
  );
}

function TemplateInputEditor({
  draft,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  canRemove,
  canMoveUp,
  canMoveDown,
}: {
  draft: TemplateInputDraft;
  index: number;
  onChange: (patch: Partial<TemplateInputDraft>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div
      className="template-input-row"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="template-input-drag" draggable onDragStart={onDragStart} aria-hidden="true">
        <GripVertical size={18} />
      </div>
      <label className="field">
        <span>
          Key
          <HelpTip label={`Input ${index + 1} key help`}>
            {`Snake_case key stored in template metadata and passed by position as args[${index}].`}
          </HelpTip>
        </span>
        <input value={draft.key} onChange={(event) => onChange({ key: event.target.value })} />
      </label>
      <label className="field">
        <span>
          Label
          <HelpTip label={`Input ${index + 1} label help`}>
            Human-readable label shown when building rows for this template.
          </HelpTip>
        </span>
        <input value={draft.label} onChange={(event) => onChange({ label: event.target.value })} />
      </label>
      <label className="field">
        <span>
          Type
          <HelpTip label={`Input ${index + 1} type help`}>
            Chooses the editor control. Skill and save inputs become dropdowns later.
          </HelpTip>
        </span>
        <select
          value={draft.inputType}
          onChange={(event) => {
            const inputType = event.target.value as EncounterTemplateInputKind;
            const nextDraft = { ...draft, inputType };
            onChange({
              inputType,
              defaultValue: draft.required ? draft.defaultValue : defaultValueForDraft(nextDraft),
            });
          }}
        >
          {TEMPLATE_INPUT_TYPES.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field template-required-field">
        <span>
          Required
          <HelpTip label={`Input ${index + 1} required help`}>
            Required row values are positional arguments without a Python default.
          </HelpTip>
        </span>
        <span className="inline-checkbox">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(event) => {
              const required = event.target.checked;
              onChange({
                required,
                defaultValue:
                  !required && draft.defaultValue === ''
                    ? defaultValueForDraft(draft)
                    : draft.defaultValue,
              });
            }}
          />
          <span>Required</span>
        </span>
      </label>
      {!draft.required ? (
        <label className="field">
          <span>
            Default
            <HelpTip label={`Input ${index + 1} default help`}>
              Optional row values use this default in the generated function signature.
            </HelpTip>
          </span>
          <input
            type={draft.inputType === 'number' || draft.inputType === 'dc' ? 'number' : 'text'}
            value={draft.defaultValue}
            onChange={(event) => onChange({ defaultValue: event.target.value })}
          />
        </label>
      ) : null}
      {draft.inputType === 'custom_select' ? (
        <label className="field">
          <span>
            Options
            <HelpTip label={`Input ${index + 1} options help`}>
              Comma-separated options for this custom dropdown.
            </HelpTip>
          </span>
          <input
            value={draft.options}
            onChange={(event) => onChange({ options: event.target.value })}
            placeholder="option, option"
          />
        </label>
      ) : null}
      <div className="template-input-actions">
        <button
          type="button"
          className="field-action-button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label={`Move input ${index + 1} up`}
          title="Move up"
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="field-action-button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label={`Move input ${index + 1} down`}
          title="Move down"
        >
          <ArrowDown size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="field-action-button template-input-remove"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remove input ${index + 1}`}
          title="Remove input"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function TemplateContractHelp() {
  return (
    <HelpDialog
      label="Template function contract help"
      title="Template Function Contract"
      description="Custom encounter templates are stored in the config gvar as Drac2 functions."
    >
      <div className="help-option-list">
        <article className="help-option">
          <strong>Function shape</strong>
          <p>
            Define one function named like the template id. It receives <code>args</code>, the
            compact row values after the template id.
          </p>
          <pre>
            {
              'def custom_scene(args):\n    title = _arg(args, 0, "Scene")\n    return {"name": title, "description": "A useful detail."}'
            }
          </pre>
        </article>
        <article className="help-option">
          <strong>Row args</strong>
          <p>
            A row like <code>[["enc.gather"], "custom_scene", "Title", 12]</code> calls the function
            with <code>args[0] == "Title"</code> and <code>args[1] == 12</code>.
          </p>
        </article>
        <article className="help-option">
          <strong>Pool routing</strong>
          <p>
            Compact row pool tags are matched before the template function runs. The returned
            encounter dict does not include routing fields.
          </p>
        </article>
        <article className="help-option">
          <strong>Return value</strong>
          <p>
            Return an encounter dict. Use <code>name</code> and <code>description</code> at minimum.
          </p>
        </article>
        <article className="help-option">
          <strong>Common fields</strong>
          <p>
            <code>rolls</code> may contain check, save, or passive roll dicts. <code>outcomes</code>{' '}
            can grant item, gold, healing, damage, or currency changes.
          </p>
        </article>
        <article className="help-option">
          <strong>Display fields</strong>
          <p>
            <code>thumb</code> sets a small embed thumbnail. <code>image</code> sets a wide embed
            image. Combat helpers may also return <code>cr</code>, <code>monsters</code>, and{' '}
            <code>difficulty</code>; quest helpers may return <code>reward</code>.
          </p>
        </article>
      </div>
    </HelpDialog>
  );
}
