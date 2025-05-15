<script lang="ts">
  import { defaultLocale, locale } from '$lib/translations';

  const url = $locale ? `/${$locale}` : `/${defaultLocale}`;
</script>

<section
  class="relative z-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-gray-950 text-slate-600"
>
  <div>
    <p>page pas traduite ❤️</p>
    <p>&mdash; <span class="text-amber-800">404</span></p>
    <h1 class="text-2xl">Votre page est perdue quelque part dans le web</h1>
    <a href={url} class="text-blue-500">
      <!-- //FIXME translation -->
      Retour à l'accueil
      {$locale}
    </a>
  </div>
</section>
