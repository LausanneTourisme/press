<script lang="ts">
  import { page } from '$app/state';
  import { locale } from '$lib/translations';

  if (typeof window !== 'undefined') {
    console.log(page.data.payload);
  }
</script>

<div class="text-column text-center">
  {$locale}
  <br />
  Nous somme dans un Thème: {page.data.theme}
</div>
