<script lang="ts">
  import { page } from "$app/state";
  import { RouteTypes } from "$enums";
  import { locale, t } from "$lib/translations";
</script>

<svelte:head>
  <title>{$t(`route.${RouteTypes.Presskit}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-center text-column">
  {$locale}
  <br>
  {$t(`route.${RouteTypes.Presskit}.title`)}
</div>
