import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Radio, UploadCloud, XCircle } from 'lucide-react';
import type { ConfigIssue } from '../lib/config';
import { SECTION_DESCRIPTIONS, SECTIONS, sectionFor, type Section } from '../app/sections';
import type { RunStep } from '../app/types';

function stateIcon(state: RunStep['state']) {
  if (state === 'success') return <CheckCircle2 size={16} aria-hidden="true" />;
  if (state === 'failed') return <XCircle size={16} aria-hidden="true" />;
  if (state === 'warning') return <AlertTriangle size={16} aria-hidden="true" />;
  if (state === 'running') return <Loader2 className="spin" size={16} aria-hidden="true" />;
  return <Radio size={16} aria-hidden="true" />;
}

export function severityIcon(severity: ConfigIssue['severity']) {
  if (severity === 'error') return <XCircle size={17} aria-hidden="true" />;
  if (severity === 'warning') return <AlertTriangle size={17} aria-hidden="true" />;
  return <CheckCircle2 size={17} aria-hidden="true" />;
}

export function SectionCta({
  section,
  setSection,
  canMovePastSetup,
  errorCount,
  canPublish,
  isBusy,
  publishToAvrae,
}: {
  section: Section;
  setSection: (section: Section) => void;
  canMovePastSetup: boolean;
  errorCount: number;
  canPublish: boolean;
  isBusy: boolean;
  publishToAvrae: () => void;
}) {
  const index = SECTIONS.findIndex((item) => item.id === section);
  const previous = index > 0 ? SECTIONS[index - 1] : null;
  const next = index >= 0 && index < SECTIONS.length - 1 ? SECTIONS[index + 1] : null;
  const nextDisabled = section === 'setup' && !canMovePastSetup;
  const nextReady = Boolean(next && !nextDisabled && (section !== 'check' || errorCount === 0));
  const publishDisabled = !canPublish || isBusy;
  const publishReady = section === 'export' && !publishDisabled;
  const ctaReady = nextReady || publishReady;
  const [showReadyAttention, setShowReadyAttention] = useState(false);
  const previousSectionRef = useRef(section);
  const previousReadyRef = useRef(ctaReady);
  const attentionTimeoutRef = useRef<number | null>(null);
  const heading = next
    ? `Next: ${next.label}`
    : canPublish
      ? 'Ready to publish'
      : 'Ready to export';
  const nextHint = next
    ? section === 'setup' && !canMovePastSetup
      ? 'Load, paste, or start a config before continuing.'
      : section === 'check' && errorCount > 0
        ? 'Review validation findings before exporting or publishing.'
        : SECTION_DESCRIPTIONS[next.id]
    : canPublish
      ? 'Publish the generated westmarch_config gvar back to Avrae.'
      : 'Copy, download, or add a gvar id and AVRAE_TOKEN to publish.';

  useEffect(() => {
    const sectionChanged = previousSectionRef.current !== section;
    const becameReady = !sectionChanged && !previousReadyRef.current && ctaReady;
    if (attentionTimeoutRef.current !== null) {
      window.clearTimeout(attentionTimeoutRef.current);
      attentionTimeoutRef.current = null;
    }
    if (becameReady) {
      setShowReadyAttention(true);
      attentionTimeoutRef.current = window.setTimeout(() => {
        setShowReadyAttention(false);
        attentionTimeoutRef.current = null;
      }, 1700);
    } else {
      setShowReadyAttention(false);
    }
    previousSectionRef.current = section;
    previousReadyRef.current = ctaReady;
  }, [ctaReady, section]);

  useEffect(() => {
    return () => {
      if (attentionTimeoutRef.current !== null) {
        window.clearTimeout(attentionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav
      className={['cta-bar', ctaReady ? 'ready' : '', showReadyAttention ? 'attention' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="Guided editor actions"
    >
      <div>
        <strong>{heading}</strong>
        <span>{nextHint}</span>
      </div>
      <div className="button-row">
        {previous ? (
          <button type="button" onClick={() => setSection(previous.id)}>
            Back
          </button>
        ) : null}
        {next ? (
          <button
            type="button"
            className="primary next-button"
            data-next-cta
            onClick={() => setSection(next.id)}
            disabled={nextDisabled}
          >
            Next
          </button>
        ) : section === 'export' ? (
          <button
            type="button"
            className="primary next-button"
            data-next-cta
            onClick={publishToAvrae}
            disabled={publishDisabled}
          >
            <UploadCloud size={16} aria-hidden="true" />
            Publish
          </button>
        ) : null}
      </div>
    </nav>
  );
}

export function IssueSummary({
  issues,
  setSection,
}: {
  issues: ConfigIssue[];
  setSection: (section: Section) => void;
}) {
  return (
    <section className="side-panel">
      <h2>Issues</h2>
      <div className="mini-issues">
        {issues.slice(0, 8).map((item) => (
          <button
            type="button"
            className={`mini-issue ${item.severity}`}
            key={`${item.code}:${item.path}`}
            onClick={() => setSection(sectionFor(item.section))}
          >
            {severityIcon(item.severity)}
            <span>{item.title}</span>
          </button>
        ))}
        {issues.length === 0 ? <span className="quiet">No issues yet</span> : null}
      </div>
    </section>
  );
}

export function RunSteps({ steps }: { steps: RunStep[] }) {
  if (steps.length === 0) return null;
  return (
    <section className="side-panel run-panel">
      <h2>Run</h2>
      {steps.map((step) => (
        <div className={`run-step ${step.state}`} key={step.label}>
          {stateIcon(step.state)}
          <div>
            <span>{step.label}</span>
            {step.detail ? <small>{step.detail}</small> : null}
          </div>
        </div>
      ))}
    </section>
  );
}
