<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes } from '$enums';
  import { route } from '$lib/helpers';
  import { menuItems } from '$lib/helpers/menu';
  import { locale, t, type Locale } from '$lib/translations';
  import { ChevronDown } from 'lucide-svelte';
  import { twMerge } from 'tailwind-merge';
  import Button from '../Button.svelte';
  import Link from '../Link.svelte';
  import Logo from './Logo.svelte';

  type Props = {
    class?: string;
  };

  const { class: additionalClass }: Props = $props();

  const style = twMerge("flex h-full items-center justify-between", additionalClass)
</script>

<nav class={style} aria-labelledby="desktop-navigation">
  <a
    href={route(RouteTypes.Home)}
    class="group my-2 flex max-w-[230px] cursor-pointer border-0 px-0 py-2 pl-[15px] transition-all"
  >
    <Logo/>
  </a>
  <div class="ml-6 h-full grow items-center justify-start flex">
    <!-- Desktop menu -->
    {#each menuItems($locale as Locale) as item}
      {#if !item.link}
        <div class="dropdown dropdown-hover group">
          <div tabindex="0" role="button" class="m-3 rounded-none hover:opacity-75">
            <p class="py-9 text-[17px] font-bold">
              <span>{item.title}</span>
            </p>
          </div>
          {#if item.items && item.items.length}
            {@const items = item.items}
            <ul
              class="items-list dropdown-content bg-base-200 dark:bg-base-300 border-t-brand-600 z-1 w-[450px] border-t p-2 shadow-xs"
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
      {:else}
        <p class="h-full content-center text-[17px] font-bold">
          <Link
            class="h-full justify-between p-2 text-left font-bold"
            href={item.link}
            preload="tap"
            withIcon={false}
          >
            {item.title}
          </Link>
        </p>
      {/if}
    {/each}
  </div>
  <!-- End desktop menu -->
  <div class="flex h-full items-center justify-between px-6">
    <Button href={route(RouteTypes.Contact)} class="invertable px-3 block" tag="a">
      {$t('common.contact-us')}
    </Button>

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
                    class={`items-list-element text-brand-600 hover:bg-base-100 flex items-center justify-center py-3 text-center font-bold opacity-100 transition-all hover:rounded-sm hover:opacity-75 dark:hover:bg-slate-600 ${alternate.hreflang === $locale ? 'hidden' : ''}`}
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
  </div>
</nav>
