<script lang="ts">
  import { page } from "$app/state";
  import { locale, locales, t, translations } from "$lib/translations";
  import { RouteTypes } from "$enums";


</script>

<svelte:head>
  <title>{$t(`route.type.${RouteTypes.Home}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-column">
  {$locale}
</div>
