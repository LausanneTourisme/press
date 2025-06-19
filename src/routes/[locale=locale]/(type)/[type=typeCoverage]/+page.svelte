<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { t } from '$lib/translations';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  let loading: boolean = $state(true);

  const show = () => {
    loading = false;
  };
</script>

<Container width="small">
  <div class="py-6 text-center">
    <Heading tag="h1">
      {$t('page.title')}
    </Heading>
    <Paragraph>
      {@html $t('page.description')}
    </Paragraph>
  </div>
</Container>
<Container width="large" class="-mt-10">
  <div class={twMerge('flex h-60 w-full items-center justify-center', loading ? '' : 'hidden')}>
    <Loading class="loading-xl" />
  </div>
  <iframe
    class:hidden={loading}
    title={$t('page.title')}
    src="https://elink.io/embed/945185f"
    allowfullscreen
    width="100%"
    height="1000px"
    onload={show}
    in:fade
  ></iframe>
</Container>
