<script lang="ts">
  import Image from '$lib/components/Image.svelte';
  import { menuItems } from '$lib/helpers/menu';
  import { t, locale, type Locale } from '$lib/translations';
  import { twMerge } from 'tailwind-merge';
  import Link from './Link.svelte';
  import { route } from '$lib/helpers';
  import { RouteTypes } from '$enums';
  import Button from './Button.svelte';
  import { page } from '$app/state';
  import { ChevronDown } from 'lucide-svelte';

  type NavProps = {
    hide?: boolean;
    class?: string;
  };

  const { hide = false, class: additionalClass }: NavProps = $props();
  const style = twMerge(
    `sticky left-0 top-0 z-11 h-[60px] w-full bg-base-200 dark:bg-base-300 shadow-lg transition-all xl:h-[120px] ${hide ? 'hidden' : ''}`,
    additionalClass
  );

  let open: boolean | null = false;
  let label: HTMLLabelElement | undefined = $state();
  const onclick: (e: Event) => void = (e) => {
    if (open) {
      label?.click(); // close menu
      open = false; // resetting open
    }
  };
</script>

<nav class={style}>
  <div class="flex h-full items-center justify-between">
    <a
      href={route(RouteTypes.Home)}
      class="group my-2 flex max-w-[230px] cursor-pointer border-0 px-0 py-2 pl-[15px] transition-all hover:invert-25 dark:invert dark:hover:invert-75"
    >
      <Image
        src="/images/logo_{$locale === 'fr' ? 'fr' : 'en'}.svg"
        alt="Lausanne Capitale Olympique"
        class="w-[117px] max-w-[230px] xl:w-[170px] 2xl:w-[230px] dark:text-white"
      />
    </a>
    <div class="ml-6 hidden h-full grow items-center justify-start xl:flex">
      <!-- Desktop menu -->
      {#each menuItems($locale as Locale) as item}
        <div class="dropdown dropdown-hover group">
          <div tabindex="0" role="button" class="m-3 rounded-none">
            <p class="py-9 text-[17px] font-bold">
              {#if item.link}
                <Link
                  class="justify-between p-2 text-left font-bold"
                  href={item.link}
                  preload="tap"
                  withIcon={false}
                >
                  {item.title}
                </Link>
              {:else}
                <span class="hover:opacity-75">{item.title}</span>
              {/if}
            </p>
          </div>
          {#if item.items && item.items.length}
            {@const items = item.items}
            <ul
              class="items-list dropdown-content bg-base-200 dark:bg-base-300 group-hover:border-t-brand-600 z-1 w-[450px] border-t border-t-transparent p-2 shadow-xs"
            >
              {#each items as item}
                {#snippet icon()}
                  {#if item.icon}
                    {@const Component = item.icon}
                    <Component strokeWidth={item.strokeWidth ?? 3} class="ml-2 inline h-4 w-4" />
                  {/if}
                {/snippet}
                <li>
                  <Link
                    class="items-list-element hover:text-brand-600 hover:bg-base-100 justify-between px-6 py-4 text-left text-[20px] font-medium hover:rounded-sm hover:border-none hover:underline hover:opacity-100"
                    href={item.link}
                    preload="tap"
                    icon={item.icon ? icon : undefined}
                  >
                    {item.title}
                  </Link>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
      <!-- End desktop menu -->
    </div>
    <div class="flex h-full items-center justify-between px-6">
      <Button
        href={route(RouteTypes.Contact)}
        {onclick}
        class="invertable hidden px-3 xl:block"
        tag="a"
      >
        {$t('common.contact-us')}
      </Button>

      <!-- Desktop locales selector -->
      <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button" class="mx-8 rounded-none xl:ml-5">
          <p class="text-brand-600 flex items-center py-3 font-bold">
            {$locale.toUpperCase()}
            {#if page.data.seo.alternate.length > 1}
              <ChevronDown strokeWidth={3} class="text-base-content invertable ml-2 h-4 w-4" />
            {/if}
          </p>

          {#if page.data.seo.alternate.length > 1}
            <ul
              class="items-list dropdown-content group bg-base-200 dark:bg-base-300 border-t-brand-600 z-1 w-16 border-t p-2 shadow-xs"
            >
              {#each page.data.seo.alternate as alternate}
                {#if alternate.hreflang !== $locale}
                  <li>
                    <Link
                      class="items-list-element text-brand-600 hover:bg-base-100 flex items-center justify-center py-3 text-center font-bold opacity-75 transition-all hover:rounded-sm hover:opacity-100"
                      href={alternate.href}
                      withIcon={false}
                      preload="tap"
                    >
                      {alternate.hreflang.toUpperCase()}
                    </Link>
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>

<style lang="postcss">
  @media (prefers-color-scheme: light) {
    :global(.invert-colours .invertable) {
      filter: invert(100%);
    }

    :global(.invert-colours .items-list) {
    }

    :global(.invert-colours .items-list-element) {
      color: #1e1e1f;
    }
  }
</style>
