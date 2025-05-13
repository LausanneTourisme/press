<script lang="ts">
  import { page } from "$app/state";
  import { t } from '$lib/translations';
  import GdprBanner from '@beyonk/gdpr-cookie-consent-banner';
  import '@beyonk/gdpr-cookie-consent-banner/banner.css';

  const choices = {
    necessary: {
      label: $t('gdpr.necessary.label'),
      description: $t('gdpr.necessary.description'),
      value: true
    },
    tracking: {
      label: $t('gdpr.tracking.label'),
      description: $t('gdpr.tracking.description'),
      value: true
    }
  };

  let gtag = $state(undefined);

  const analytics = () => {
    window.dataLayer = window?.dataLayer || [];

    gtag = () => {
      window.dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', 'G-3N695XLPQQ');
  };

  $effect(() => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-3N695XLPQQ', {
        page_title: document.title,
        page_path: page.data.i18n.route
      });
    }
  });
</script>

<svelte:head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-3N695XLPQQ">
  </script>
</svelte:head>

<GdprBanner
  cookieName="consent"
  onAnalytics={analytics}
  heading={$t('gdpr.banner.heading')}
  description={$t('gdpr.banner.description')}
  acceptLabel={$t('gdpr.banner.accept')}
  rejectLabel={$t('gdpr.banner.reject')}
  settingsLabel={$t('gdpr.banner.settings')}
  closeLabel={$t('gdpr.banner.close')}
  editLabel={$t('gdpr.banner.edit')}
  {choices}
/>

<style>
  /* :global(.cookieConsent__Button[type='submit']) {
    @apply bg-brand-600 text-white !important;
  }

  :global(button.cookieConsentToggle) {
    @apply left-[20px] !important;
    right: unset !important;
  } */
</style>
