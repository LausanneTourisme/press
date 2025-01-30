<script lang="ts">
  import Image from '$lib/components/Image.svelte';
  import { menuItems } from '$lib/helpers/menu';
  import { locale, type Locale } from '$lib/translations';
  import { twMerge } from 'tailwind-merge';
  import Button from './Button.svelte';
  import Link from './Link.svelte';

  type NavProps = {
    hide?: boolean;
    class?: string;
  };

  const { hide = false, class: additionalClass }: NavProps = $props();

  const style = twMerge(
    `sticky left-0 top-0 z-[11] h-[60px] w-full bg-white shadow-lg transition-all xl:h-[120px] ${hide ? 'hidden' : ''}`,
    additionalClass
  );
</script>

<nav class={style}>
  <div class="flex h-full items-center justify-between">
    <Button
      border={false}
      nofx={true}
      href="/{$locale}"
      class="invertable flex max-w-[230px]  pl-[15px]"
      tag="a"
    >
      <Image
        src="/images/logo_{$locale === 'fr' ? 'fr' : 'en'}.svg"
        alt="Lausanne Capitale Olympique"
        class="w-[117px] max-w-[230px] xl:w-[170px] 2xl:w-[230px]"
      />
    </Button>
    <div class="ml-6 hidden h-full flex-grow items-center justify-start xl:flex">
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
                {item.title}
              {/if}
            </p>
          </div>
          {#if item.items && item.items.length}
            {@const items = item.items}
            <ul
              class="items-list dropdown-content bg-base-100 z-[1] w-[450px] border-t border-t-transparent p-2 shadow group-hover:border-t-brand-600"
            >
              {#each items as item}
                <li>
                  <Link
                    class="items-list-element justify-between px-6 py-4 text-left text-[20px] font-medium hover:rounded-none hover:border-none hover:bg-white hover:text-brand-600 hover:underline hover:opacity-100"
                    href={item.link}
                    preload="tap"
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
  </div>
</nav>

<style lang="postcss">
  :global(.invert-colours .invertable) {
    filter: invert(100%);
  }

  :global(.invert-colours .items-list) {
  }

  :global(.invert-colours .items-list-element) {
    color: #1e1e1f;
  }
</style>
