import { formatDayLabel, getSessionAccent, getWeekRangeLabel, type SessionSelection, type TrainingWeek } from '../lib/plan-derived';

type TrainingCalendarProps = {
  anchorWeekNumber: number;
  onSelectSession: (selection: SessionSelection) => void;
  weeklyPlans: TrainingWeek[];
};

export function TrainingCalendar({ anchorWeekNumber, onSelectSession, weeklyPlans }: TrainingCalendarProps) {
  return (
    <section className="panel-card calendar-shell" id="calendar-panel" role="tabpanel" aria-labelledby="view-tab-calendar">
      <div className="section-heading section-heading--split">
        <div>
          <p className="eyebrow">Calendar</p>
          <h3>Full training calendar</h3>
          <p className="muted-copy">Scan the full block, jump between weeks, and open any session for details.</p>
        </div>
        <nav className="calendar-nav" aria-label="Jump to week">
          {weeklyPlans.map((week) => (
            <a
              key={week.week}
              className={`week-link${week.week === anchorWeekNumber ? ' week-link--active' : ''}`}
              href={`#week-${week.week}`}
            >
              W{week.week}
            </a>
          ))}
        </nav>
      </div>

      <div className="calendar-stack">
        {weeklyPlans.map((week) => (
          <section className={`calendar-week${week.week === anchorWeekNumber ? ' calendar-week--anchor' : ''}`} id={`week-${week.week}`} key={week.week}>
            <header className="calendar-header">
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
              </div>
            </header>

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
                            <span>{session.duration}</span>
                          </span>
                          <span className="session-button-meta">
                            {session.type}
                            {session.sport ? ` • ${session.sport}` : ''}
                            {session.intensity ? ` • ${session.intensity}` : ''}
                          </span>
                          <span>{session.summary}</span>
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
          </section>
        ))}
      </div>
    </section>
  );
}
