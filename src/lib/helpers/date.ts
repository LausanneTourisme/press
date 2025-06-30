import type { Event, Period, PostType, ScheduleDate, SelectedDates, Translatable } from "$types";
import { DateTime } from "luxon";


export const extractStartEndDate = <T extends string | Translatable>(event: Event<T>, selectedDates: SelectedDates): {
    start: DateTime,
    end: DateTime
} | undefined => {
    let period: Period | null = null;
    event.schedules?.dates?.some((schedule) => {
        period = findAvailablePeriod(schedule, DateTime.fromSQL(selectedDates.start), selectedDates.end ? DateTime.fromSQL(selectedDates.end) : undefined);
        return period != null;
    });

    return period ? {
        start: DateTime.fromSQL((period as Period).start ?? ''),
        end: DateTime.fromSQL((period as Period).end ?? DateTime.now().endOf('year').toSQLDate())
    } : undefined;
};


export const isSameDays = <T extends string | Translatable>(event: Event<T>, selectedDates: SelectedDates): boolean => {
    const period = extractStartEndDate(event, selectedDates);

    return period?.start.toSQLDate() === period?.end.toSQLDate();
};

export const findAvailablePeriod = (schedule: ScheduleDate, start: DateTime | null | undefined, end: DateTime | null | undefined): Period | null => {
    const today = start ?? DateTime.now();
    for (const period of sortPeriods(schedule.periods ?? [])) {
        if (isBetween(period, today, end)) {
            return period;
        }
    }

    return null;
};


export const sortPeriods = (periods: Period[]): Period[] => {
    return [...periods].sort((a, b): number => {
        const p1 = DateTime.fromSQL(a.start ?? '').valueOf();
        const p2 = DateTime.fromSQL(b.start ?? '').valueOf();
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
        return 0;
    });
};

export const sortDates = (dates: ScheduleDate[]): ScheduleDate[] => {
    return [...dates].sort((a, b) => {
        const p1 = DateTime.fromSQL(sortPeriods(a.periods ?? []).at(0)?.start ?? '').valueOf();
        const p2 = DateTime.fromSQL(sortPeriods(b.periods ?? []).at(0)?.start ?? '').valueOf();

        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
        return 0;
    });
};


export const isBetween = (period: Period, start: DateTime | undefined | null, end: DateTime | undefined | null): boolean => {
    const from = start ?? DateTime.now();

    const pStart = DateTime.fromSQL(period.start ?? '').startOf('day');
    const pEnd = DateTime.fromSQL(period.end ?? '').endOf('day');


    if (from && end) {
        const to = end;

        if (pStart <= from && pEnd >= to) {
            return true;
        }
        if (pStart <= from && pEnd >= from && pEnd <= to) {
            return true;
        }
        if (pStart >= from && pStart <= to && pEnd >= to) {
            return true;
        }
        if (pStart >= from && pEnd <= to) {
            return true;
        }
    } else {
        if (pStart <= from && pEnd >= from) {
            return true;
        }
        if (pStart >= from) {
            return true;
        }
    }

    return false;
};

export const sortByYears = <T extends PostType<Translatable | string>>(posts: T[]) => {
    const sortedPosts = new Map<number, T[]>();

    posts.forEach(post => {
        if (!post.published_at) return;

        const date = DateTime.fromSeconds(parseInt(post.published_at));
        const year = Number(date.toFormat('yyyy'));
        if (!sortedPosts.get(year)) {
            sortedPosts.set(year, []);
        }
        sortedPosts.get(year)?.push(post);
    });

    return new Map([...sortedPosts.entries()].sort(([a], [b]) => a - b));
}
