<script lang="ts">
  import { page } from '$app/state';
  import { t } from '$lib/translations';
  import { browser, dev } from '$app/environment';
  import GdprBanner from '@beyonk/gdpr-cookie-consent-banner';
  import '@beyonk/gdpr-cookie-consent-banner/banner.css';
  import type { PageData } from '../../../routes/[locale=locale]/$types';
  import {
    PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,
    PUBLIC_GOOGLE_ANALYTICS_TOKEN,
    PUBLIC_HOTJAR_ANALYTICS_ID,
    PUBLIC_HOTJAR_ANALYTICS_VERSION
  } from '$env/static/public';
  import { consentStore } from '$lib/stores/CookiesConsent';

  const choices = {
    necessary: {
      label: $t('gdpr.necessary.label'),
      description: $t('gdpr.necessary.description'),
      value: true
    },
    analytics: {
      label: $t('gdpr.analytics.label'),
      description: $t('gdpr.analytics.description'),
      value: false
    },
    tracking: {
      label: $t('gdpr.tracking.label'),
      description: $t('gdpr.tracking.description'),
      value: false
    },
    marketing: undefined,
  };

  let gtag: (...args: unknown[]) => void = $state(() => {});

  const handleConsent = async ({ type, agreed }: { type: string; agreed: boolean }) => {
    if (!browser) {
      return;
    }

    consentStore.update((current) => ({ ...current, [type]: agreed }));

    switch (type) {
      case 'necessary':
        break;
      case 'analytics':
        await Promise.all([
          GoogleAnalytics(agreed),
          CloudflareAnalytics(agreed),
          HotjarAnalytics(agreed),
        ])
        break;
      case 'tracking':
        // instagram added only when lib/components/Blocks/Embed/Instagram.svelte is used
        break;
      case 'marketing':
        break;
      default:
        break;
    }
  };

  const GoogleAnalytics = async (agreed: boolean) => {
    const url = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GOOGLE_ANALYTICS_TOKEN}`;
    if (!agreed || document.querySelector(`script[src*="${url}"]`)) {
      document.querySelector(`script[src*="${url}"]`)?.remove()
      return; // Prevent duplicate script insertion
    }

    // (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    // new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    // j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    // 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    // })(window,document,'script','dataLayer',PUBLIC_GOOGLE_ANALYTICS_TOKEN);

    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = url;
    script.onload = () => {
      dev ? console.log('Google Analytics script loaded successfully') : undefined;

      window.dataLayer = window?.dataLayer || [];

      gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args);
      };

      gtag('js', new Date());
      gtag('config', PUBLIC_GOOGLE_ANALYTICS_TOKEN);
    };

    const noScript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${PUBLIC_GOOGLE_ANALYTICS_TOKEN}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style = 'display:none;visibility:hidden';
    noScript.appendChild(iframe);

    document.body.insertBefore(noScript, document.body.firstChild);
    document.head.appendChild(script);
  };

  const CloudflareAnalytics = async (agreed: boolean) => {
    if (!agreed || document.querySelector('script[data-cf-beacon]')) {
      document.querySelector(`script[data-cf-beacon]`)?.remove()
      return; // Prevent duplicate script insertion
    }

    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', `{"token": "${PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN}"}`);
    script.onload = () => {
      dev ? console.log('Cloudflare Analytics script loaded successfully') : undefined;
    };
    document.head.appendChild(script);
  };

  const HotjarAnalytics = async (agreed: boolean) => {
    const url = `https://static.hotjar.com/c/hotjar-${PUBLIC_HOTJAR_ANALYTICS_ID}.js?sv=${PUBLIC_HOTJAR_ANALYTICS_VERSION}`;
    if (!agreed || document.querySelector(`script[src*="${url}"]`)) {
      document.querySelector(`script[src*="${url}"]`)?.remove()
      return; // Prevent duplicate script insertion
    }

    (function (h, o, t, j, a, r) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
      h._hjSettings = { hjid: PUBLIC_HOTJAR_ANALYTICS_ID, hjsv: PUBLIC_HOTJAR_ANALYTICS_VERSION };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script');
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      r.setAttribute('data-hotjar', 'true'); // Ajout d'un attribut pour éviter les doublons
      r.onload = () => {
        dev ? console.log('Hotjar script loaded successfully') : undefined;
      };
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  };

  $effect(() => {
    const title = (page.data as PageData).seo.title;
    const url = (page.data as PageData).seo.canonical;
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-3N695XLPQQ', {
        page_title: title,
        page_path: url
      });
    }
  });
</script>

<GdprBanner
  on:necessary={(e: CustomEvent<{ agreed: boolean }>) => {
    handleConsent({ type: e.type, agreed: e.detail.agreed });
  }}
  on:tracking={(e: CustomEvent<{ agreed: boolean }>) => {
    handleConsent({ type: e.type, agreed: e.detail.agreed });
  }}
  on:analytics={(e: CustomEvent<{ agreed: boolean }>) => {
    handleConsent({ type: e.type, agreed: e.detail.agreed });
  }}
  cookieName="consent"
  heading={$t('gdpr.banner.heading')}
  description={$t('gdpr.banner.description')}
  acceptLabel={$t('gdpr.banner.accept')}
  acceptAllLabel={$t('gdpr.banner.acceptAll')}
  acceptSelectedLabel={$t('gdpr.banner.acceptSelected')}
  rejectLabel={$t('gdpr.banner.reject')}
  settingsLabel={$t('gdpr.banner.settings')}
  closeLabel={$t('gdpr.banner.close')}
  editLabel={$t('gdpr.banner.edit')}
  {choices}
/>
