<script lang="ts">
  import { page } from "$app/state";
  import { RouteSlug } from "$enums";
  import { t } from "$lib/translations";

  console.log($t(`route.type.${RouteSlug.Contact}.title`))
  console.log('here')
</script>

<svelte:head>
  <title>{$t(`route.type.${RouteSlug.Contact}.title`)}</title>
  <meta name="description" content="" />
</svelte:head>

<div class="text-column">
  {page.data.i18n.locale}
  {$t('route.type.contact.title')}
</div>
