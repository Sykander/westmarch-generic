import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';

type HelpDialogProps = {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function HelpDialog({ label, title, description, children }: HelpDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="help-trigger"
        aria-label={label}
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle size={15} aria-hidden="true" />
      </button>
      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="modal-backdrop"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setIsOpen(false);
              }}
            >
              <section
                className="modal help-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
              >
                <header className="modal-header">
                  <div className="modal-heading">
                    <span className="modal-icon" aria-hidden="true">
                      <HelpCircle size={22} />
                    </span>
                    <div>
                      <h2 id={titleId}>{title}</h2>
                      {description ? <p id={descriptionId}>{description}</p> : null}
                    </div>
                  </div>
                  <button
                    ref={closeRef}
                    className="icon-only"
                    type="button"
                    aria-label={`Close ${title} help`}
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </header>
                <div className="modal-body">{children}</div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
