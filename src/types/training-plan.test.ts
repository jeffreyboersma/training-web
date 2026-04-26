import { describe, expect, it } from 'vitest';

import { trainingPlanPayloadSchema } from './training-plan';

describe('trainingPlanPayloadSchema', () => {
  it('accepts a backend payload compatible with the reference renderer shape', () => {
    const parsed = trainingPlanPayloadSchema.parse({
      plan: {
        title: 'Sample Athlete Sprint Plan',
        athlete: 'Sample Athlete',
        events: [
          {
            name: 'Sample Sprint Triathlon',
            date: '2026-08-16',
            sport: 'Triathlon',
            format: 'Sprint',
            priority: 'A',
          },
        ],
        startDate: '2026-04-13',
        endDate: '2026-08-16',
        totalWeeks: 18,
        weeklyVolumeRange: '5-8 hours',
      },
      actionItems: ['Book pool access'],
      zones: [
        {
          title: 'Run Pace Guide',
          columns: ['Zone', 'Pace'],
          rows: [['Z2', '5:50-6:15/km']],
        },
      ],
      phases: [
        {
          name: 'BASE',
          weeks: '1-4',
          startDate: '2026-04-13',
          endDate: '2026-05-10',
          focus: 'Consistency',
          weeklyHours: '5-6',
        },
      ],
      strengthApproach: 'Two sessions per week',
      weeklyPlans: [
        {
          week: 1,
          phase: 'BASE',
          recovery: false,
          startDate: '2026-04-13',
          totalHours: '5.0',
          focus: 'Start smoothly',
          days: [
            {
              date: '2026-04-13',
              sessions: [
                {
                  type: 'run',
                  sport: 'T',
                  label: 'Easy Run',
                  duration: '30 min',
                  intensity: 'Z2 / RPE 3',
                  summary: 'Easy 30 min run',
                  details: 'Warm-up\n\nMain set',
                  purpose: 'Build aerobic consistency',
                },
              ],
            },
            { date: '2026-04-14', sessions: [] },
            { date: '2026-04-15', sessions: [] },
            { date: '2026-04-16', sessions: [] },
            { date: '2026-04-17', sessions: [] },
            { date: '2026-04-18', sessions: [] },
            { date: '2026-04-19', sessions: [] },
          ],
          coachingNotes: 'Keep it easy.',
        },
      ],
      raceStrategy: [
        {
          title: 'Race Week Overview',
          content: 'Stay calm.',
        },
      ],
      legend: [
        {
          type: 'run',
          label: 'Run',
        },
      ],
    });

    expect(parsed.plan.athlete).toBe('Sample Athlete');
    expect(parsed.weeklyPlans).toHaveLength(1);
  });
});
