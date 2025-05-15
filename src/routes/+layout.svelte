<script lang="ts">
  import { page } from '$app/state';
  import Heading from '$lib/components/Heading.svelte';
  import Button from '$lib/components/Button.svelte';
  import Link from '$lib/components/Link.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Nav from '$lib/components/Nav/Nav.svelte';
  import SocialNetworks from '$lib/components/SocialNetworks.svelte';
  import { locale, t } from '$lib/translations';
  import { Send } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import '../app.css';
  import { type PageData } from './[locale=locale]/$types';

  let { children } = $props<{ children: Snippet }>();
  const pageData = page.data as PageData;

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${pageData.seo.title} • Lausanne Tourisme`,
    image: pageData.seo.image,
    description: pageData.seo.description,
    url: pageData.seo.canonical
  };

  const ldJsonOrganisation = {
    '@context': 'http://schema.org',
    '@type': 'Organization',
    url: 'https://www.lausanne-tourisme.ch',
    logo: `${page.url.origin}/images/logo/LT_Logo.png`,
    name: 'Lausanne Tourisme',
    email: 'info@lausanne-tourisme.ch',
    telephone: '+41 21 613 73 73',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@lausanne-tourisme.ch',
      telephone: '+41 21 613 73 73'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenue de Rhodanie 2 – CP 975',
      addressLocality: 'Lausanne',
      addressCountry: 'CH',
      addressRegion: 'Vaud',
      postalCode: '1001'
    },
    sameAs: [
      'https://www.facebook.com/LausanneCapitaleOlympique',
      'https://www.x.com/LausanneCO',
      'https://www.instagram.com/thelausanner/',
      'https://www.youtube.com/LausanneTourisme',
      'https://www.linkedin.com/company/lausanne-capitale-olympique'
    ]
  };
</script>

<svelte:head>
  <title>{pageData.seo.title} • Lausanne Tourisme</title>
  <meta name="description" content={pageData.seo.description} />
  <meta name="robots" content="index,follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="UTF-8" />
  <link rel="canonical" href={pageData.seo.canonical} />
  {#each pageData.seo.alternate as route}
    <link rel="alternate" hreflang={route.hreflang} href={route.href} />
  {/each}
  <link rel="icon" href="/favicon.png" />
  <!-- Open Graph -->
  <meta property="twitter:image" content={pageData.seo.image} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={pageData.seo.title} />
  <meta property="twitter:description" content={pageData.seo.description} />
  <meta property="og:image" content={pageData.seo.image} />
  <meta property="og:title" content={pageData.seo.title} />
  <meta property="og:description" content={pageData.seo.description} />
  <meta property="og:url" content={`${pageData.seo.canonical}${page.url.hash}`} />
  <script type="application/ld+json">
  </script>
  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(ldJson)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(ldJsonOrganisation)}</script>`}
</svelte:head>

<div class="app">
  <Nav />

  <main>
    {@render children()}
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
            src="/images/logo/partners/ville_de_lausanne.svg"
            class="h-[48px] object-contain md:h-[84px]"
          />
        </Link>
        <Link withIcon={false} href="https://www.myvaud.ch/" class="inline-flex w-full">
          <Image
            src="/images/logo/partners/vaud_promotion.svg"
            class="mt-2 h-[16px] object-contain md:h-[29px]"
          />
        </Link>
        <Link
          withIcon={false}
          href="https://www.lausanne-montreux-congress.ch/"
          class="inline-flex w-full"
        >
          <Image src="/images/logo/partners/lmc.svg" class="h-[48px] object-contain md:h-[84px]" />
        </Link>
        <Link withIcon={false} href="https://www.myswitzerland.com/" class="inline-flex w-full">
          <Image
            src="/images/logo/partners/suisse_tourisme_partner.svg"
            class="h-[48px] w-[100px] object-contain md:h-[84px] md:w-[170px]"
          />
        </Link>
        <Link withIcon={false} href="https://www.t-l.ch/" class="inline-flex w-full">
          <Image src="/images/logo/partners/tl.svg" class="h-[48px] object-contain md:h-[84px]" />
        </Link>
        <Link withIcon={false} href="https://www.tgv-lyria.com/" class="inline-flex w-full">
          <Image
            src="/images/logo/partners/lyria.svg"
            class="h-full w-full object-contain md:h-[84px]"
          />
        </Link>
      </div>
    </section>
    <section class="mx-auto flex w-full max-w-[1270px] flex-wrap p-[15px]">
      <hr class="-mt-2 w-full border-t-2 border-white" />
      <div class="grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_2.5fr_1.5fr]">
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
          <Button negative={true} href={pageData.translations[locale.get()]['footer.where.url']}>
            {$t('footer.where.text')}
          </Button>
        </div>
        <nav class="footer-infos xl:w-full">
          <ul class=" grid list-none grid-cols-2 gap-5">
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
                    href={pageData.translations[locale.get()][
                      'footer.infos.corporate.about-us.url'
                    ]}
                  >
                    {$t('footer.infos.corporate.about-us.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()][
                      'footer.infos.corporate.member-space.url'
                    ]}
                  >
                    {$t('footer.infos.corporate.member-space.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()]['footer.infos.corporate.jobs.url']}
                  >
                    {$t('footer.infos.corporate.jobs.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()][
                      'footer.infos.corporate.general-terms.url'
                    ]}
                  >
                    {$t('footer.infos.corporate.general-terms.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()][
                      'footer.infos.corporate.privacy.url'
                    ]}
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
                    href={pageData.translations[locale.get()]['footer.infos.more.meeting.url']}
                  >
                    {$t('footer.infos.more.meeting.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()]['footer.infos.more.congress.url']}
                  >
                    {$t('footer.infos.more.congress.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()]['footer.infos.more.trade.url']}
                  >
                    {$t('footer.infos.more.trade.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()]['footer.infos.more.presskit.url']}
                  >
                    {$t('footer.infos.more.presskit.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()]['footer.infos.more.press.url']}
                  >
                    {$t('footer.infos.more.press.text')}
                  </Link>
                </li>
                <li class="list-none">
                  <Link
                    class="text-left font-normal text-white"
                    withFlex={false}
                    withIcon={false}
                    href={pageData.translations[locale.get()]['footer.infos.more.brochures.url']}
                  >
                    {$t('footer.infos.more.brochures.text')}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <div class="footer-logo flex w-full justify-center xl:mt-4 xl:justify-end">
          <Image src="/images/logo/partners/lt_logo_white.svg" class="h-56 w-48 md:h-36 md:w-24" />
        </div>
      </div>
    </section>
  </footer>
</div>
