import { z } from 'zod';

const planEventSchema = z.object({
  name: z.string(),
  date: z.string(),
  sport: z.string(),
  format: z.string(),
  priority: z.string(),
});

const zoneSchema = z.object({
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const phaseSchema = z.object({
  name: z.string(),
  weeks: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  focus: z.string(),
  weeklyHours: z.string(),
});

const trainingSessionSchema = z.object({
  type: z.string(),
  sport: z.string().nullable(),
  label: z.string(),
  duration: z.string(),
  intensity: z.string(),
  summary: z.string(),
  details: z.string(),
  purpose: z.string(),
});

const trainingDaySchema = z.object({
  date: z.string(),
  sessions: z.array(trainingSessionSchema),
});

const weeklyPlanSchema = z.object({
  week: z.number(),
  phase: z.string(),
  recovery: z.boolean(),
  startDate: z.string(),
  totalHours: z.string(),
  focus: z.string(),
  days: z.array(trainingDaySchema).length(7),
  coachingNotes: z.string().optional().default(''),
});

const raceStrategySchema = z.object({
  title: z.string(),
  content: z.string(),
});

const legendSchema = z.object({
  type: z.string(),
  label: z.string(),
});

export const trainingPlanPayloadSchema = z.object({
  plan: z.object({
    title: z.string(),
    athlete: z.string(),
    events: z.array(planEventSchema),
    startDate: z.string(),
    endDate: z.string(),
    totalWeeks: z.number().nullable().optional(),
    weeklyVolumeRange: z.string(),
  }),
  actionItems: z.array(z.string()),
  zones: z.array(zoneSchema),
  phases: z.array(phaseSchema),
  strengthApproach: z.string().nullable(),
  weeklyPlans: z.array(weeklyPlanSchema),
  raceStrategy: z.array(raceStrategySchema),
  legend: z.array(legendSchema),
});

export type TrainingPlanPayload = z.infer<typeof trainingPlanPayloadSchema>;
