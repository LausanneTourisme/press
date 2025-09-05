<script lang="ts">
  import { page } from '$app/state';
  import { Forms, MediaTypes, RouteTypes, Titles, TravelReductions } from '$enums';
  import { t } from '$lib/translations';
  import type { MediaProfileJournalist } from '$types';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  // TODO SEO
  // TODO all dates return a string and not Date object
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
      travelReductions: [],
      lastVisit: undefined
    },
    personalInformation: {
      title: 'they',
      firstName: undefined,
      lastName: undefined,
      birthday: undefined,
      phoneNumber: undefined,
      email: undefined,
      address: {
        streetAddress: undefined,
        city: undefined,
        postalcode: undefined,
        country: undefined
      },
      freelance: undefined,
      spokenLanguages: undefined,
      allergies: undefined,
      medicalAndPhysicalCondition: undefined,
      passport: {
        number: undefined,
        validity: undefined
      },
      emergencyContacts: [{ name: undefined, phoneNumber: undefined }]
    },
    travelInsuranceCoveringSwitzerland: undefined,
    remarks: undefined,
    readTermsOfAcceptance: undefined,
    newsletter: undefined
  });
  let canDeleteEmergencyContacts = $state(false);

  $effect(() => {
    canDeleteEmergencyContacts = mediaProfile.personalInformation.emergencyContacts.length > 1;
  });
  $effect(() => {
    console.log({ form: $form, errors: $errors, message: $message });
  });
</script>

<h2>Media information</h2>

<form method="POST" use:enhance>
  <input type="hidden" name="step" value={step} />
  <input type="hidden" name="__superform_id" bind:value={$formId} />

  {#if step === 0}
    <section class="step1 about-media">
      <h2>
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.about-media`)}
      </h2>
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
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile-placeholder`
          )}
          bind:value={mediaProfile.audienceProfile}
        />
      </div>

      <fieldset id="media-types">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.title`)}
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
                    mediaProfile.mediaTypes = mediaProfile.mediaTypes.filter(
                      (x) => x !== mediaType
                    );
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
        <section class="print-statistics">
          <h3>
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.title`)}
          </h3>
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
        </section>
      {/if}
      {#if (mediaProfile.mediaTypes.includes(MediaTypes.Tv) && mediaProfile.mediaTypes.includes(MediaTypes.Radio)) || (mediaProfile.mediaTypes.includes(MediaTypes.Tv) && !mediaProfile.mediaTypes.includes(MediaTypes.Radio)) || (mediaProfile.mediaTypes.includes(MediaTypes.Radio) && !mediaProfile.mediaTypes.includes(MediaTypes.Tv))}
        <section class="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics">
          <h3>
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.title`
            )}
          </h3>
          <div class="container">
            <div class="emission-name">
              <label for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-emission-name" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.emission-name`
                )}
              </label>
              <input
                type="text"
                id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-emission-name"
                name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-emission-name"
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.emission-name-placeholder`
                )}
                bind:value={mediaProfile.radioAndTVMediaStatistics.emissionName}
              />
            </div>
            <div class="viewers">
              <label for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-viewers" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.viewers`
                )}
              </label>
              <input
                type="number"
                id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-viewers"
                name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-viewers"
                defaultValue={mediaProfile.radioAndTVMediaStatistics.viewers}
                bind:value={mediaProfile.radioAndTVMediaStatistics.viewers}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if mediaProfile.mediaTypes.includes(MediaTypes.Online)}
        <section class="online-statistics">
          <h3>
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.title`
            )}
          </h3>
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
        </section>
      {/if}
    </section>
  {/if}

  {#if step === 1}
    <section class="step2 media-coverage">
      <h2>
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.title`)}
      </h2>

      {#if mediaProfile.mediaTypes.includes(MediaTypes.Print)}
        <section class="print-coverage">
          <h3>
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.title`)}
          </h3>
          <div class="container">
            <div class="total-pages">
              <label for="print-coverage-total-pages" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.total-pages`
                )}
              </label>
              <input
                type="number"
                id="print-coverage-total-pages"
                name="print-coverage-total-pages"
                defaultValue={mediaProfile.mediaCoveragePrint.totalPages}
                bind:value={mediaProfile.mediaCoveragePrint.totalPages}
              />
            </div>
            <div class="article-length">
              <label for="print-coverage-article-length" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.article-length`
                )}
              </label>
              <input
                type="text"
                id="print-coverage-article-length"
                name="print-coverage-article-length"
                defaultValue={mediaProfile.mediaCoveragePrint.articleLength}
                bind:value={mediaProfile.mediaCoveragePrint.articleLength}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if (mediaProfile.mediaTypes.includes(MediaTypes.Tv) && mediaProfile.mediaTypes.includes(MediaTypes.Radio)) || (mediaProfile.mediaTypes.includes(MediaTypes.Tv) && !mediaProfile.mediaTypes.includes(MediaTypes.Radio)) || (mediaProfile.mediaTypes.includes(MediaTypes.Radio) && !mediaProfile.mediaTypes.includes(MediaTypes.Tv))}
        <section class="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage">
          <h3>
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.title`)}
          </h3>
          <div class="container">
            <div class="article-thematic">
              <label
                for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
                class=""
              >
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-thematic`
                )}
              </label>
              <input
                type="text"
                id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
                name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-thematic-placeholder`
                )}
                bind:value={mediaProfile.mediaCoverageOnline.articleThematic}
              />
            </div>
            <div class="publish-date">
              <label for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-publish-date" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.publish-date`
                )}
              </label>
              <input
                type="date"
                id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-publish-date"
                name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-publish-date"
                bind:value={mediaProfile.mediaCoverageOnline.publishDate}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if mediaProfile.mediaTypes.includes(MediaTypes.Online)}
        <section class="online-coverage">
          <h3>
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.title`)}
          </h3>
          <div class="container">
            <div class="article-length">
              <label for="online-coverage-article-length" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-length`
                )}
              </label>
              <input
                type="text"
                id="online-coverage-article-length"
                name="online-coverage-article-length"
                bind:value={mediaProfile.mediaCoverageOnline.articleLength}
              />
            </div>
            <div class="article-thematic">
              <label for="online-coverage-article-thematic" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-thematic`
                )}
              </label>
              <input
                type="text"
                id="online-coverage-article-thematic"
                name="online-coverage-article-thematic"
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-thematic-placeholder`
                )}
                bind:value={mediaProfile.mediaCoverageOnline.articleThematic}
              />
            </div>
            <div class="publish-date">
              <label for="online-coverage-publish-date" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.publish-date`
                )}
              </label>
              <input
                type="date"
                id="online-coverage-publish-date"
                name="online-coverage-publish-date"
                bind:value={mediaProfile.mediaCoverageOnline.publishDate}
              />
            </div>
          </div>
        </section>
      {/if}
    </section>
  {/if}

  {#if step === 2}
    <section class="step3 travel-information">
      <h2>
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.title`)}
      </h2>

      <section class="departure-point">
        <h3>
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.title`
          )}
        </h3>
        <div class="departure-point-city">
          <label for="departure-point-city">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.city`
            )}
          </label>
          <input
            type="text"
            id="departure-point-city"
            name="departure-point-city"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.city-placeholder`
            )}
            bind:value={mediaProfile.travelInformation.departurePoint.city}
          />
        </div>
        <div class="departure-point-country">
          <label for="departure-point-country">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.country`
            )}
          </label>
          <select
            id="departure-point-country"
            name="departure-point-country"
            bind:value={mediaProfile.travelInformation.departurePoint.country}
          >
            <option hidden disabled selected value={undefined}
              >{$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.country-placeholder`
              )}</option
            >
            {#each countries as country}
              <option value={country}>{country}</option>
            {/each}
          </select>
        </div>
        <div class="departure-point-outward-journey">
          <label for="departure-point-outward-journey">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.title`
            )}
          </label>
          <p class="departure-point-outward-journey information">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.information`
            )}
          </p>
          <textarea
            id="departure-point-outward-journey"
            name="departure-point-outward-journey"
            bind:value={mediaProfile.travelInformation.departurePoint.outwardJourney}
            maxlength="300"
          >
          </textarea>
        </div>
      </section>

      <div class="return-journey">
        <label for="travel-information-return-journey">
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.return-journey.title`
          )}
        </label>
        <p class="travel-information-return-journey information">
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.return-journey.information`
          )}
        </p>
        <textarea
          id="travel-information-return-journey"
          name="travel-information-return-journey"
          bind:value={mediaProfile.travelInformation.returnJourney}
          maxlength="300"
        >
        </textarea>
      </div>

      <section class="travel-reductions">
        <h3>
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.title`
          )}
        </h3>

        <fieldset id="travel-reductions">
          <legend>
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.please-tick`
            )}
          </legend>
          <div class="container">
            {#each Object.values(TravelReductions) as travelReduction}
              <div>
                <input
                  class=""
                  name={travelReduction}
                  type="checkbox"
                  defaultValue={mediaProfile.travelInformation.travelReductions.includes(
                    travelReduction
                  )}
                  id={travelReduction}
                  onchange={(e) => {
                    if (!e.currentTarget.checked) {
                      mediaProfile.travelInformation.travelReductions =
                        mediaProfile.travelInformation.travelReductions.filter(
                          (x) => x !== travelReduction
                        );
                    } else {
                      mediaProfile.travelInformation.travelReductions.push(travelReduction);
                    }
                  }}
                />
                <label for={travelReduction} class="">
                  {$t(
                    `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${travelReduction}`
                  )}
                </label>
              </div>
            {/each}
          </div>
        </fieldset>
      </section>

      <div class="last-visit">
        <label for="travel-information-return-journey">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.last-visit`)}
        </label>
        <input
          type="date"
          id="travel-information-return-journey"
          name="travel-information-return-journey"
          bind:value={mediaProfile.travelInformation.lastVisit}
        />
      </div>
    </section>
  {/if}

  {#if step === 3}
    <section class="step4 personal-information">
      <h2>
        {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.title`)}
      </h2>

      <fieldset class="titles">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.title`)}
        </legend>
        <div class="container">
          {#each Object.values(Titles) as title}
            <input
              type="radio"
              id="personal-information-title-{title}"
              name="personal-information-title"
              checked={title === 'they'}
              onchange={(e) => {
                if (e.currentTarget.checked) {
                  mediaProfile.personalInformation.title = title;
                }
              }}
            />
            <label for="personal-information-title-{title}">
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${title}`
              )}
            </label>
          {/each}
        </div>
      </fieldset>

      <div class="personal-information-first-name">
        <label for="personal-information-first-name">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name`)}
        </label>
        <input
          type="text"
          id="personal-information-first-name"
          name="personal-information-first-name"
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name-placeholder`
          )}
          bind:value={mediaProfile.personalInformation.firstName}
        />
      </div>

      <div class="personal-information-last-name">
        <label for="personal-information-last-name">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name`)}
        </label>
        <input
          type="text"
          id="personal-information-last-name"
          name="personal-information-last-name"
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name-placeholder`
          )}
          bind:value={mediaProfile.personalInformation.lastName}
        />
      </div>

      <fieldset class="is-freelance">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.freelance`)}
        </legend>
        <div class="freelance-false">
          <input
            type="radio"
            id="personal-information-freelance-false"
            name="personal-information-freelance"
            onchange={(e) => (mediaProfile.personalInformation.freelance = false)}
          />
          <label for="personal-information-freelance-false">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.no`)}
          </label>
        </div>
        <div class="freelance-true">
          <input
            type="radio"
            id="personal-information-freelance-true"
            name="personal-information-freelance"
            onchange={(e) => (mediaProfile.personalInformation.freelance = true)}
          />
          <label for="personal-information-freelance-true">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.yes`)}
          </label>
        </div>
      </fieldset>

      <div class="personal-information-spoken-languages">
        <label for="personal-information-spoken-languages">
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.title`
          )}
        </label>
        <input
          type="text"
          id="personal-information-spoken-languages"
          name="personal-information-spoken-languages"
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.placeholder`
          )}
          bind:value={mediaProfile.personalInformation.spokenLanguages}
        />
      </div>

      <section class="passport">
        <h3>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.title`)}
        </h3>

        <div>
          <label for="personal-information-passport-number">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.number`)}
          </label>
          <input
            type="text"
            id="personal-information-passport-number"
            name="personal-information-passport-number"
            bind:value={mediaProfile.personalInformation.passport.number}
          />
        </div>

        <div>
          <label for="personal-information-passport-validity">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.validity`
            )}
          </label>
          <input
            type="date"
            id="personal-information-passport-validity"
            name="personal-information-passport-validity"
            bind:value={mediaProfile.personalInformation.passport.validity}
          />
        </div>
      </section>

      <div class="personal-information-birth-date">
        <label for="personal-information-birth-date">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.birth-date`)}
        </label>
        <input
          type="date"
          id="personal-information-birth-date"
          name="personal-information-birth-date"
          bind:value={mediaProfile.personalInformation.birthday}
        />
      </div>
      <section class="address">
        <h3>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.title`)}
        </h3>

        <div class="personal-information-address-street-address">
          <label for="personal-information-address-street-address">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.street-address`
            )}
          </label>
          <input
            type="text"
            id="personal-information-address-street-address"
            name="personal-information-address-street-address"
            bind:value={mediaProfile.personalInformation.address.streetAddress}
          />
        </div>

        <div class="personal-information-address-city">
          <label for="personal-information-address-city">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`)}
          </label>
          <input
            type="text"
            id="personal-information-address-city"
            name="personal-information-address-city"
            bind:value={mediaProfile.personalInformation.address.city}
          />
        </div>

        <div class="personal-information-address-zip">
          <label for="personal-information-address-zip">
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.postal-code`
            )}
          </label>
          <input
            type="text"
            id="personal-information-address-zip"
            name="personal-information-address-zip"
            bind:value={mediaProfile.personalInformation.address.postalcode}
          />
        </div>

        <div class="personal-information-address-country">
          <label for="personal-information-address-country">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.country`)}
          </label>

          <select
            id="personal-information-address-country"
            name="personal-information-address-country"
            bind:value={mediaProfile.personalInformation.address.country}
          >
            <option hidden disabled selected value={undefined}>
              {$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.country-placeholder`
              )}
            </option>
            {#each countries as country}
              <option value={country}>{country}</option>
            {/each}
          </select>
        </div>
      </section>

      <div class="personal-information-phone-number">
        <label for="personal-information-phone-number">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.phone-number`)}
        </label>
        <input
          type="text"
          id="personal-information-phone-number"
          name="personal-information-phone-number"
          bind:value={mediaProfile.personalInformation.phoneNumber}
        />
      </div>

      <div class="personal-information-email">
        <label for="personal-information-email">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.email`)}
        </label>
        <input
          type="email"
          id="personal-information-email"
          name="personal-information-email"
          bind:value={mediaProfile.personalInformation.email}
        />
      </div>

      <div class="personal-information-allergies">
        <label for="personal-information-allergies">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.allergies`)}
        </label>
        <input
          type="text"
          id="personal-information-allergies"
          name="personal-information-allergies"
          bind:value={mediaProfile.personalInformation.allergies}
        />
      </div>

      <div class="personal-information-medical-and-physical-condition">
        <label for="personal-information-medical-and-physical-condition">
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.medical-and-physical-condition`
          )}
        </label>
        <input
          type="text"
          id="personal-information-medical-and-physical-condition"
          name="personal-information-medical-and-physical-condition"
          bind:value={mediaProfile.personalInformation.medicalAndPhysicalCondition}
        />
      </div>

      <div class="personal-information-emergency-contacts">
        <div>
          <p>
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`
            )}
          </p>
          <p>
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`
            )}
          </p>
        </div>
        {#each mediaProfile.personalInformation.emergencyContacts as ec, index ([ec.name, ec.phoneNumber])}
          <div class="personal-information-emergency-contact">
            <div class="hidden">{index}</div>
            <input
              type="text"
              id="personal-information-emergency-contact-name-{index}"
              name="personal-information-emergency-contact-{index}[]"
              defaultValue={mediaProfile.personalInformation.emergencyContacts[index].name ?? ''}
              onchange={(e) => {
                const value = e.currentTarget.value;
                if (!value.trim().length) {
                  mediaProfile.personalInformation.emergencyContacts[index].name = undefined;
                } else {
                  mediaProfile.personalInformation.emergencyContacts[index].name =
                    value.trimStart();
                }
              }}
            />
            <input
              type="text"
              id="personal-information-emergency-contact-phone-number-{index}"
              name="personal-information-emergency-contact-{index}[]"
              defaultValue={mediaProfile.personalInformation.emergencyContacts[index].phoneNumber ??
                ''}
              onchange={(e) => {
                const value = e.currentTarget.value;
                if (!value.trim().length) {
                  mediaProfile.personalInformation.emergencyContacts[index].phoneNumber = undefined;
                } else {
                  mediaProfile.personalInformation.emergencyContacts[index].phoneNumber =
                    value.trimStart();
                }
              }}
            />
            <button
              type="button"
              onclick={() =>
                mediaProfile.personalInformation.emergencyContacts.push({
                  name: undefined,
                  phoneNumber: undefined
                })}>add</button
            >
            <button
              type="button"
              class={[!canDeleteEmergencyContacts && 'hidden']}
              onclick={() => mediaProfile.personalInformation.emergencyContacts.splice(index, 1)}
              disabled={!canDeleteEmergencyContacts}>delete</button
            >
          </div>
        {/each}
      </div>

      <fieldset class="has-travel-insurance">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.travel-insurance`)}
        </legend>
        <div class="travel-insurance-false">
          <input
            type="radio"
            id="personal-information-travel-insurance-false"
            name="personal-information-freelance"
            onchange={(e) => (mediaProfile.travelInsuranceCoveringSwitzerland = false)}
          />
          <label for="personal-information-travel-insurance-false">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.no`)}
          </label>
        </div>
        <div class="travel-insurance-true">
          <input
            type="radio"
            id="personal-information-travel-insurance-true"
            name="personal-information-travel-insurance"
            onchange={(e) => (mediaProfile.travelInsuranceCoveringSwitzerland = true)}
          />
          <label for="personal-information-travel-insurance-true">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.yes`)}
          </label>
        </div>
      </fieldset>

      <div class="personal-information-remarks">
        <label for="personal-information-remarks">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.remarks`)}
        </label>
        <textarea
          id="personal-information-remarks"
          name="personal-information-remarks"
          bind:value={mediaProfile.remarks}
        ></textarea>
      </div>

      <div class="terms-of-acceptance">
        <h3>
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.terms-of-acceptance.title`
          )}
        </h3>
        <input
          name="terms-of-acceptance"
          type="checkbox"
          defaultValue={false}
          id="terms-of-acceptance"
          onchange={(e) => {
            mediaProfile.readTermsOfAcceptance = e.currentTarget.checked;
          }}
        />
        <p>
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.terms-of-acceptance.content`
          )}
        </p>
        <label for="terms-of-acceptance" class="">
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.terms-of-acceptance.accept-terms`
          )}
        </label>
      </div>

      <fieldset class="newsletter">
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.newsletter.title`)}
        </legend>
        <p>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.newsletter.paragraph`)}
          </p>
        <div class="newsletter-false">
          <input
            type="radio"
            id="personal-information-newsletter-false"
            name="personal-information-freelance"
            onchange={(e) => (mediaProfile.newsletter = false)}
          />
          <label for="personal-information-newsletter-false">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.no`)}
          </label>
        </div>
        <div class="newsletter-true">
          <input
            type="radio"
            id="personal-information-newsletter-true"
            name="personal-information-newsletter"
            onchange={(e) => (mediaProfile.newsletter = true)}
          />
          <label for="personal-information-newsletter-true">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.yes`)}
          </label>
        </div>
      </fieldset>
    </section>
  {/if}

  <button>Submit</button>
</form>
