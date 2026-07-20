import { Forms, RouteTypes, Themes } from '$enums';
import {
  blankable,
  chunkify,
  filename,
  filterByTag,
  getMediaLibraryRegisterLink,
  getTailwindColor,
  humanFileSize,
  intersect,
  normalize,
  route,
  shuffle,
  ucfirst
} from '$lib/helpers';
import type { Post } from '$types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
  env: {
    PUBLIC_ENABLE_OFFLINE_MODE: 'false'
  }
}));
//assuming during this test 'defaultLocale' is in "fr"
describe('Test helper: Index', () => {
  describe('Test blankable', () => {
    it('is blank link', () => {
      expect(blankable('https://perdu.com')).toBe('_blank');
      expect(blankable('http://perdus.com')).toBe('_blank');
    });

    it('is not blank link', () => {
      expect(blankable('/highlight')).toBe(undefined);
      expect(blankable(undefined)).toBe(undefined);
    });
  });

  describe('Test filename', () => {
    it('has extension', () => {
      expect(filename('this/is/an/example.png')).toBe('this/is/an/example.png');
      expect(filename('this/is/an/example.png', true)).toBe('this/is/an/example.png');
    });
    it('returns without extension', () => {
      expect(filename('this/is/an/example.png', false)).toBe('this/is/an/example');
      expect(filename('this/is/an/example', true)).toBe('this/is/an/example');
    });
  });

  describe('Test getMediaLibraryRegisterLink', () => {
    it('returns FR link', () => {
      expect(getMediaLibraryRegisterLink('fr')).toBe(
        'https://medialibrary.lausanne-tourisme.ch?registration&lang=fr_FR'
      );
    });
    it('returns DE link', () => {
      expect(getMediaLibraryRegisterLink('de')).toBe(
        'https://medialibrary.lausanne-tourisme.ch?registration&lang=de_DE'
      );
    });
    it('returns EN link', () => {
      expect(getMediaLibraryRegisterLink('en')).toBe(
        'https://medialibrary.lausanne-tourisme.ch?registration&lang=en_US'
      );
      //@ts-expect-error test inexisting locale
      expect(getMediaLibraryRegisterLink('fake locale')).toBe(
        'https://medialibrary.lausanne-tourisme.ch?registration&lang=en_US'
      );
    });
  });

  describe('Test route', () => {
    describe('Get all home page links', () => {
      it('returns FR page url', () => {
        expect(
          route(RouteTypes.Home, {
            forceLocale: 'fr'
          })
        ).toBe('/fr');
      });
      it('returns DE page url', () => {
        expect(
          route(RouteTypes.Home, {
            forceLocale: 'de'
          })
        ).toBe('/de');
      });
      it('returns EN page url', () => {
        expect(
          route(RouteTypes.Home, {
            forceLocale: 'en'
          })
        ).toBe('/en');
      });
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Home)).toBe('/fr');
      });
    });

    describe('Get all Press releases And Press kits pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits)).toBe(
          '/fr/communiques-de-presse-et-dossiers-de-presse'
        );
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits, { forceLocale: 'fr' })).toBe(
          '/fr/communiques-de-presse-et-dossiers-de-presse'
        );
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits, { forceLocale: 'de' })).toBe(
          '/de/pressemitteilungen-und-pressedossiers'
        );
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits, { forceLocale: 'en' })).toBe(
          '/en/press-releases-and-press-kits'
        );
      });
    });

    describe('Get all Coverage pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Coverages)).toBe('/fr/parutions');
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.Coverages, { forceLocale: 'fr' })).toBe('/fr/parutions');
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.Coverages, { forceLocale: 'de' })).toBe('/de/veroeffentlichungen');
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.Coverages, { forceLocale: 'en' })).toBe('/en/coverages');
      });
    });

    describe('Get all Themes pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Themes)).toBe('/fr/themes');
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.Themes, { forceLocale: 'fr' })).toBe('/fr/themes');
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.Themes, { forceLocale: 'de' })).toBe('/de/themen');
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.Themes, { forceLocale: 'en' })).toBe('/en/themes');
      });

      describe('Test all specific themes', () => {
        describe(Themes.Architecture, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Architecture })).toBe(
              '/fr/themes/architecture-design'
            );
          });
          it('returns FR page url', () => {
            expect(
              route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Architecture })
            ).toBe('/fr/themes/architecture-design');
          });
          it('returns DE page url', () => {
            expect(
              route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Architecture })
            ).toBe('/de/themen/architektur-design');
          });
          it('returns EN page url', () => {
            expect(
              route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Architecture })
            ).toBe('/en/themes/architecture-design');
          });
        });

        describe(Themes.Culture, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Culture })).toBe('/fr/themes/culture');
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Culture })).toBe(
              '/fr/themes/culture'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Culture })).toBe(
              '/de/themen/kultur'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Culture })).toBe(
              '/en/themes/culture'
            );
          });
        });

        describe(Themes.Education, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Education })).toBe(
              '/fr/themes/education'
            );
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Education })).toBe(
              '/fr/themes/education'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Education })).toBe(
              '/de/themen/bildung'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Education })).toBe(
              '/en/themes/education'
            );
          });
        });

        describe(Themes.Family, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Family })).toBe('/fr/themes/famille');
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Family })).toBe(
              '/fr/themes/famille'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Family })).toBe(
              '/de/themen/familie'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Family })).toBe(
              '/en/themes/family'
            );
          });
        });

        describe(Themes.Gastronomy, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Gastronomy })).toBe(
              '/fr/themes/gastronomie'
            );
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Gastronomy })).toBe(
              '/fr/themes/gastronomie'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Gastronomy })).toBe(
              '/de/themen/gastronomie'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Gastronomy })).toBe(
              '/en/themes/gastronomy'
            );
          });
        });

        describe(Themes.Lacustrine, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Lacustrine })).toBe(
              '/fr/themes/lacustre'
            );
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Lacustrine })).toBe(
              '/fr/themes/lacustre'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Lacustrine })).toBe(
              '/de/themen/lakustrin'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Lacustrine })).toBe(
              '/en/themes/lacustrine'
            );
          });
        });

        describe(Themes.Nature, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Nature })).toBe('/fr/themes/nature');
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Nature })).toBe(
              '/fr/themes/nature'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Nature })).toBe(
              '/de/themen/natur'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Nature })).toBe(
              '/en/themes/nature'
            );
          });
        });

        describe(Themes.Sport, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Sport })).toBe('/fr/themes/sport');
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Sport })).toBe(
              '/fr/themes/sport'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Sport })).toBe(
              '/de/themen/sport'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Sport })).toBe(
              '/en/themes/sport'
            );
          });
        });

        describe(Themes.Sustainability, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Sustainability })).toBe(
              '/fr/themes/durabilite'
            );
          });
          it('returns FR page url', () => {
            expect(
              route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Sustainability })
            ).toBe('/fr/themes/durabilite');
          });
          it('returns DE page url', () => {
            expect(
              route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Sustainability })
            ).toBe('/de/themen/nachhaltigkeit');
          });
          it('returns EN page url', () => {
            expect(
              route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Sustainability })
            ).toBe('/en/themes/sustainability');
          });
        });

        describe(Themes.Unusual, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Unusual })).toBe('/fr/themes/insolite');
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Unusual })).toBe(
              '/fr/themes/insolite'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Unusual })).toBe(
              '/de/themen/ungewoehnlich'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Unusual })).toBe(
              '/en/themes/unusual'
            );
          });
        });

        describe(Themes.Wellness, () => {
          it('returns page url in default locale', () => {
            expect(route(RouteTypes.Themes, { theme: Themes.Wellness })).toBe(
              '/fr/themes/bien-etre'
            );
          });
          it('returns FR page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'fr', theme: Themes.Wellness })).toBe(
              '/fr/themes/bien-etre'
            );
          });
          it('returns DE page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'de', theme: Themes.Wellness })).toBe(
              '/de/themen/wohlbefinden'
            );
          });
          it('returns EN page url', () => {
            expect(route(RouteTypes.Themes, { forceLocale: 'en', theme: Themes.Wellness })).toBe(
              '/en/themes/wellness'
            );
          });
        });
      });
    });

    describe('Get all Highlights pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Highlights)).toBe('/fr/immanquables');
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.Highlights, { forceLocale: 'fr' })).toBe('/fr/immanquables');
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.Highlights, { forceLocale: 'de' })).toBe('/de/highlights');
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.Highlights, { forceLocale: 'en' })).toBe('/en/highlights');
      });
    });

    describe('Get all Contact pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Contact)).toBe('/fr/contact');
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.Contact, { forceLocale: 'fr' })).toBe('/fr/contact');
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.Contact, { forceLocale: 'de' })).toBe('/de/kontakt');
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.Contact, { forceLocale: 'en' })).toBe('/en/contact');
      });
    });

    describe('Get all Press releases And Press kits pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits)).toBe(
          '/fr/communiques-de-presse-et-dossiers-de-presse'
        );
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits, { forceLocale: 'fr' })).toBe(
          '/fr/communiques-de-presse-et-dossiers-de-presse'
        );
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits, { forceLocale: 'de' })).toBe(
          '/de/pressemitteilungen-und-pressedossiers'
        );
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.PressreleasesAndPresskits, { forceLocale: 'en' })).toBe(
          '/en/press-releases-and-press-kits'
        );
      });

      describe('Get all Press release pages', () => {
        it('returns page url in default locale', () => {
          expect(route(RouteTypes.Pressreleases)).toBe('/fr/communiques-de-presse');
        });
        it('returns FR page url', () => {
          expect(route(RouteTypes.Pressreleases, { forceLocale: 'fr' })).toBe(
            '/fr/communiques-de-presse'
          );
        });
        it('returns DE page url', () => {
          expect(route(RouteTypes.Pressreleases, { forceLocale: 'de' })).toBe(
            '/de/pressemitteilungen'
          );
        });
        it('returns EN page url', () => {
          expect(route(RouteTypes.Pressreleases, { forceLocale: 'en' })).toBe('/en/press-releases');
        });
      });

      describe('Get all Press kit pages', () => {
        it('returns page url in default locale', () => {
          expect(route(RouteTypes.Presskits)).toBe('/fr/dossiers-de-presse');
        });
        it('returns FR page url', () => {
          expect(route(RouteTypes.Presskits, { forceLocale: 'fr' })).toBe('/fr/dossiers-de-presse');
        });
        it('returns DE page url', () => {
          expect(route(RouteTypes.Presskits, { forceLocale: 'de' })).toBe('/de/pressedossiers');
        });
        it('returns EN page url', () => {
          expect(route(RouteTypes.Presskits, { forceLocale: 'en' })).toBe('/en/press-kits');
        });
      });
    });

    describe('Get all Article pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Articles)).toBe('/fr/articles');
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.Articles, { forceLocale: 'fr' })).toBe('/fr/articles');
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.Articles, { forceLocale: 'de' })).toBe('/de/artikeln');
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.Articles, { forceLocale: 'en' })).toBe('/en/articles');
      });
    });

    describe('Get all Form pages', () => {
      it('returns page url in default locale', () => {
        expect(route(RouteTypes.Forms)).toBe('/fr/formulaires');
      });
      it('returns FR page url', () => {
        expect(route(RouteTypes.Forms, { forceLocale: 'fr' })).toBe('/fr/formulaires');
      });
      it('returns DE page url', () => {
        expect(route(RouteTypes.Forms, { forceLocale: 'de' })).toBe('/de/formulare');
      });
      it('returns EN page url', () => {
        expect(route(RouteTypes.Forms, { forceLocale: 'en' })).toBe('/en/forms');
      });

      describe('Test all specific forms', () => {
        describe(Forms.ContentCreator, () => {
          it('returns page url in default locale', () => {
            expect(
              route(RouteTypes.Forms, {
                form: Forms.ContentCreator
              })
            ).toBe('/fr/formulaires/createur-de-contenu');
          });
          it('returns FR page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'fr',
                form: Forms.ContentCreator
              })
            ).toBe('/fr/formulaires/createur-de-contenu');
          });
          it('returns DE page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'de',
                form: Forms.ContentCreator
              })
            ).toBe('/de/formulare/inhaltsersteller');
          });
          it('returns EN page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'en',
                form: Forms.ContentCreator
              })
            ).toBe('/en/forms/content-creator');
          });
        });

        describe(Forms.Journalist, () => {
          it('returns page url in default locale', () => {
            expect(
              route(RouteTypes.Forms, {
                form: Forms.Journalist
              })
            ).toBe('/fr/formulaires/journaliste');
          });
          it('returns FR page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'fr',
                form: Forms.Journalist
              })
            ).toBe('/fr/formulaires/journaliste');
          });
          it('returns DE page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'de',
                form: Forms.Journalist
              })
            ).toBe('/de/formulare/journalist');
          });
          it('returns EN page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'en',
                form: Forms.Journalist
              })
            ).toBe('/en/forms/journalist');
          });
        });

        describe(Forms.MediaCoverage, () => {
          it('returns page url in default locale', () => {
            expect(
              route(RouteTypes.Forms, {
                form: Forms.MediaCoverage
              })
            ).toBe('/fr/formulaires/retombees-mediatiques');
          });
          it('returns FR page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'fr',
                form: Forms.MediaCoverage
              })
            ).toBe('/fr/formulaires/retombees-mediatiques');
          });
          it('returns DE page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'de',
                form: Forms.MediaCoverage
              })
            ).toBe('/de/formulare/medienresonanz');
          });
          it('returns EN page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'en',
                form: Forms.MediaCoverage
              })
            ).toBe('/en/forms/media-coverage');
          });
        });

        describe(Forms.Thanks, () => {
          it('returns page url in default locale', () => {
            expect(
              route(RouteTypes.Forms, {
                form: Forms.Thanks
              })
            ).toBe('/fr/formulaires/merci');
          });
          it('returns FR page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'fr',
                form: Forms.Thanks
              })
            ).toBe('/fr/formulaires/merci');
          });
          it('returns DE page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'de',
                form: Forms.Thanks
              })
            ).toBe('/de/formulare/danke');
          });
          it('returns EN page url', () => {
            expect(
              route(RouteTypes.Forms, {
                forceLocale: 'en',
                form: Forms.Thanks
              })
            ).toBe('/en/forms/thanks');
          });
        });
      });
    });
  });

  describe('Test chunkify', () => {
    it('splits correctly in 2 chunks', () => {
      expect(chunkify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toStrictEqual([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10]
      ]);
      expect(chunkify([1, 2, 3, 4, 5, 6, 7])).toStrictEqual([
        [1, 2, 3, 4],
        [5, 6, 7]
      ]);
    });

    it('splits correctly in 4 chunks', () => {
      expect(chunkify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3)).toStrictEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10]
      ]);
      expect(chunkify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toStrictEqual([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15]
      ]);
    });

    it('splits correctly in 1 chunk', () => {
      expect(chunkify([1, 2, 3], 3)).toStrictEqual([[1, 2, 3]]);
      expect(chunkify([1, 2, 3, 4])).toStrictEqual([[1, 2, 3, 4]]);
    });
  });

  describe('Test ucfirst', () => {
    it('returns first letter upscaled', () => {
      expect(ucfirst('it is a test?')).toBe('It is a test?');
      expect(ucfirst('UPSCALED')).toBe('UPSCALED');
    });
  });

  it('Test intersect', () => {
    expect(intersect([1, 2, 3], [2, 3, 4])).toStrictEqual([2, 3]);
    expect(intersect([1, 2, 3], [4, 5, 6])).toStrictEqual([]);
    expect(intersect([1, 2, 3], [1, 2, 3])).toStrictEqual([1, 2, 3]);
    expect(intersect([], [1, 2, 3])).toStrictEqual([]);
  });

  describe('Test normalize', () => {
    it('convert special chars to simple chars', () => {
      expect(normalize('àâçéèêëïîôùûüÿÀÂÇÉÈÊËÏÎÔÙÛÜŸäöüÄÖÜ')).toBe(
        'aaceeeeiiouuuyAACEEEEIIOUUUYaouAOU'
      );
    });
  });

  describe('Test filterByTag', () => {
    let posts: Post<string>[] = [];
    beforeEach(() => {
      posts = [
        {
          id: 1,
          tags: [
            {
              name: 'a',
              public_name: 'aa'
            },
            {
              name: 'b',
              public_name: 'bb'
            },
            {
              name: 'c',
              public_name: 'cc'
            },
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'e',
              public_name: 'ee'
            },
            {
              name: 'f',
              public_name: 'ff'
            }
          ]
        },
        {
          id: 2,
          tags: [
            {
              name: 'c',
              public_name: 'cc'
            }
          ]
        },
        {
          id: 3,
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            }
          ]
        },
        {
          id: 4,
          tags: [
            {
              name: 'e',
              public_name: 'ee'
            }
          ]
        },
        {
          id: 5,
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'g',
              public_name: 'gg'
            }
          ]
        }
      ];
    });

    it('returns all posts with tag "a"', () => {
      expect(filterByTag(posts, 'a')).toStrictEqual([
        {
          id: 1,
          tags: [
            {
              name: 'a',
              public_name: 'aa'
            },
            {
              name: 'b',
              public_name: 'bb'
            },
            {
              name: 'c',
              public_name: 'cc'
            },
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'e',
              public_name: 'ee'
            },
            {
              name: 'f',
              public_name: 'ff'
            }
          ]
        }
      ]);
    });
    it('returns all posts with tag "c"', () => {
      expect(filterByTag(posts, 'c')).toStrictEqual([
        {
          id: 1,
          tags: [
            {
              name: 'a',
              public_name: 'aa'
            },
            {
              name: 'b',
              public_name: 'bb'
            },
            {
              name: 'c',
              public_name: 'cc'
            },
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'e',
              public_name: 'ee'
            },
            {
              name: 'f',
              public_name: 'ff'
            }
          ]
        },
        {
          id: 2,
          tags: [
            {
              name: 'c',
              public_name: 'cc'
            }
          ]
        }
      ]);
    });
    it('returns all posts with tag "d"', () => {
      expect(filterByTag(posts, 'd')).toStrictEqual([
        {
          id: 1,
          tags: [
            {
              name: 'a',
              public_name: 'aa'
            },
            {
              name: 'b',
              public_name: 'bb'
            },
            {
              name: 'c',
              public_name: 'cc'
            },
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'e',
              public_name: 'ee'
            },
            {
              name: 'f',
              public_name: 'ff'
            }
          ]
        },
        {
          id: 3,
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            }
          ]
        },
        {
          id: 5,
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'g',
              public_name: 'gg'
            }
          ]
        }
      ]);
    });
    it('returns all posts with tag "e"', () => {
      expect(filterByTag(posts, 'e')).toStrictEqual([
        {
          id: 1,
          tags: [
            {
              name: 'a',
              public_name: 'aa'
            },
            {
              name: 'b',
              public_name: 'bb'
            },
            {
              name: 'c',
              public_name: 'cc'
            },
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'e',
              public_name: 'ee'
            },
            {
              name: 'f',
              public_name: 'ff'
            }
          ]
        },
        {
          id: 4,
          tags: [
            {
              name: 'e',
              public_name: 'ee'
            }
          ]
        }
      ]);
    });
    it('returns all posts with tag "d"', () => {
      expect(filterByTag(posts, 'g')).toStrictEqual([
        {
          id: 5,
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'g',
              public_name: 'gg'
            }
          ]
        }
      ]);
    });

    it('sorts when published dates exists', () => {
      posts[0].published_at = '1570572000';
      posts[1].published_at = '1722356572';
      posts[2].published_at = '1731376991';
      posts[3].published_at = '1617573600';
      posts[4].published_at = '1743413600';

      expect(filterByTag(posts, 'd')).toStrictEqual([
        {
          id: 5,
          published_at: '1743413600',
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'g',
              public_name: 'gg'
            }
          ]
        },
        {
          id: 3,
          published_at: '1731376991',
          tags: [
            {
              name: 'd',
              public_name: 'dd'
            }
          ]
        },
        {
          id: 1,
          published_at: '1570572000',
          tags: [
            {
              name: 'a',
              public_name: 'aa'
            },
            {
              name: 'b',
              public_name: 'bb'
            },
            {
              name: 'c',
              public_name: 'cc'
            },
            {
              name: 'd',
              public_name: 'dd'
            },
            {
              name: 'e',
              public_name: 'ee'
            },
            {
              name: 'f',
              public_name: 'ff'
            }
          ]
        }
      ]);
    });
  });

  describe('Test getTailwindColor', () => {
    const style = document.createElement('style');
    // mock tailwind style
    style.textContent = `
      .bg-red-500 { background-color: rgb(239, 68, 68); }
      .bg-blue-500 { background-color: rgb(59, 130, 246); }
      .bg-green-500 { background-color: rgb(34, 197, 94); }
    `;
    document.head.appendChild(style);

    it('get rgb values from class name', () => {
      expect(getTailwindColor('bg-red-500')).toBe('rgb(239, 68, 68)');
      expect(getTailwindColor('bg-blue-500')).toBe('rgb(59, 130, 246)');
      expect(getTailwindColor('bg-green-500')).toBe('rgb(34, 197, 94)');
    });

    it('also returns values for classes not found', () => {
      expect(getTailwindColor('bg-yellow-500')).toBe('rgba(0, 0, 0, 0)');
    });
  });

  describe('Test shuffle', () => {
    it('should not return the same array order', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      expect(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).not.toStrictEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      ]);

      randomSpy.mockRestore();
    });

    it('should not mutate the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];

      shuffle(original);

      expect(original).toEqual(copy);
    });
  });

  describe('Test humanFileSize', () => {
    it('returns octet', () => {
      expect(humanFileSize(0)).toBe('0 o');
      expect(humanFileSize(1)).toBe('1 o');
      expect(humanFileSize(1000)).toBe('1000 o');
    });
    it('returns kilooctet', () => {
      expect(humanFileSize(1024)).toBe('1 ko');
    });
    it('returns megaoctet', () => {
      expect(humanFileSize(1_048_576)).toBe('1 Mo');
    });
    it('returns gigaoctet', () => {
      expect(humanFileSize(1_073_741_824)).toBe('1 Go');
    });
    it('returns teraoctet', () => {
      expect(humanFileSize(1_099_511_627_776)).toBe('1 To');
    });
    it('returns teraoctet', () => {
      console.log(humanFileSize(1_125_899_906_842_624));
      expect(humanFileSize(1_125_899_906_842_624)).toBe('1024 To');
    });
  });
});
