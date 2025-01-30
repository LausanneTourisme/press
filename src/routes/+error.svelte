<script lang="ts">
  import { defaultLocale, locale } from "$lib/translations";

  const url: string = $locale ? `/${$locale}` : `/${defaultLocale}`;
</script>

<section
        class="h-screen w-screen overflow-hidden bg-gray-950 text-slate-600 flex items-center justify-center relative z-0">
    <div>
        <p>page pas traduite ❤️</p>
        <p>&mdash; <span class="text-amber-800">404</span></p>
        <h1 class="text-2xl">Votre page est perdue quelque part dans le web</h1>
        <a href={url} class="text-blue-500">
            <!-- //FIXME translation -->
             Retour à l'accueil
        </a>
    </div>
</section>