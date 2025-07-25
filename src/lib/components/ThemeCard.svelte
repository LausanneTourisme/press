<script lang="ts">
  import { RouteTypes, ThemeKeys, type Theme } from '$enums';
  import Figure from '$lib/components/Figure.svelte';
  import { filename, route } from '$lib/helpers';
  import { ThemeDetails } from '$lib/helpers/themes';
  import { locale, t, type Locale } from '$lib/translations';
  import { blur } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import Clickable from './Clickable.svelte';
  import Heading from './Heading.svelte';
  import Paragraph from './Paragraph.svelte';
  import Image from './Media/Image.svelte';

  type Props = {
    class?: string;
    theme: Theme;
    gridIndex?: number;
    inverted?: boolean;
    length?: number;
  };

  const {
    class: additionalClass,
    theme,
    gridIndex = 0,
    inverted = false,
    length = 4
  }: Props = $props();

  const themeInformation = ThemeDetails[ThemeKeys[theme]];
  const gridPosition: Array<string> = !inverted
    ? [
        'md:col-span-2 md:row-span-4',
        'md:row-span-8 md:col-start-3',
        length === 3
          ? 'md:col-span-2 md:row-span-4 md:row-start-5'
          : 'md:row-span-4 md:row-start-5',
        'md:row-span-4 md:row-start-5'
      ]
    : [
        'md:row-span-8',
        'md:col-span-2 md:row-span-4',
        'md:row-span-4 md:col-start-2 md:row-start-5',
        'md:row-span-4 md:col-start-3 md:row-start-5'
      ];

  const imageSizes = () => {
    if (length === 4) {
      if (inverted) {
        switch (gridIndex) {
          case 0:
            return { height: 960, width: 480 };
          case 1:
            return { height: 480, width: 960 };
        }
      } else {
        switch (gridIndex) {
          case 0:
            return { height: 480, width: 960 };
          case 1:
            return { height: 960, width: 480 };
        }
      }
    } else if (length === 3) {
        switch (gridIndex) {
          case 0:
          case 2:
            return { height: 480, width: 960 };
          case 1:
            return { height: 960, width: 480 };
        }
    }

    return { height: 360, width: 360 };
  };
  const style = twMerge(
    'group flex items-end text-white relative min-h-64 h-full p-1 md:p-4 overflow-hidden transition-[filter]',
    gridPosition[gridIndex],
    additionalClass,
    `grind_index=${gridIndex}-${length}`
  );
</script>

<article class={style} in:blur={{ delay: 150 * gridIndex, opacity: 0.2 }}>
  <Clickable href={route(RouteTypes.Themes, { theme, forceLocale: $locale as Locale })}>
    <Heading
      tag="h3"
      class="translate-y-0 p-2 text-white opacity-100 shadow-gray-950 transition-transform [text-shadow:_0_0_10px_var(--tw-shadow-color)] group-hover:translate-y-72 group-hover:opacity-0 md:p-4"
    >
      {$t(`themes.${theme}.title`)}
    </Heading>
    <div
      class={twMerge(
        'absolute top-0 left-0 flex h-full w-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100',
        `${themeInformation.background}`
      )}
    >
      <div
        class="h-48 w-48 shadow {themeInformation.card} flex translate-y-96 flex-col items-center justify-center transition-transform group-hover:translate-y-0"
      >
        <Figure
          src={themeInformation.head}
          transform={{ height: 120, width: 120 }}
          class="aspect-square max-h-24"
        />
        <Paragraph class="w-full px-2 text-center text-base font-medium text-gray-950">
          {$t(`themes.${theme}.themecard.more`)}
        </Paragraph>
      </div>
    </div>
  </Clickable>
  <div
    class="absolute top-0 left-0 -z-10 h-full w-full bg-zinc-200 transition-transform group-hover:scale-110"
  >
    <Image
      alt={$t(`themes.${theme}.title`)}
      src={filename(themeInformation.image, false)}
      localSrc={themeInformation.image}
      transform={{
        crop: 'auto',
        gravity: 'south',
        ...themeInformation.transform,
        ...imageSizes(),
      }}
    />
  </div>
</article>
