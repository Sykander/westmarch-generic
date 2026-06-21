import { useId, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { EncounterTemplate } from '../domain/encounters';
import type { EncounterPreviewModel } from '../lib/encounterPreview';
import { ExpandableBlockRows } from './ExpandableBlockRows';
import { SelectField } from './FormFields';
import { HelpTip } from './HelpTip';
import { TemplatePreviewArgField } from './TemplatePreviewArgField';

const DISCORD_ASSET_BASE = `${import.meta.env?.BASE_URL ?? '/westmarch-generic/'}discord-assets/`;
const AVRAE_AVATAR_URL = `${DISCORD_ASSET_BASE}avrae-profile.webp`;
const DEFAULT_DISCORD_PROFILE_URL = `${DISCORD_ASSET_BASE}default_profile.png`;
const CAT_DISCORD_PROFILE_URL = `${DISCORD_ASSET_BASE}cat_profile.png`;
const PREVIEW_MESSAGE_TIMESTAMP = 'Today at 8:53 PM';
const PREVIEW_ACCURACY_HELP =
  'This preview is an indicator, not a guarantee of runtime behaviour. It does not run real Avrae/Drac2 in Discord or ask the Discord API to generate the message preview.';

const DISCORD_MARKDOWN_COMPONENTS = {
  p({ children }) {
    return <p className="discord-markdown-paragraph">{children}</p>;
  },
  h1({ children }) {
    return <h1>{children}</h1>;
  },
  h2({ children }) {
    return <h2>{children}</h2>;
  },
  h3({ children }) {
    return <h3>{children}</h3>;
  },
  h4({ children }) {
    return <h4>{children}</h4>;
  },
  h5({ children }) {
    return <h5>{children}</h5>;
  },
  h6({ children }) {
    return <h6>{children}</h6>;
  },
  a({ children, href }) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  },
  blockquote({ children }) {
    return <blockquote>{children}</blockquote>;
  },
  code({ children, className }) {
    return <code className={className}>{children}</code>;
  },
  pre({ children }) {
    return <pre>{children}</pre>;
  },
  ul({ children }) {
    return <ul>{children}</ul>;
  },
  ol({ children }) {
    return <ol>{children}</ol>;
  },
  li({ children }) {
    return <li>{children}</li>;
  },
} satisfies Components;

type PreviewRowId = 'inputs' | 'mocks' | 'outputs' | 'view';

export type PreviewMode = 'ready' | 'idle' | 'loading' | 'encounter-ready';
export type PreviewDiscordProfile = 'default' | 'cat' | 'custom';
type PreviewAction = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'preview';
};

export function EncounterPreviewPanel({
  template,
  preview,
  inputValues,
  onInputValueChange,
  previewResult,
  onPreviewResultChange,
  rollValues = '15,15,15,15,15',
  onRollValuesChange,
  previewCharacterName = 'Daenerys Targaryen',
  onPreviewCharacterNameChange,
  previewCharacterLevel = '5',
  onPreviewCharacterLevelChange,
  previewDiscordUserName = 'CoolGuy2026',
  onPreviewDiscordUserNameChange,
  previewDiscordProfile = 'cat',
  onPreviewDiscordProfileChange,
  previewDiscordProfileUrl = '',
  onPreviewDiscordProfileUrlChange,
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
  previewDiscordUserName?: string;
  onPreviewDiscordUserNameChange?: (value: string) => void;
  previewDiscordProfile?: PreviewDiscordProfile;
  onPreviewDiscordProfileChange?: (value: PreviewDiscordProfile) => void;
  previewDiscordProfileUrl?: string;
  onPreviewDiscordProfileUrlChange?: (value: string) => void;
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
                previewDiscordUserName={previewDiscordUserName}
                onPreviewDiscordUserNameChange={onPreviewDiscordUserNameChange}
                previewDiscordProfile={previewDiscordProfile}
                onPreviewDiscordProfileChange={onPreviewDiscordProfileChange}
                previewDiscordProfileUrl={previewDiscordProfileUrl}
                onPreviewDiscordProfileUrlChange={onPreviewDiscordProfileUrlChange}
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
                embedAuthorName={previewDiscordUserName}
                embedAuthorAvatarUrl={discordProfileUrl(
                  previewDiscordProfile,
                  previewDiscordProfileUrl,
                )}
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
  const callLabel = `${template.functionName ?? template.id}(args)`;
  return (
    <div className="preview-section-content">
      <section className="preview-template-summary">
        <div className="preview-summary-copy">
          <span>Template</span>
          <strong>{callLabel}</strong>
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
            title: template.custom ? 'Template function' : 'Engine template function',
            summary: String(template.functionName ?? template.id),
            children: (
              <section className="preview-data-block">
                {!template.custom ? <h4>Read-only engine source</h4> : null}
                <pre>{template.source?.trim() || callLabel}</pre>
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
  previewDiscordUserName,
  onPreviewDiscordUserNameChange,
  previewDiscordProfile,
  onPreviewDiscordProfileChange,
  previewDiscordProfileUrl,
  onPreviewDiscordProfileUrlChange,
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
  previewDiscordUserName: string;
  onPreviewDiscordUserNameChange?: (value: string) => void;
  previewDiscordProfile: PreviewDiscordProfile;
  onPreviewDiscordProfileChange?: (value: PreviewDiscordProfile) => void;
  previewDiscordProfileUrl: string;
  onPreviewDiscordProfileUrlChange?: (value: string) => void;
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
          help="Controls mocked roll pass/fail state in processed encounter output."
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
        <label className="field">
          <span>
            Mock Discord user
            <HelpTip label="Mock Discord user help">
              Shown as the embed author row Avrae includes above the embed title.
            </HelpTip>
          </span>
          <input
            value={previewDiscordUserName}
            onChange={(event) => onPreviewDiscordUserNameChange?.(event.target.value)}
          />
        </label>
        <SelectField
          label="Mock Discord profile"
          value={previewDiscordProfile}
          values={['default', 'cat', 'custom']}
          onChange={(value) => onPreviewDiscordProfileChange?.(value as PreviewDiscordProfile)}
          help="Avatar shown in the Avrae embed author row."
        />
        {previewDiscordProfile === 'custom' ? (
          <label className="field">
            <span>Profile image URL</span>
            <input
              value={previewDiscordProfileUrl}
              placeholder="https://example.test/avatar.png"
              onChange={(event) => onPreviewDiscordProfileUrlChange?.(event.target.value)}
            />
          </label>
        ) : null}
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
  embedAuthorName,
  embedAuthorAvatarUrl,
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
  embedAuthorName: string;
  embedAuthorAvatarUrl: string;
}) {
  const showPlaceholder = Boolean(onPreviewRequest && previewMode !== 'ready');
  return (
    <div className="preview-section-content">
      {showPlaceholder ? (
        <EncounterPreviewPlaceholder loading={isDisplayLoading} preview={preview} />
      ) : (
        <EncounterPreview
          preview={preview}
          embedAuthorName={embedAuthorName}
          embedAuthorAvatarUrl={embedAuthorAvatarUrl}
        />
      )}
      <PreviewCtaRow
        secondary={[
          { label: 'Inputs', onClick: onGoToInputs },
          { label: 'Mocks', onClick: onGoToMocks },
          { label: 'Outputs', onClick: onGoToOutputs },
          ...(onPreviewRequest
            ? [
                {
                  label: isDisplayLoading ? 'Generating Preview...' : 'Generate Preview',
                  onClick: onPreviewRequest,
                  disabled: isDisplayLoading,
                  variant: 'preview' as const,
                },
              ]
            : []),
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
  primary?: PreviewAction;
  secondary?: PreviewAction[];
  error?: string;
}) {
  return (
    <div className="preview-action-row">
      {secondary.map((action) => (
        <button
          type="button"
          className={previewActionClassName(action)}
          onClick={action.onClick}
          disabled={action.disabled}
          key={action.label}
        >
          {action.label}
        </button>
      ))}
      {primary ? (
        <button
          type="button"
          className={previewActionClassName({ ...primary, variant: primary.variant ?? 'primary' })}
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

function previewActionClassName(action: PreviewAction) {
  if (action.variant === 'preview') return 'preview-refresh';
  if (action.variant === 'primary') return 'primary';
  return undefined;
}

export function EncounterPreview({
  preview,
  embedAuthorName = 'CoolGuy2026',
  embedAuthorAvatarUrl = CAT_DISCORD_PROFILE_URL,
}: {
  preview: EncounterPreviewModel;
  embedAuthorName?: string;
  embedAuthorAvatarUrl?: string;
}) {
  const embed = preview.displayOutput?.embed;
  const description = previewEmbedDescription(preview);
  const title = embed?.title || preview.name;
  const footer = embed?.footer || preview.footer;
  const thumb = embed?.thumb || preview.thumb;
  const image = embed?.image || preview.image;
  const authorName = embedAuthorName.trim() || 'Discord User';
  const hasThumbnail = Boolean(thumb);

  return (
    <div className="discord-preview" aria-label="Encounter embed preview">
      <div className="discord-preview-toolbar">
        <span>Preview</span>
        <HelpTip label="Preview accuracy help">{PREVIEW_ACCURACY_HELP}</HelpTip>
      </div>
      <div className="discord-message">
        <img className="discord-avatar" src={AVRAE_AVATAR_URL} width={40} height={40} alt="" />
        <div className="discord-message-body">
          <h3 className="discord-message-header">
            <span className="discord-author">
              <span>Avrae</span>
              <span className="discord-app-badge">APP</span>
            </span>
            <span className="discord-message-time">{PREVIEW_MESSAGE_TIMESTAMP}</span>
          </h3>
          <article
            className={`discord-embed ${preview.kind}${hasThumbnail ? ' has-thumbnail' : ''}`}
          >
            <div className={`discord-embed-grid${hasThumbnail ? ' has-thumbnail' : ''}`}>
              <div className="discord-embed-author">
                <img src={embedAuthorAvatarUrl} width={24} height={24} alt="" />
                <span>{authorName}</span>
              </div>
              <h4 className="discord-embed-title">{title}</h4>
              {description ? (
                <DiscordMarkdown className="discord-embed-description">
                  {description}
                </DiscordMarkdown>
              ) : null}
              {thumb ? <img className="discord-thumb" src={thumb} alt="" /> : null}
              {preview.notice ? <span className="preview-note">{preview.notice}</span> : null}
              {image ? <img className="discord-image" src={image} alt="" /> : null}
              <footer>{footer}</footer>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function DiscordMarkdown({ children, className }: { children: string; className?: string }) {
  const parts = splitDiscordMarkdown(children);

  return (
    <div className={`discord-markdown${className ? ` ${className}` : ''}`}>
      {parts.map((part, index) =>
        part.type === 'subtext' ? (
          <div className="discord-markdown-subtext" key={`${part.type}-${index}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={DISCORD_MARKDOWN_COMPONENTS}>
              {part.value}
            </ReactMarkdown>
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={DISCORD_MARKDOWN_COMPONENTS}
            key={`${part.type}-${index}`}
          >
            {part.value}
          </ReactMarkdown>
        ),
      )}
    </div>
  );
}

function splitDiscordMarkdown(markdown: string) {
  const parts: Array<{ type: 'markdown' | 'subtext'; value: string }> = [];
  const markdownBuffer: string[] = [];

  function flushMarkdown() {
    const value = markdownBuffer.join('\n').trim();
    markdownBuffer.length = 0;
    if (value) parts.push({ type: 'markdown', value });
  }

  for (const line of markdown.split('\n')) {
    const subtext = line.match(/^-#\s+(.+)$/);
    if (subtext) {
      flushMarkdown();
      parts.push({ type: 'subtext', value: subtext[1] });
    } else {
      markdownBuffer.push(line);
    }
  }
  flushMarkdown();
  return parts;
}

function previewEmbedDescription(preview: EncounterPreviewModel) {
  const embedDesc = preview.displayOutput?.embed?.desc;
  if (embedDesc?.trim()) return embedDesc;
  return [preview.description, ...preview.rolls, ...preview.outcomes]
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function discordProfileUrl(profile: PreviewDiscordProfile, customUrl: string) {
  if (profile === 'cat') return CAT_DISCORD_PROFILE_URL;
  if (profile === 'custom') return customUrl.trim() || DEFAULT_DISCORD_PROFILE_URL;
  return DEFAULT_DISCORD_PROFILE_URL;
}

function EncounterPreviewPlaceholder({
  loading,
  preview,
}: {
  loading: boolean;
  preview: EncounterPreviewModel;
}) {
  const thumb = preview.displayOutput?.embed?.thumb || preview.thumb;
  const hasThumbnail = Boolean(thumb);

  return (
    <div
      className={`discord-preview preview-placeholder${loading ? ' loading' : ''}`}
      aria-label="Encounter preview placeholder"
      aria-busy={loading}
    >
      <div className="discord-preview-toolbar">
        <span>Preview</span>
        <HelpTip label="Preview accuracy help">{PREVIEW_ACCURACY_HELP}</HelpTip>
      </div>
      <div className="discord-message">
        <img className="discord-avatar" src={AVRAE_AVATAR_URL} width={40} height={40} alt="" />
        <div className="discord-message-body">
          <h3 className="discord-message-header">
            <span className="skeleton-line author-line" />
          </h3>
          <article
            className={`discord-embed ${preview.kind} preview-skeleton${hasThumbnail ? ' has-thumbnail' : ''}`}
          >
            <div
              className={`discord-embed-grid preview-skeleton-grid${hasThumbnail ? ' has-thumbnail' : ''}`}
            >
              <span className="skeleton-line embed-author-line" />
              <span className="skeleton-line title-line" />
              <div className="skeleton-description">
                <span className="skeleton-line text-line wide" />
                <span className="skeleton-line text-line" />
                <span className="skeleton-line strong-line" />
              </div>
              {hasThumbnail ? <span className="skeleton-line thumb-line" /> : null}
              <span className="skeleton-line footer-line" />
            </div>
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
