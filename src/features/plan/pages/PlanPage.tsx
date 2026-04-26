import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { useTrainingPlan } from '../hooks/useTrainingPlan';

export function PlanPage() {
  const { session, signOut } = useAuthSession();
  const { data, error, loading, refresh } = useTrainingPlan();

  if (loading) {
    return (
      <main className="page-shell">
        <section className="panel-card state-card">
          <p className="eyebrow">Loading plan</p>
          <h2>Fetching your assigned plan</h2>
          <p className="muted-copy">The app is loading the authenticated athlete payload from the backend.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell">
        <section className="panel-card state-card">
          <p className="eyebrow">Plan unavailable</p>
          <h2>Unable to load the backend plan</h2>
          <p className="muted-copy">{error}</p>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={refresh}>
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page-shell">
        <section className="panel-card state-card">
          <p className="eyebrow">No plan assigned</p>
          <h2>There is no active training plan yet</h2>
          <p className="muted-copy">Once a plan version is assigned in the backend, it will appear here automatically.</p>
        </section>
      </main>
    );
  }

  const nextEvent = data.plan.events.find((event) => event.date >= new Date().toISOString().slice(0, 10)) ?? data.plan.events[0];

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Authenticated athlete view</p>
          <h2>{data.plan.title}</h2>
          <p className="muted-copy">
            {data.plan.athlete} • {data.plan.startDate} to {data.plan.endDate}
          </p>
        </div>
        <div className="hero-actions">
          <div className="identity-chip">{session?.user.email ?? data.plan.athlete}</div>
          <button className="secondary-button" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </section>

      <section className="metric-grid">
        <article className="panel-card metric-card">
          <p className="metric-label">Next event</p>
          <h3>{nextEvent?.name ?? 'No upcoming event'}</h3>
          <p className="muted-copy">{nextEvent ? `${nextEvent.date} • ${nextEvent.sport}` : 'Assign PLAN.events in the backend payload.'}</p>
        </article>
        <article className="panel-card metric-card">
          <p className="metric-label">Weekly volume</p>
          <h3>{data.plan.weeklyVolumeRange || 'TBD'}</h3>
          <p className="muted-copy">Preserved from the reference plan shape.</p>
        </article>
        <article className="panel-card metric-card">
          <p className="metric-label">Plan length</p>
          <h3>{data.plan.totalWeeks ? `${data.plan.totalWeeks} weeks` : `${data.weeklyPlans.length} loaded`}</h3>
          <p className="muted-copy">The UI renders the backend payload directly after contract validation.</p>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Events</p>
            <h3>Target race calendar</h3>
          </div>
          <div className="stack-grid">
            {data.plan.events.map((event) => (
              <div className="info-card" key={`${event.name}-${event.date}`}>
                <strong>{event.name}</strong>
                <span>{event.date}</span>
                <span>
                  {event.sport} • {event.priority} priority
                </span>
                <p>{event.format}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Action items</p>
            <h3>Immediate operational tasks</h3>
          </div>
          {data.actionItems.length ? (
            <ul className="text-list">
              {data.actionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">No urgent setup tasks are attached to this plan version.</p>
          )}
        </article>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <p className="eyebrow">Phases</p>
          <h3>Periodization overview</h3>
        </div>
        <div className="phase-grid">
          {data.phases.map((phase) => (
            <article className="phase-card" key={`${phase.name}-${phase.startDate}`}>
              <span className="phase-badge">{phase.name}</span>
              <h4>{phase.weeks}</h4>
              <p>{phase.startDate} to {phase.endDate}</p>
              <p>{phase.focus}</p>
              <strong>{phase.weeklyHours}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <p className="eyebrow">Weekly plan</p>
          <h3>Detailed schedule</h3>
        </div>
        <div className="week-stack">
          {data.weeklyPlans.map((week) => (
            <details className="week-card" key={week.week} open={week.week === 1}>
              <summary>
                <div>
                  <strong>Week {week.week}</strong>
                  <span>{week.phase}</span>
                </div>
                <div>
                  <span>{week.startDate}</span>
                  <span>{week.totalHours} hours</span>
                </div>
              </summary>
              <p className="muted-copy">{week.focus}</p>
              <div className="day-stack">
                {week.days.map((day) => (
                  <article className="day-card" key={day.date}>
                    <div className="day-header">
                      <strong>{day.date}</strong>
                      <span>{day.sessions.length ? `${day.sessions.length} session(s)` : 'Rest day'}</span>
                    </div>
                    {day.sessions.length ? (
                      <div className="session-stack">
                        {day.sessions.map((session) => (
                          <article className="session-card" key={`${day.date}-${session.label}-${session.duration}`}>
                            <div className="session-header">
                              <strong>{session.label}</strong>
                              <span>{session.duration}</span>
                            </div>
                            <p className="session-meta">
                              {session.type}
                              {session.sport ? ` • ${session.sport}` : ''}
                              {session.intensity ? ` • ${session.intensity}` : ''}
                            </p>
                            <p className="muted-copy">{session.summary}</p>
                            <div className="rich-copy">{renderTextBlocks(session.details)}</div>
                            <p className="session-purpose">{session.purpose}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="muted-copy">Recovery day.</p>
                    )}
                  </article>
                ))}
              </div>
              {week.coachingNotes ? <div className="coach-note">{renderTextBlocks(week.coachingNotes)}</div> : null}
            </details>
          ))}
        </div>
      </section>

      <section className="two-column-grid">
        <article className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Reference</p>
            <h3>Training zones</h3>
          </div>
          <div className="stack-grid">
            {data.zones.map((zone) => (
              <div className="zone-card" key={zone.title}>
                <strong>{zone.title}</strong>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        {zone.columns.map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {zone.rows.map((row) => (
                        <tr key={row.join('-')}>
                          {row.map((value) => (
                            <td key={value}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Strategy</p>
            <h3>Strength and race notes</h3>
          </div>
          {data.strengthApproach ? <div className="rich-copy">{renderTextBlocks(data.strengthApproach)}</div> : null}
          <div className="stack-grid">
            {data.raceStrategy.map((entry) => (
              <div className="info-card" key={entry.title}>
                <strong>{entry.title}</strong>
                <div className="rich-copy">{renderTextBlocks(entry.content)}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function renderTextBlocks(content: string): ReactNode[] {
  return content.split('\n\n').map((block, blockIndex) => {
    const lines = block.split('\n').filter(Boolean);

    if (lines.every((line) => line.trimStart().startsWith('- '))) {
      return (
        <ul key={`block-${blockIndex}`} className="text-list compact-list">
          {lines.map((line, lineIndex) => (
            <li key={`line-${lineIndex}`}>{renderInline(line.replace(/^\s*-\s*/, ''))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`block-${blockIndex}`}>
        {lines.map((line, lineIndex) => (
          <Fragment key={`line-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderInline(line)}
          </Fragment>
        ))}
      </p>
    );
  });
}

function renderInline(line: string): ReactNode[] {
  return line.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}
