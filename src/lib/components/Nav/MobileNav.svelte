<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes } from '$enums';
  import Image from '$lib/components/Image.svelte';
  import { route } from '$lib/helpers';
  import { menuItems } from '$lib/helpers/menu';
  import { locale, t, type Locale } from '$lib/translations';
  import { ChevronDown, Menu, X } from 'lucide-svelte';
  import Button from '../Button.svelte';
  import Link from '../Link.svelte';
  import { twMerge } from 'tailwind-merge';
  import { onMount } from 'svelte';

  type Props = {
    class?: string;
  };

  const { class: additionalClass }: Props = $props();
  const style = twMerge('flex h-full items-center justify-between', additionalClass);

  let open = $state(false);
  const toggleMenu = () => {
    open = !open;
    document.body.classList.toggle('overflow-hidden', open);
  };

  const closeMenu = () => {
    open = false;
    document.body.classList.toggle('overflow-hidden', open);
  }

  onMount(() => {
    document.body.classList.remove('overflow-hidden');
  });
</script>

<nav class={style} aria-labelledby="mobile-navigation">
  <a href={route(RouteTypes.Home)} class="group my-2 flex max-w-[230px] cursor-pointer border-0 px-0 py-2 pl-[15px]">
    <Image src="/images/logo_{$locale === 'fr' ? 'fr' : 'en'}.svg" alt="Lausanne Capitale Olympique" class="w-[117px] xl:w-[170px] 2xl:w-[230px] dark:text-white" />
  </a>
  <div class="flex h-full items-center px-6">

    <!-- Desktop locales selector -->
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
</nav>

<!-- Full-Page Drawer -->
<div class="fixed inset-0 bg-base-100 z-50 transition-transform duration-300" class:translate-x-full={!open}>
  <div class="bg-base-200 flex h-[60px] w-full items-center justify-between p-4">
    <a href={route(RouteTypes.Home)} class="flex max-w-[230px] cursor-pointer">
      <Image src="/images/logo_{$locale === 'fr' ? 'fr' : 'en'}.svg" alt="Lausanne Capitale Olympique" class="w-[117px] xl:w-[170px] 2xl:w-[230px] dark:text-white" />
    </a>
    <button class="cursor-pointer" aria-label="close menu" onclick={toggleMenu}>
      <X class="text-brand-600 h-6 w-6" />
    </button>
  </div>

  <div class="p-4">
    <div class="flex flex-col gap-2">
      {#each menuItems($locale as Locale) as item}
      {#if item.link}
      <Link class="p-4 text-left font-semibold hover:bg-slate-100" href={item.link} preload="tap" withIcon={false}>
        {item.title}
      </Link>
      {:else}
          {@const subItems = item.items}
          <details class="bg-base-200 p-3 rounded-md">
            <summary class="font-semibold cursor-pointer">{item.title}</summary>
            <div class="pl-4 mt-2 space-y-2">
              {#each subItems as subItem}
                <Link class="block p-3 text-left font-semibold hover:bg-slate-100" href={subItem.link} preload="tap">
                  {subItem.title}
                </Link>
              {/each}
            </div>
          </details>
        {/if}
      {/each}
    </div>
  </div>
</div>
