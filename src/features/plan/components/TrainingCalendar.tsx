import { useEffect, useState } from 'react';

import { formatDayLabel, getSessionAccent, getWeekRangeLabel, type SessionSelection, type TrainingWeek } from '../lib/plan-derived';

type TrainingCalendarProps = {
  anchorWeekNumber: number;
  onSelectSession: (selection: SessionSelection) => void;
  weeklyPlans: TrainingWeek[];
};

export function TrainingCalendar({ anchorWeekNumber, onSelectSession, weeklyPlans }: TrainingCalendarProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => new Set([anchorWeekNumber]));

  useEffect(() => {
    setExpandedWeeks(new Set([anchorWeekNumber]));
  }, [anchorWeekNumber]);

  function toggleWeek(weekNumber: number) {
    setExpandedWeeks((currentWeeks) => {
      const nextWeeks = new Set(currentWeeks);

      if (nextWeeks.has(weekNumber)) {
        nextWeeks.delete(weekNumber);
      } else {
        nextWeeks.add(weekNumber);
      }

      return nextWeeks;
    });
  }

  return (
    <section className="panel-card calendar-shell" id="calendar-panel" role="tabpanel" aria-labelledby="view-tab-calendar">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Calendar</p>
          <h3>Full training calendar</h3>
          <p className="muted-copy">Scan the full block, expand the week you need, and open any session for details.</p>
        </div>
      </div>

      <div className="calendar-stack">
        {weeklyPlans.map((week) => {
          const isExpanded = expandedWeeks.has(week.week);

          return (
          <section
            className={`calendar-week${week.week === anchorWeekNumber ? ' calendar-week--anchor' : ''}${isExpanded ? '' : ' calendar-week--collapsed'}`}
            id={`week-${week.week}`}
            key={week.week}
          >
            <button
              aria-controls={`week-${week.week}-content`}
              aria-expanded={isExpanded}
              className="calendar-header calendar-week-toggle"
              type="button"
              onClick={() => toggleWeek(week.week)}
            >
              <div>
                <p className="eyebrow">Week {week.week}</p>
                <h4>
                  {week.phase} • {getWeekRangeLabel(week)}
                </h4>
                <p className="muted-copy">{week.focus}</p>
              </div>
              <div className="calendar-header-meta">
                <span className="week-stat">{week.totalHours} hours</span>
                {week.recovery ? <span className="week-stat week-stat--recovery">Recovery</span> : null}
                <span
                  aria-hidden="true"
                  className={`calendar-toggle-caret${isExpanded ? ' calendar-toggle-caret--expanded' : ''}`}
                />
              </div>
            </button>

            {isExpanded ? (
              <div className="calendar-week-content" id={`week-${week.week}-content`}>
                <div className="calendar-grid">
                  {week.days.map((day) => (
                    <article className="calendar-day" key={day.date}>
                      <div className="calendar-day-header">
                        <strong>{formatDayLabel(day.date)}</strong>
                        <span>{day.sessions.length ? `${day.sessions.length} planned` : 'Rest'}</span>
                      </div>

                      {day.sessions.length ? (
                        <div className="calendar-session-stack">
                          {day.sessions.map((session) => (
                            <button
                              key={`${day.date}-${session.label}-${session.duration}`}
                              className="session-button"
                              type="button"
                              style={{ '--session-accent': getSessionAccent(session.type) } as React.CSSProperties}
                              onClick={() => onSelectSession({ day, session, week })}
                            >
                              <span className="session-button-topline">
                                <strong>{session.label}</strong>
                              </span>
                              <span className="session-button-meta">
                                {session.duration}
                                {session.type ? ` • ${session.type.toUpperCase()}` : ''}
                                {session.sport ? ` • ${session.sport}` : ''}
                                {session.intensity ? ` • ${session.intensity}` : ''}
                              </span>
                              <span className="session-button-summary">{session.summary}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="rest-note">Recovery day</p>
                      )}
                    </article>
                  ))}
                </div>

                {week.coachingNotes ? (
                  <aside className="coach-note coach-note--calendar">
                    <p className="eyebrow">Coach note</p>
                    <p>{week.coachingNotes}</p>
                  </aside>
                ) : null}
              </div>
            ) : null}
          </section>
          );
        })}
      </div>
    </section>
  );
}
