import { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type Monaco, type OnMount, type OnValidate } from '@monaco-editor/react';
import { AlertTriangle } from 'lucide-react';
import { HelpTip } from './HelpTip';

type MonacoEditor = Parameters<OnMount>[0];

export type CodeIdeLanguage = 'json' | 'gvar';

export type CodeDiagnostic = {
  message: string;
  severity: 'error' | 'warning';
};

type CodeIdeProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  language: CodeIdeLanguage;
  minLines?: number;
  readOnly?: boolean;
  help?: string;
};

export function CodeIde({
  label,
  value,
  onChange,
  language,
  minLines = 8,
  readOnly = false,
  help,
}: CodeIdeProps) {
  const [diagnostics, setDiagnostics] = useState<CodeDiagnostic[]>([]);
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const monacoLanguage = language === 'json' ? 'json' : 'python';
  const height = useMemo(() => {
    const lineCount = Math.max(minLines, value.split('\n').length + 1);
    return Math.min(620, Math.max(180, lineCount * 20 + 22));
  }, [minLines, value]);

  useEffect(() => {
    if (language === 'gvar') refreshDrac2Markers(value, editorRef.current, monacoRef.current);
  }, [language, value]);

  const validateJson: OnValidate = (markers) => {
    if (language !== 'json') return;
    setDiagnostics(
      markers.map((marker) => ({
        message: marker.message,
        severity: marker.severity >= 8 ? 'error' : 'warning',
      })),
    );
  };

  function handleMount(editor: MonacoEditor, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (language === 'gvar') refreshDrac2Markers(value, editor, monaco);
  }

  function handleChange(nextValue: string | undefined) {
    const text = nextValue ?? '';
    onChange(text);
    if (language === 'gvar') refreshDrac2Markers(text, editorRef.current, monacoRef.current);
  }

  function refreshDrac2Markers(text: string, editor: MonacoEditor | null, monaco: Monaco | null) {
    const model = editor?.getModel();
    if (!model || !monaco) {
      setDiagnostics(getDrac2Diagnostics(text));
      return;
    }

    const markers = drac2Markers(text, monaco);
    monaco.editor.setModelMarkers(model, 'westmarch-drac2', markers);
    setDiagnostics(
      markers.map((marker) => ({
        message: marker.message,
        severity: marker.severity === monaco.MarkerSeverity.Error ? 'error' : 'warning',
      })),
    );
  }

  return (
    <div className="field span-2 code-ide-field">
      <span>
        {label}
        {help ? <HelpTip label={`${label} help`}>{help}</HelpTip> : null}
      </span>
      {typeof window === 'undefined' ? (
        <textarea
          className="code-input"
          rows={minLines}
          readOnly={readOnly}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
        />
      ) : (
        <div
          className={
            diagnostics.some((item) => item.severity === 'error') ? 'code-ide invalid' : 'code-ide'
          }
        >
          <Editor
            height={height}
            value={value}
            language={monacoLanguage}
            theme="westmarch-light"
            beforeMount={configureMonaco}
            onMount={handleMount}
            onChange={handleChange}
            onValidate={validateJson}
            options={{
              minimap: { enabled: false },
              readOnly,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              lineNumbersMinChars: 3,
              folding: true,
              glyphMargin: false,
              renderLineHighlight: 'line',
              overviewRulerBorder: false,
              automaticLayout: true,
              fontSize: 13,
              fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
            }}
          />
        </div>
      )}
      {diagnostics.length ? (
        <span className="field-error code-diagnostics">
          <AlertTriangle size={14} aria-hidden="true" />
          {diagnostics[0].message}
          {diagnostics.length > 1 ? ` (+${diagnostics.length - 1} more)` : ''}
        </span>
      ) : null}
    </div>
  );
}

function configureMonaco(monaco: Monaco) {
  monaco.editor.defineTheme('westmarch-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#fbfcfb',
      'editor.lineHighlightBackground': '#eef3f0',
      'editorGutter.background': '#fbfcfb',
    },
  });

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    trailingCommas: 'error',
  });
}

export function getDrac2Diagnostics(text: string): CodeDiagnostic[] {
  return drac2RuleHits(text).map((hit) => ({
    message: hit.message,
    severity: hit.severity,
  }));
}

function drac2Markers(text: string, monaco: Monaco) {
  return drac2RuleHits(text).map((hit) => ({
    startLineNumber: hit.line,
    endLineNumber: hit.line,
    startColumn: hit.column,
    endColumn: hit.endColumn,
    message: hit.message,
    severity:
      hit.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
  }));
}

function drac2RuleHits(text: string) {
  const hits: Array<CodeDiagnostic & { line: number; column: number; endColumn: number }> = [];
  const rules = [
    {
      re: /^\s*(?:import|from)\s+/,
      severity: 'error' as const,
      message:
        'Imports are not valid in owner config/content gvars. Reference related gvars through explicit config fields.',
    },
    {
      re: /^\s*using\s*\(/,
      severity: 'warning' as const,
      message:
        'using(...) imports executable modules. Prefer explicit gvar id fields so the editor can load and publish related gvars.',
    },
    {
      re: /\b__import__\s*\(/,
      severity: 'error' as const,
      message: '__import__ is not allowed in Drac2 owner content.',
    },
    {
      re: /\b(?:eval|exec|open)\s*\(/,
      severity: 'error' as const,
      message: 'This Python builtin is not part of the safe Drac2 authoring subset.',
    },
    {
      re: /\btype\s*\(/,
      severity: 'warning' as const,
      message:
        'type(...) is not available in many Drac2 builds. Prefer shape checks or helpers used by existing gvars.',
    },
  ];

  text.split('\n').forEach((line, index) => {
    for (const rule of rules) {
      const match = rule.re.exec(line);
      if (!match) continue;
      const column = (match.index ?? 0) + 1;
      hits.push({
        line: index + 1,
        column,
        endColumn: Math.max(column + match[0].length, column + 1),
        message: rule.message,
        severity: rule.severity,
      });
    }
  });

  return hits;
}
