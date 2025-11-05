import { Forms, RouteTypes, Themes } from '$enums';
import { blankable, filename, getMediaLibraryRegisterLink, route } from '$lib/helpers';
import { describe, expect, it, vi } from 'vitest';
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
});
