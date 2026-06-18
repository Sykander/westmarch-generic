export type PyodideTemplatePreview = {
  encounter?: Record<string, unknown>;
  error?: string;
};

type PendingRequest = {
  resolve: (value: PyodideTemplatePreview) => void;
  timer: number;
};

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, PendingRequest>();

export function previewTemplateWithPyodide({
  source,
  functionName,
  args,
  previewCharacter,
}: {
  source: string;
  functionName?: string;
  args: unknown[];
  previewCharacter?: {
    name: string;
    level: number;
  };
}): Promise<PyodideTemplatePreview> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve({ error: 'Python preview is only available in the browser.' });
  }
  if (/\b(?:import|from|using|eval|exec|open|__import__)\b/.test(source)) {
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
    pyodideWorker.postMessage({ id, source, functionName, args, previewCharacter });
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
