import { useCallback, useEffect, useRef, useState } from 'react';
import {
  previewTemplateWithPyodide,
  type PyodideTemplatePreview,
} from '../lib/pyodideEncounterPreview';

export type PythonPreviewState = (PyodideTemplatePreview & { loading?: boolean }) | null;

export function useLazyPythonTemplatePreview({
  enabled,
  source,
  functionName,
  templateId,
  args,
  previewResult,
  previewRoll,
  previewCharacter,
}: {
  enabled: boolean;
  source?: string;
  functionName?: string;
  templateId?: string;
  args: unknown[];
  previewResult: string;
  previewRoll: string;
  previewCharacter: {
    name: string;
    level: number;
  };
}) {
  const [pythonPreview, setPythonPreview] = useState<PythonPreviewState>(null);
  const loadingRef = useRef(false);
  const versionRef = useRef(0);

  useEffect(() => {
    versionRef.current += 1;
    loadingRef.current = false;
    setPythonPreview(null);
  }, [
    args,
    enabled,
    functionName,
    previewCharacter,
    previewResult,
    previewRoll,
    source,
    templateId,
  ]);

  const requestPreview = useCallback(() => {
    if (!enabled || loadingRef.current) return;

    const requestVersion = versionRef.current;
    loadingRef.current = true;
    setPythonPreview({ loading: true });

    void previewTemplateWithPyodide({
      source,
      functionName,
      templateId,
      args,
      previewResult,
      previewRoll,
      previewCharacter,
    })
      .then((result) => {
        if (requestVersion === versionRef.current) setPythonPreview(result);
      })
      .catch((error: unknown) => {
        if (requestVersion !== versionRef.current) return;
        setPythonPreview({
          error: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => {
        if (requestVersion === versionRef.current) loadingRef.current = false;
      });
  }, [
    args,
    enabled,
    functionName,
    previewCharacter,
    previewResult,
    previewRoll,
    source,
    templateId,
  ]);

  return {
    isPreviewLoading: Boolean(pythonPreview?.loading),
    pythonPreview,
    requestPreview,
  };
}
