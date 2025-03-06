<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes } from '$enums';
  import { route } from '$lib/helpers';
  import { menuItems } from '$lib/helpers/menu';
  import { locale, t, type Locale } from '$lib/translations';
  import { ChevronDown, Menu, X } from 'lucide-svelte';
  import { onDestroy, onMount } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import Button from '../Button.svelte';
  import Link from '../Link.svelte';
  import Shelf from '../Shelf.svelte';
  import SocialNetworks from '../SocialNetworks.svelte';
  import Logo from './Logo.svelte';

  type Props = {
    class?: string;
    maxWidth?: number; //max width to trigger the auto close of the menu on window size change
  };

  const { class: additionalClass, maxWidth = 1280 }: Props = $props();
  const style: string = twMerge('flex h-full items-center justify-between', additionalClass);

  let open = $state(false);
  let openShelfIndex: number | null = $state(null); // Stores which shelf is open

  const toggleMenu = () => {
    open = !open;
    document.body.classList.toggle('overflow-hidden', open);
    if (!open) openShelfIndex = null;
  };

  const closeMenu = () => {
    open = false;
    openShelfIndex = null;
    document.body.classList.toggle('overflow-hidden', open);
  };

  const toggleShelf: (index: number) => void = (index) => {
    openShelfIndex = openShelfIndex === index ? null : index;
  };

  onMount(() => {
    document.body.classList.remove('overflow-hidden');

    const mediaQuery = window.matchMedia(`(min-width: ${maxWidth}px)`);

    const handleResize = () => {
      if (mediaQuery.matches) {
        open = false;
      }
    };

    mediaQuery.addEventListener('change', handleResize);

    onDestroy(() => {
      mediaQuery.removeEventListener('change', handleResize);
    });
  });
</script>

<nav class={style} aria-labelledby="mobile-navigation">
  <a
    href={route(RouteTypes.Home)}
    class="group my-2 flex max-w-[230px] cursor-pointer border-0 px-0 py-2 pl-[15px]"
  >
    <Logo />
  </a>
  <div class="flex h-full items-center px-6">
    <!-- locales selector -->
    <div class="dropdown dropdown-hover group">
      <div tabindex="0" role="button" class="mx-8 my-3 rounded-none">
        <p class="text-brand-600 flex items-center py-1.5 text-[17px] font-bold xl:py-9">
          <span>{$locale.toUpperCase()}</span>
          {#if page.data.seo.alternate.length > 1}
            <ChevronDown strokeWidth={3} class="text-base-content invertable ml-2 h-4 w-4" />
          {/if}
        </p>
      </div>
      {#if page.data.seo.alternate.length > 1}
        <div>
          <ul
            class="items-list dropdown-content bg-base-200 dark:bg-base-300 border-t-brand-600 left-5 z-1 w-16 border-t p-2 shadow-xs"
          >
            {#key page.url}
              {#each page.data.seo.alternate as alternate}
                <li>
                  <Link
                    class={`items-list-element text-brand-600 hover:bg-base-100 flex items-center justify-center py-3 text-center font-bold opacity-100 transition-all hover:rounded-sm hover:opacity-75 ${alternate.hreflang === $locale ? 'hidden' : ''}`}
                    href={alternate.href}
                    preload="tap"
                    withIcon={false}
                  >
                    {alternate.hreflang.toUpperCase()}
                  </Link>
                </li>
              {/each}
            {/key}
          </ul>
        </div>
      {/if}
    </div>
    <button class="cursor-pointer xl:hidden" aria-label="open menu" onclick={toggleMenu}>
      <Menu class="text-brand-600 h-6 w-6" />
    </button>
  </div>
  <!-- Full-Page Drawer -->
  <div
    class="bg-base-100 dark:bg-base-dark fixed inset-0 z-50 flex flex-col transition-transform duration-300"
    class:translate-x-full={!open}
  >
    <!-- HEADER -->
    <div class="bg-base-200 flex h-[60px] w-full items-center justify-between p-4">
      <a href={route(RouteTypes.Home)} class="flex max-w-[230px] cursor-pointer">
        <Logo />
      </a>
      <div class="flex">
        <!-- locales selector -->
        <div class="dropdown dropdown-hover group">
          <div tabindex="0" role="button" class="mx-8 my-3 rounded-none">
            <p class="text-brand-600 flex items-center py-1.5 text-[17px] font-bold xl:py-9">
              <span>{$locale.toUpperCase()}</span>
              {#if page.data.seo.alternate.length > 1}
                <ChevronDown strokeWidth={3} class="text-base-content invertable ml-2 h-4 w-4" />
              {/if}
            </p>
          </div>
          {#if page.data.seo.alternate.length > 1}
            <div>
              <ul
                class="items-list dropdown-content bg-base-200 dark:bg-base-300 border-t-brand-600 left-5 z-1 w-16 border-t p-2 shadow-xs"
              >
                {#key page.url}
                  {#each page.data.seo.alternate as alternate}
                    <li>
                      <Link
                        class={`items-list-element text-brand-600 hover:bg-base-100 flex items-center justify-center py-3 text-center font-bold opacity-100 transition-all hover:rounded-sm hover:opacity-75 ${alternate.hreflang === $locale ? 'hidden' : ''}`}
                        href={alternate.href}
                        preload="tap"
                        withIcon={false}
                      >
                        {alternate.hreflang.toUpperCase()}
                      </Link>
                    </li>
                  {/each}
                {/key}
              </ul>
            </div>
          {/if}
        </div>
        <button class="cursor-pointer" aria-label="close menu" onclick={toggleMenu}>
          <X class="text-brand-600 h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- BODY -->
    <div class="flex-grow overflow-auto p-4">
      <div class="flex flex-col gap-2">
        {#each menuItems($locale as Locale) as item, index}
          {#if item.link}
            <Link
              class="flex justify-between rounded-md p-4 text-left font-semibold hover:bg-slate-100 dark:hover:bg-slate-600"
              href={item.link}
              preload="tap"
              onclick={closeMenu}
            >
              {item.title}
            </Link>
          {:else if item.items}
            {@const subItems = item.items}
            <Shelf
              onToggle={() => {
                toggleShelf(index);
              }}
              isOpen={openShelfIndex === index}
              titleClass="hover:opacity-75 rounded-md p-3 pr-4 hover:bg-slate-100 dark:hover:bg-slate-600"
              title={item.title}
            >
              {#each subItems as subItem}
                {#snippet icon()}
                  {#if subItem.icon}
                    {@const Component = subItem.icon}
                    <Component
                      strokeWidth={subItem.strokeWidth ?? 3}
                      class="mr-4 ml-2 inline h-4 w-4"
                    />
                  {/if}
                {/snippet}
                <Link
                  class="flex justify-between rounded-md p-3 text-left font-semibold hover:bg-slate-100 dark:hover:bg-slate-600"
                  href={subItem.link}
                  preload="tap"
                  icon={subItem.icon ? icon : undefined}
                  classIcon={'mr-4'}
                  onclick={closeMenu}
                >
                  <span class="pl-4">{subItem.title}</span>
                </Link>
              {/each}
            </Shelf>
          {/if}
        {/each}
      </div>
    </div>

    <!-- FOOTER -->

    <div class="bg-base-200 flex flex-shrink flex-col justify-end px-6 py-4">
      <Button href={route(RouteTypes.Contact)} class="invertable block px-3" tag="a">
        {$t('common.contact-us')}
      </Button>
      <div class="flex justify-center pt-2">
        <SocialNetworks />
      </div>
    </div>
  </div>
</nav>
