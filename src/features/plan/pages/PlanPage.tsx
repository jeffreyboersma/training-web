import { startTransition, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { StatePanel } from '../../../app/components/StatePanel';
import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { SESSION_EXPIRED_MESSAGE } from '../api/getMyPlan';
import { PlanOverview } from '../components/PlanOverview';
import { SessionDialog } from '../components/SessionDialog';
import { TrainingCalendar } from '../components/TrainingCalendar';
import { useTrainingPlan } from '../hooks/useTrainingPlan';
import { findAnchorWeek, findNextEvent, listUpcomingSessions, type SessionSelection } from '../lib/plan-derived';

const MOBILE_MENU_ANIMATION_MS = 260;

export function PlanPage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuthSession();
  const { data, error, loading, refresh } = useTrainingPlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState<SessionSelection | null>(null);
  const [mobileMenuState, setMobileMenuState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const desktopUserMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement | null>(null);
  const currentView = searchParams.get('view') === 'calendar' ? 'calendar' : 'overview';
  const nextEvent = useMemo(() => (data ? findNextEvent(data.plan.events) : null), [data]);
  const anchorWeek = useMemo(() => (data ? findAnchorWeek(data.weeklyPlans) : null), [data]);
  const upcomingSessions = useMemo(() => (data ? listUpcomingSessions(data.weeklyPlans) : []), [data]);
  const sessionExpired = error === SESSION_EXPIRED_MESSAGE;
  const userEmail = session?.user.email ?? '';
  const userInitial = userEmail.trim().charAt(0).toUpperCase() || data?.plan.athlete.trim().charAt(0).toUpperCase() || 'U';
  const mobileMenuVisible = mobileMenuState !== 'closed';
  const mobileMenuExpanded = mobileMenuState === 'opening' || mobileMenuState === 'open';
  const viewOptions = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'calendar' as const, label: 'Calendar' },
  ];

  useEffect(() => {
    if (!userMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (desktopUserMenuRef.current?.contains(target) || mobileUserMenuRef.current?.contains(target)) {
        return;
      }

      setUserMenuOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      closeMobileMenu();
      setUserMenuOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuVisible) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuVisible]);

  useEffect(() => {
    if (mobileMenuState === 'opening') {
      const frameId = window.requestAnimationFrame(() => {
        setMobileMenuState('open');
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    if (mobileMenuState !== 'closing') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMobileMenuState('closed');
    }, MOBILE_MENU_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mobileMenuState]);

  async function handleSignBackIn() {
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  }

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
            <>
              <button className="primary-button" type="button" onClick={refresh}>
                Try again
              </button>
              {sessionExpired ? (
                <button className="secondary-button" type="button" onClick={() => void handleSignBackIn()}>
                  Sign back in
                </button>
              ) : null}
            </>
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

  const athleteName = data.plan.athlete;

  function openMobileMenu() {
    setMobileMenuState((current) => {
      if (current === 'open' || current === 'opening') {
        return current;
      }

      return 'opening';
    });
  }

  function closeMobileMenu() {
    setMobileMenuState((current) => {
      if (current === 'closed' || current === 'closing') {
        return current;
      }

      return 'closing';
    });
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

    if (nextView === 'overview' && currentView !== 'overview') {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }

    closeMobileMenu();
  }

  function renderUserMenu(menuRef: RefObject<HTMLDivElement | null>) {
    return (
      <div className="user-menu" ref={menuRef}>
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
            <p className="user-menu-email">{userEmail || athleteName}</p>
            <div className="user-menu-actions">
              <button
                className="user-menu-action"
                role="menuitem"
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  closeMobileMenu();
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
                  closeMobileMenu();
                  void signOut();
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="page-shell plan-shell">
      <div className="floating-navbar" data-mobile-menu-open={mobileMenuExpanded ? 'true' : 'false'}>
        <section className="floating-navbar__bar" aria-label="Primary navigation">
          <div className="page-brand floating-navbar__brand">
            <span className="brand-mark brand-mark--compact" aria-hidden="true" />
            <div className="page-brand-copy">
              <h1 className="page-app-title">Tränare</h1>
              <p className="site-kicker">Personal training</p>
            </div>
          </div>

          <div className="floating-navbar__tabs" aria-label="Plan views">
            {viewOptions.map((viewOption) => (
              <button
                key={viewOption.key}
                aria-pressed={currentView === viewOption.key}
                className={`floating-nav-button${currentView === viewOption.key ? ' floating-nav-button--active' : ''}`}
                type="button"
                onClick={() => handleViewChange(viewOption.key)}
              >
                {viewOption.label}
              </button>
            ))}
          </div>

          <div className="floating-navbar__actions">
            <button
              aria-expanded={mobileMenuExpanded}
              aria-haspopup="dialog"
              aria-label="Open navigation menu"
              className="floating-navbar__menu-toggle"
              type="button"
              onClick={() => {
                openMobileMenu();
                setUserMenuOpen(false);
              }}
            >
              <span className="floating-navbar__menu-line" aria-hidden="true" />
              <span className="floating-navbar__menu-line" aria-hidden="true" />
              <span className="floating-navbar__menu-line" aria-hidden="true" />
            </button>

            <div className="floating-navbar__user-menu">{renderUserMenu(desktopUserMenuRef)}</div>
          </div>
        </section>

        {mobileMenuVisible ? (
          <section
            className="floating-navbar__mobile-menu"
            data-state={mobileMenuState}
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
          >
            <div className="floating-navbar__mobile-header">
              <div className="page-brand floating-navbar__brand">
                <span className="brand-mark brand-mark--compact" aria-hidden="true" />
                <div className="page-brand-copy">
                  <h1 className="page-app-title">Tränare</h1>
                  <p className="site-kicker">Personal training</p>
                </div>
              </div>

              <button
                aria-label="Close navigation menu"
                className="floating-navbar__close-toggle"
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setUserMenuOpen(false);
                }}
              >
                <span aria-hidden="true">X</span>
              </button>
            </div>

            <div className="floating-navbar__mobile-links" aria-label="Plan views">
              {viewOptions.map((viewOption) => (
                <button
                  key={viewOption.key}
                  aria-pressed={currentView === viewOption.key}
                  className={`floating-nav-button floating-nav-button--stacked${currentView === viewOption.key ? ' floating-nav-button--active' : ''}`}
                  type="button"
                  onClick={() => handleViewChange(viewOption.key)}
                >
                  {viewOption.label}
                </button>
              ))}
            </div>

            <div className="floating-navbar__mobile-footer">{renderUserMenu(mobileUserMenuRef)}</div>
          </section>
        ) : null}
      </div>

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
