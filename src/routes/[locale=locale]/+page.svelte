<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import { locale, t, translations } from '$lib/translations';

</script>

  <Container
    fullscreen={true}
    class="relative min-h-[500px] items-end justify-start overflow-hidden md:flex md:items-center"
  >
  <div class="md:w-1/2 p-6 md:p-16 text-left xl:mt-[25px] 2xl:mt-[5px]">
    <Heading tag="h1" class="xl:whitespace-nowrap text-white">
      <span
          class="inline-block font-light pb-3 text-4xl tracking-[0.45px]">{$t('page.title').toUpperCase()}</span>
      <br>
      <span class="inline-block tracking-tight">{$t('page.subtitle')}<span
          class="[text-shadow:_0_0_1px_var(--tw-shadow-color)] shadow-gray-950">!</span>
</span>
  </Heading>
  </div>
</Container>
