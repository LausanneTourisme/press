<script lang="ts">
  import { RouteTypes, ThemeKeys, type Theme } from '$enums';
  import Figure from '$lib/components/Figure.svelte';
  import { route } from '$lib/helpers';
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
    length = 0
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

  const style = twMerge(
    'group flex items-end text-white relative min-h-64 h-full p-1 md:p-4 overflow-hidden transition-[filter]',
    gridPosition[gridIndex],
    additionalClass
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
        "absolute top-0 left-0 h-full w-full opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center",
        themeInformation.background
      )}
    >
      <div
        class="h-48 w-48 shadow {themeInformation.card} flex translate-y-96 flex-col items-center justify-center transition-transform group-hover:translate-y-0"
      >
        <Figure src={themeInformation.head} class="aspect-square max-h-24" />
        <Paragraph class="w-full px-2 text-center text-base font-medium text-gray-950">
          {$t(`themes.${theme}.themecard.more`)}
        </Paragraph>
      </div>
    </div>
  </Clickable>
  <div
    class="absolute top-0 left-0 -z-10 h-full w-full bg-zinc-200 transition-transform group-hover:scale-110"
  >
    <Image src={themeInformation.image} transform={themeInformation.transform ?? { g: 'auto', c: 'auto' }} />
  </div>
</article>
