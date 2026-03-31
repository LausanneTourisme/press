import { sortByYears } from '$lib/helpers/date';
import type { GraphQLResponse, Release, Translatable } from '$types';
import { describe, expect, it } from 'vitest';

describe('Press releases and press kits page - FR', () => {
  it('Releases By Dates', () => {
    const modules = import.meta.glob<{ default: GraphQLResponse<Release<Translatable>> }>(
      '/src/lib/mocks/responses/posts/press_kit.fr.json',
      { eager: true }
    );console.log(modules);
    const releases = modules['/src/lib/mocks/responses/posts/press_kit.fr.json'].default.data!.items!.data!;
    const byYear = new Map([...sortByYears(releases)].reverse());

    expect(byYear.get(2022)?.length).toBe(3);
    expect(byYear.get(2023)?.length).toBe(2);
    expect(byYear.get(2024)?.length).toBe(2);
    expect(byYear.get(2025)?.length).toBe(1);
    expect(byYear.get(2026)?.length).toBe(1);
  });
});
