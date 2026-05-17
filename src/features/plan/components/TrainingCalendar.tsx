import { Fragment, useEffect, useMemo, useRef } from 'react';

import {
  formatFullDate,
  getSessionAccent,
  getTodayIso,
  getWeekDaysMondayToSunday,
  getWeekRangeLabel,
  type SessionSelection,
  type TrainingWeek,
} from '../lib/plan-derived';

type TrainingCalendarProps = {
  anchorWeekNumber: number;
  onSelectSession: (selection: SessionSelection) => void;
  weeklyPlans: TrainingWeek[];
};

type CalendarDayItem = {
  day: TrainingWeek['days'][number];
  isAnchorWeekStart: boolean;
  isPlanStart: boolean;
  isToday: boolean;
  isWeekStart: boolean;
  week: TrainingWeek;
};

const dividerDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  weekday: 'short',
});

function formatDividerDate(date: string) {
  return dividerDateFormatter.format(new Date(`${date}T00:00:00Z`)).replace(',', '').toUpperCase();
}

function getWeekTooltip(week: TrainingWeek) {
  const parts = [getWeekRangeLabel(week)];

  if (week.focus) {
    parts.push(week.focus);
  }

  if (week.coachingNotes) {
    parts.push(`Coach note: ${week.coachingNotes}`);
  }

  if (week.recovery) {
    parts.push('Recovery week');
  }

  return parts.join(' • ');
}

export function TrainingCalendar({ anchorWeekNumber, onSelectSession, weeklyPlans }: TrainingCalendarProps) {
  const todayIso = getTodayIso();
  const dayRefs = useRef<Record<string, HTMLElement | null>>({});
  const hasAutoScrolledRef = useRef(false);

  const calendarDays = useMemo<CalendarDayItem[]>(
    () =>
      weeklyPlans.flatMap((week) => {
        const weekDays = getWeekDaysMondayToSunday(week);

        return weekDays.map((day, index) => ({
          day,
          isAnchorWeekStart: index === 0 && week.week === anchorWeekNumber,
          isPlanStart: week.week === weeklyPlans[0]?.week && index === 0,
          isToday: day.date === todayIso,
          isWeekStart: index === 0,
          week,
        }));
      }),
    [anchorWeekNumber, todayIso, weeklyPlans],
  );

  const firstDay = calendarDays[0] ?? null;
  const todayEntry = calendarDays.find((entry) => entry.isToday) ?? null;
  const anchorEntry = calendarDays.find((entry) => entry.isAnchorWeekStart) ?? firstDay;
  const scrollTargetDate = todayEntry?.day.date ?? anchorEntry?.day.date ?? null;

  useEffect(() => {
    if (!scrollTargetDate || hasAutoScrolledRef.current) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = dayRefs.current[scrollTargetDate];

      if (!target) {
        return;
      }

      hasAutoScrolledRef.current = true;
      target.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollTargetDate]);

  return (
    <section className="panel-card calendar-shell" id="calendar-panel" role="tabpanel" aria-labelledby="view-tab-calendar">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Calendar</p>
          <h3>Full training calendar</h3>
          <p className="muted-copy">Move through the full block in one continuous timeline and open any session for details.</p>
        </div>

        <div className="calendar-summary-strip" aria-label="Calendar summary">
          {firstDay ? <span className="session-chip session-chip--muted">Plan starts {formatFullDate(firstDay.day.date)}</span> : null}
          {todayEntry ? <span className="session-chip timeline-flag timeline-flag--today">Today</span> : null}
        </div>
      </div>

      <div className="calendar-day-list">
        {calendarDays.map((entry) => (
          <Fragment key={entry.day.date}>
            {entry.isWeekStart ? (
              <div className={`calendar-week-marker${entry.isAnchorWeekStart ? ' calendar-week-marker--anchor' : ''}`}>
                <div className="calendar-week-marker-copy">
                  <p className="calendar-week-label">WEEK {entry.week.week} • {entry.week.phase}</p>
                  <span
                    aria-label={`Week ${entry.week.week} details: ${getWeekTooltip(entry.week)}`}
                    className="calendar-week-info"
                    data-tooltip={getWeekTooltip(entry.week)}
                    tabIndex={0}
                  >
                    i
                  </span>
                </div>

                <div className="calendar-header-meta">
                  <span className="week-stat">{entry.week.totalHours} hours</span>
                </div>
              </div>
            ) : null}

            <article
              aria-current={entry.isToday ? 'date' : undefined}
              className={`timeline-day${entry.isPlanStart ? ' timeline-day--start' : ''}${entry.isToday ? ' timeline-day--today' : ''}`}
              ref={(node) => {
                dayRefs.current[entry.day.date] = node;
              }}
            >
              <div className="timeline-day-divider">
                <div className="timeline-day-divider-copy">
                  <span className="timeline-day-date">{formatDividerDate(entry.day.date)}</span>

                  <div className="timeline-day-flags">
                    {entry.isPlanStart ? <span className="session-chip session-chip--muted">Plan starts</span> : null}
                    {entry.isToday ? <span className="session-chip timeline-flag timeline-flag--today">Today</span> : null}
                    <span className="timeline-session-count">{entry.day.sessions.length ? `${entry.day.sessions.length} planned` : 'Rest day'}</span>
                  </div>
                </div>

                <span aria-hidden="true" className="timeline-day-rule" />
              </div>

              {entry.day.sessions.length ? (
                <div className="calendar-session-stack">
                  {entry.day.sessions.map((session) => (
                    <button
                      key={`${entry.day.date}-${session.label}-${session.duration}`}
                      className="session-button"
                      type="button"
                      style={{ '--session-accent': getSessionAccent(session.type) } as React.CSSProperties}
                      onClick={() => onSelectSession({ day: entry.day, session, week: entry.week })}
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
                <p className="rest-note">No planned sessions.</p>
              )}
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
