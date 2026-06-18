import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export type ExpandableBlockRow = {
  id: string;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  htmlId?: string;
};

export function ExpandableBlockRows({
  rows,
  className,
  openRows,
  onOpenRowsChange,
}: {
  rows: ExpandableBlockRow[];
  className?: string;
  openRows?: Record<string, boolean>;
  onOpenRowsChange?: (rows: Record<string, boolean>) => void;
}) {
  const [localOpenRows, setLocalOpenRows] = useState<Record<string, boolean>>({});
  const activeOpenRows = openRows ?? localOpenRows;

  function setRows(nextRows: Record<string, boolean>) {
    if (onOpenRowsChange) onOpenRowsChange(nextRows);
    else setLocalOpenRows(nextRows);
  }

  function isOpen(row: ExpandableBlockRow, index: number) {
    return activeOpenRows[row.id] ?? row.defaultOpen ?? index === 0;
  }

  function toggle(row: ExpandableBlockRow, index: number) {
    setRows({ ...activeOpenRows, [row.id]: !isOpen(row, index) });
  }

  return (
    <div className={`builder-row-list${className ? ` ${className}` : ''}`}>
      {rows.map((row, index) => {
        const open = isOpen(row, index);
        return (
          <article className={`builder-row${open ? ' open' : ''}`} id={row.htmlId} key={row.id}>
            <header className="builder-row-head">
              <button
                type="button"
                className="row-toggle"
                onClick={() => toggle(row, index)}
                aria-expanded={open}
              >
                {open ? (
                  <ChevronDown size={17} aria-hidden="true" />
                ) : (
                  <ChevronRight size={17} aria-hidden="true" />
                )}
                <span>{row.title}</span>
              </button>
              <span className="builder-row-summary">{row.summary}</span>
            </header>
            {open ? <div className="builder-row-body">{row.children}</div> : null}
          </article>
        );
      })}
    </div>
  );
}
