<script lang="ts">
  import { page } from "$app/state";
  import { RouteType } from "$enums";
  import { locale, t } from "$lib/translations";
</script>

<svelte:head>
  <title>{$t(`route.type.${RouteType.Contact}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-center text-column">
  {$locale}
  <br>
  {$t('route.type.contact.title')}
</div>
