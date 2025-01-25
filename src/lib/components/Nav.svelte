<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Image from '$lib/components/Image.svelte';
  import type { Locale } from '$lib/i18n';
  import { twMerge } from 'tailwind-merge';

  type NavProps = {
    hide?: boolean;
    class?: string;
  };

  const { hide = false, class: additionalClass }: NavProps = $props();

  const locales: Locale[] = ['en', 'fr', 'de'];
  const locale: Locale = 'en';
  const style = twMerge(
    `sticky left-0 top-0 z-[11] h-[60px] w-full bg-white shadow-lg transition-all xl:h-[120px] ${hide ? 'hidden' : ''}`,
    additionalClass
  );
</script>

<nav class={style}>
  <div class="flex h-full items-center justify-between">
    <Button
      nofx={true}
      border={false}
      href="/"
      class="invertable flex max-w-[230px]  pl-[15px]"
      tag="a"
    >
      <Image
        src="/images/logo_{locale === 'fr' ? 'fr' : 'en'}.svg"
        alt="Lausanne Capitale Olympique"
        class="w-[117px] max-w-[230px] xl:w-[170px] 2xl:w-[230px]"
      />
    </Button>
    <div class="ml-6 hidden h-full flex-grow items-center justify-start xl:flex"></div>
  </div>
</nav>
