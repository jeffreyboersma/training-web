import { describe, expect, it } from 'vitest';

import type { TrainingWeek } from './plan-derived';
import {
  findAnchorWeek,
  findNextEvent,
  getDaysUntil,
  getTodayIso,
  getWeekDaysMondayToSunday,
  getWeekRangeLabel,
  getWeekSessionCount,
  listUpcomingSessions,
} from './plan-derived';

const weeklyPlans: TrainingWeek[] = [
  {
    coachingNotes: 'Ease in.',
    days: [
      { date: '2026-04-13', sessions: [{ details: 'Warm-up', duration: '30 min', intensity: 'Z2', label: 'Easy Run', purpose: 'Consistency', sport: 'T', summary: 'Run easy', type: 'run' }] },
      { date: '2026-04-14', sessions: [] },
      { date: '2026-04-15', sessions: [] },
      { date: '2026-04-16', sessions: [] },
      { date: '2026-04-17', sessions: [] },
      { date: '2026-04-18', sessions: [] },
      { date: '2026-04-19', sessions: [] },
    ],
    focus: 'Base week',
    phase: 'BASE',
    recovery: false,
    startDate: '2026-04-13',
    totalHours: '5.0',
    week: 1,
  },
  {
    coachingNotes: 'Stay smooth.',
    days: [
      { date: '2026-04-20', sessions: [{ details: 'Longer ride', duration: '60 min', intensity: 'Z2', label: 'Aerobic Bike', purpose: 'Build endurance', sport: 'T', summary: 'Bike steady', type: 'bike' }] },
      { date: '2026-04-21', sessions: [] },
      { date: '2026-04-22', sessions: [] },
      { date: '2026-04-23', sessions: [] },
      { date: '2026-04-24', sessions: [] },
      { date: '2026-04-25', sessions: [] },
      { date: '2026-04-26', sessions: [] },
    ],
    focus: 'Build week',
    phase: 'BUILD',
    recovery: false,
    startDate: '2026-04-20',
    totalHours: '6.0',
    week: 2,
  },
];

describe('plan-derived helpers', () => {
  it('finds the next upcoming event relative to a plan date', () => {
    const nextEvent = findNextEvent(
      [
        { date: '2026-08-16', format: 'Sprint', name: 'Triathlon', priority: 'A', sport: 'Triathlon' },
        { date: '2026-10-04', format: 'Open Men', name: 'HYROX', priority: 'A', sport: 'HYROX' },
      ],
      '2026-08-20',
    );

    expect(nextEvent?.name).toBe('HYROX');
  });

  it('anchors the athlete view to the first week that has not passed', () => {
    const anchorWeek = findAnchorWeek(weeklyPlans, '2026-04-20');

    expect(anchorWeek?.week).toBe(2);
  });

  it('lists upcoming sessions and counts session totals', () => {
    const upcoming = listUpcomingSessions(weeklyPlans, '2026-04-19', 4);

    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.session.label).toBe('Aerobic Bike');
    expect(getWeekSessionCount(weeklyPlans[0]!)).toBe(1);
  });

  it('excludes current-day sessions from the upcoming list', () => {
    const todaySessionWeek: TrainingWeek[] = [
      {
        ...weeklyPlans[1]!,
        days: [
          {
            date: '2026-04-20',
            sessions: [
              { details: 'Steady ride', duration: '60 min', intensity: 'Z2', label: 'Today Ride', purpose: 'Aerobic work', sport: 'T', summary: 'Ride steady', type: 'bike' },
            ],
          },
          {
            date: '2026-04-21',
            sessions: [
              { details: 'Easy jog', duration: '30 min', intensity: 'Z2', label: 'Tomorrow Run', purpose: 'Consistency', sport: 'T', summary: 'Run easy', type: 'run' },
            ],
          },
          { date: '2026-04-22', sessions: [] },
          { date: '2026-04-23', sessions: [] },
          { date: '2026-04-24', sessions: [] },
          { date: '2026-04-25', sessions: [] },
          { date: '2026-04-26', sessions: [] },
        ],
      },
    ];

    const upcoming = listUpcomingSessions(todaySessionWeek, '2026-04-20', 4);

    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.session.label).toBe('Tomorrow Run');
  });

  it('computes day deltas for athlete countdowns', () => {
    expect(getDaysUntil('2026-08-16', '2026-08-10')).toBe(6);
  });

  it('uses the local calendar day when deriving today', () => {
    expect(getTodayIso(new Date(2026, 3, 26, 23, 30))).toBe('2026-04-26');
  });

  it('normalizes week days into Monday through Sunday order', () => {
    const shuffledWeek: TrainingWeek = {
      ...weeklyPlans[0]!,
      days: [
        weeklyPlans[0]!.days[6]!,
        weeklyPlans[0]!.days[2]!,
        weeklyPlans[0]!.days[0]!,
        weeklyPlans[0]!.days[4]!,
        weeklyPlans[0]!.days[1]!,
        weeklyPlans[0]!.days[5]!,
        weeklyPlans[0]!.days[3]!,
      ],
    };

    expect(getWeekDaysMondayToSunday(shuffledWeek).map((day) => day.date)).toEqual([
      '2026-04-13',
      '2026-04-14',
      '2026-04-15',
      '2026-04-16',
      '2026-04-17',
      '2026-04-18',
      '2026-04-19',
    ]);
    expect(getWeekRangeLabel(shuffledWeek)).toBe('Apr 13 - Apr 19');
  });
});
