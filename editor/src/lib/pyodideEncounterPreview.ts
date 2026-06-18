export type PyodideTemplatePreview = {
  encounter?: Record<string, unknown>;
  displayOutput?: Record<string, unknown>;
  encounterCacheKey?: string;
  error?: string;
};

export type PyodidePreviewPhase = 'encounter' | 'process' | 'full';

export type RollMockMode = 'mockReturns' | 'mockReturnsOnce' | 'mockReturnsNTimes';

export type RollMockConfig = {
  mode: RollMockMode;
  values: string[];
  fallback: string;
  times: number;
};

type PendingRequest = {
  resolve: (value: PyodideTemplatePreview) => void;
  timer: number;
};

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, PendingRequest>();

export function previewTemplateWithPyodide({
  phase = 'full',
  source,
  functionName,
  templateId,
  args,
  previewResult,
  previewRoll,
  previewCharacter,
  rollMock,
  encounterCacheKey,
  encounterOverride,
}: {
  phase?: PyodidePreviewPhase;
  source?: string;
  functionName?: string;
  templateId?: string;
  args: unknown[];
  previewResult: string;
  previewRoll: string;
  previewCharacter?: {
    name: string;
    level: number;
  };
  rollMock?: RollMockConfig;
  encounterCacheKey?: string;
  encounterOverride?: Record<string, unknown>;
}): Promise<PyodideTemplatePreview> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve({ error: 'Python preview is only available in the browser.' });
  }
  if (source && /\b(?:import|from|using|eval|exec|open|__import__)\b/.test(source)) {
    return Promise.resolve({
      error:
        'Python preview cannot run imports, using(...), eval, exec, open, or __import__. The exported gvar keeps the source unchanged.',
    });
  }

  const id = nextId;
  nextId += 1;
  const pyodideWorker = ensureWorker();

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      resolve({ error: 'Python preview timed out before the template returned output.' });
    }, 7000);
    pending.set(id, { resolve, timer });
    pyodideWorker.postMessage({
      id,
      phase,
      source,
      functionName,
      templateId,
      args,
      previewResult,
      previewRoll,
      previewCharacter,
      rollMock,
      encounterCacheKey,
      encounterOverride,
    });
  });
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('../workers/pyodideEncounterWorker.ts', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener(
    'message',
    (event: MessageEvent<{ id: number } & PyodideTemplatePreview>) => {
      const request = pending.get(event.data.id);
      if (!request) return;
      window.clearTimeout(request.timer);
      pending.delete(event.data.id);
      request.resolve({
        encounter: event.data.encounter,
        displayOutput: event.data.displayOutput,
        encounterCacheKey: event.data.encounterCacheKey,
        error: event.data.error,
      });
    },
  );
  worker.addEventListener('error', (event) => {
    for (const [id, request] of pending) {
      window.clearTimeout(request.timer);
      pending.delete(id);
      request.resolve({
        error: event.message || 'Python preview worker failed before returning output.',
      });
    }
  });
  return worker;
}
