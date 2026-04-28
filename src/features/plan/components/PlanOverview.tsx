import type { TrainingPlanPayload } from '../../../types/training-plan';
import { RichTextContent } from './RichTextContent';
import {
  formatDayLabel,
  formatFullDate,
  getDaysUntil,
  getSessionAccent,
  getTodayIso,
  getWeekDaysMondayToSunday,
  type PlanEvent,
  type SessionSelection,
  type TrainingWeek,
} from '../lib/plan-derived';

type PlanOverviewProps = {
  anchorWeek: TrainingWeek;
  data: TrainingPlanPayload;
  nextEvent: PlanEvent | null;
  onSelectSession: (selection: SessionSelection) => void;
  onShowCalendar: () => void;
  upcomingSessions: SessionSelection[];
};

function formatPhaseWeeksLabel(weeks: string): string {
  const weekNumbers = weeks.split(/\D+/).filter(Boolean);
  const [startWeek, endWeek] = weekNumbers;

  if (!startWeek) {
    return `Week ${weeks}`;
  }

  if (!endWeek || startWeek === endWeek) {
    return `Week ${startWeek}`;
  }

  return `Weeks ${startWeek}-${endWeek}`;
}

export function PlanOverview({ anchorWeek, data, nextEvent, onSelectSession, upcomingSessions }: PlanOverviewProps) {
  const daysUntilNextEvent = nextEvent ? getDaysUntil(nextEvent.date) : null;
  const todayIso = getTodayIso();
  const todayWeek = data.weeklyPlans.find((week) => week.days.some((day) => day.date === todayIso)) ?? null;
  const todayDay = todayWeek ? getWeekDaysMondayToSunday(todayWeek).find((day) => day.date === todayIso) ?? null : null;

  return (
    <div className="overview-grid" id="overview-panel" role="tabpanel" aria-labelledby="view-tab-overview">
      <div className="overview-primary stack-grid">
        <section className="panel-card">
          <div className="section-heading section-heading--split">
            <div>
              {todayWeek ? (
                <p className="eyebrow">Today • Week {todayWeek.week}</p>
              ) : <p className="eyebrow">Today</p>}
              <h3>{formatFullDate(todayIso)}</h3>
            </div>
            {todayWeek ? (
              <div className="today-heading-meta">
                <span className="phase-badge">{todayWeek.phase}</span>
              </div>
            ) : null}
          </div>
          {todayWeek ? null : <p className="muted-copy">Outside the loaded plan range</p>}

          {todayDay?.sessions.length ? (
            <div className="session-list">
              {todayDay.sessions.map((session) => (
                <button
                  key={`${todayDay.date}-${session.label}-${session.duration}`}
                  className="session-inline-card"
                  type="button"
                  style={{ '--session-accent': getSessionAccent(session.type) } as React.CSSProperties}
                  onClick={() => onSelectSession({ day: todayDay, session, week: todayWeek ?? anchorWeek })}
                >
                  <strong>{session.label}</strong>
                  <span className="session-button-meta">
                    {session.duration} • {session.intensity}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rest-note">No planned sessions today.</p>
          )}
          {anchorWeek.focus ? (
            <aside className="focus-note">
              <p className="eyebrow">Week {anchorWeek.week} Focus</p>
              <RichTextContent content={anchorWeek.focus} />
            </aside>
          ) : null}
          {anchorWeek.coachingNotes ? (
            <aside className="coach-note">
              <p className="eyebrow">Week {anchorWeek.week} Coach note</p>
              <RichTextContent content={anchorWeek.coachingNotes} />
            </aside>
          ) : null}
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Upcoming sessions</p>
            <h3>Next up</h3>
          </div>
          {upcomingSessions.length ? (
            <div className="session-list">
              {upcomingSessions.map((selection) => (
                <button
                  key={`${selection.day.date}-${selection.session.label}-${selection.session.duration}`}
                  className="session-inline-card"
                  type="button"
                  style={{ '--session-accent': getSessionAccent(selection.session.type) } as React.CSSProperties}
                  onClick={() => onSelectSession(selection)}
                >
                  <strong>{selection.session.label}</strong>
                  <span className="session-button-meta">
                    {formatDayLabel(selection.day.date)} • {selection.session.duration}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted-copy">There are no upcoming sessions in the loaded plan range.</p>
          )}
        </section>
        
        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Key</p>
            <h3>Session types</h3>
          </div>
          <div className="legend-list">
            {data.legend.map((entry) => (
              <span key={`${entry.type}-${entry.label}`} className="legend-chip" style={{ '--session-accent': getSessionAccent(entry.type) } as React.CSSProperties}>
                {entry.label}
              </span>
            ))}
          </div>
        </section>
        
        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Targets</p>
            <h3>Events and phase progression</h3>
          </div>

          <div className="stack-grid">
            <div className="event-grid">
              {data.plan.events.map((event) => (
                <article className="info-card event-card" key={`${event.name}-${event.date}`}>
                  <div className="event-card-header">
                    <strong>{event.name}</strong>
                    <span className="event-priority">{event.priority}</span>
                  </div>
                  <p className="muted-copy">
                    {formatFullDate(event.date)} • {event.sport}
                  </p>
                  <p>{event.format}</p>
                  {nextEvent?.name === event.name ? (
                    <p className="event-countdown">
                      {daysUntilNextEvent === 0 ? 'Race day is here.' : `${daysUntilNextEvent} days until this event.`}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="phase-track">
              {data.phases.map((phase) => (
                <article className="phase-card" key={`${phase.name}-${phase.startDate}`}>
                  <div className="phase-card-header">
                    <div className="eyebrow">{formatPhaseWeeksLabel(phase.weeks)}</div>
                    <span className="phase-badge">{phase.name}</span>
                  </div>
                  <p className="muted-copy">
                    {phase.startDate} to {phase.endDate}
                  </p>
                  <p>{phase.focus}</p>
                  <div className="eyebrow phase-hours">{phase.weeklyHours} hours per week</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <aside className="overview-rail stack-grid">
        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">On deck</p>
            <h4>Small wins this week</h4>
          </div>
          <div className="content">
            {data.actionItems.length ? (
              <ul className="text-list action-list">
                {data.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted-copy">No extra setup items are attached to this plan.</p>
            )}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Guidance</p>
            <h3>Strength and race notes</h3>
          </div>
          <div className="stack-grid content">
            {data.strengthApproach ? <RichTextContent content={data.strengthApproach} /> : null}
            {data.raceStrategy.map((entry) => (
              <article className="info-card" key={entry.title}>
                <strong>{entry.title}</strong>
                <div className="muted-copy">
                  <RichTextContent content={entry.content} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Reference</p>
            <h3>Training zones</h3>
          </div>
          <div className="stack-grid">
            {data.zones.map((zone) => (
              <article className="zone-card" key={zone.title}>
                <strong>{zone.title}</strong>
                <div className="table-scroll content">
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
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
