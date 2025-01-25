<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { goto } from '$app/navigation';

  export let hide: boolean = false;

</script>

<nav
  class="w-full h-[60px] xl:h-[120px] shadow-lg bg-white sticky top-0 left-0 z-[11] transition-all ${hide ? 'hidden' : ''}">
  <div class="flex justify-between items-center h-full">
    <Button nofx="{true}" border="{false}" href="/" tag="a">
      <!--{#if $locale === 'fr'}-->
      <!--  <Image src="/images/LT_logo_medias_fr.svg" alt="Lausanne Capitale Olympique"-->
      <!--         class="w-[117px] xl:w-[170px] 2xl:w-[230px] max-w-[230px]" />-->
      <!--{:else}-->
      <!--  <Image src="/images/LT_logo_medias_en.svg" alt="Lausanne Capitale Olympique"-->
      <!--         class="w-[117px] xl:w-[170px] 2xl:w-[230px] max-w-[230px]" />-->
      <!--{/if}-->
      <span>home</span>
    </Button>
    <Button nofx="{true}" border="{false}" href="/about" onclick={() => goto('/about')}>
      <span>lol</span>
    </Button>
    <a href="/sverdle"> mdr </a>
  </div>
</nav>