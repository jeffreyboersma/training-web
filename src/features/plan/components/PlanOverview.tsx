import type { TrainingPlanPayload } from '../../../types/training-plan';
import { RichTextContent } from './RichTextContent';
import {
  formatDayLabel,
  formatFullDate,
  getDaysUntil,
  getSessionAccent,
  getWeekDaysMondayToSunday,
  getWeekRangeLabel,
  getWeekSessionCount,
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

export function PlanOverview({ anchorWeek, data, nextEvent, onSelectSession, onShowCalendar, upcomingSessions }: PlanOverviewProps) {
  const daysUntilNextEvent = nextEvent ? getDaysUntil(nextEvent.date) : null;
  const anchorWeekDays = getWeekDaysMondayToSunday(anchorWeek);

  return (
    <div className="overview-grid" id="overview-panel" role="tabpanel" aria-labelledby="view-tab-overview">
      <div className="overview-primary stack-grid">
        <section className="panel-card anchor-week-card">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">This week</p>
              <h3>
                Week {anchorWeek.week} • {anchorWeek.phase}
              </h3>
              <p className="muted-copy">
                {getWeekRangeLabel(anchorWeek)} • {anchorWeek.totalHours} planned hours • {getWeekSessionCount(anchorWeek)} sessions
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={onShowCalendar}>
              Open full calendar
            </button>
          </div>

          <p className="feature-copy">{anchorWeek.focus}</p>

          <div className="anchor-week-grid">
            {anchorWeekDays.map((day) => (
              <article className="week-focus-day" key={day.date}>
                <div className="day-summary-header">
                  <strong>{formatDayLabel(day.date)}</strong>
                  <span>{day.sessions.length ? `${day.sessions.length} session${day.sessions.length === 1 ? '' : 's'}` : 'Recovery'}</span>
                </div>

                {day.sessions.length ? (
                  <div className="session-list">
                    {day.sessions.map((session) => (
                      <button
                        key={`${day.date}-${session.label}-${session.duration}`}
                        className="session-inline-card"
                        type="button"
                        style={{ '--session-accent': getSessionAccent(session.type) } as React.CSSProperties}
                        onClick={() => onSelectSession({ day, session, week: anchorWeek })}
                      >
                        <strong>{session.label}</strong>
                        <span className="session-button-meta">
                          {session.duration} • {session.intensity}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rest-note">Recovery day</p>
                )}
              </article>
            ))}
          </div>

          {anchorWeek.coachingNotes ? (
            <aside className="coach-note">
              <p className="eyebrow">Coach note</p>
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
                  <span className="session-inline-date">{formatFullDate(selection.day.date)}</span>
                  <strong>{selection.session.label}</strong>
                  <span className="session-button-meta">
                    {selection.session.duration} • {selection.session.intensity}
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
                  <span className="phase-badge">{phase.name}</span>
                  <h4>{phase.weeks}</h4>
                  <p className="muted-copy">
                    {phase.startDate} to {phase.endDate}
                  </p>
                  <p>{phase.focus}</p>
                  <strong>{phase.weeklyHours}</strong>
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
            <h3>Small wins this week</h3>
          </div>
          {data.actionItems.length ? (
            <ul className="text-list action-list">
              {data.actionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">No extra setup items are attached to this plan.</p>
          )}
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <p className="eyebrow">Guidance</p>
            <h3>Strength and race notes</h3>
          </div>
          {data.strengthApproach ? <RichTextContent content={data.strengthApproach} /> : null}
          <div className="stack-grid">
            {data.raceStrategy.map((entry) => (
              <article className="info-card" key={entry.title}>
                <strong>{entry.title}</strong>
                <RichTextContent content={entry.content} />
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
              </article>
            ))}
          </div>
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
      </aside>
    </div>
  );
}
