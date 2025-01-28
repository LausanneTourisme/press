<script lang="ts">
  import { page } from "$app/state";
  import { locale, locales, t, translations } from "$lib/translations";
  import { RouteSlug } from "$enums";


</script>

<svelte:head>
  <title>{$t(`route.type.${RouteSlug.Home}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-column">
  {page.data.i18n.locale}
</div>
