import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FOOTER_BEHAVIOUR_HELP, FOOTER_BEHAVIOUR_OPTIONS } from '../domain/display';
import { HelpDialog } from './HelpDialog';
import { HelpTip } from './HelpTip';

export function SectionTitle({
  icon,
  title,
  help,
}: {
  icon: ReactNode;
  title: string;
  help: string;
}) {
  return (
    <div className="section-title">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <HelpTip label={`${title} help`}>{help}</HelpTip>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function footerDraftsFromValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    const values = value.map((item) => String(item));
    return values.length > 0 ? values : [''];
  }
  if (typeof value === 'string') return [value];
  return [''];
}

export function footerValueFromDrafts(values: string[]): string | string[] | undefined {
  const cleaned = values.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) return undefined;
  return cleaned.length === 1 ? cleaned[0] : cleaned;
}

export function FooterTextListField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: unknown;
  onChange: (value: string | string[] | undefined) => void;
  help?: string;
}) {
  const externalDrafts = useMemo(() => footerDraftsFromValue(value), [value]);
  const [drafts, setDrafts] = useState(externalDrafts);

  useEffect(() => {
    setDrafts(externalDrafts);
  }, [externalDrafts]);

  function commit(nextDrafts: string[]) {
    const visibleDrafts = nextDrafts.length > 0 ? nextDrafts : [''];
    setDrafts(visibleDrafts);
    onChange(footerValueFromDrafts(visibleDrafts));
  }

  return (
    <div className="field span-2">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      <div className="footer-text-list">
        {drafts.map((text, index) => (
          <div className="footer-text-row" key={index}>
            <input
              value={text}
              onChange={(event) => {
                const nextDrafts = [...drafts];
                nextDrafts[index] = event.target.value;
                commit(nextDrafts);
              }}
              placeholder={index === 0 ? 'My Westmarch' : 'Another footer line'}
            />
            <button
              type="button"
              className="field-action-button"
              onClick={() => {
                const nextDrafts =
                  drafts.length === 1 ? [''] : drafts.filter((_, row) => row !== index);
                commit(nextDrafts);
              }}
              disabled={drafts.length === 1 && text.trim() === ''}
              aria-label={`Remove footer text ${index + 1}`}
              title="Remove footer text"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="add-row-button" onClick={() => setDrafts([...drafts, ''])}>
        <Plus size={16} aria-hidden="true" />
        Add fixed footer text
      </button>
    </div>
  );
}

export function ColourField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
  help?: string;
}) {
  const normalised = value.trim().replace(/^#/, '');
  const pickerValue = /^[0-9a-fA-F]{6}$/.test(normalised) ? `#${normalised}` : '#5865F2';

  return (
    <div className="field">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      <div className="colour-control">
        <input
          className="colour-picker"
          type="color"
          value={pickerValue}
          aria-label={`${label} picker`}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="colour-text"
          value={value}
          onChange={(event) => onChange(event.target.value || undefined)}
          placeholder="#5865F2"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export function FooterBehaviourField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const knownValue = FOOTER_BEHAVIOUR_OPTIONS.some((option) => option.value === value);
  const selectValue = knownValue ? value : value || 'balanced';

  return (
    <label className="field">
      <span>
        Footer behaviour
        <HelpDialog
          label="Footer behaviour help"
          title="Footer behaviour"
          description={FOOTER_BEHAVIOUR_HELP}
        >
          <div className="help-option-list">
            {FOOTER_BEHAVIOUR_OPTIONS.map((option) => (
              <article
                className={option.value === selectValue ? 'help-option active' : 'help-option'}
                key={option.value}
              >
                <strong>{option.label}</strong>
                <p>{option.help}</p>
              </article>
            ))}
          </div>
        </HelpDialog>
      </span>
      <select value={selectValue} onChange={(event) => onChange(event.target.value)}>
        {!knownValue && value ? <option value={value}>Unknown: {value}</option> : null}
        {FOOTER_BEHAVIOUR_OPTIONS.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SelectField({
  label,
  value,
  values,
  onChange,
  help,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
