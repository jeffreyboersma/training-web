import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import {
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
  isWeekPast: boolean;
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
  const parts = [getWeekRangeLabel(week), `${week.totalHours} hours`];

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
  const [todayButtonTop, setTodayButtonTop] = useState<number | null>(null);
  const [showGoToToday, setShowGoToToday] = useState(false);

  const calendarDays = useMemo<CalendarDayItem[]>(
    () =>
      weeklyPlans.flatMap((week) => {
        const weekDays = getWeekDaysMondayToSunday(week);

        const weekEndDate = weekDays[weekDays.length - 1]?.date ?? weekDays[0]?.date;

        return weekDays.map((day, index) => ({
          day,
          isAnchorWeekStart: index === 0 && week.week === anchorWeekNumber,
          isPlanStart: week.week === weeklyPlans[0]?.week && index === 0,
          isToday: day.date === todayIso,
          isWeekPast: weekEndDate !== undefined && weekEndDate < todayIso,
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

  function getNavbarBottomOffset() {
    const navbar = document.querySelector<HTMLElement>('.floating-navbar');
    if (!navbar) return 0;
    if (navbar.dataset.hidden === 'true') return 0;
    const stickyTop = parseFloat(getComputedStyle(navbar).top) || 0;
    return stickyTop + navbar.offsetHeight;
  }

  function scrollToCalendarDate(targetDate: string, behavior: ScrollBehavior) {
    const target = dayRefs.current[targetDate];

    if (!target) {
      return;
    }

    const navbarBottom = getNavbarBottomOffset();
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const scrollTop = Math.max(0, targetTop - navbarBottom - 12);

    window.scrollTo({ top: scrollTop, behavior });
  }

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
      scrollToCalendarDate(scrollTargetDate, 'auto');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollTargetDate]);

  useEffect(() => {
    if (!todayEntry) {
      setShowGoToToday(false);
      setTodayButtonTop(null);
      return undefined;
    }

    const todayDate = todayEntry.day.date;

    let frameId: number | null = null;

    function updateTodayButtonState() {
      frameId = null;

      const target = dayRefs.current[todayDate];

      if (!target) {
        setShowGoToToday(false);
        return;
      }

      const navbarBottom = getNavbarBottomOffset();
      const targetTop = target.getBoundingClientRect().top;
      const minimumVisibleTop = navbarBottom + 8;
      const maximumVisibleTop = window.innerHeight - 32;
      const isVisible = targetTop >= minimumVisibleTop && targetTop <= maximumVisibleTop;

      setTodayButtonTop(Math.round(navbarBottom + 10));
      setShowGoToToday(!isVisible);
    }

    function scheduleTodayButtonUpdate() {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateTodayButtonState);
    }

    const navbar = document.querySelector<HTMLElement>('.floating-navbar');
    const navbarObserver = navbar ? new MutationObserver(updateTodayButtonState) : null;
    if (navbar) navbarObserver?.observe(navbar, { attributes: true, attributeFilter: ['data-hidden'] });

    updateTodayButtonState();
    window.addEventListener('scroll', scheduleTodayButtonUpdate, { passive: true });
    window.addEventListener('resize', scheduleTodayButtonUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      navbarObserver?.disconnect();
      window.removeEventListener('scroll', scheduleTodayButtonUpdate);
      window.removeEventListener('resize', scheduleTodayButtonUpdate);
    };
  }, [todayEntry]);

  return (
    <section className="panel-card calendar-shell" id="calendar-panel" role="tabpanel" aria-labelledby="view-tab-calendar">
      {todayEntry ? (
        <button
          aria-hidden={!showGoToToday || todayButtonTop === null}
          className={`calendar-today-jump${showGoToToday && todayButtonTop !== null ? ' calendar-today-jump--visible' : ''}`}
          tabIndex={showGoToToday && todayButtonTop !== null ? 0 : -1}
          type="button"
          style={{ top: `${todayButtonTop ?? 0}px` }}
          onClick={() => scrollToCalendarDate(todayEntry.day.date, 'smooth')}
        >
          GO TO TODAY
        </button>
      ) : null}

      <div className="section-heading">
        <div>
          <p className="eyebrow">Calendar</p>
          <h3>Full training calendar</h3>
          
          <p className="muted-copy">Move through the full block in one continuous timeline and open any session for details.</p>
        </div>

        
      </div>

      <div className="calendar-day-list">
        {calendarDays.map((entry) => (
          <Fragment key={entry.day.date}>
            {entry.isWeekStart ? (
              <div className={`calendar-week-marker${entry.isAnchorWeekStart ? ' calendar-week-marker--anchor' : ''}${entry.isWeekPast ? ' calendar-week-marker--past' : ''}`}>
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

                <span aria-hidden="true" className="calendar-week-marker-rule" />
                {entry.week.recovery ? <span className="session-chip--recovery">RECOVERY</span> : null}
              </div>
            ) : null}

            <article
              aria-current={entry.isToday ? 'date' : undefined}
              className={`timeline-day${entry.isPlanStart ? ' timeline-day--start' : ''}${entry.isToday ? ' timeline-day--today' : ''}${!entry.isToday && entry.day.date < todayIso ? ' timeline-day--past' : ''}`}
              ref={(node) => {
                dayRefs.current[entry.day.date] = node;
              }}
            >
              <div className="timeline-day-divider">
                <div className="timeline-day-divider-copy">
                  <span className="timeline-day-date">{formatDividerDate(entry.day.date)}</span>
                </div>

                <span aria-hidden="true" className="timeline-day-rule" />
                {entry.isPlanStart ? <span className="session-chip session-chip--muted">Plan starts</span> : null}
                {entry.isToday ? <span className="session-chip timeline-flag timeline-flag--today">TODAY</span> : null}
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
                <p className="rest-note calendar-rest-state">No planned sessions.</p>
              )}
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
