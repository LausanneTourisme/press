import { dev } from '$app/environment';
import { filterByTag, isOfflineMode } from '$lib/helpers';
import { sortByYears } from '$lib/helpers/date';
import { getFavorites, getPosts, getTag } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import type { Post, Release } from '$types';

export const load = async ({ parent }) => {
    if (dev && isOfflineMode) {
        //MOCK fetch requests
        server.listen()
    }

    const { locale } = await parent();

    const releasesRes = await getPosts<Release<string>>({ type: 'press_release', locale });

    const releases = releasesRes.data?.items?.data ?? [];

    return {
        payload: {
            releasesByDates: new Map([...sortByYears(releases).entries()].reverse())
        }
    }
};
