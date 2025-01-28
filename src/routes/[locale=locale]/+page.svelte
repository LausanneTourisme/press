<script lang="ts">
  import { page } from "$app/state";
  import { locale, locales, t, translations } from "$lib/translations";
  import { RouteType } from "$enums";


</script>

<svelte:head>
  <title>{$t(`route.type.${RouteType.Home}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-column">
  {$locale}
</div>
