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
          message="The app is loading the authenticated athlete payload from the backend."
          title="Fetching your assigned plan"
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
          title="Unable to load the backend plan"
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
          message="Once a plan version is assigned in the backend, it will appear here automatically."
          title="There is no active training plan yet"
        />
      </main>
    );
  }

  if (!anchorWeek) {
    return (
      <main className="page-shell">
        <StatePanel
          eyebrow="Plan unavailable"
          message="The backend returned a plan payload without any weekly schedule data."
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
          <p className="eyebrow">Authenticated athlete view</p>
          <h2>{data.plan.title}</h2>
          <p className="hero-summary">
            {data.plan.athlete} • {data.plan.startDate} to {data.plan.endDate}
          </p>

          <div className="hero-stat-grid">
            <article className="hero-stat panel-card">
              <p className="metric-label">Next event</p>
              <strong>{nextEvent?.name ?? 'No event configured'}</strong>
              <span className="muted-copy">
                {nextEvent ? `${nextEvent.date} • ${nextEvent.sport}` : 'Add PLAN.events in the backend payload.'}
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
            <strong>Live backend data</strong>
            <p>The athlete app is rendering the validated payload returned by `get-my-plan`.</p>
          </div>
          <button className="secondary-button" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
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
          <button className="secondary-button" type="button" onClick={refresh}>
            Refresh plan
          </button>
        </div>
      </section>

      {currentView === 'calendar' ? (
        <TrainingCalendar anchorWeekNumber={anchorWeek.week} onSelectSession={setSelection} weeklyPlans={data.weeklyPlans} />
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
