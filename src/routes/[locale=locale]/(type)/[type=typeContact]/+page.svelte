<script lang="ts">
  import { page } from "$app/state";
  import { RouteTypes } from "$enums";
  import { locale, t } from "$lib/translations";
</script>

<svelte:head>
  <title>{$t(`route.type.${RouteTypes.Contact}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-center text-column">
  {$locale}
  <br>
  {$t(`route.type.${RouteTypes.Contact}.title`)}
</div>
