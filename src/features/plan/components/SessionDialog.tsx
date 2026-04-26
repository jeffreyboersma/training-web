import { useEffect, useId, useRef } from 'react';

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
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div>
            <p className="eyebrow">Week {week.week} session</p>
            <h2 id={titleId}>{session.label}</h2>
            <p className="muted-copy" id={descriptionId}>
              {formatFullDate(day.date)} • {session.duration} • {session.type}
              {session.sport ? ` • ${session.sport}` : ''}
            </p>
          </div>
          <button ref={closeButtonRef} className="dialog-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="dialog-body">
          <div className="dialog-meta">
            <span className="session-chip" style={{ '--session-accent': getSessionAccent(session.type) } as React.CSSProperties}>
              {session.intensity}
            </span>
            <span className="session-chip session-chip--muted">{week.phase}</span>
            {week.recovery ? <span className="session-chip session-chip--muted">Recovery week</span> : null}
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
            <article className="dialog-panel">
              <h3>Coach note</h3>
              <RichTextContent content={week.coachingNotes} />
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}
