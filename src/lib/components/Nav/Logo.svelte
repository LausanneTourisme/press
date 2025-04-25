<script lang="ts">
  import { locale } from '$lib/translations';
  import { twMerge } from 'tailwind-merge';
  import Image from '../Media/Image.svelte';

  type Props = {
    class?: string;
  };

  const { class: additionalClass }: Props = $props();

  const style = twMerge(
    'w-[117px] max-w-[230px] xl:w-[170px] 2xl:w-[230px] dark:text-black dark:invert hover:invert-25 dark:hover:invert-75',
    additionalClass
  );
</script>

<Image
  src="/images/logo/logo_{$locale === 'fr' ? 'fr' : 'en'}.svg"
  alt="Lausanne Capitale Olympique"
  class={style}
/>
