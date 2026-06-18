import { useId, useState } from 'react';
import type { EncounterTemplate } from '../domain/encounters';
import type { EncounterPreviewModel } from '../lib/encounterPreview';
import { ExpandableBlockRows } from './ExpandableBlockRows';
import { SelectField } from './FormFields';
import { HelpTip } from './HelpTip';
import { TemplatePreviewArgField } from './TemplatePreviewArgField';

const AVRAE_AVATAR_URL = `${import.meta.env?.BASE_URL ?? '/westmarch-generic/'}westmarch-assets/brand/avrae-avatar.svg`;

type PreviewRowId = 'inputs' | 'mocks' | 'outputs' | 'view';

export type PreviewMode = 'ready' | 'idle' | 'loading' | 'encounter-ready';

export function EncounterPreviewPanel({
  template,
  preview,
  inputValues,
  onInputValueChange,
  previewResult,
  onPreviewResultChange,
  rollValues = '15,15,15,15,15',
  onRollValuesChange,
  previewCharacterName = 'Preview Character',
  onPreviewCharacterNameChange,
  previewCharacterLevel = '5',
  onPreviewCharacterLevelChange,
  previewMode = 'ready',
  encounterText = '',
  onEncounterTextChange,
  encounterError,
  displayError,
  isDisplayLoading = false,
  onPreviewRequest,
  primaryCtaLabel,
  onPrimaryCta,
  className,
}: {
  template: EncounterTemplate;
  preview: EncounterPreviewModel;
  inputValues?: Record<string, string | number>;
  onInputValueChange?: (key: string, value: string | number) => void;
  previewResult: string;
  onPreviewResultChange: (value: string) => void;
  rollValues?: string;
  onRollValuesChange?: (value: string) => void;
  previewCharacterName?: string;
  onPreviewCharacterNameChange?: (value: string) => void;
  previewCharacterLevel?: string;
  onPreviewCharacterLevelChange?: (value: string) => void;
  previewMode?: PreviewMode;
  encounterText?: string;
  onEncounterTextChange?: (value: string) => void;
  encounterError?: string;
  displayError?: string;
  isDisplayLoading?: boolean;
  onPreviewRequest?: () => void;
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  className?: string;
}) {
  const idPrefix = useId().replace(/:/g, '');
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({
    inputs: true,
    mocks: false,
    outputs: false,
    view: false,
  });

  function goTo(rowId: PreviewRowId) {
    setOpenRows((current) => ({
      ...current,
      [rowId]: true,
    }));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(`${idPrefix}-${rowId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      });
    });
  }

  return (
    <aside className={`encounter-preview-panel${className ? ` ${className}` : ''}`}>
      <ExpandableBlockRows
        className="preview-section-rows"
        openRows={openRows}
        onOpenRowsChange={setOpenRows}
        rows={[
          {
            id: 'inputs',
            htmlId: `${idPrefix}-inputs`,
            title: 'Inputs',
            summary: 'Row values and template function',
            children: (
              <PreviewInputsSection
                template={template}
                inputValues={inputValues}
                onInputValueChange={onInputValueChange}
                onGoToMocks={() => goTo('mocks')}
              />
            ),
          },
          {
            id: 'mocks',
            htmlId: `${idPrefix}-mocks`,
            title: 'Mocks',
            summary: 'Roll returns and mock character data',
            children: (
              <PreviewMocksSection
                encounterText={encounterText}
                previewResult={previewResult}
                onPreviewResultChange={onPreviewResultChange}
                rollValues={rollValues}
                onRollValuesChange={onRollValuesChange}
                previewCharacterName={previewCharacterName}
                onPreviewCharacterNameChange={onPreviewCharacterNameChange}
                previewCharacterLevel={previewCharacterLevel}
                onPreviewCharacterLevelChange={onPreviewCharacterLevelChange}
                onGoToOutputs={() => goTo('outputs')}
                onGoToView={() => goTo('view')}
              />
            ),
          },
          {
            id: 'outputs',
            htmlId: `${idPrefix}-outputs`,
            title: 'Outputs',
            summary: 'Encounter output and processed display output',
            children: (
              <PreviewOutputsSection
                preview={preview}
                previewMode={previewMode}
                encounterText={encounterText}
                onEncounterTextChange={onEncounterTextChange}
                encounterError={encounterError}
                displayError={displayError}
                isDisplayLoading={isDisplayLoading}
                onPreviewRequest={onPreviewRequest}
                onGoToView={() => goTo('view')}
              />
            ),
          },
          {
            id: 'view',
            htmlId: `${idPrefix}-view`,
            title: 'View',
            summary: 'Discord-style embed preview',
            children: (
              <PreviewViewSection
                preview={preview}
                previewMode={previewMode}
                isDisplayLoading={isDisplayLoading}
                onPreviewRequest={onPreviewRequest}
                onGoToInputs={() => goTo('inputs')}
                onGoToMocks={() => goTo('mocks')}
                onGoToOutputs={() => goTo('outputs')}
                primaryCtaLabel={primaryCtaLabel}
                onPrimaryCta={onPrimaryCta}
              />
            ),
          },
        ]}
      />
    </aside>
  );
}

function PreviewInputsSection({
  template,
  inputValues,
  onInputValueChange,
  onGoToMocks,
}: {
  template: EncounterTemplate;
  inputValues?: Record<string, string | number>;
  onInputValueChange?: (key: string, value: string | number) => void;
  onGoToMocks: () => void;
}) {
  const canEditInputs = Boolean(inputValues && onInputValueChange);
  return (
    <div className="preview-section-content">
      <section className="preview-template-summary">
        <div className="preview-summary-copy">
          <span>Template</span>
          <strong>{template.functionName ?? template.id}(args)</strong>
          <small>
            {template.custom ? 'Custom Drac2 function via Pyodide' : template.description}
          </small>
        </div>
      </section>
      <ExpandableBlockRows
        className="preview-subrow-list"
        rows={[
          ...(canEditInputs
            ? [
                {
                  id: 'row-values',
                  title: 'Row values',
                  summary: `${template.fields.length} values synced with the row builder`,
                  children: (
                    <div className="form-grid custom-template-preview-inputs">
                      {template.fields.map((field) => (
                        <TemplatePreviewArgField
                          field={field}
                          value={inputValues?.[field.key] ?? ''}
                          onChange={(value) => onInputValueChange?.(field.key, value)}
                          key={field.key}
                        />
                      ))}
                    </div>
                  ),
                },
              ]
            : []),
          {
            id: 'template-function',
            title: 'Template function',
            summary: String(template.functionName ?? template.id),
            children: (
              <section className="preview-data-block">
                <pre>
                  {template.source?.trim() || `${template.functionName ?? template.id}(args)`}
                </pre>
              </section>
            ),
          },
        ]}
      />
      <PreviewCtaRow secondary={[{ label: 'Mocks', onClick: onGoToMocks }]} />
    </div>
  );
}

function PreviewMocksSection({
  encounterText,
  previewResult,
  onPreviewResultChange,
  rollValues,
  onRollValuesChange,
  previewCharacterName,
  onPreviewCharacterNameChange,
  previewCharacterLevel,
  onPreviewCharacterLevelChange,
  onGoToOutputs,
  onGoToView,
}: {
  encounterText: string;
  previewResult: string;
  onPreviewResultChange: (value: string) => void;
  rollValues: string;
  onRollValuesChange?: (value: string) => void;
  previewCharacterName: string;
  onPreviewCharacterNameChange?: (value: string) => void;
  previewCharacterLevel: string;
  onPreviewCharacterLevelChange?: (value: string) => void;
  onGoToOutputs: () => void;
  onGoToView: () => void;
}) {
  const rollLabels = encounterRollLabels(encounterText);
  const rollParts = rollValues
    .split(',')
    .map((value) => value.trim())
    .slice(0, 5);
  while (rollParts.length < 5) rollParts.push('');

  function updateRoll(index: number, value: string) {
    const next = [...rollParts];
    next[index] = value;
    onRollValuesChange?.(next.join(','));
  }

  function fillAllFromFirst() {
    const value = rollParts[0] || '15';
    onRollValuesChange?.(Array.from({ length: 5 }, () => value).join(','));
  }

  function fillRandomRolls() {
    onRollValuesChange?.(
      Array.from({ length: 5 }, () => String(Math.floor(Math.random() * 20) + 1)).join(','),
    );
  }

  return (
    <div className="preview-section-content">
      <div className="preview-controls">
        <SelectField
          label="Preview result"
          value={previewResult}
          values={['success', 'failure', 'neutral']}
          onChange={onPreviewResultChange}
          help="Controls success/failure text in processed encounter output."
        />
        <label className="field">
          <span>
            Mock character
            <HelpTip label="Mock character help">
              Exposed as character().name, character().level, and str(character()).
            </HelpTip>
          </span>
          <input
            value={previewCharacterName}
            onChange={(event) => onPreviewCharacterNameChange?.(event.target.value)}
          />
        </label>
        <SelectField
          label="Mock level"
          value={previewCharacterLevel}
          values={['1', '3', '5', '8', '10', '12', '15', '17', '20']}
          onChange={(value) => onPreviewCharacterLevelChange?.(value)}
          help="Exposed as character().level."
        />
      </div>
      <section className="preview-data-block">
        <h4>Roll results</h4>
        <div className="preview-roll-mock-grid">
          {rollParts.map((value, index) => (
            <label className="field" key={`roll-${index}`}>
              <span>{rollLabels[index] ?? `Roll ${index + 1}`}</span>
              <input
                inputMode="numeric"
                value={value}
                placeholder="random"
                onChange={(event) => updateRoll(index, event.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="button-row">
          <button type="button" onClick={fillAllFromFirst}>
            Use First For All
          </button>
          <button type="button" onClick={fillRandomRolls}>
            Random Rolls
          </button>
        </div>
      </section>
      <PreviewCtaRow
        secondary={[
          { label: 'Outputs', onClick: onGoToOutputs },
          { label: 'View', onClick: onGoToView },
        ]}
      />
    </div>
  );
}

function PreviewOutputsSection({
  preview,
  previewMode,
  encounterText,
  onEncounterTextChange,
  encounterError,
  displayError,
  isDisplayLoading,
  onPreviewRequest,
  onGoToView,
}: {
  preview: EncounterPreviewModel;
  previewMode: PreviewMode;
  encounterText: string;
  onEncounterTextChange?: (value: string) => void;
  encounterError?: string;
  displayError?: string;
  isDisplayLoading: boolean;
  onPreviewRequest?: () => void;
  onGoToView: () => void;
}) {
  return (
    <div className="preview-section-content">
      <div className="preview-details-grid">
        <label className="field preview-output-editor">
          <span>Encounter output</span>
          <textarea
            className="code-input"
            rows={14}
            value={encounterOutputText(encounterText, previewMode, encounterError)}
            onChange={(event) => onEncounterTextChange?.(event.target.value)}
            readOnly={!onEncounterTextChange || !encounterText}
          />
        </label>
        <section className="preview-data-block">
          <h4>Display output</h4>
          <pre>{displayOutputText(preview, previewMode, displayError)}</pre>
        </section>
      </div>
      <PreviewCtaRow
        primary={{
          label: isDisplayLoading ? 'Generating Outputs...' : 'Generate Outputs',
          onClick: onPreviewRequest,
          disabled: !onPreviewRequest || isDisplayLoading,
        }}
        secondary={[{ label: 'View', onClick: onGoToView }]}
      />
    </div>
  );
}

function PreviewViewSection({
  preview,
  previewMode,
  isDisplayLoading,
  onPreviewRequest,
  onGoToInputs,
  onGoToMocks,
  onGoToOutputs,
  primaryCtaLabel,
  onPrimaryCta,
}: {
  preview: EncounterPreviewModel;
  previewMode: PreviewMode;
  isDisplayLoading: boolean;
  onPreviewRequest?: () => void;
  onGoToInputs: () => void;
  onGoToMocks: () => void;
  onGoToOutputs: () => void;
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
}) {
  const showPlaceholder = Boolean(onPreviewRequest && previewMode !== 'ready');
  return (
    <div className="preview-section-content">
      <PreviewCtaRow
        primary={{
          label: isDisplayLoading ? 'Generating Preview...' : 'Generate Preview',
          onClick: onPreviewRequest,
          disabled: !onPreviewRequest || isDisplayLoading,
        }}
      />
      {showPlaceholder ? (
        <EncounterPreviewPlaceholder loading={isDisplayLoading} />
      ) : (
        <EncounterPreview preview={preview} />
      )}
      <PreviewCtaRow
        secondary={[
          { label: 'Inputs', onClick: onGoToInputs },
          { label: 'Mocks', onClick: onGoToMocks },
          { label: 'Outputs', onClick: onGoToOutputs },
        ]}
        primary={
          primaryCtaLabel
            ? {
                label: primaryCtaLabel,
                onClick: onPrimaryCta,
                disabled: !onPrimaryCta,
              }
            : undefined
        }
      />
    </div>
  );
}

function PreviewCtaRow({
  primary,
  secondary = [],
  error,
}: {
  primary?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  secondary?: Array<{
    label: string;
    onClick: () => void;
  }>;
  error?: string;
}) {
  return (
    <div className="preview-action-row">
      {secondary.map((action) => (
        <button type="button" onClick={action.onClick} key={action.label}>
          {action.label}
        </button>
      ))}
      {primary ? (
        <button
          type="button"
          className="primary"
          onClick={primary.onClick}
          disabled={primary.disabled}
        >
          {primary.label}
        </button>
      ) : null}
      {error ? <span className="preview-note">{error}</span> : null}
    </div>
  );
}

export function EncounterPreview({ preview }: { preview: EncounterPreviewModel }) {
  return (
    <div className="discord-preview" aria-label="Encounter embed preview">
      <div className="discord-message">
        <img className="discord-avatar" src={AVRAE_AVATAR_URL} alt="" />
        <div className="discord-message-body">
          <div className="discord-author">
            <span>Avrae</span>
            <span className="discord-app-badge">APP</span>
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
      </div>
    </div>
  );
}

function EncounterPreviewPlaceholder({ loading }: { loading: boolean }) {
  return (
    <div
      className={`discord-preview preview-placeholder${loading ? ' loading' : ''}`}
      aria-label="Encounter preview placeholder"
      aria-busy={loading}
    >
      <div className="discord-message">
        <img className="discord-avatar" src={AVRAE_AVATAR_URL} alt="" />
        <div className="discord-message-body">
          <div className="discord-author">
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
        </div>
      </div>
    </div>
  );
}

function encounterOutputText(
  encounterText: string,
  previewMode: PreviewMode,
  encounterError?: string,
) {
  if (encounterError) return JSON.stringify({ error: encounterError }, null, 2);
  if (encounterText) return encounterText;
  return 'Generate outputs to inspect or edit template output.';
}

function displayOutputText(
  preview: EncounterPreviewModel,
  previewMode: PreviewMode,
  displayError?: string,
) {
  if (displayError) return JSON.stringify({ error: displayError }, null, 2);
  if (previewMode === 'idle') return 'Preview has not been rendered yet.';
  if (previewMode === 'encounter-ready') return 'Generate outputs to process the encounter.';
  if (previewMode === 'loading') return 'Processing display output with Python...';
  if (preview.displayOutput) return JSON.stringify(preview.displayOutput, null, 2);
  if (preview.notice) return JSON.stringify({ error: preview.notice }, null, 2);
  return 'null';
}

function encounterRollLabels(encounterText: string) {
  const labels = Array.from({ length: 5 }, (_, index) => `Roll ${index + 1}`);
  if (!encounterText.trim()) return labels;
  try {
    const parsed = JSON.parse(encounterText) as { rolls?: unknown };
    if (!Array.isArray(parsed.rolls)) return labels;
    parsed.rolls.slice(0, 5).forEach((roll, index) => {
      if (!roll || typeof roll !== 'object' || Array.isArray(roll)) return;
      const record = roll as Record<string, unknown>;
      const name = record.name ? String(record.name) : labels[index];
      const dc = record.dc ? ` DC ${String(record.dc)}` : '';
      labels[index] = `${name}${dc}`;
    });
  } catch {
    return labels;
  }
  return labels;
}
