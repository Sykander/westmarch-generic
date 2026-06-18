import { useEffect, useState } from 'react';
import type { CompactEncounterRow } from '../domain/encounters';
import { CollectionEditor } from './CollectionEditor';

const DEFAULT_COMPACT_ROW: CompactEncounterRow = [
  ['enc.gather'],
  'flavour',
  'Forest sign',
  'You notice a quiet detail in the wild.',
];

export function BiomeGvarEditor({
  rows,
  onRowsChange,
  title = 'Biome gvar rows',
  emptyText = 'No rows yet. Insert an encounter row or add a blank row to start a custom biome body.',
}: {
  rows: CompactEncounterRow[];
  onRowsChange: (rows: CompactEncounterRow[]) => void;
  title?: string;
  emptyText?: string;
}) {
  return (
    <div className="biome-gvar-editor">
      <CollectionEditor
        title={title}
        items={rows}
        emptyText={emptyText}
        addLabel="Add Blank Row"
        addItem={() => [...DEFAULT_COMPACT_ROW]}
        onChange={onRowsChange}
        getKey={(row, index) => `${index}:${String(row[1] ?? 'row')}`}
        renderSummary={(row) => compactRowSummary(row)}
        renderItem={({ item, updateItem }) => (
          <CompactRowJsonEditor row={item} onChange={updateItem} />
        )}
      />
      <label className="field span-2">
        <span>Generated biome gvar body</span>
        <textarea
          className="code-input"
          rows={Math.max(6, rows.length * 2 + 2)}
          readOnly
          value={JSON.stringify(rows, null, 2)}
        />
      </label>
    </div>
  );
}

export function compactRowSummary(row: CompactEncounterRow) {
  const poolTags = row[0];
  const poolText = Array.isArray(poolTags) ? poolTags.join(', ') : 'any pool';
  return `${String(row[1] ?? 'unknown')} · ${poolText}`;
}

export function CompactRowJsonEditor({
  row,
  onChange,
}: {
  row: CompactEncounterRow;
  onChange: (row: CompactEncounterRow) => void;
}) {
  const [draft, setDraft] = useState(() => JSON.stringify(row));
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(JSON.stringify(row));
    setError('');
  }, [row]);

  function commit() {
    try {
      const next = JSON.parse(draft);
      if (!Array.isArray(next) || next.length < 2) {
        setError('Rows must be JSON arrays with at least pool tags and a template id.');
        return;
      }
      setError('');
      onChange(next as CompactEncounterRow);
    } catch {
      setError('Row JSON is invalid.');
    }
  }

  return (
    <label className="field">
      <span>Row JSON</span>
      <textarea
        className={error ? 'code-input invalid' : 'code-input'}
        rows={3}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        spellCheck={false}
      />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}
