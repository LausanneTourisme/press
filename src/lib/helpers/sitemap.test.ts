import { supportedLocales } from '$lib/translations';
import { describe, expect, it, test, vi } from 'vitest';
import type { UrlEntry } from './sitemap';
import { generateUrlSets, getInternalLinks } from './sitemap';
vi.mock('$lib/services/requests.server', () => ({
  getPosts: vi.fn().mockResolvedValue({
    data: {
      items: {
        data: [
          {
            type: 'press_release',
            languages: ['fr', 'en', 'de'],
            seo: { slug: { fr: 'mon-communique', en: 'mon-communique', de: 'mon-communique' } }
          },
          {
            type: 'press_release',
            languages: ['en'],
            seo: { slug: { en: 'mon-communique2' } }
          },
          {
            type: 'press_kit',
            languages: ['en', 'de'],
            seo: { slug: { en: 'mon-dossier', de: 'mon-dossier' } }
          },
          {
            type: 'press_kit',
            languages: ['de'],
            seo: { slug: { de: 'mon-dossier3' } }
          }
        ]
      }
    }
  })
}));

describe('Test helper: sitemap', () => {
  const baseEntriesLength = 75; // number of static entries without press releases

  test('entries structure', async () => {
    const entries = await getInternalLinks();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);

    entries.forEach((entry) => {
      expect(entry).toHaveProperty('paths');
      expect(typeof entry.paths).toBe('object');
    });

    expect(typeof entries.find((e) => e.paths.fr !== undefined)?.paths.fr).toBe('string');
    expect(typeof entries.find((e) => e.paths.en !== undefined)?.paths.en).toBe('string');
    expect(typeof entries.find((e) => e.paths.de !== undefined)?.paths.de).toBe('string');
  });

  it(`should return ${baseEntriesLength} internal links without press releases`, async () => {
    const { getPosts } = await import('$lib/services/requests.server');
    (getPosts as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { items: { data: [] } }
    });
    const entries = await getInternalLinks();
    const allPaths = entries.flatMap((entry) => Object.values(entry.paths));

    expect(allPaths.length).toBe(baseEntriesLength);
  });

  describe('Test getInternalLinks', () => {
    it('returns all paths across all locales with correct total count', async () => {
      const entries = await getInternalLinks();
      const allPaths = entries.flatMap((entry) => Object.values(entry.paths));
      const expectedTotal = baseEntriesLength + 7; // 7 press release paths from the mocked getPosts

      expect(allPaths.length).toBe(expectedTotal);

      expect(allPaths).toContain('/fr');
      expect(allPaths).toContain('/en');
      expect(allPaths).toContain('/de');
      expect(allPaths).toContain('/fr/communiques-de-presse-et-dossiers-de-presse');
      expect(allPaths).toContain('/en/press-releases-and-press-kits');
      expect(allPaths).toContain('/de/pressemitteilungen-und-pressedossiers');
      expect(allPaths).toContain('/fr/parutions');
      expect(allPaths).toContain('/en/coverages');
      expect(allPaths).toContain('/de/veroeffentlichungen');
      expect(allPaths).toContain('/fr/themes');
      expect(allPaths).toContain('/en/themes');
      expect(allPaths).toContain('/de/themen');
      expect(allPaths).toContain('/fr/themes/culture');
      expect(allPaths).toContain('/en/themes/culture');
      expect(allPaths).toContain('/de/themen/kultur');
      expect(allPaths).toContain('/fr/themes/nature');
      expect(allPaths).toContain('/en/themes/nature');
      expect(allPaths).toContain('/de/themen/natur');
      expect(allPaths).toContain('/fr/themes/sport');
      expect(allPaths).toContain('/en/themes/sport');
      expect(allPaths).toContain('/de/themen/sport');
      expect(allPaths).toContain('/fr/themes/gastronomie');
      expect(allPaths).toContain('/en/themes/gastronomy');
      expect(allPaths).toContain('/de/themen/gastronomie');
      expect(allPaths).toContain('/fr/themes/education');
      expect(allPaths).toContain('/en/themes/education');
      expect(allPaths).toContain('/de/themen/bildung');
      expect(allPaths).toContain('/fr/themes/durabilite');
      expect(allPaths).toContain('/en/themes/sustainability');
      expect(allPaths).toContain('/de/themen/nachhaltigkeit');
      expect(allPaths).toContain('/fr/themes/famille');
      expect(allPaths).toContain('/en/themes/family');
      expect(allPaths).toContain('/de/themen/familie');
      expect(allPaths).toContain('/fr/themes/architecture-design');
      expect(allPaths).toContain('/en/themes/architecture-design');
      expect(allPaths).toContain('/de/themen/architektur-design');
      expect(allPaths).toContain('/fr/themes/lacustre');
      expect(allPaths).toContain('/en/themes/lacustrine');
      expect(allPaths).toContain('/de/themen/lakustrin');
      expect(allPaths).toContain('/fr/themes/bien-etre');
      expect(allPaths).toContain('/en/themes/wellness');
      expect(allPaths).toContain('/de/themen/wohlbefinden');
      expect(allPaths).toContain('/fr/themes/insolite');
      expect(allPaths).toContain('/en/themes/unusual');
      expect(allPaths).toContain('/de/themen/ungewoehnlich');
      expect(allPaths).toContain('/fr/immanquables#news');
      expect(allPaths).toContain('/en/highlights#news');
      expect(allPaths).toContain('/de/highlights#news');
      expect(allPaths).toContain('/fr/immanquables#highlights');
      expect(allPaths).toContain('/en/highlights#highlights');
      expect(allPaths).toContain('/de/highlights#highlights');
      expect(allPaths).toContain('/fr#numbers');
      expect(allPaths).toContain('/en#numbers');
      expect(allPaths).toContain('/de#numbers');
      expect(allPaths).toContain('/fr#distinctions');
      expect(allPaths).toContain('/en#distinctions');
      expect(allPaths).toContain('/de#distinctions');
      expect(allPaths).toContain('/fr#faq');
      expect(allPaths).toContain('/en#faq');
      expect(allPaths).toContain('/de#faq');
      expect(allPaths).toContain('/fr/contact');
      expect(allPaths).toContain('/en/contact');
      expect(allPaths).toContain('/de/kontakt');
      expect(allPaths).toContain('/fr/formulaires/journaliste');
      expect(allPaths).toContain('/en/forms/journalist');
      expect(allPaths).toContain('/de/formulare/journalist');
      expect(allPaths).toContain('/fr/formulaires/createur-de-contenu');
      expect(allPaths).toContain('/en/forms/content-creator');
      expect(allPaths).toContain('/de/formulare/inhaltsersteller');
      expect(allPaths).toContain('/fr/formulaires/retombees-mediatiques');
      expect(allPaths).toContain('/en/forms/media-coverage');
      expect(allPaths).toContain('/de/formulare/medienresonanz');
      expect(allPaths).toContain('/fr/formulaires/merci');
      expect(allPaths).toContain('/en/forms/thanks');
      expect(allPaths).toContain('/de/formulare/danke');
      // expect(allPaths).toContain('/fr/communiques-de-presse/mon-communique');
      // expect(allPaths).toContain('/fr/dossiers-de-presse/mon-dossier');
      // expect(allPaths).toContain('/en/press-releases/mon-communique');
      // expect(allPaths).toContain('/en/press-kits/mon-dossier');
      // expect(allPaths).toContain('/de/pressemitteilungen/mon-communique');
      // expect(allPaths).toContain('/de/pressedossiers/mon-dossier');
    });

    supportedLocales.forEach((locale) => {
      it(`returns only paths available in "${locale}" with correct total count`, async () => {
        const entries = await getInternalLinks({ canonLocale: locale });
        expect(entries.every((entry) => entry.paths[locale])).toBe(true);

        const allPaths = entries.flatMap((entry) => Object.values(entry.paths));
        const expectedPerLocale = {
          fr: baseEntriesLength + 3, // 3 comes from the mocked getPosts
          en: baseEntriesLength + 6, // 6 comes from the mocked getPosts
          de: baseEntriesLength + 6 // 6 comes from the mocked getPosts
        };

        expect(allPaths.length).toBe(expectedPerLocale[locale]);
      });
    });

    it('does not return a path of different locale', async () => {
      const entries = await getInternalLinks();

      // de-only release must NOT appear
      expect(entries.some((entry) => entry.paths.fr === '/de/pressedossiers/mon-dossier3')).toBe(
        false
      );
      expect(entries.some((entry) => entry.paths.en === '/de/pressedossiers/mon-dossier3')).toBe(
        false
      );
    });

    it('each entry groups the same page across locales', async () => {
      const entries = await getInternalLinks();

      // home page: one entry groups all 3 locales
      expect(entries).toContainEqual(
        expect.objectContaining({
          paths: expect.objectContaining({ fr: '/fr', en: '/en', de: '/de' })
        })
      );

      // theme entry groups all 3 locale paths
      expect(entries).toContainEqual(
        expect.objectContaining({
          paths: expect.objectContaining({
            fr: '/fr/themes/culture',
            en: '/en/themes/culture',
            de: '/de/themen/kultur'
          })
        })
      );

      // press release entry groups all 3 locale paths
      expect(entries).toContainEqual(
        expect.objectContaining({
          paths: expect.objectContaining({
            fr: '/fr/communiques-de-presse/mon-communique',
            en: '/en/press-releases/mon-communique',
            de: '/de/pressemitteilungen/mon-communique'
          })
        })
      );
    });

    it('calls getPosts once for all locales', async () => {
      const { getPosts } = await import('$lib/services/requests.server');
      (getPosts as ReturnType<typeof vi.fn>).mockClear();

      await getInternalLinks();

      expect(getPosts).toHaveBeenCalledTimes(1);
      expect(getPosts).toHaveBeenCalledWith(
        expect.not.objectContaining({ locale: expect.anything() })
      );
    });

    supportedLocales.forEach((locale) => {
      it(`calls getPosts once for ${locale} locales`, async () => {
        const { getPosts } = await import('$lib/services/requests.server');
        (getPosts as ReturnType<typeof vi.fn>).mockClear();

        await getInternalLinks({ canonLocale: locale });

        expect(getPosts).toHaveBeenCalledTimes(1);
        expect(getPosts).toHaveBeenCalledWith(
          expect.not.objectContaining({ locale: expect.anything() })
        );
      });
    });

    it('static entries have no lastmod', async () => {
      const entries = await getInternalLinks();
      const home = entries.find((e) => e.paths.fr === '/fr');

      expect(home?.lastmod).toBeUndefined();
    });

    it('press release entries carry lastmod', async () => {
      const { getPosts } = await import('$lib/services/requests.server');
      (getPosts as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: {
          items: {
            data: [
              {
                type: 'press_release',
                languages: ['fr'],
                published_at: '1469852625',
                seo: { slug: { fr: 'avec-date' } }
              },
              {
                type: 'press_release',
                languages: ['fr'],
                published_at: '1974895352',
                updated_at: '1739953520',
                seo: { slug: { fr: 'avec-updated' } }
              }
            ]
          }
        }
      });

      const entries = await getInternalLinks();
      const withPublished = entries.find(
        (e) => e.paths.fr === '/fr/communiques-de-presse/avec-date'
      );
      const withUpdated = entries.find(
        (e) => e.paths.fr === '/fr/communiques-de-presse/avec-updated'
      );

      expect(withPublished?.lastmod).toBe('2016-07-30');
      expect(withUpdated?.lastmod).toBe('2025-02-19'); // updated_at preferred over published_at
    });
  });

  describe('Test generateUrlSets', () => {
    const origin = 'https://example.com';

    const allLocalesEntry: UrlEntry = { paths: { fr: '/fr/test', en: '/en/test', de: '/de/test' } };
    const deOnlyEntry: UrlEntry = { paths: { de: '/de/only' } };
    const withLastmod: UrlEntry = {
      paths: { fr: '/fr/article', en: '/en/article' },
      lastmod: '2024-01-15T10:00:00.000Z'
    };

    it('uses canonLocale path as <loc>', () => {
      const [block] = generateUrlSets({
        entries: [allLocalesEntry],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(block).toContain(`<loc>${origin}/fr/test</loc>`);
    });

    it('skips entry when canonLocale path is not available', () => {
      const result = generateUrlSets({
        entries: [deOnlyEntry],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(result).toHaveLength(0);
    });

    it('includes entry when canonLocale matches', () => {
      const result = generateUrlSets({
        entries: [deOnlyEntry],
        urlOrigin: origin,
        canonLocale: 'de'
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toContain(`<loc>${origin}/de/only</loc>`);
    });

    it('falls back to first available path when no canonLocale and defaultLocale not present', () => {
      const result = generateUrlSets({ entries: [deOnlyEntry], urlOrigin: origin });
      expect(result).toHaveLength(1);
      expect(result[0]).toContain(`<loc>${origin}/de/only</loc>`);
    });

    it('includes xhtml:link alternates for all locales in the entry', () => {
      const [block] = generateUrlSets({
        entries: [allLocalesEntry],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(block).toContain(`hreflang="fr" href="${origin}/fr/test"`);
      expect(block).toContain(`hreflang="en" href="${origin}/en/test"`);
      expect(block).toContain(`hreflang="de" href="${origin}/de/test"`);
    });

    it('de-only entry has no fr or en alternate', () => {
      const [block] = generateUrlSets({
        entries: [deOnlyEntry],
        urlOrigin: origin,
        canonLocale: 'de'
      });
      expect(block).toContain(`hreflang="de"`);
      expect(block).not.toContain(`hreflang="fr"`);
      expect(block).not.toContain(`hreflang="en"`);
    });

    it('includes <lastmod> when present', () => {
      const [block] = generateUrlSets({
        entries: [withLastmod],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(block).toContain('<lastmod>2024-01-15T10:00:00.000Z</lastmod>');
    });

    it('omits <lastmod> when absent', () => {
      const [block] = generateUrlSets({
        entries: [allLocalesEntry],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(block).not.toContain('<lastmod>');
    });

    it('prepends urlOrigin to all URLs', () => {
      const [block] = generateUrlSets({
        entries: [allLocalesEntry],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(block).not.toContain('href="/');
      expect(block).not.toContain('<loc>/');
    });

    it('returns empty array for empty entries', () => {
      expect(generateUrlSets({ entries: [] })).toHaveLength(0);
    });

    it('produces correct full XML block', () => {
      const [block] = generateUrlSets({
        entries: [withLastmod],
        urlOrigin: origin,
        canonLocale: 'fr'
      });
      expect(block).toBe(
        `\t<url>\n\t\t<loc>${origin}/fr/article</loc>\n\t\t<lastmod>2024-01-15T10:00:00.000Z</lastmod>\n\t\t<xhtml:link rel="alternate" hreflang="fr" href="${origin}/fr/article" />\n\t\t<xhtml:link rel="alternate" hreflang="en" href="${origin}/en/article" />\n\t</url>`
      );
    });
  });
});
