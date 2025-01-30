<script lang="ts">
  import { page } from '$app/state';
  import { locale } from '$lib/translations';
</script>

<div class="text-column text-center">
  {$locale}
  <br />
  Nous somme dans un Thème: {page.data.theme}
</div>
