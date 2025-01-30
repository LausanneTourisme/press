<script lang="ts">
  import {page} from "$app/state"
  import { RouteTypes } from "$enums";
  import { locale } from '$lib/translations';
</script>

<div class="text-column text-center">
  {$locale}
  <br />
  {RouteTypes.Coverage}
</div>
