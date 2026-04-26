import { z } from 'zod';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const planEventSchema = z.object({
  name: z.string(),
  date: isoDateSchema,
  sport: z.string(),
  format: z.string(),
  priority: z.string(),
}).strict();

const zoneSchema = z.object({
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
}).strict();

const phaseSchema = z.object({
  name: z.string(),
  weeks: z.string(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  focus: z.string(),
  weeklyHours: z.string(),
}).strict();

const trainingSessionSchema = z.object({
  type: z.string(),
  sport: z.string().nullable(),
  label: z.string(),
  duration: z.string(),
  intensity: z.string(),
  summary: z.string(),
  details: z.string(),
  purpose: z.string(),
}).strict();

const trainingDaySchema = z.object({
  date: isoDateSchema,
  sessions: z.array(trainingSessionSchema),
}).strict();

const weeklyPlanSchema = z.object({
  week: z.number(),
  phase: z.string(),
  recovery: z.boolean(),
  startDate: isoDateSchema,
  totalHours: z.string(),
  focus: z.string(),
  days: z.array(trainingDaySchema).length(7),
  coachingNotes: z.string(),
}).strict();

const raceStrategySchema = z.object({
  title: z.string(),
  content: z.string(),
}).strict();

const legendSchema = z.object({
  type: z.string(),
  label: z.string(),
}).strict();

export const trainingPlanPayloadSchema = z.object({
  plan: z.object({
    title: z.string(),
    athlete: z.string(),
    events: z.array(planEventSchema),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    totalWeeks: z.number().nullable().optional(),
    weeklyVolumeRange: z.string(),
  }).strict(),
  actionItems: z.array(z.string()),
  zones: z.array(zoneSchema),
  phases: z.array(phaseSchema),
  strengthApproach: z.string().nullable(),
  weeklyPlans: z.array(weeklyPlanSchema),
  raceStrategy: z.array(raceStrategySchema),
  legend: z.array(legendSchema),
}).strict();

export type TrainingPlanPayload = z.infer<typeof trainingPlanPayloadSchema>;
