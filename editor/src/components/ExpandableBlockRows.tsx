import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export type ExpandableBlockRow = {
  id: string;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function ExpandableBlockRows({ rows }: { rows: ExpandableBlockRow[] }) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  function isOpen(row: ExpandableBlockRow, index: number) {
    return openRows[row.id] ?? row.defaultOpen ?? index === 0;
  }

  function toggle(row: ExpandableBlockRow, index: number) {
    setOpenRows((current) => ({ ...current, [row.id]: !isOpen(row, index) }));
  }

  return (
    <div className="builder-row-list">
      {rows.map((row, index) => {
        const open = isOpen(row, index);
        return (
          <article className="builder-row" key={row.id}>
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
