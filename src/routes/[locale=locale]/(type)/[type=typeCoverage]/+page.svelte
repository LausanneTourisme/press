<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { RouteTypes } from '$enums';
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
      {@html $t(`${RouteTypes.Coverages}.title`)}
    </Heading>
    <Paragraph>
      {@html $t(`${RouteTypes.Coverages}.description`)}
    </Paragraph>
  </div>
</Container>
<Container width="large" class="-mt-10">
  <div class={twMerge('flex h-60 w-full items-center justify-center', loading ? '' : 'hidden')}>
    <Loading class="loading-xl" />
  </div>
  <iframe
    class:hidden={loading}
    title={$t(`${RouteTypes.Coverages}.title`)}
    src="https://elink.io/embed/945185f"
    allowfullscreen
    width="100%"
    height="1000px"
    onload={show}
    in:fade
  ></iframe>
</Container>
