<script lang="ts">
  import { page } from '$app/state';
  import type { PageData } from './$types';

  let countries = $derived(Object.values((page.data as PageData).countries));
</script>

<h2>Media information</h2>
{#each countries as country}
    {country} <br>
{/each}