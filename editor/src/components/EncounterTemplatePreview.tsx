import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CompactEncounterRow, EncounterTemplate } from '../domain/encounters';
import { buildEncounterPreview } from '../lib/encounterPreview';
import {
  previewTemplateWithPyodide,
  type PyodideTemplatePreview,
  type RollMockConfig,
} from '../lib/pyodideEncounterPreview';
import { EncounterPreviewPanel, type PreviewDiscordProfile } from './EncounterPreviewPanel';

export function EncounterTemplatePreview({
  template,
  compactRow,
  inputValues,
  onInputValueChange,
  primaryCtaLabel,
  onPrimaryCta,
  className,
}: {
  template: EncounterTemplate;
  compactRow: CompactEncounterRow;
  inputValues?: Record<string, string | number>;
  onInputValueChange?: (key: string, value: string | number) => void;
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  className?: string;
}) {
  const [previewResult, setPreviewResult] = useState('success');
  const [rollValues, setRollValues] = useState('15,15,15,15,15');
  const [previewCharacterName, setPreviewCharacterName] = useState('Daenerys Targaryen');
  const [previewCharacterLevel, setPreviewCharacterLevel] = useState('5');
  const [previewDiscordUserName, setPreviewDiscordUserName] = useState('CoolGuy2026');
  const [previewDiscordProfile, setPreviewDiscordProfile] = useState<PreviewDiscordProfile>('cat');
  const [previewDiscordProfileUrl, setPreviewDiscordProfileUrl] = useState('');
  const [encounterResult, setEncounterResult] = useState<PyodideTemplatePreview | null>(null);
  const [displayResult, setDisplayResult] = useState<PyodideTemplatePreview | null>(null);
  const [encounterText, setEncounterText] = useState('');
  const [encounterDirty, setEncounterDirty] = useState(false);
  const [isDisplayLoading, setIsDisplayLoading] = useState(false);
  const pythonPreviewArgs = useMemo(() => compactRow.slice(2), [compactRow]);
  const pythonPreviewCharacter = useMemo(
    () => ({
      name: previewCharacterName.trim() || 'Daenerys Targaryen',
      level: Number(previewCharacterLevel) || 1,
    }),
    [previewCharacterLevel, previewCharacterName],
  );
  const pythonPreviewEnabled = template.custom ? Boolean(template.source?.trim()) : true;
  const rollMock = useMemo<RollMockConfig>(
    () => ({
      mode: 'mockReturns',
      values: rollValues
        .split(',')
        .map((value) => value.trim())
        .slice(0, 5),
      fallback: '10',
      times: 1,
    }),
    [rollValues],
  );

  useEffect(() => {
    setEncounterResult(null);
    setDisplayResult(null);
    setEncounterText('');
    setEncounterDirty(false);
    setIsDisplayLoading(false);
  }, [
    pythonPreviewArgs,
    pythonPreviewEnabled,
    template.functionName,
    template.id,
    template.source,
  ]);

  useEffect(() => {
    setDisplayResult(null);
  }, [previewResult, pythonPreviewCharacter, rollMock]);

  const requestPreview = useCallback(() => {
    if (!pythonPreviewEnabled || isDisplayLoading) return;
    setIsDisplayLoading(true);
    let encounterOverride: Record<string, unknown> | undefined;
    if (encounterDirty && encounterText.trim()) {
      try {
        const parsed = JSON.parse(encounterText) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          encounterOverride = parsed as Record<string, unknown>;
        } else {
          throw new Error('Encounter output must be a JSON object.');
        }
      } catch (error) {
        setDisplayResult({
          error: error instanceof Error ? error.message : String(error),
        });
        setIsDisplayLoading(false);
        return;
      }
    }
    const hasEncounter =
      encounterOverride !== undefined || Boolean(encounterResult?.encounterCacheKey);
    void previewTemplateWithPyodide({
      phase: hasEncounter ? 'process' : 'full',
      source: template.custom ? (template.source ?? '') : undefined,
      functionName: template.functionName,
      templateId: template.id,
      args: pythonPreviewArgs,
      previewResult,
      previewRoll: rollMock.values[0] ?? '15',
      previewCharacter: pythonPreviewCharacter,
      rollMock,
      encounterCacheKey: encounterResult?.encounterCacheKey,
      encounterOverride,
    })
      .then((result) => {
        setDisplayResult(result);
        if (result.encounter) {
          setEncounterResult({
            encounter: result.encounter,
            encounterCacheKey: result.encounterCacheKey,
            error: result.error,
          });
          if (!encounterDirty || !encounterText.trim()) {
            setEncounterText(JSON.stringify(result.encounter, null, 2));
            setEncounterDirty(false);
          }
        }
      })
      .catch((error: unknown) => {
        setDisplayResult({
          error: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => setIsDisplayLoading(false));
  }, [
    encounterDirty,
    encounterResult?.encounterCacheKey,
    encounterText,
    isDisplayLoading,
    previewResult,
    pythonPreviewArgs,
    pythonPreviewCharacter,
    pythonPreviewEnabled,
    rollMock,
    template.custom,
    template.functionName,
    template.id,
    template.source,
  ]);

  const pythonPreview = useMemo<PyodideTemplatePreview | null>(() => {
    if (displayResult) return displayResult;
    if (isDisplayLoading) return { loading: true } as PyodideTemplatePreview & { loading: boolean };
    return null;
  }, [displayResult, isDisplayLoading]);
  const previewMode = isDisplayLoading
    ? 'loading'
    : displayResult
      ? 'ready'
      : encounterResult
        ? 'encounter-ready'
        : pythonPreviewEnabled
          ? 'idle'
          : 'ready';
  const preview = useMemo(
    () =>
      buildEncounterPreview({
        template,
        row: compactRow,
        previewResult,
        previewRoll: rollMock.values[0] ?? '15',
        pythonPreview,
      }),
    [compactRow, previewResult, pythonPreview, rollMock, template],
  );

  function updateEncounterText(value: string) {
    setEncounterText(value);
    setEncounterDirty(true);
    setDisplayResult(null);
  }

  return (
    <EncounterPreviewPanel
      template={template}
      preview={preview}
      inputValues={inputValues}
      onInputValueChange={onInputValueChange}
      previewResult={previewResult}
      onPreviewResultChange={setPreviewResult}
      rollValues={rollValues}
      onRollValuesChange={setRollValues}
      previewCharacterName={previewCharacterName}
      onPreviewCharacterNameChange={setPreviewCharacterName}
      previewCharacterLevel={previewCharacterLevel}
      onPreviewCharacterLevelChange={setPreviewCharacterLevel}
      previewDiscordUserName={previewDiscordUserName}
      onPreviewDiscordUserNameChange={setPreviewDiscordUserName}
      previewDiscordProfile={previewDiscordProfile}
      onPreviewDiscordProfileChange={setPreviewDiscordProfile}
      previewDiscordProfileUrl={previewDiscordProfileUrl}
      onPreviewDiscordProfileUrlChange={setPreviewDiscordProfileUrl}
      previewMode={previewMode}
      encounterText={encounterText}
      onEncounterTextChange={updateEncounterText}
      encounterError={encounterResult?.error}
      displayError={displayResult?.error}
      isDisplayLoading={isDisplayLoading}
      onPreviewRequest={pythonPreviewEnabled ? requestPreview : undefined}
      primaryCtaLabel={primaryCtaLabel}
      onPrimaryCta={onPrimaryCta}
      className={className}
    />
  );
}
