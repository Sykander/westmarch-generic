import { RefreshCw } from 'lucide-react';
import type { CompactEncounterRow, EncounterTemplate } from '../domain/encounters';
import type { EncounterPreviewModel } from '../lib/encounterPreview';
import { SelectField } from './FormFields';
import { HelpTip } from './HelpTip';

type PreviewArg = {
  label: string;
  value: unknown;
};

export type PreviewMode = 'ready' | 'idle' | 'loading';

export function EncounterPreviewPanel({
  template,
  preview,
  compactRow,
  previewResult,
  onPreviewResultChange,
  previewRoll,
  onPreviewRollChange,
  previewCharacterName,
  onPreviewCharacterNameChange,
  previewCharacterLevel,
  onPreviewCharacterLevelChange,
  previewMode = 'ready',
  onPreviewRequest,
  className,
}: {
  template: EncounterTemplate;
  preview: EncounterPreviewModel;
  compactRow: CompactEncounterRow;
  previewResult: string;
  onPreviewResultChange: (value: string) => void;
  previewRoll: string;
  onPreviewRollChange: (value: string) => void;
  previewCharacterName?: string;
  onPreviewCharacterNameChange?: (value: string) => void;
  previewCharacterLevel?: string;
  onPreviewCharacterLevelChange?: (value: string) => void;
  previewMode?: PreviewMode;
  onPreviewRequest?: () => void;
  className?: string;
}) {
  const showCharacterControls = Boolean(
    template.custom &&
    previewCharacterName !== undefined &&
    onPreviewCharacterNameChange &&
    previewCharacterLevel !== undefined &&
    onPreviewCharacterLevelChange,
  );
  const args = previewArgs(template, compactRow);
  const showPlaceholder = Boolean(onPreviewRequest && previewMode !== 'ready');

  return (
    <aside className={`encounter-preview-panel${className ? ` ${className}` : ''}`}>
      <section className="preview-template-summary">
        <div className="preview-summary-copy">
          <span>Template</span>
          <strong>{template.functionName ?? template.id}(args)</strong>
          <small>
            {template.custom ? 'Custom Drac2 function via Pyodide' : template.description}
          </small>
        </div>
      </section>
      <div className="preview-controls">
        <SelectField
          label="Preview result"
          value={previewResult}
          values={['success', 'failure', 'neutral']}
          onChange={onPreviewResultChange}
          help="Controls success/failure text in the embed preview."
        />
        <SelectField
          label="Mock roll total"
          value={previewRoll}
          values={['5', '10', '12', '15', '18', '20', '25']}
          onChange={onPreviewRollChange}
          help="Sample roll total shown beside any checks the template returns."
        />
        {showCharacterControls ? (
          <>
            <label className="field">
              <span>
                Mock character
                <HelpTip label="Mock character help">
                  The Pyodide preview exposes this as character().name, character().level, and
                  str(character()).
                </HelpTip>
              </span>
              <input
                value={previewCharacterName ?? ''}
                onChange={(event) => onPreviewCharacterNameChange?.(event.target.value)}
              />
            </label>
            <SelectField
              label="Mock level"
              value={previewCharacterLevel ?? '5'}
              values={['1', '3', '5', '8', '10', '12', '15', '17', '20']}
              onChange={(value) => onPreviewCharacterLevelChange?.(value)}
              help="The Pyodide preview exposes this as character().level."
            />
          </>
        ) : null}
      </div>
      <div className="preview-details-grid">
        <section className="preview-data-block">
          <h4>Input args</h4>
          {args.length ? (
            <dl className="preview-arg-list">
              {args.map((arg, index) => (
                <div key={`${arg.label}-${index}`}>
                  <dt>{arg.label}</dt>
                  <dd>{formatPreviewValue(arg.value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>No positional args are passed to this template.</p>
          )}
        </section>
        <section className="preview-data-block">
          <h4>Template output</h4>
          <pre>{previewOutputText(preview, previewMode)}</pre>
        </section>
      </div>
      {showPlaceholder && onPreviewRequest ? (
        <EncounterPreviewPlaceholder
          loading={previewMode === 'loading'}
          onRefresh={onPreviewRequest}
        />
      ) : onPreviewRequest ? (
        <div className="preview-refresh-frame">
          <EncounterPreview preview={preview} />
          <button
            type="button"
            className="preview-placeholder-refresh"
            onClick={onPreviewRequest}
            aria-label="Refresh Python preview"
            title="Refresh Python preview"
          >
            <RefreshCw size={26} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <EncounterPreview preview={preview} />
      )}
    </aside>
  );
}

export function EncounterPreview({ preview }: { preview: EncounterPreviewModel }) {
  return (
    <div className="discord-preview" aria-label="Encounter embed preview">
      <div className="discord-author">
        <span className="discord-avatar">A</span>
        <span>Avrae preview</span>
      </div>
      <article className={`discord-embed ${preview.kind}`}>
        {preview.thumb ? <img className="discord-thumb" src={preview.thumb} alt="" /> : null}
        <header>
          <span className="discord-kicker">{preview.kind}</span>
          <h4>{preview.name}</h4>
        </header>
        <p>{preview.description}</p>
        {preview.rolls.map((roll) => (
          <strong key={roll}>{roll}</strong>
        ))}
        {preview.outcomes.map((outcome) => (
          <span key={outcome}>{outcome}</span>
        ))}
        {preview.notice ? <span className="preview-note">{preview.notice}</span> : null}
        {preview.image ? <img className="discord-image" src={preview.image} alt="" /> : null}
        <footer>{preview.footer}</footer>
      </article>
    </div>
  );
}

function previewArgs(template: EncounterTemplate, row: CompactEncounterRow): PreviewArg[] {
  const args = row.slice(2);
  return args.map((value, index) => ({
    label: template.fields[index]?.label ?? `args[${index}]`,
    value,
  }));
}

function EncounterPreviewPlaceholder({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div
      className={`discord-preview preview-placeholder${loading ? ' loading' : ''}`}
      aria-label="Encounter preview placeholder"
      aria-busy={loading}
    >
      <div className="discord-author">
        <span className="discord-avatar">A</span>
        <span className="skeleton-line author-line" />
      </div>
      <article className="discord-embed gather preview-skeleton">
        <span className="skeleton-line kicker-line" />
        <span className="skeleton-line title-line" />
        <span className="skeleton-line text-line wide" />
        <span className="skeleton-line text-line" />
        <span className="skeleton-line strong-line" />
        <span className="skeleton-line footer-line" />
      </article>
      <button
        type="button"
        className="preview-placeholder-refresh"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh Python preview"
        title="Refresh Python preview"
      >
        <RefreshCw size={26} aria-hidden="true" className={loading ? 'spin' : undefined} />
      </button>
    </div>
  );
}

function previewOutputText(preview: EncounterPreviewModel, previewMode: PreviewMode) {
  if (previewMode === 'idle') return 'Preview has not been rendered yet.';
  if (previewMode === 'loading') return 'Rendering template output with Python...';
  if (preview.output) return JSON.stringify(preview.output, null, 2);
  if (preview.notice) return JSON.stringify({ error: preview.notice }, null, 2);
  return 'null';
}

function formatPreviewValue(value: unknown) {
  if (value === null) return 'null';
  if (value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
