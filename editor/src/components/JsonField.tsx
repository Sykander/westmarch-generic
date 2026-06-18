import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CodeIde } from './CodeIde';

type JsonFieldProps = {
  label: string;
  value: unknown;
  onCommit: (value: unknown) => void;
  minRows?: number;
};

export function JsonField({ label, value, onCommit, minRows = 8 }: JsonFieldProps) {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value ?? {}, null, 2));
    setError(null);
  }, [value]);

  function commit(nextText: string) {
    setText(nextText);
    try {
      onCommit(JSON.parse(nextText));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }

  return (
    <>
      <CodeIde label={label} value={text} onChange={commit} language="json" minLines={minRows} />
      {error ? (
        <span className="field-error">
          <AlertTriangle size={14} aria-hidden="true" />
          {error}
        </span>
      ) : null}
    </>
  );
}
