import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ExternalLink, HelpCircle, KeyRound, ShieldCheck, X } from "lucide-react";

export function AvraeTokenHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            ref={triggerRef}
            className="help-trigger token-help-trigger"
            type="button"
            aria-haspopup="dialog"
            aria-label="How to get an Avrae token"
            onClick={() => setIsOpen(true)}
          >
            <HelpCircle size={15} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip" sideOffset={8}>
            Needed only for browser read/publish. It stays in this session and is
            never added to links or exports. Click for setup instructions.
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      {isOpen ? createPortal(
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            className="modal token-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <header className="modal-header">
              <div className="modal-heading">
                <span className="modal-icon" aria-hidden="true">
                  <KeyRound size={22} />
                </span>
                <div>
                  <h2 id={titleId}>Getting an AVRAE_TOKEN</h2>
                  <p id={descriptionId}>
                    The editor only needs this token when you want to read from or publish
                    to Avrae in this browser.
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                className="icon-only"
                type="button"
                aria-label="Close token guide"
                onClick={close}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="modal-body">
              <ol className="step-list">
                <li>
                  Open{" "}
                  <a href="https://avrae.io/" target="_blank" rel="noreferrer">
                    Avrae
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>{" "}
                  and sign in to the dashboard.
                </li>
                <li>Open your browser developer tools for that Avrae page.</li>
                <li>
                  Go to the storage view: Chrome and Edge call it Application;
                  Firefox calls it Storage.
                </li>
                <li>
                  Select Local Storage for <code>https://avrae.io</code>.
                </li>
                <li>
                  Copy the value beside the <code>avrae-token</code> key and paste it
                  into this field.
                </li>
              </ol>

              <div className="security-note">
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <strong>Keep it private.</strong>
                  <p>
                    This editor keeps the token in memory only. It is not added to share
                    links, exports, generated gvars, or downloaded files.
                  </p>
                </div>
              </div>

              <div className="link-row">
                <a href="https://avrae.io/" target="_blank" rel="noreferrer">
                  Avrae dashboard
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
                <a
                  href="https://developer.chrome.com/docs/devtools/storage/localstorage/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Local storage guide
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
