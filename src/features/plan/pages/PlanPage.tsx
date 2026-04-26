import { startTransition, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { StatePanel } from '../../../app/components/StatePanel';
import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { PlanOverview } from '../components/PlanOverview';
import { SessionDialog } from '../components/SessionDialog';
import { TrainingCalendar } from '../components/TrainingCalendar';
import { useTrainingPlan } from '../hooks/useTrainingPlan';
import { findAnchorWeek, findNextEvent, getDaysUntil, getWeekSessionCount, listUpcomingSessions, type SessionSelection } from '../lib/plan-derived';

export function PlanPage() {
  const { session, signOut } = useAuthSession();
  const { data, error, loading, refresh } = useTrainingPlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState<SessionSelection | null>(null);
  const currentView = searchParams.get('view') === 'calendar' ? 'calendar' : 'overview';
  const nextEvent = useMemo(() => (data ? findNextEvent(data.plan.events) : null), [data]);
  const anchorWeek = useMemo(() => (data ? findAnchorWeek(data.weeklyPlans) : null), [data]);
  const upcomingSessions = useMemo(() => (data ? listUpcomingSessions(data.weeklyPlans) : []), [data]);

  if (loading) {
    return (
      <main className="page-shell">
        <StatePanel
          eyebrow="Loading plan"
          message="Pulling your latest training schedule into view."
          title="Opening your plan"
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell">
        <StatePanel
          eyebrow="Plan unavailable"
          message={error}
          title="We couldn&apos;t load your plan"
          tone="error"
          actions={
            <button className="primary-button" type="button" onClick={refresh}>
              Try again
            </button>
          }
        />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page-shell">
        <StatePanel
          eyebrow="No plan assigned"
          message="Your next block has not been published yet. Check back soon."
          title="No active plan right now"
        />
      </main>
    );
  }

  if (!anchorWeek) {
    return (
      <main className="page-shell">
        <StatePanel
          eyebrow="Plan unavailable"
          message="This plan is missing weekly schedule details."
          title="The schedule is incomplete"
          tone="error"
        />
      </main>
    );
  }

  const daysUntilNextEvent = nextEvent ? getDaysUntil(nextEvent.date) : null;
  const sessionCount = getWeekSessionCount(anchorWeek);

  function handleViewChange(nextView: 'overview' | 'calendar') {
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams);

      if (nextView === 'overview') {
        nextParams.delete('view');
      } else {
        nextParams.set('view', nextView);
      }

      setSearchParams(nextParams, { replace: true });
    });
  }

  return (
    <main className="page-shell plan-shell">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <p className="eyebrow">Current plan</p>
          <h2>{data.plan.title}</h2>
          <p className="hero-summary">
            {data.plan.athlete} • {data.plan.startDate} to {data.plan.endDate}
          </p>

          <div className="hero-stat-grid">
            <article className="hero-stat panel-card">
              <p className="metric-label">Next event</p>
              <strong>{nextEvent?.name ?? 'No event configured'}</strong>
              <span className="muted-copy">
                {nextEvent ? `${nextEvent.date} • ${nextEvent.sport}` : 'Add an event to this plan to track your next target.'}
              </span>
            </article>

            <article className="hero-stat panel-card">
              <p className="metric-label">Current block</p>
              <strong>{anchorWeek.phase}</strong>
              <span className="muted-copy">Week {anchorWeek.week} • {anchorWeek.totalHours} planned hours</span>
            </article>

            <article className="hero-stat panel-card">
              <p className="metric-label">This week</p>
              <strong>{sessionCount} scheduled sessions</strong>
              <span className="muted-copy">{anchorWeek.recovery ? 'Recovery emphasis' : anchorWeek.focus}</span>
            </article>

            <article className="hero-stat panel-card">
              <p className="metric-label">Countdown</p>
              <strong>{daysUntilNextEvent == null ? 'TBD' : `${daysUntilNextEvent} days`}</strong>
              <span className="muted-copy">Until the next target event</span>
            </article>
          </div>
        </div>

        <aside className="hero-actions">
          <div className="identity-chip">{session?.user.email ?? data.plan.athlete}</div>
          <div className="hero-meta-card">
            <strong>Stay locked in</strong>
            <p>{anchorWeek.recovery ? 'This week is built to absorb the work.' : anchorWeek.focus}</p>
          </div>
          <div className="button-row button-row--stacked">
            <button className="secondary-button" type="button" onClick={refresh}>
              Refresh plan
            </button>
            <button className="ghost-button" type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </aside>
      </section>

      <section className="panel-card toolbar-card">
        <div className="toolbar-tabs" role="tablist" aria-label="Plan views">
          <button
            id="view-tab-overview"
            aria-controls="overview-panel"
            aria-selected={currentView === 'overview'}
            className={`view-tab${currentView === 'overview' ? ' view-tab--active' : ''}`}
            role="tab"
            type="button"
            onClick={() => handleViewChange('overview')}
          >
            Overview
          </button>
          <button
            id="view-tab-calendar"
            aria-controls="calendar-panel"
            aria-selected={currentView === 'calendar'}
            className={`view-tab${currentView === 'calendar' ? ' view-tab--active' : ''}`}
            role="tab"
            type="button"
            onClick={() => handleViewChange('calendar')}
          >
            Full calendar
          </button>
        </div>

        <div className="toolbar-actions">
          <button className="secondary-button" type="button" onClick={() => handleViewChange(currentView === 'overview' ? 'calendar' : 'overview')}>
            {currentView === 'overview' ? 'Jump to calendar' : 'Back to overview'}
          </button>
        </div>
      </section>

      {currentView === 'calendar' ? (
        <TrainingCalendar
          key={anchorWeek.week}
          anchorWeekNumber={anchorWeek.week}
          onSelectSession={setSelection}
          weeklyPlans={data.weeklyPlans}
        />
      ) : (
        <PlanOverview
          anchorWeek={anchorWeek}
          data={data}
          nextEvent={nextEvent}
          onSelectSession={setSelection}
          onShowCalendar={() => handleViewChange('calendar')}
          upcomingSessions={upcomingSessions}
        />
      )}

      <SessionDialog selection={selection} onClose={() => setSelection(null)} />
    </main>
  );
}
