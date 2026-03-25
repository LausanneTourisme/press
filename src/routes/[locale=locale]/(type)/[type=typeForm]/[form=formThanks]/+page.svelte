<script lang="ts">
  import { Forms, RouteTypes } from '$enums';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import { t } from '$lib/translations';
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Container width="small">
  <Heading tag="h1">
    {@html $t(`${RouteTypes.Forms}.${Forms.Thanks}.title`)}
  </Heading>

  <Container width="small">
    {@html $t(`${RouteTypes.Forms}.${Forms.Thanks}.confirmation-mail`)}
  </Container>
</Container>
