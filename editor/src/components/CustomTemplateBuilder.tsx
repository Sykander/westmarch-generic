import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
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

function defaultSource(functionName: string) {
  return `def ${functionName}(args):
    name = "Custom encounter"
    description = "Describe what the character finds."
    kind = "gather"
    check_name = "Survival"
    dc = "12"
    item = "Supplies"
    qty = 1
    bag = "Forage"
    thumb = ""
    image = ""
    if len(args) > 0:
        name = args[0]
    if len(args) > 1:
        description = args[1]
    if len(args) > 2:
        kind = str(args[2]).strip().lower()
    if len(args) > 3:
        check_name = args[3]
    if len(args) > 4:
        dc = args[4]
    if len(args) > 5:
        item = args[5]
    if len(args) > 6:
        qty = args[6]
    if len(args) > 7:
        bag = args[7]
    if len(args) > 8:
        thumb = str(args[8]).strip()
    if len(args) > 9:
        image = str(args[9]).strip()
    if kind not in ["combat", "quest", "gather"]:
        kind = "gather"
    encounter = {
        "kind": kind,
        "name": name,
        "description": description,
        "rolls": [
            {"type": "check", "name": check_name, "ability": "wis", "dc": str(dc)}
        ],
        "success": "You find something useful.",
        "failure": "Nothing useful turns up.",
        "outcomes": [
            {"type": "item", "name": item, "total": qty, "bag": bag}
        ],
    }
    if thumb != "":
        encounter["thumb"] = thumb
    if image != "":
        encounter["image"] = image
    return encounter
`;
}

type TemplateInputDraft = {
  key: string;
  label: string;
  inputType: EncounterTemplateInputKind;
  options: string;
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
  { key: 'title', label: 'Title', inputType: 'text', options: '' },
  { key: 'description', label: 'Description', inputType: 'text_block', options: '' },
  { key: 'kind', label: 'Kind', inputType: 'encounter_kind', options: '' },
  { key: 'check', label: 'Check', inputType: 'skill_name', options: '' },
  { key: 'dc', label: 'DC', inputType: 'dc', options: '' },
  { key: 'item', label: 'Outcome item', inputType: 'text', options: '' },
  { key: 'qty', label: 'Quantity', inputType: 'number', options: '' },
  { key: 'bag', label: 'Bag', inputType: 'text', options: '' },
  { key: 'thumb', label: 'Thumbnail URL', inputType: 'url', options: '' },
  { key: 'image', label: 'Image URL', inputType: 'url', options: '' },
];

function optionValues(text: string) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function fieldFromInputDraft(draft: TemplateInputDraft): EncounterTemplateField {
  const key = slugValue(draft.key) || 'arg';
  const label = draft.label.trim() || titleFromSlug(key) || key;
  if (draft.inputType === 'text_block')
    return { key, label, type: 'textarea', inputType: 'text_block' };
  if (draft.inputType === 'number') return { key, label, type: 'number', inputType: 'number' };
  if (draft.inputType === 'dc') return { key, label, type: 'number', inputType: 'dc' };
  if (draft.inputType === 'skill_name') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'skill_name',
      values: CHECK_OPTIONS.map((option) => option.label),
    };
  }
  if (draft.inputType === 'save_name') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'save_name',
      values: SAVE_OPTIONS.map((option) => option.label),
    };
  }
  if (draft.inputType === 'encounter_kind') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'encounter_kind',
      values: ['combat', 'quest', 'gather'],
    };
  }
  if (draft.inputType === 'custom_select') {
    return {
      key,
      label,
      type: 'select',
      inputType: 'custom_select',
      values: optionValues(draft.options).length > 0 ? optionValues(draft.options) : [''],
    };
  }
  return {
    key,
    label,
    type: 'text',
    inputType: draft.inputType === 'url' ? 'url' : 'text',
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
  const [source, setSource] = useState(() => defaultSource(functionName));
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
      if (current.trim() === defaultSource(functionName).trim())
        return defaultSource(nextFunctionName);
      return current;
    });
  }

  function updateInputDraft(index: number, patch: Partial<TemplateInputDraft>) {
    setInputDrafts((current) =>
      current.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...patch } : draft)),
    );
  }

  function addInputDraft() {
    setInputDrafts((current) => [
      ...current,
      {
        key: `arg_${current.length + 1}`,
        label: `Arg ${current.length + 1}`,
        inputType: 'text',
        options: '',
      },
    ]);
  }

  function removeInputDraft(index: number) {
    setInputDrafts((current) =>
      current.length <= 1 ? current : current.filter((_, draftIndex) => draftIndex !== index),
    );
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
            summary: `${template.id} as ${template.functionName}(args)`,
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
                  remaining values passed to <code>{template.functionName}(args)</code>.
                </p>
                <div className="template-input-list">
                  {inputDrafts.map((draft, index) => (
                    <TemplateInputEditor
                      draft={draft}
                      index={index}
                      onChange={(patch) => updateInputDraft(index, patch)}
                      onRemove={() => removeInputDraft(index)}
                      canRemove={inputDrafts.length > 1}
                      key={`${draft.key}:${index}`}
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
              <CodeIde
                label="Template function"
                value={source}
                onChange={setSource}
                language="gvar"
                minLines={15}
                help="Define one Drac2 function that accepts args and returns an encounter dict."
              />
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
  canRemove,
}: {
  draft: TemplateInputDraft;
  index: number;
  onChange: (patch: Partial<TemplateInputDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="template-input-row">
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
          onChange={(event) =>
            onChange({ inputType: event.target.value as EncounterTemplateInputKind })
          }
        >
          {TEMPLATE_INPUT_TYPES.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
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
            positional list after the template id in a compact biome row.
          </p>
          <pre>{'def custom_scene(args):\n    return {"kind": "gather", "name": "Scene"}'}</pre>
        </article>
        <article className="help-option">
          <strong>Row args</strong>
          <p>
            A row like <code>[["enc.gather"], "custom_scene", "Title", 12]</code> calls the function
            with <code>args[0] == "Title"</code> and <code>args[1] == 12</code>.
          </p>
        </article>
        <article className="help-option">
          <strong>Why return kind?</strong>
          <p>
            <code>kind</code> routes the encounter through distribution and pool matching. Use{' '}
            <code>gather</code>, <code>quest</code>, or <code>combat</code>.
          </p>
        </article>
        <article className="help-option">
          <strong>Return value</strong>
          <p>
            Return an encounter dict. Use <code>kind</code>, <code>name</code>, and{' '}
            <code>description</code> at minimum.
          </p>
        </article>
        <article className="help-option">
          <strong>Common fields</strong>
          <p>
            <code>rolls</code> may contain check, save, or passive roll dicts. <code>success</code>{' '}
            and <code>failure</code> describe roll outcomes. <code>outcomes</code> can grant item,
            gold, healing, damage, or currency changes.
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
