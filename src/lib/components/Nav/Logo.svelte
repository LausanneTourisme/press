<script>
  import { locale } from '$lib/translations';
  import Image from '../Image.svelte';
</script>

<Image
  src="/images/logo_{$locale === 'fr' ? 'fr' : 'en'}.svg"
  alt="Lausanne Capitale Olympique"
  class="w-[117px] max-w-[230px] xl:w-[170px] 2xl:w-[230px] dark:text-white dark:invert-1"
/>
