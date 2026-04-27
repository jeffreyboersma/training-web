import { type CSSProperties, useEffect, useId, useRef } from 'react';

import { RichTextContent } from './RichTextContent';
import { formatFullDate, getSessionAccent, type SessionSelection } from '../lib/plan-derived';

type SessionDialogProps = {
  onClose: () => void;
  selection: SessionSelection | null;
};

export function SessionDialog({ onClose, selection }: SessionDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!selection) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, selection]);

  if (!selection) {
    return null;
  }

  const { day, session, week } = selection;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="session-dialog"
        role="dialog"
        style={{ '--session-accent': getSessionAccent(session.type) } as CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div className="dialog-title-block">
            <p className="eyebrow">Week {week.week} session</p>
            <h2 id={titleId}>{session.label}</h2>
            <p className="muted-copy eyebrow" id={descriptionId}>
              {formatFullDate(day.date)} • {session.duration} • {session.type}
              {session.sport ? ` • ${session.sport}` : ''}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="Close session dialog"
            className="dialog-close"
            type="button"
            onClick={onClose}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 4L12 12" />
              <path d="M12 4L4 12" />
            </svg>
          </button>
        </div>

        <div className="dialog-body">
          <div className="dialog-meta">
            <span className="session-chip">
              {session.intensity}
            </span>
            <span className="session-chip">{week.phase}</span>
            {week.recovery ? <span className="session-chip--recovery">Recovery Week</span> : null}
          </div>

          <article className="dialog-panel">
            <h3>Summary</h3>
            <p>{session.summary}</p>
          </article>

          <article className="dialog-panel">
            <h3>Session details</h3>
            <RichTextContent content={session.details} />
          </article>

          <article className="dialog-panel">
            <h3>Purpose</h3>
            <p>{session.purpose}</p>
          </article>

          {week.coachingNotes ? (
            <aside className="coach-note">
              <p className="eyebrow">Week {week.week} Coach note</p>
              <RichTextContent content={week.coachingNotes} />
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}
