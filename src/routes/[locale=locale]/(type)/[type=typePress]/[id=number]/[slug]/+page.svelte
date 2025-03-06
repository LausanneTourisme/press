<script lang="ts">
  import { page } from "$app/state";
  import { RouteTypes } from "$enums";
  import { locale, t } from "$lib/translations";
</script>

<svelte:head>
  <title>{$t(`page.title`)} • TITRE ARTICLE • Lausanne Tourisme</title>
  <meta name="description" content="{$t(`page.description`)}" />
</svelte:head>

<div class="text-center text-column">
  {$locale}
  <br>
  {$t(`page.title`)}
</div>
