<script lang="ts">
  import { locale } from '$lib/translations';
  import { twMerge } from 'tailwind-merge';
  import Image from '$lib/components/Image.svelte';

  type Props = {
    class?: string;
  };

  const { class: additionalClass }: Props = $props();

  const style = twMerge(
    'w-[117px] max-w-[230px] xl:w-[170px] 2xl:w-[230px] dark:text-black dark:invert hover:invert-25 dark:hover:invert-75',
    additionalClass
  );
  const src = $derived(`/logo/logo_${$locale === 'fr' ? 'fr' : 'en'}.svg`);
</script>

{#key $locale}
  <Image
    class={style}
    alt="Lausanne Capitale Olympique"
    title="Lausanne Capitale Olympique"
    {src}
    localSrc={src}
  />
{/key}
