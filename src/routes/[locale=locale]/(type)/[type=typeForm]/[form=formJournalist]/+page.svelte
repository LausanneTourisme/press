<script lang="ts">
  import { page } from '$app/state';
  import { Forms, MediaTypes, RouteTypes } from '$enums';
  import { t } from '$lib/translations';
  import type { MediaProfileJournalist } from '$types';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  // TODO SEO
  const countries = $derived(Object.values((page.data as PageData).countries));
  const { form, formId, errors, message, capture, restore } = $derived.by(() =>
    superForm((page.data as PageData).form, {
      dataType: 'json',
      onSubmit: async ({ cancel }) => {}
    })
  );
  const step = $derived($message?.step ?? 0);

  let mediaProfile: MediaProfileJournalist = $state({
    mediaName: undefined,
    thematic: undefined,
    audienceProfile: undefined,
    mediaTypes: [],
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
      emergencyContacts: []
    },
    travelInsuranceCoveringSwitzerland: undefined,
    remarks: undefined,
    readTermsOfAcceptance: undefined,
    newsletter: undefined
  });

  $effect(() => {
    console.log({ errors: $errors, message: $message });
  });
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
    <div class="media-name">
      <label for="media-name">
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-name`)}
      </label>
      <input
        type="text"
        id="media-name"
        name="media-name"
        placeholder={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-name-placeholder`)}
        bind:value={mediaProfile.mediaName}
      />
    </div>

    <div class="thematic">
      <label for="thematic">
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic`)}
      </label>
      <input
        type="text"
        id="media-thematic"
        name="media-thematic"
        placeholder={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic-placeholder`)}
        bind:value={mediaProfile.thematic}
      />
    </div>

    <div class="audience-profile">
      <label for="audience-profile">
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile`)}
      </label>
      <input
        type="text"
        id="audience-profile"
        name="audience-profile"
        placeholder={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile-placeholder`)}
        bind:value={mediaProfile.audienceProfile}
      />
    </div>

    <fieldset id="media-type">
      <legend>
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.media-type`)}
      </legend>
      <div class="container">
        {#each Object.values(MediaTypes) as mediaType}
          <div>
            <input
              class=""
              name="media-type-{mediaType}"
              type="checkbox"
              defaultValue={mediaProfile.mediaTypes.includes(mediaType)}
              id="media-type-{mediaType}"
              onchange={(e) => {
                if (!e.currentTarget.checked) {
                  mediaProfile.mediaTypes = mediaProfile.mediaTypes.filter((x) => x !== mediaType);
                } else {
                  mediaProfile.mediaTypes.push(mediaType);
                }
              }}
            />
            <label for="media-type-{mediaType}" class="">
              {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.${mediaType}`)}
            </label>
          </div>
        {/each}
      </div>
    </fieldset>

    {#if mediaProfile.mediaTypes.includes(MediaTypes.Print)}
      <fieldset class="print-statistics">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.title`)}
        </legend>
        <div class="container">
          <div class="copies">
            <label for="print-statistics-copies" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.copies`
              )}
            </label>
            <input
              type="number"
              id="print-statistics-copies"
              name="print-statistics-copies"
              defaultValue={mediaProfile.printMediaStatistics.copies}
              bind:value={mediaProfile.printMediaStatistics.copies}
            />
          </div>
          <div class="readers">
            <label for="print-statistics-readers" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.readers`
              )}
            </label>
            <input
              type="number"
              id="print-statistics-readers"
              name="print-statistics-readers"
              defaultValue={mediaProfile.printMediaStatistics.readers}
              bind:value={mediaProfile.printMediaStatistics.readers}
            />
          </div>
        </div>
      </fieldset>
    {/if}
    {#if (mediaProfile.mediaTypes.includes(MediaTypes.Tv) && mediaProfile.mediaTypes.includes(MediaTypes.Radio)) || (mediaProfile.mediaTypes.includes(MediaTypes.Tv) && !mediaProfile.mediaTypes.includes(MediaTypes.Radio)) || (mediaProfile.mediaTypes.includes(MediaTypes.Radio) && !mediaProfile.mediaTypes.includes(MediaTypes.Tv))}
      <fieldset class="tv-and-radio-statistics">
        <legend>
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.title`
          )}
        </legend>
        <div class="container">
          <div class="emission-name">
            <label for="tv-and-radio-statistics-emission-name" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.emission-name`
              )}
            </label>
            <input
              type="text"
              id="tv-and-radio-statistics-emission-name"
              name="tv-and-radio-statistics-emission-name"
              placeholder={$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.emission-name-placeholder`
              )}
              bind:value={mediaProfile.radioAndTVMediaStatistics.emissionName}
            />
          </div>
          <div class="viewers">
            <label for="tv-and-radio-statistics-viewers" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.viewers`
              )}
            </label>
            <input
              type="number"
              id="tv-and-radio-statistics-viewers"
              name="tv-and-radio-statistics-viewers"
              defaultValue={mediaProfile.radioAndTVMediaStatistics.viewers}
              bind:value={mediaProfile.radioAndTVMediaStatistics.viewers}
            />
          </div>
        </div>
      </fieldset>
    {/if}
    {#if mediaProfile.mediaTypes.includes(MediaTypes.Online)}
      <fieldset class="online-statistics">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.title`)}
        </legend>
        <div class="container">
          <div class="website">
            <label for="online-statistics-website" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.website`
              )}
            </label>
            <input
              type="url"
              id="online-statistics-website"
              name="online-statistics-website"
              placeholder={$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.website-placeholder`
              )}
              bind:value={mediaProfile.onlineMediaStatistics.website}
            />
          </div>
          <div class="monthly-unique-visitors">
            <label for="online-statistics-monthly-unique-visitors" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.monthly-unique-visitors`
              )}
            </label>
            <input
              type="number"
              id="online-statistics-monthly-unique-visitors"
              name="online-statistics-monthly-unique-visitors"
              defaultValue={mediaProfile.onlineMediaStatistics.monthlyUniqueVisitors}
              bind:value={mediaProfile.onlineMediaStatistics.monthlyUniqueVisitors}
            />
          </div>
          <div class="montlhy-page-views">
            <label for="online-statistics-montlhy-page-views" class="">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.montlhy-page-views`
              )}
            </label>
            <input
              type="number"
              id="online-statistics-montlhy-page-views"
              name="online-statistics-montlhy-page-views"
              defaultValue={mediaProfile.onlineMediaStatistics.montlhyPageViews}
              bind:value={mediaProfile.onlineMediaStatistics.montlhyPageViews}
            />
          </div>
        </div>
      </fieldset>
    {/if}
  </section>

  <section class="step2"></section>

  <button>Submit</button>
</form>
