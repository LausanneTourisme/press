<script lang="ts">
  import { page } from "$app/state";
  import { RouteTypes } from "$enums";
  import { locale, t } from "$lib/translations";
</script>

<div class="text-center text-column">
  {$locale}
  <br>
  {$t(`route.${RouteTypes.Presskit}.slug`)}
</div>
