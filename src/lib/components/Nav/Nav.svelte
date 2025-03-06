<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import DesktopNav from './DesktopNav.svelte';
  import MobileNav from './MobileNav.svelte';

  type NavProps = {
    hide?: boolean;
    class?: string;
  };

  const { hide = false, class: additionalClass }: NavProps = $props();
  const style = twMerge(
    `sticky left-0 top-0 z-11 h-[60px] w-full bg-base-200 dark:bg-base-300 shadow-lg transition-all xl:h-[120px] ${hide ? 'hidden' : ''}`,
    additionalClass
  );
</script>

<nav class={style} aria-labelledby="group-navigation">
  <DesktopNav class="hidden xl:flex" />
  <MobileNav class="flex xl:hidden" />
</nav>
