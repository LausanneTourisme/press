<script lang="ts">
  import { page } from '$app/state';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { t } from '$lib/translations';
  import { Forms, RouteTypes } from '$enums';
  import type { MediaProfileJournalist } from '$types';
  // TODO SEO
  const countries = $derived(Object.values((page.data as PageData).countries));
  const { form, formId, errors, message, capture, restore } = $derived.by(() =>
    superForm((page.data as PageData).form, {
      dataType: 'json',
      onSubmit: async ({ cancel }) => {}
    })
  );
  const step = $derived($message?.step ?? 0);

  $effect(() => {
    console.log({ errors: $errors, message: $message });
  });

  const mediaProfile: MediaProfileJournalist = {
    mediaName: undefined,
    thematic: undefined,
    audienceProfile: undefined,
    mediaType: [],
    printMediaStatistics: {
      copies: 0,
      readers: 0,
      broadcastLocation: undefined
    },
    radioAndTVMediaStatistics: {
      emissionName: undefined,
      viewers: 0
    },
    onlineMediaStatistics: {
      website: undefined,
      monthlyUniqueVisitors: 0,
      montlhyPageViews: 0
    },
    mediaCoveragePrint: {
      totalPages: 0,
      articleLength: 0,
      publishDate: undefined
    },
    mediaCoverageOnline: {
      articleLength: 0,
      articleThematic: 0,
      publishDate: undefined
    },
    mediaCoverageTvOrRadio: {
      articleThematic: undefined,
      publishDate: undefined
    },
    travelInformation: {
      departurePoint: {
        city: undefined,
        country: undefined,
        outwardJourney: undefined
      },
      returnJourney: undefined,
      anyReduction: [],
      lastVisit: undefined
    },
    personalInformation: {
      title: undefined,
      firstName: undefined,
      lastName: undefined,
      birthday: undefined,
      phoneNumber: undefined,
      email: undefined,
      address: {
        address: undefined,
        city: undefined,
        postalcode: undefined,
        country: undefined
      },
      freelance: undefined,
      spokenLanguages: undefined,
      medicalAndPhysicalCondition: undefined,
      passport: {
        number: undefined,
        validity: undefined
      },
      emergencyContacts: [],
    },
    travelInsuranceCoveringSwitzerland: undefined,
    remarks: undefined,
    readTermsOfAcceptance: undefined,
    newsletter: undefined
  };
</script>

<h2>Media information</h2>
<!-- {#each countries as country}
  {country} <br />
{/each} -->

<form method="POST">
  <input type="hidden" name="step" value={step} />
  <input type="hidden" name="__superform_id" bind:value={$formId} />
  Step{step}<br />

  <section class="step1">
    <label for="media-name">{$t(`${RouteTypes.Form}.${Forms.Journalist}.media-name`)}</label>
    <input type="text" id="media-name" />
  </section>

  <button>Submit</button>
</form>
