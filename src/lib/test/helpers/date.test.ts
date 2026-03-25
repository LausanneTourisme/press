import {
  extractStartEndDate,
  findAvailablePeriod,
  isBetween,
  isSameDays,
  sortByYears,
  sortDates,
  sortPeriods
} from '$lib/helpers/date';
import type { Event, Post, RawDate, ShortDay, Translatable } from '$types';
import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Test helper: Date', () => {
  const event: Event<Translatable> = {
    id: 17048,
    name: {
      fr: 'Astronomie: découvrez le ciel lausannois'
    },
    lead: {
      fr: 'Au moyen de télescopes et en présence de moniteurs pour répondre à vos questions.'
    },
    languages: ['fr'],
    highlight: false,
    schedules: undefined,
    medias: [
      {
        is_cover: true,
        cloudinary_id: '9472Astronomiedecouvrezleciellausannois0',
        copyright: '© Droits réservés',
        public_name: {
          fr: 'Astronomie: découvrez le ciel lausannois'
        },
        original_width: 800,
        original_height: 600,
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    seo: {
      slug: {
        fr: 'astronomie-decouvrez-le-ciel-lausannois'
      },
      hreflang: {
        fr: '/fr/evenement/astronomie-decouvrez-le-ciel-lausannois'
      }
    },
    tags: [
      {
        id: 85,
        name: 'Autres',
        public_name: {
          fr: 'Autres',
          en: 'Others',
          de: 'Andere'
        }
      }
    ]
  };

  //reset dates
  beforeEach(() => {
    event.schedules = {
      dates: [
        {
          label: null,
          every_year: false,
          open_days: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
          week: [
            {
              days: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
              times: []
            }
          ],
          periods: [
            {
              start: '2027-06-30',
              end: '2027-06-30'
            },
            {
              start: '2025-01-01',
              end: '2025-12-31'
            },
            {
              start: '2023-01-01',
              end: '2024-12-31'
            },
            {
              start: '2027-01-01',
              end: '2027-06-29'
            }
          ]
        }
      ],
      exceptions: {
        range: {
          from: '2023-01-01',
          to: '2027-06-30'
        },
        dates: []
      }
    };
  });

  describe('Test extractStartEndDate', () => {
    it('returns first period', () => {
      expect(
        extractStartEndDate(event, {
          start: '2020-01-01',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2023-01-01'),
        end: DateTime.fromSQL('2024-12-31')
      });

      expect(
        extractStartEndDate(event, {
          start: '2024-01-01',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2023-01-01'),
        end: DateTime.fromSQL('2024-12-31')
      });

      expect(
        extractStartEndDate(event, {
          start: '2024-12-31',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2023-01-01'),
        end: DateTime.fromSQL('2024-12-31')
      });

      expect(
        extractStartEndDate(event, {
          start: '2024-01-01',
          end: '2025-12-31'
        })
      ).toEqual({
        start: DateTime.fromSQL('2023-01-01'),
        end: DateTime.fromSQL('2024-12-31')
      });
    });

    it('returns second period', () => {
      expect(
        extractStartEndDate(event, {
          start: '2025-01-01',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2025-01-01'),
        end: DateTime.fromSQL('2025-12-31')
      });

      expect(
        extractStartEndDate(event, {
          start: '2025-01-01',
          end: '2025-12-31'
        })
      ).toEqual({
        start: DateTime.fromSQL('2025-01-01'),
        end: DateTime.fromSQL('2025-12-31')
      });

      expect(
        extractStartEndDate(event, {
          start: '2025-06-20',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2025-01-01'),
        end: DateTime.fromSQL('2025-12-31')
      });
    });

    it('returns third period', () => {
      expect(
        extractStartEndDate(event, {
          start: '2026-01-01',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2027-01-01'),
        end: DateTime.fromSQL('2027-06-29')
      });

      expect(
        extractStartEndDate(event, {
          start: '2026-12-31',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2027-01-01'),
        end: DateTime.fromSQL('2027-06-29')
      });

      expect(
        extractStartEndDate(event, {
          start: '2026-12-31',
          end: '2030-12-31'
        })
      ).toEqual({
        start: DateTime.fromSQL('2027-01-01'),
        end: DateTime.fromSQL('2027-06-29')
      });
    });

    it('returns last period', () => {
      expect(
        extractStartEndDate(event, {
          start: '2027-06-30',
          end: undefined
        })
      ).toEqual({
        start: DateTime.fromSQL('2027-06-30'),
        end: DateTime.fromSQL('2027-06-30')
      });

      expect(
        extractStartEndDate(event, {
          start: '2027-06-30',
          end: '2027-06-30'
        })
      ).toEqual({
        start: DateTime.fromSQL('2027-06-30'),
        end: DateTime.fromSQL('2027-06-30')
      });
    });

    it('returns undefined on invalid periods', () => {
      expect(
        extractStartEndDate(event, {
          start: '2030-01-01',
          end: undefined
        })
      ).toBeUndefined();

      expect(
        extractStartEndDate(event, {
          start: '2020-01-01',
          end: '2022-12-31'
        })
      ).toBeUndefined();

      expect(
        extractStartEndDate(event, {
          start: '2023-01-01',
          end: '2022-12-31'
        })
      ).toBeUndefined();

      expect(
        extractStartEndDate(event, {
          start: '2026-01-01',
          end: '2026-12-31'
        })
      ).toBeUndefined();

      expect(
        extractStartEndDate(event, {
          start: '2027-07-01',
          end: undefined
        })
      ).toBeUndefined();

      expect(
        extractStartEndDate(event, {
          start: '2027-07-01',
          end: '2027-01-01'
        })
      ).toBeUndefined();

      expect(
        extractStartEndDate(event, {
          start: '2027-07-01',
          end: '2030-12-31'
        })
      ).toBeUndefined();
    });
  });

  describe('Test isSameDays', () => {
    it('is same day', () => {
      expect(isSameDays(event, { start: '2027-06-30', end: undefined })).toBeTruthy();
      expect(isSameDays(event, { start: '2027-06-30', end: '2030-12-31' })).toBeTruthy();
    });

    it('is not same day', () => {
      expect(isSameDays(event, { start: '2027-01-01', end: '2027-06-29' })).toBeFalsy();
      expect(isSameDays(event, { start: '2027-06-29', end: '2027-06-29' })).toBeFalsy();
      expect(isSameDays(event, { start: '2027-06-29', end: undefined })).toBeFalsy();
      expect(isSameDays(event, { start: '2060-01-01', end: undefined })).toBeFalsy();
    });
  });

  describe('Test findAvailablePeriod', () => {
    it('find a period', () => {
      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(0)!,
          DateTime.fromSQL('2022-01-01'),
          undefined
        )
      ).toEqual({
        start: '2023-01-01',
        end: '2024-12-31'
      });
      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(0)!,
          DateTime.fromSQL('2023-01-01'),
          DateTime.fromSQL('2024-12-31')
        )
      ).toEqual({
        start: '2023-01-01',
        end: '2024-12-31'
      });
      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(0)!,
          DateTime.fromSQL('2025-01-01'),
          DateTime.fromSQL('2025-12-31')
        )
      ).toEqual({
        start: '2025-01-01',
        end: '2025-12-31'
      });
      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(0)!,
          DateTime.fromSQL('2027-01-01'),
          DateTime.fromSQL('2027-06-29')
        )
      ).toEqual({
        start: '2027-01-01',
        end: '2027-06-29'
      });
      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(0)!,
          DateTime.fromSQL('2027-06-30'),
          DateTime.fromSQL('2027-06-30')
        )
      ).toEqual({
        start: '2027-06-30',
        end: '2027-06-30'
      });
    });

    it('find a period based on today', () => {
      const days = [
        DateTime.now()
          .toLocaleString({ weekday: 'short' }, { locale: 'en' })
          .substring(0, 2)
          .toLocaleLowerCase()
      ] as ShortDay[];

      event.schedules!.dates = [
        {
          label: 'today land',
          every_year: false,
          open_days: days,
          week: [
            {
              days,
              times: []
            }
          ],
          periods: [
            {
              start: DateTime.now().toSQLDate() as RawDate,
              end: DateTime.now().toSQLDate() as RawDate
            }
          ]
        },
        ...(event.schedules?.dates ?? [])
      ];

      expect(findAvailablePeriod(event.schedules!.dates!.at(0)!, undefined, undefined)).toEqual({
        start: DateTime.now().toSQLDate() as RawDate,
        end: DateTime.now().toSQLDate() as RawDate
      });
      expect(
        findAvailablePeriod(event.schedules!.dates!.at(0)!, DateTime.now(), undefined)
      ).toEqual({
        start: DateTime.now().toSQLDate() as RawDate,
        end: DateTime.now().toSQLDate() as RawDate
      });
      expect(
        findAvailablePeriod(event.schedules!.dates!.at(0)!, DateTime.now(), DateTime.now())
      ).toEqual({
        start: DateTime.now().toSQLDate() as RawDate,
        end: DateTime.now().toSQLDate() as RawDate
      });
      expect(
        findAvailablePeriod(event.schedules!.dates!.at(0)!, undefined, DateTime.now())
      ).toEqual({
        start: DateTime.now().toSQLDate() as RawDate,
        end: DateTime.now().toSQLDate() as RawDate
      });
    });

    it("doesn't find a period", () => {
      const days = [
        DateTime.now()
          .toLocaleString({ weekday: 'short' }, { locale: 'en' })
          .substring(0, 2)
          .toLocaleLowerCase()
      ] as ShortDay[];

      event.schedules!.dates = [
        {
          label: 'past land',
          every_year: false,
          open_days: days,
          week: [
            {
              days,
              times: []
            }
          ],
          periods: [
            {
              start: '2000-05-20',
              end: '2001-10-10'
            }
          ]
        },
        ...(event.schedules?.dates ?? [])
      ];

      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(0)!,
          undefined,
          DateTime.fromSQL('1999-06-30')
        )
      ).toBeNull();
      // it test "now"
      expect(findAvailablePeriod(event.schedules!.dates!.at(0)!, undefined, undefined)).toBeNull();
      expect(
        findAvailablePeriod(
          event.schedules!.dates!.at(1)!,
          DateTime.fromSQL('2090-06-30'),
          undefined
        )
      ).toBeNull();
    });
  });

  it('Test sortPeriods', () => {
    event.schedules!.dates!.at(0)!.periods = [
      {
        start: '2023-01-01',
        end: undefined
      },
      {
        start: undefined,
        end: undefined
      },
      {
        start: undefined,
        end: '2090-01-01'
      },
      {
        start: '2024-01-01',
        end: undefined
      },
      ...event.schedules!.dates!.at(0)!.periods!
    ];

    expect(sortPeriods(event.schedules!.dates!.at(0)!.periods!)).toEqual([
      {
        start: undefined,
        end: undefined
      },
      {
        start: undefined,
        end: '2090-01-01'
      },
      {
        start: '2023-01-01',
        end: undefined
      },
      {
        start: '2023-01-01',
        end: '2024-12-31'
      },
      {
        start: '2024-01-01',
        end: undefined
      },
      {
        start: '2025-01-01',
        end: '2025-12-31'
      },
      {
        start: '2027-01-01',
        end: '2027-06-29'
      },
      {
        start: '2027-06-30',
        end: '2027-06-30'
      }
    ]);
  });

  it('Test sortDates', () => {
    const todayDay = DateTime.now();
    const pastDay = DateTime.now().minus({ years: 50 });

    event.schedules!.dates = [
      {
        label: 'past day',
        every_year: true,
        open_days: [
          pastDay
            .toLocaleString({ weekday: 'short' }, { locale: 'en' })
            .substring(0, 2)
            .toLocaleLowerCase() as ShortDay
        ],
        week: [
          {
            days: [
              pastDay
                .toLocaleString({ weekday: 'short' }, { locale: 'en' })
                .substring(0, 2)
                .toLocaleLowerCase() as ShortDay
            ],
            times: []
          }
        ],
        periods: [
          {
            start: pastDay.toSQLDate() as RawDate,
            end: pastDay.toSQLDate() as RawDate
          }
        ]
      },
      {
        label: 'today land',
        every_year: false,
        open_days: [
          todayDay
            .toLocaleString({ weekday: 'short' }, { locale: 'en' })
            .substring(0, 2)
            .toLocaleLowerCase() as ShortDay
        ],
        week: [
          {
            days: [
              todayDay
                .toLocaleString({ weekday: 'short' }, { locale: 'en' })
                .substring(0, 2)
                .toLocaleLowerCase() as ShortDay
            ],
            times: []
          }
        ],
        periods: [
          {
            start: DateTime.now().toSQLDate() as RawDate,
            end: DateTime.now().toSQLDate() as RawDate
          }
        ]
      },
      ...(event.schedules?.dates ?? [])
    ];

    expect(sortDates(event.schedules!.dates)).toEqual([
      {
        label: 'past day',
        every_year: true,
        open_days: [
          pastDay
            .toLocaleString({ weekday: 'short' }, { locale: 'en' })
            .substring(0, 2)
            .toLocaleLowerCase() as ShortDay
        ],
        week: [
          {
            days: [
              pastDay
                .toLocaleString({ weekday: 'short' }, { locale: 'en' })
                .substring(0, 2)
                .toLocaleLowerCase() as ShortDay
            ],
            times: []
          }
        ],
        periods: [
          {
            start: pastDay.toSQLDate() as RawDate,
            end: pastDay.toSQLDate() as RawDate
          }
        ]
      },
      {
        label: null,
        every_year: false,
        open_days: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
        week: [
          {
            days: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
            times: []
          }
        ],
        periods: [
          {
            start: '2023-01-01',
            end: '2024-12-31'
          },
          {
            start: '2025-01-01',
            end: '2025-12-31'
          },
          {
            start: '2027-01-01',
            end: '2027-06-29'
          },
          {
            start: '2027-06-30',
            end: '2027-06-30'
          }
        ]
      },
      {
        label: 'today land',
        every_year: false,
        open_days: [
          todayDay
            .toLocaleString({ weekday: 'short' }, { locale: 'en' })
            .substring(0, 2)
            .toLocaleLowerCase() as ShortDay
        ],
        week: [
          {
            days: [
              todayDay
                .toLocaleString({ weekday: 'short' }, { locale: 'en' })
                .substring(0, 2)
                .toLocaleLowerCase() as ShortDay
            ],
            times: []
          }
        ],
        periods: [
          {
            start: DateTime.now().toSQLDate() as RawDate,
            end: DateTime.now().toSQLDate() as RawDate
          }
        ]
      }
    ]);
  });

  describe('Test isBetween', () => {
    it('is not between', () => {
      expect(isBetween({ start: undefined, end: '2010-01-01' }, undefined, undefined)).toBeFalsy();
      expect(
        isBetween(
          { start: undefined, end: '2010-01-01' },
          DateTime.fromSQL('2010-01-02'),
          undefined
        )
      ).toBeFalsy();
      expect(
        isBetween({ start: undefined, end: '2010-01-01' }, DateTime.now(), undefined)
      ).toBeFalsy();
      expect(
        isBetween(
          { start: '2010-01-01', end: undefined },
          DateTime.fromSQL('2009-01-01'),
          undefined
        )
      ).toBeFalsy();
      expect(
        isBetween(
          { start: '2010-01-01', end: undefined },
          DateTime.fromSQL('2009-12-31'),
          undefined
        )
      ).toBeFalsy();
    });
    it('is between', () => {
      expect(
        isBetween(
          { start: undefined, end: '2010-01-01' },
          DateTime.fromSQL('2009-01-01'),
          undefined
        )
      ).toBeTruthy();
      expect(
        isBetween(
          { start: undefined, end: '2010-01-01' },
          DateTime.fromSQL('2010-01-01'),
          undefined
        )
      ).toBeTruthy();
      expect(
        isBetween(
          { start: '2010-01-01', end: undefined },
          DateTime.fromSQL('2010-01-01'),
          undefined
        )
      ).toBeTruthy();
      expect(
        isBetween(
          { start: '2010-01-01', end: undefined },
          DateTime.fromSQL('2010-01-02'),
          undefined
        )
      ).toBeTruthy();
      expect(
        isBetween({ start: '2010-01-01', end: undefined }, DateTime.now(), undefined)
      ).toBeTruthy();
      expect(
        isBetween(
          { start: '2010-01-01', end: '2015-01-01' },
          DateTime.fromSQL('2010-12-31'),
          undefined
        )
      ).toBeTruthy();
      expect(
        isBetween(
          { start: '2010-01-01', end: '2015-01-01' },
          DateTime.fromSQL('2009-12-31'),
          DateTime.fromSQL('2010-12-31')
        )
      ).toBeTruthy();
      expect(
        isBetween(
          { start: '2010-01-01', end: '2015-01-01' },
          DateTime.fromSQL('2009-12-31'),
          DateTime.fromSQL('2016-12-31')
        )
      ).toBeTruthy();
    });
  });

  it('Test posts by year', () => {
    const posts: Post<string>[] = [
      {
        // 2027-05-14
        published_at: '1810245600'
      },
      {
        // 2027-02-12
        published_at: '1802386800'
      },
      {
        // 2027-03-31
        published_at: '1806444000'
      },
      {
        // 2027-05-13
        published_at: '1810159200'
      },
      {
        // 2021-01-14
        published_at: '1610578800'
      },
      {
        // 2023-09-20
        published_at: '1695160800'
      },
      {
        // 2025-03-09
        published_at: '1741474800'
      },
      {
        // 2025-03-03
        published_at: '1740956400'
      },
      {
        // 2025-06-18
        published_at: '1750197600'
      },
      {
        // 2025-08-20
        published_at: '1755640800'
      }
    ];

    const expectedValues = new Map<number, Post<string>[]>();
    expectedValues.set(2027, [
      {
        published_at: '1810245600'
      },
      {
        published_at: '1802386800'
      },
      {
        published_at: '1806444000'
      },
      {
        published_at: '1810159200'
      }
    ]);
    expectedValues.set(2021, [
      {
        published_at: '1610578800'
      }
    ]);
    expectedValues.set(2023, [
      {
        published_at: '1695160800'
      }
    ]);
    expectedValues.set(2025, [
      {
        published_at: '1741474800'
      },
      {
        published_at: '1740956400'
      },
      {
        published_at: '1750197600'
      },
      {
        published_at: '1755640800'
      }
    ]);

    expect(sortByYears(posts)).toStrictEqual(expectedValues);
  });
});
