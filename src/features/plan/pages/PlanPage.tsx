import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { StatePanel } from '../../../app/components/StatePanel';
import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { PlanOverview } from '../components/PlanOverview';
import { SessionDialog } from '../components/SessionDialog';
import { TrainingCalendar } from '../components/TrainingCalendar';
import { useTrainingPlan } from '../hooks/useTrainingPlan';
import { findAnchorWeek, findNextEvent, listUpcomingSessions, type SessionSelection } from '../lib/plan-derived';

export function PlanPage() {
  const { session, signOut } = useAuthSession();
  const { data, error, loading, refresh } = useTrainingPlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState<SessionSelection | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const currentView = searchParams.get('view') === 'calendar' ? 'calendar' : 'overview';
  const nextEvent = useMemo(() => (data ? findNextEvent(data.plan.events) : null), [data]);
  const anchorWeek = useMemo(() => (data ? findAnchorWeek(data.weeklyPlans) : null), [data]);
  const upcomingSessions = useMemo(() => (data ? listUpcomingSessions(data.weeklyPlans) : []), [data]);
  const userEmail = session?.user.email ?? '';
  const userInitial = userEmail.trim().charAt(0).toUpperCase() || data?.plan.athlete.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    if (!userMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (userMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setUserMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

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
      <section className="page-topbar">
        <div className="page-header-stack">
          <div className="page-brand">
            <span className="brand-mark brand-mark--compact" aria-hidden="true" />
            <div className="page-brand-copy">
              <p className="site-kicker">Personal training</p>
              <h1 className="page-app-title">Training App</h1>
            </div>
          </div>
        </div>

        <div className="user-menu" ref={userMenuRef}>
          <button
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-label={userEmail ? `Open user menu for ${userEmail}` : 'Open user menu'}
            className="user-menu-trigger"
            type="button"
            onClick={() => setUserMenuOpen((current) => !current)}
          >
            {userInitial}
          </button>

          {userMenuOpen ? (
            <div className="user-menu-panel" role="menu" aria-label="User menu">
              <p className="user-menu-email">{userEmail || data.plan.athlete}</p>
              <div className="user-menu-actions">
                <button
                  className="user-menu-action"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    refresh();
                  }}
                >
                  Refresh plan
                </button>
                <button
                  className="user-menu-action user-menu-action--danger"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    void signOut();
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>
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
            Calendar
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
