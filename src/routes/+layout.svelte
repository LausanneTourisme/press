<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import Button from '$lib/components/Button.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Link from '$lib/components/Link.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Nav from '$lib/components/Nav/Nav.svelte';
  import SocialNetworks from '$lib/components/SocialNetworks.svelte';
  import { locale, t } from '$lib/translations';
  import { Send } from 'lucide-svelte';
  import { type Snippet } from 'svelte';
  import '../app.css';
  import { type PageData } from './[locale=locale]/$types';
  import { twMerge } from 'tailwind-merge';
  import CookieButton from '$lib/components/CookieButton.svelte';
  import { PUBLIC_GOOGLE_TAG_MANAGER_TOKEN } from '$env/static/public';

  let { children } = $props<{ children: Snippet }>();
  const origin = $derived(page.url.origin);
  const translations = $derived((page.data as PageData).translations[locale.get()]);
  const seo = $derived.by(() => {
    const pageData = $state(page.data as PageData);
    return {
      title: pageData.seo.title,
      description: pageData.seo.description,
      canonical: pageData.seo.canonical,
      alternates: pageData.seo.alternate
        .map(
          (alternate) =>
            `<link rel="alternate" hreflang="${alternate.hreflang}" href="${origin}${alternate.href}" />`
        )
        .join('\n'),
      image: pageData.seo.image
    };
  });

  afterNavigate(() => {
    /*
     * Go to Anchor tags !
     */
    const { hash } = document.location;
    if (hash) {
      const anchor = document.querySelector(hash ?? '');
      anchor?.scrollIntoView({ behavior: 'smooth' });
    }
  });
</script>

<svelte:head>
  <title>{seo.title} • Lausanne Tourisme</title>
  <meta name="description" content={seo.description} />
  <meta name="robots" content="index,follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="UTF-8" />
  <link rel="canonical" href={seo.canonical} />
  {@html seo.alternates}
  <link rel="icon" href="/favicon.png" />
  <!-- Open Graph -->
  <meta property="twitter:image" content={seo.image} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={seo.title} />
  <meta property="twitter:description" content={seo.description} />
  <meta property="og:image" content={seo.image} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={`${seo.canonical}`} />
  <!-- Structured Data -->
  {@html `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${seo.title} • Lausanne Tourisme",
        "image": "${seo.image}",
        "description": "${seo.description}",
        "url": "${seo.canonical}"
      }
      </script>
    `}
  {@html `
    <script type="application/ld+json">
    {
      "@context": "http://schema.org",
      "@type": "Organization",
      "url": "https://www.lausanne-tourisme.ch",
      "logo": "${origin}/logo/LT_Logo.png",
      "name": "Lausanne Tourisme",
      "email": "info@lausanne-tourisme.ch",
      "telephone": "+41 21 613 73 73",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@lausanne-tourisme.ch",
        "telephone": "+41 21 613 73 73"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Avenue de Rhodanie 2 – CP 975",
        "addressLocality": "Lausanne",
        "addressCountry": "CH",
        "addressRegion": "Vaud",
        "postalCode": "1001"
      },
      "sameAs": [
        "https://www.facebook.com/LausanneCapitaleOlympique",
        "https://www.x.com/LausanneCO",
        "https://www.instagram.com/thelausanner/",
        "https://www.youtube.com/LausanneTourisme",
        "https://www.linkedin.com/company/lausanne-capitale-olympique"
      ]
    }
    </script>
    `}

  <!-- Google Tag Manager -->
  <script>
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', PUBLIC_GOOGLE_TAG_MANAGER_TOKEN);
  </script>
  <!-- End Google Tag Manager -->
</svelte:head>

<div class="app">
  <main>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe
        title="Google Tag Manager"
        src="https://www.googletagmanager.com/ns.html?id={PUBLIC_GOOGLE_TAG_MANAGER_TOKEN}"
        height="0"
        width="0"
        style="display:none;visibility:hidden"
      ></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->
    <Nav />

    {@render children()}
    <CookieButton />
  </main>

  <footer class="bg-metallic-800 relative z-10 leading-[1.7] tracking-wider text-white">
    <section class="mx-auto flex max-w-[1270px] flex-col justify-center p-[15px] text-center">
      <Heading class="tracking-normal text-white md:pb-5 md:text-3xl ">
        {$t('footer.follow-us')}
      </Heading>
      <nav class="flex w-full items-center justify-center md:mb-5">
        <SocialNetworks />
      </nav>
      <Heading class="tracking-normal text-white md:mb-2 md:text-3xl ">
        {$t('footer.newsletter')}
      </Heading>
      <div>
        <Button
          negative={true}
          tag="a"
          href={$t('footer.subscribe.url')}
          class="invertable inline-flex flex-row-reverse items-center justify-between rounded-none text-lg font-normal dark:text-white "
        >
          {$t('footer.subscribe.text')}
          <Send class="mx-2 h-5 w-5" />
        </Button>
      </div>
      <Heading class="py-3 tracking-normal text-white md:text-3xl ">
        {$t('footer.partners')}
      </Heading>
      <div
        class="partners grid h-32 w-full grid-cols-3 place-content-center gap-4 md:h-[81px] md:grid-cols-6 md:gap-1"
      >
        <Link withIcon={false} href="https://www.lausanne.ch" class="inline-flex w-full">
          <Image
            class="block h-[48px] object-contain md:h-[84px]"
            imgClass="object-contain h-full"
            alt="Ville de Lausanne"
            title="Ville de Lausanne"
            src="/logo/partners/ville_de_lausanne.svg"
            localSrc="/logo/partners/ville_de_lausanne.svg"
          />
        </Link>
        <Link withIcon={false} href="https://www.myvaud.ch/" class="inline-flex w-full">
          <Image
            class="mt-2 block h-[16px] object-contain md:h-full"
            imgClass="object-contain h-full"
            alt="Vaud Promotion"
            title="Vaud Promotion"
            src="/logo/partners/vaud_promotion.svg"
            localSrc="/logo/partners/vaud_promotion.svg"
          />
        </Link>
        <Link
          withIcon={false}
          href="https://www.lausanne-montreux-congress.ch/"
          class="inline-flex w-full"
        >
          <Image
            class="block h-[48px] object-contain md:h-[84px]"
            imgClass="object-contain h-full"
            alt="Lausanne Montreux Congress"
            title="Lausanne Montreux Congrès"
            src="/logo/partners/lmc.svg"
            localSrc="/logo/partners/lmc.svg"
          />
        </Link>
        <Link withIcon={false} href="https://www.myswitzerland.com/" class="inline-flex w-full">
          <Image
            class="block h-[48px] w-[100px] object-contain md:h-[84px] md:w-[170px]"
            imgClass="object-contain h-full"
            alt="Switzerland Tourism"
            title="Switzerland Tourism"
            src="/logo/partners/suisse_tourisme_partner.svg"
            localSrc="/logo/partners/suisse_tourisme_partner.svg"
          />
        </Link>
        <Link withIcon={false} href="https://www.t-l.ch/" class="inline-flex w-full">
          <Image
            class="block h-[48px] object-contain md:h-[84px]"
            imgClass="object-contain h-full"
            alt="t-l"
            title="t-l"
            src="/logo/partners/tl.svg"
            localSrc="/logo/partners/tl.svg"
          />
        </Link>
        <Link withIcon={false} href="https://www.tgv-lyria.com/" class="inline-flex w-full">
          <Image
            class="block h-full w-full object-contain md:h-[84px]"
            imgClass="object-contain h-full"
            alt="TGV Lyria"
            title="TGV Lyria"
            src="/logo/partners/lyria.svg"
            localSrc="/logo/partners/lyria.svg"
          />
        </Link>
      </div>
    </section>
    <section class="mx-auto flex w-full max-w-[1270px] flex-wrap p-[15px]">
      <hr class="-mt-2 w-full border-t-2 border-white" />
      <div class="grid w-full grid-cols-1 gap-8 md:grid-cols-[1.5fr_2.5fr_1.5fr]">
        <div class="footer-contact max-w-[400px]">
          <Heading class="mt-4 mb-2 text-base text-white md:text-base ">
            {$t('footer.contact')}
          </Heading>
          <p>
            <b>Lausanne Tourisme – administration</b><br />
            Avenue de Rhodanie 2 – CP 975<br />
            1001 Lausanne – Suisse<br />
            <a href="mailto:info@lausanne-tourisme.ch">info@lausanne-tourisme.ch</a><br />
            <a href="tel:+41216137373">+41 21 613 73 73</a>
          </p>
          <Button negative={true} href={translations['footer.where.url']}>
            {$t('footer.where.text')}
          </Button>
        </div>
        <nav class="footer-infos w-full">
          <ul class=" xs:grid-cols-2 grid list-none grid-cols-1 gap-5">
            <li class="footer-info list-none pb-2.5 tracking-[.75px] text-white">
              <Heading
                class="mb-1 text-base font-bold tracking-normal text-white md:text-base xl:mt-4 "
              >
                {$t('footer.infos.corporate.title')}
              </Heading>
              <ul>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.corporate.about-us.url']}
                  >
                    {$t('footer.infos.corporate.about-us.text')}
                  </Link>
                </li>
                <li class={twMerge('list-none', $locale !== 'fr' ? 'hidden' : '')}>
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.corporate.member-space.url']}
                  >
                    {$t('footer.infos.corporate.member-space.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.corporate.jobs.url']}
                  >
                    {$t('footer.infos.corporate.jobs.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.corporate.general-terms.url']}
                  >
                    {$t('footer.infos.corporate.general-terms.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.corporate.privacy.url']}
                  >
                    {$t('footer.infos.corporate.privacy.text')}
                  </Link>
                </li>
              </ul>
            </li>
            <li class="footer-info list-none pb-2.5 tracking-[.75px] text-white">
              <Heading
                class="mb-1 text-base font-bold tracking-normal text-white md:text-base xl:mt-4 "
              >
                {$t('footer.infos.more.title')}
              </Heading>
              <ul>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.more.meeting.url']}
                  >
                    {$t('footer.infos.more.meeting.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.more.congress.url']}
                  >
                    {$t('footer.infos.more.congress.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.more.trade.url']}
                  >
                    {$t('footer.infos.more.trade.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.more.press.url']}
                  >
                    {$t('footer.infos.more.press.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={translations['footer.infos.more.brochures.url']}
                  >
                    {$t('footer.infos.more.brochures.text')}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <div class="footer-logo -mt-10 w-full justify-center sm:mt-0 xl:mt-4 xl:justify-end">
          <Image
            class="mx-auto h-56 w-56 md:h-36 md:w-36"
            alt="Lausanne Tourisme"
            title="Lausanne Tourisme"
            src="/logo/partners/lt_logo_white.svg"
            localSrc="/logo/partners/lt_logo_white.svg"
          />
        </div>
      </div>
    </section>
  </footer>
</div>
