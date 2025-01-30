<script lang="ts">
  import { page } from "$app/state";
  import { RouteTypes } from "$enums";
  import { locale, t } from "$lib/translations";
</script>

<svelte:head>
  <title>{$t(`pages.title`)} • TITRE ARTICLE • Lausanne Tourisme</title>
  <meta name="description" content="{$t(`pages.description`)}" />
</svelte:head>

<div class="text-center text-column">
  {$locale}
  <br>
  {$t(`pages.title`)}
</div>
