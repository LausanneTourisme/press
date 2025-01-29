<script lang="ts">
  import { page } from '$app/state';
  import { locale } from '$lib/translations';
</script>

<svelte:head>
  <title>Nous somme dans un Thème</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-column text-center">
  {$locale}
  <br />
  Nous somme dans un Thème: {page.data.theme}
</div>
