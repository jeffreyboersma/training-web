import type { TrainingPlanPayload } from '../../../types/training-plan';

export type TrainingWeek = TrainingPlanPayload['weeklyPlans'][number];
export type TrainingDay = TrainingWeek['days'][number];
export type TrainingSession = TrainingDay['sessions'][number];
export type PlanEvent = TrainingPlanPayload['plan']['events'][number];
export type SessionSelection = {
  day: TrainingDay;
  session: TrainingSession;
  week: TrainingWeek;
};

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  weekday: 'short',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  weekday: 'long',
  year: 'numeric',
});

const monthDayFormatter = new Intl.DateTimeFormat('en-CA', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export function getTodayIso(now = new Date()) {
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;
}

export function comparePlanDates(left: string, right: string) {
  return parsePlanDate(left).getTime() - parsePlanDate(right).getTime();
}

export function formatDayLabel(date: string) {
  return dayFormatter.format(parsePlanDate(date));
}

export function formatFullDate(date: string) {
  return fullDateFormatter.format(parsePlanDate(date));
}

export function formatMonthDay(date: string) {
  return monthDayFormatter.format(parsePlanDate(date));
}

export function findNextEvent(events: PlanEvent[], todayIso = getTodayIso()) {
  return events.find((event) => comparePlanDates(event.date, todayIso) >= 0) ?? events[0] ?? null;
}

export function findAnchorWeek(weeklyPlans: TrainingWeek[], todayIso = getTodayIso()) {
  return (
    weeklyPlans.find((week) => getWeekDaysMondayToSunday(week).some((day) => comparePlanDates(day.date, todayIso) >= 0)) ??
    weeklyPlans[0] ??
    null
  );
}

export function getWeekDaysMondayToSunday(week: TrainingWeek) {
  return [...week.days].sort((left, right) => comparePlanDates(left.date, right.date));
}

export function getWeekRangeLabel(week: TrainingWeek) {
  const orderedDays = getWeekDaysMondayToSunday(week);
  const firstDay = orderedDays[0];
  const lastDay = orderedDays[orderedDays.length - 1];

  if (!firstDay || !lastDay) {
    return week.startDate;
  }

  return `${formatMonthDay(firstDay.date)} - ${formatMonthDay(lastDay.date)}`;
}

export function getWeekSessionCount(week: TrainingWeek) {
  return getWeekDaysMondayToSunday(week).reduce((count, day) => count + day.sessions.length, 0);
}

export function listUpcomingSessions(weeklyPlans: TrainingWeek[], todayIso = getTodayIso(), limit = 6) {
  return weeklyPlans
    .flatMap((week) =>
      getWeekDaysMondayToSunday(week).flatMap((day) =>
        day.sessions.map((session) => ({
          day,
          session,
          week,
        })),
      ),
    )
    .filter(({ day }) => comparePlanDates(day.date, todayIso) > 0)
    .slice(0, limit);
}

export function getDaysUntil(date: string, todayIso = getTodayIso()) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((parsePlanDate(date).getTime() - parsePlanDate(todayIso).getTime()) / millisecondsPerDay);
}

export function getSessionAccent(sessionType: string) {
  switch (sessionType.toLowerCase()) {
    case 'bike':
      return 'var(--activity-bike)';
    case 'brick':
      return 'var(--activity-brick)';
    case 'hyrox':
      return 'var(--activity-hyrox)';
    case 'prerace':
    case 'race':
      return 'var(--activity-race)';
    case 'run':
      return 'var(--activity-run)';
    case 'strength':
      return 'var(--activity-strength)';
    case 'swim':
      return 'var(--activity-swim)';
    default:
      return 'var(--activity-default)';
  }
}

function parsePlanDate(date: string) {
  const parts = date.split('-').map(Number);

  if (parts.length !== 3) {
    throw new Error(`Invalid plan date: ${date}`);
  }

  const [year, month, day] = parts as [number, number, number];

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error(`Invalid plan date: ${date}`);
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}
