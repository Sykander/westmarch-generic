import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileCode2, X } from 'lucide-react';
import type { PlannedFeature } from '../app/types';

export function PlannedFeatureButton({ feature }: { feature: PlannedFeature }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="planned-card" onClick={() => setIsOpen(true)}>
        <span className="badge neutral">Planned</span>
        <strong>{feature.title}</strong>
        <span>{feature.detail}</span>
      </button>
      {isOpen ? <PlannedFeatureModal feature={feature} onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

function PlannedFeatureModal({
  feature,
  onClose,
}: {
  feature: PlannedFeature;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="modal-header">
          <div className="modal-heading">
            <span className="modal-icon" aria-hidden="true">
              <FileCode2 size={22} />
            </span>
            <div>
              <h2 id={titleId}>{feature.title} is planned</h2>
              <p id={descriptionId}>{feature.detail}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            className="icon-only"
            type="button"
            aria-label="Close planned feature notice"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">
          <ul className="planned-list">
            {feature.plannedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            For now, use the raw JSON/source fields or export the generated row and paste it
            manually.
          </p>
          <div className="modal-actions">
            <button className="primary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
