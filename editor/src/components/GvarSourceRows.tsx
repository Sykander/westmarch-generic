import { ChevronDown, ChevronRight, Clipboard, Download, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { LoadedGvarSource } from '../lib/gvarSources';
import { makeGvarDashboardUrl } from '../lib/avrae';
import { CodeIde } from './CodeIde';

type GvarSourceRowsProps = {
  rows: LoadedGvarSource[];
  onChange?: (id: string, value: string) => void;
  onCopy?: (value: string, label: string) => void;
  onDownload?: (id: string, value: string) => void;
  readOnlyIds?: string[];
};

export function GvarSourceRows({
  rows,
  onChange,
  onCopy,
  onDownload,
  readOnlyIds = [],
}: GvarSourceRowsProps) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const readOnly = useMemo(() => new Set(readOnlyIds), [readOnlyIds]);

  function isOpen(id: string, index: number) {
    return openRows[id] ?? index === 0;
  }

  function toggle(id: string, index: number) {
    setOpenRows((current) => ({ ...current, [id]: !isOpen(id, index) }));
  }

  return (
    <div className="gvar-source-list">
      {rows.length === 0 ? (
        <p className="collection-empty">
          No gvar sources loaded yet. Load or paste a base config to inspect sources.
        </p>
      ) : null}
      {rows.map((row, index) => {
        const expanded = isOpen(row.id, index);
        const dashboardUrl = makeGvarDashboardUrl(row.id);

        return (
          <article
            className={`gvar-source-row${expanded ? ' open' : ''}`}
            key={`${row.id}:${row.path}`}
          >
            <header className="gvar-source-head">
              <button
                type="button"
                className="row-toggle"
                onClick={() => toggle(row.id, index)}
                aria-expanded={expanded}
              >
                {expanded ? (
                  <ChevronDown size={17} aria-hidden="true" />
                ) : (
                  <ChevronRight size={17} aria-hidden="true" />
                )}
                <span>{row.label}</span>
              </button>
              <span className="gvar-source-path">{row.path}</span>
              <span className={row.loaded && !row.error ? 'badge ok' : 'badge warn'}>
                {row.error ? 'Needs attention' : row.loaded ? row.kind : 'Not loaded'}
              </span>
              <div className="gvar-source-actions">
                {onCopy ? (
                  <button
                    type="button"
                    className="field-action-button"
                    onClick={() => onCopy(row.value, row.label)}
                    title="Copy source"
                    aria-label={`Copy ${row.label}`}
                  >
                    <Clipboard size={16} aria-hidden="true" />
                  </button>
                ) : null}
                {onDownload ? (
                  <button
                    type="button"
                    className="field-action-button"
                    onClick={() => onDownload(row.id, row.value)}
                    title="Download source"
                    aria-label={`Download ${row.label}`}
                  >
                    <Download size={16} aria-hidden="true" />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="field-action-button"
                  onClick={() => {
                    if (dashboardUrl) window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
                  }}
                  disabled={!dashboardUrl}
                  title="Open in Avrae dashboard"
                  aria-label={`Open ${row.label} in Avrae dashboard`}
                >
                  <ExternalLink size={16} aria-hidden="true" />
                </button>
              </div>
            </header>
            {expanded ? (
              <div className="gvar-source-body">
                {row.error ? <p className="field-note">{row.error}</p> : null}
                <CodeIde
                  label={`${row.label} source`}
                  value={row.value}
                  onChange={(value) => onChange?.(row.id, value)}
                  language={row.kind === 'json' ? 'json' : 'gvar'}
                  minLines={row.id === rows[0]?.id ? 18 : 10}
                  readOnly={readOnly.has(row.id) || !onChange}
                  help={
                    row.kind === 'json'
                      ? 'JSON gvars are edited as raw JSON with syntax diagnostics.'
                      : 'Gvar source uses Python-style highlighting with Drac2 import and builtin warnings.'
                  }
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
