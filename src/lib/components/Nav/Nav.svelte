<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import DesktopNav from './DesktopNav.svelte';
  import MobileNav from './MobileNav.svelte';
  import type { Locale } from '$lib/translations';

  type NavProps = {
    hide?: boolean;
    class?: string;
    locale: Locale;
  };

  const { hide = false, class: additionalClass, locale }: NavProps = $props();
  const style = $derived.by(() =>
    twMerge(
      `sticky left-0 top-0 z-11 h-[60px] w-full bg-base-200 dark:bg-base-300 shadow-lg transition-all xl:h-[120px] ${hide ? 'hidden' : ''}`,
      additionalClass
    )
  );
</script>

<nav class={style} aria-labelledby="group-navigation" id="main-nav">
  <DesktopNav class="hidden xl:flex" {locale} />
  <MobileNav class="flex xl:hidden" {locale} />
</nav>
