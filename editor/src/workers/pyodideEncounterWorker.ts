import { loadPyodide, version as pyodideVersion } from 'pyodide';

type PreviewRequest = {
  id: number;
  source: string;
  functionName?: string;
  args: unknown[];
  previewCharacter?: {
    name: string;
    level: number;
  };
};

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<PreviewRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};
const ready = loadPyodide({
  indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
});

ctx.onmessage = async (event: MessageEvent<PreviewRequest>) => {
  const { id, source, functionName, args, previewCharacter } = event.data;
  try {
    const pyodide = await ready;
    pyodide.globals.set(
      'WG_TEMPLATE_INPUT',
      JSON.stringify({ source, functionName, args, previewCharacter }),
    );
    const json = await pyodide.runPythonAsync(PYTHON_TEMPLATE_PREVIEW_SCRIPT);
    ctx.postMessage({ id, ...JSON.parse(String(json)) });
  } catch (error) {
    ctx.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const PYTHON_TEMPLATE_PREVIEW_SCRIPT = String.raw`
import json
from math import ceil, floor

payload = json.loads(WG_TEMPLATE_INPUT)
source = payload.get("source") or ""
function_name = payload.get("functionName") or ""
args = payload.get("args") or []
preview_character = payload.get("previewCharacter") or {}

def _arg(values, index, default=None):
    if values is None:
        return default
    try:
        if index < len(values):
            return values[index]
    except Exception:
        pass
    return default

def _text(value, default=""):
    if value is None:
        return default
    try:
        return str(value)
    except Exception:
        return default

def _int_or_text(value, default=0):
    if value is None:
        return default
    try:
        return int(value)
    except Exception:
        return value

safe_builtins = {
    "abs": abs,
    "bool": bool,
    "dict": dict,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "range": range,
    "round": round,
    "str": str,
    "sum": sum,
}

class PreviewCharacter:
    def __init__(self, data):
        self.name = data.get("name") or "Preview Character"
        self.level = data.get("level") or 1
        self.cvars = data.get("cvars") or {}

    def __str__(self):
        return self.name

    def get_cvar(self, key, default=None):
        return self.cvars.get(key, default)

    def cvar(self, key, default=None):
        return self.get_cvar(key, default)

    def set_cvar(self, key, value):
        self.cvars[key] = value
        return value

    def cc_exists(self, _name):
        return False

    def cc_str(self, name):
        return "0/0"

    def get_cc(self, _name):
        return 0

    def get_cc_max(self, _name):
        return 0

preview_character_obj = PreviewCharacter(preview_character)

def character():
    return preview_character_obj

namespace = {
    "__builtins__": safe_builtins,
    "_arg": _arg,
    "_text": _text,
    "_int_or_text": _int_or_text,
    "ceil": ceil,
    "floor": floor,
    "character": character,
}

exec(source, namespace)
fn = namespace.get(function_name)
if fn is None:
    candidates = []
    for key, value in namespace.items():
        if not key.startswith("_") and callable(value):
            candidates.append(value)
    if len(candidates) == 1:
        fn = candidates[0]
if fn is None or not callable(fn):
    raise Exception("No matching callable template function was found.")

encounter = fn(args)
if not isinstance(encounter, dict):
    raise Exception("Template function did not return an encounter dict.")

json.dumps({"encounter": encounter}, default=str)
`;
