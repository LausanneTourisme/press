import type { Event, Period, PostType, ScheduleDate, SelectedDates, Translatable } from '$types';
import { DateTime } from 'luxon';

/**
 * Get first period based on SelectedDates.
 */
export const extractStartEndDate = <T extends string | Translatable>(
  event: Event<T>,
  selectedDates: SelectedDates
):
  | {
    start: DateTime;
    end: DateTime;
  }
  | undefined => {
  let period: Period | null = null;
  event.schedules?.dates?.some((schedule) => {
    period = findAvailablePeriod(
      schedule,
      DateTime.fromSQL(selectedDates.start),
      selectedDates.end ? DateTime.fromSQL(selectedDates.end) : undefined
    );
    return period != null;
  });

  return period
    ? {
      start: DateTime.fromSQL((period as Period).start ?? ''),
      end: DateTime.fromSQL((period as Period).end ?? DateTime.now().endOf('year').toSQLDate())
    }
    : undefined;
};

/**
 * Looks in first matched period if start and end are the same day.
 */
export const isSameDays = <T extends string | Translatable>(
  event: Event<T>,
  selectedDates: SelectedDates
): boolean => {
  const period = extractStartEndDate(event, selectedDates);

  if (!period) return false;

  return period.start.toSQLDate() === period.end.toSQLDate();
};

/**
 * Get in the schedule the first period available today or based on given date
 */
export const findAvailablePeriod = (
  schedule: ScheduleDate,
  start: DateTime | null | undefined,
  end: DateTime | null | undefined
): Period | null => {
  const today = start ?? DateTime.now();

  if (end && end < today) return null;

  for (const period of sortPeriods(schedule.periods ?? [])) {
    if (isBetween(period, today, end)) {
      return period;
    }
  }

  return null;
};

export const sortPeriods = (periods: Period[]): Period[] => {
  return [...periods].sort((a, b): number => {
    // undefined move to first position and are sort after
    if (!a.start && !b.start) return -1;
    if (!a.start && b.start) return -1;
    if (a.start && !b.start) return 1;
    if (!a.start || !b.start) return 0;

    const p1 = DateTime.fromSQL(a.start).valueOf();
    const p2 = DateTime.fromSQL(b.start).valueOf();
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
  }).sort((a, b): number => {
    // sorted in previous sort
    if (a.start || b.start) return 0;
    // undefined values on the top
    if (!a.start && !a.end || !b.start && !b.end) return -1;
    // sorted in previous sort
    if (!a.end || !b.end) return 0;

    const p1 = DateTime.fromSQL(a.end).valueOf();
    const p2 = DateTime.fromSQL(b.end).valueOf();
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
  });
};

export const sortDates = (dates: ScheduleDate[]): ScheduleDate[] => {
  return dates
    // should not occur, but typing allow that
    .filter(d => d.periods !== undefined && d.periods.length > 0)
    .map(d => {
      d.periods = sortPeriods(d.periods!)
      return d;
    })
    .sort((a, b) => {
      const p1 = a.periods!.at(0)!;
      const p2 = b.periods!.at(0)!;
      if (!p1.start && !p2.start) return -1;
      if (!p1.start && p2.start) return -1;
      if (p1.start && !p2.start) return 1;
      if (!p1.start || !p2.start) return -1;

      const d1 = DateTime.fromSQL(p1.start);
      const d2 = DateTime.fromSQL(p2.start);

      if (d1 < d2) return -1;
      if (d1 > d2) return 1;
      return 0;
    });
};

/**
 * Is the period between specific dates ?
 */
export const isBetween = (
  period: Period,
  start: DateTime | undefined | null,
  end: DateTime | undefined | null
): boolean => {
  const from = start ?? DateTime.now();

  if (!period.start && !period.end) return false;

  if (period.start && period.end) {
    const pEnd = DateTime.fromSQL(period.end).endOf('day');
    const pStart = DateTime.fromSQL(period.start).startOf('day');

    if (from && end) {
      if (from <= pStart && end >= pStart) return true;
      if (from <= pStart && end >= pEnd) return true;
      if (from >= pStart && from <= pEnd) return true;
    }
    else if (from >= pStart && from <= pEnd) return true;
    else if (from <= pStart) return true;
  }
  else if (!period.start && period.end) {
    const pEnd = DateTime.fromSQL(period.end).endOf('day');
    if (from && end) {
      if (from <= pEnd && end >= pEnd) return true;
      if (from <= pEnd && end <= pEnd) return true;
    }
    else if (from <= pEnd) return true;
  }
  else if (period.start && !period.end) {
    const pStart = DateTime.fromSQL(period.start).startOf('day');
    if (from && end) {
      if (from <= pStart && end >= pStart) return true;
      if (from >= pStart && end >= pStart) return true;
    }
    else if (from >= pStart) return true;
  }
  return false;
};

export const sortByYears = <T extends PostType<Translatable | string>>(posts: T[]) => {
  const sortedPosts = new Map<number, T[]>();

  posts.forEach((post) => {
    if (!post.published_at) return;

    const date = DateTime.fromSeconds(parseInt(post.published_at));
    const year = Number(date.toFormat('yyyy'));
    if (!sortedPosts.get(year)) {
      sortedPosts.set(year, []);
    }
    sortedPosts.get(year)?.push(post);
  });

  return new Map([...sortedPosts.entries()].sort(([a], [b]) => a - b));
};
