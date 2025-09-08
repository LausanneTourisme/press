<script lang="ts">
  import { page } from '$app/state';
  import { Forms, MediaTypes, RouteTypes, Titles, TravelReductions } from '$enums';
  import { t } from '$lib/translations';
  import { superForm, type SuperForm } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import type { PageData } from './$types';
  import { schemaStep1Refined, schemaStep2Refined, schemaStep3, schemaStep4 } from './schema';
  // TODO SEO
  const countries = $derived(Object.values((page.data as PageData).countries));
  const steps = [
    zod(schemaStep1Refined),
    zod(schemaStep2Refined),
    zod(schemaStep3),
    zod(schemaStep4)
  ];
  let step = $state(0);
  let canDeleteEmergencyContacts = $state(false);

  const { form, formId, errors, enhance, message, options, validateForm } = $derived.by(() =>
    superForm((page.data as PageData).form, {
      dataType: 'json',
      onSubmit: async ({ cancel }) => {
        const isLast = steps.length - 1 === steps.length;
        options.validators = steps[step];
        console.log({ form: $form, errors: $errors, message: $message, step });
        // If on last step, make a normal request
        if (isLast) {
          $form.personalInformation.emergencyContacts =
            $form.personalInformation.emergencyContacts.filter(
              (x) => x.name !== undefined && x.phoneNumber !== undefined
            );
          return;
        } else {
          cancel();
        }
        const result = await validateForm({ update: true });
        if (result.valid) step = step + 1;
      }
    })
  );

  function addEmergencyContact() {
    $form.personalInformation.emergencyContacts = [
      ...$form.personalInformation.emergencyContacts,
      { phoneNumber: '', name: '' }
    ];
    canDeleteEmergencyContacts = true;
  }

  function removeEmergencyContact(index: number) {
    $form.personalInformation.emergencyContacts =
      $form.personalInformation.emergencyContacts.filter((_, i) => i !== index);
    if ($form.personalInformation.emergencyContacts.length <= 1) canDeleteEmergencyContacts = false;
  }
</script>

<h2>Media information</h2>
{step}
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
          placeholder={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-name-placeholder`)}
          bind:value={$form.mediaName}
          aria-invalid={$errors.mediaName ? 'true' : undefined}
        />
      </div>

      <div class="thematic">
        <label for="media-thematic">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic`)}
        </label>
        <input
          type="text"
          id="media-thematic"
          placeholder={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic-placeholder`)}
          bind:value={$form.thematic}
          aria-invalid={$errors.thematic ? 'true' : undefined}
        />
      </div>

      <div class="audience-profile">
        <label for="audience-profile">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile`)}
        </label>
        <input
          type="text"
          id="audience-profile"
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile-placeholder`
          )}
          bind:value={$form.audienceProfile}
          aria-invalid={$errors.audienceProfile ? 'true' : undefined}
        />
      </div>

      <!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
      <fieldset id="media-types" aria-invalid={$errors.mediaTypes ? 'true' : undefined}>
        <legend>
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.title`)}
        </legend>
        <div class="container">
          {#each Object.values(MediaTypes) as mediaType}
            <div>
              <input
                class=""
                type="checkbox"
                checked={$form.mediaTypes.includes(mediaType)}
                value={mediaType}
                id="media-type-{mediaType}"
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    $form.mediaTypes = [...$form.mediaTypes, mediaType];
                  } else {
                    $form.mediaTypes = $form.mediaTypes.filter(
                      (x) => x !== mediaType
                    ) as typeof $form.mediaTypes;
                  }
                }}
              />
              <label for="media-type-{mediaType}" class="">
                {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.${mediaType}`)}
              </label>
            </div>
          {/each}
        </div>

        {#if $errors.mediaTypes?._errors}
          <p id="media-types-error" class="error">
            {#each $errors.mediaTypes._errors as error}
              {$t(error)}
            {/each}
          </p>
        {/if}
      </fieldset>

      {#if $form.mediaTypes.includes(MediaTypes.Print)}
        <section class="print-statistics">
          <h3>
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.title`)}
          </h3>
          <div>
            <div class="broadcast-location">
              <label for="print-statistics-broadcastLocation" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.broadcast-location`
                )}
              </label>
              <input
                type="text"
                id="print-statistics-broadcastLocation"
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.broadcast-location-placeholder`
                )}
                defaultValue={$form.printMediaStatistics?.broadcastLocation ?? ''}
                onchange={(e) => {
                  const value = e.currentTarget.value;
                  if (value.trim().length) {
                    $form.printMediaStatistics = {
                      copies: 0,
                      readers: 0,
                      ...$form.printMediaStatistics,
                      broadcastLocation: value
                    };
                  }
                }}
                aria-invalid={$errors.printMediaStatistics?.broadcastLocation ? 'true' : undefined}
              />
            </div>
            <div class="copies">
              <label for="print-statistics-copies" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.copies`
                )}
              </label>
              <input
                type="number"
                id="print-statistics-copies"
                defaultValue={$form.printMediaStatistics?.copies ?? 0}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(value)) {
                    $form.printMediaStatistics = {
                      readers: 0,
                      broadcastLocation: '',
                      ...$form.printMediaStatistics,
                      copies: value
                    };
                  }
                }}
                aria-invalid={$errors.printMediaStatistics?.copies ? 'true' : undefined}
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
                defaultValue={$form.printMediaStatistics?.readers ?? 0}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(value)) {
                    $form.printMediaStatistics = {
                      copies: 0,
                      broadcastLocation: '',
                      ...$form.printMediaStatistics,
                      readers: value
                    };
                  }
                }}
                aria-invalid={$errors.printMediaStatistics?.readers ? 'true' : undefined}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if ($form.mediaTypes.includes(MediaTypes.Tv) && $form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Tv) && !$form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Radio) && !$form.mediaTypes.includes(MediaTypes.Tv))}
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
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.emission-name-placeholder`
                )}
                defaultValue={$form.radioAndTVMediaStatistics?.emissionName ?? ''}
                onchange={(e) => {
                  const value = e.currentTarget.value;
                  if (value.trim().length) {
                    $form.radioAndTVMediaStatistics = {
                      viewers: 0,
                      ...$form.radioAndTVMediaStatistics,
                      emissionName: value
                    };
                  }
                }}
                aria-invalid={$errors.radioAndTVMediaStatistics?.emissionName ? 'true' : undefined}
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
                defaultValue={$form.radioAndTVMediaStatistics?.viewers ?? 0}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(value)) {
                    $form.radioAndTVMediaStatistics = {
                      emissionName: '',
                      ...$form.radioAndTVMediaStatistics,
                      viewers: value
                    };
                  }
                }}
                aria-invalid={$errors.radioAndTVMediaStatistics?.viewers ? 'true' : undefined}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if $form.mediaTypes.includes(MediaTypes.Online)}
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
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.website-placeholder`
                )}
                defaultValue={$form.onlineMediaStatistics?.website ?? ''}
                onchange={(e) => {
                  const value = e.currentTarget.value;
                  if (value.trim().length) {
                    $form.onlineMediaStatistics = {
                      monthlyUniqueVisitors: 0,
                      montlhyPageViews: 0,
                      ...$form.onlineMediaStatistics,
                      website: value
                    };
                  }
                }}
                aria-invalid={$errors.onlineMediaStatistics?.website ? 'true' : undefined}
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
                defaultValue={$form.onlineMediaStatistics?.monthlyUniqueVisitors ?? 0}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(value)) {
                    $form.onlineMediaStatistics = {
                      montlhyPageViews: 0,
                      website: '',
                      ...$form.onlineMediaStatistics,
                      monthlyUniqueVisitors: value
                    };
                  }
                }}
                aria-invalid={$errors.onlineMediaStatistics?.monthlyUniqueVisitors
                  ? 'true'
                  : undefined}
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
                defaultValue={$form.onlineMediaStatistics?.montlhyPageViews ?? 0}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(value)) {
                    $form.onlineMediaStatistics = {
                      monthlyUniqueVisitors: 0,
                      website: '',
                      ...$form.onlineMediaStatistics,
                      montlhyPageViews: value
                    };
                  } else {
                    $form.onlineMediaStatistics = {
                      monthlyUniqueVisitors: 0,
                      website: '',
                      montlhyPageViews: 0,
                      ...$form.onlineMediaStatistics
                    };
                  }
                }}
                aria-invalid={$errors.onlineMediaStatistics?.montlhyPageViews ? 'true' : undefined}
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

      {#if $form.mediaTypes.includes(MediaTypes.Print)}
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
                defaultValue={$form.mediaCoveragePrint.totalPages ?? 0}
                bind:value={$form.mediaCoveragePrint.totalPages}
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
                defaultValue={$form.mediaCoveragePrint.articleLength}
                bind:value={$form.mediaCoveragePrint.articleLength}
              />
            </div>
            <div class="publish-date">
              <label for="print-coverage-publish-date" class="">
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.publish-date`
                )}
              </label>
              <input
                type="date"
                id="{MediaTypes.Print}-coverage-publish-date"
                name="{MediaTypes.Print}-coverage-publish-date"
                defaultValue={$form.mediaCoveragePrint.publishDate}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsDate;
                  if (value) {
                    $form.mediaCoveragePrint.publishDate = value;
                  }
                }}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if ($form.mediaTypes.includes(MediaTypes.Tv) && $form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Tv) && !$form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Radio) && !$form.mediaTypes.includes(MediaTypes.Tv))}
        <section class="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage">
          <h3>
            {$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Radio}-and-${MediaTypes.Tv}.title`
            )}
          </h3>
          <div class="container">
            <div class="article-thematic">
              <label
                for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
                class=""
              >
                {$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Radio}-and-${MediaTypes.Tv}.article-thematic`
                )}
              </label>
              <input
                type="text"
                id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
                name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
                placeholder={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Radio}-and-${MediaTypes.Tv}.article-thematic-placeholder`
                )}
                bind:value={$form.mediaCoverageTvOrRadio.articleThematic}
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
                defaultValue={$form.mediaCoverageTvOrRadio.publishDate}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsDate;
                  if (value) {
                    $form.mediaCoverageTvOrRadio.publishDate = value;
                  }
                }}
              />
            </div>
          </div>
        </section>
      {/if}
      {#if $form.mediaTypes.includes(MediaTypes.Online)}
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
                bind:value={$form.mediaCoverageOnline.articleLength}
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
                bind:value={$form.mediaCoverageOnline.articleThematic}
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
                defaultValue={$form.mediaCoverageOnline.publishDate}
                onchange={(e) => {
                  const value = e.currentTarget.valueAsDate;
                  if (value) {
                    $form.mediaCoverageOnline.publishDate = value;
                  }
                }}
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
            bind:value={$form.travelInformation.departurePoint.city}
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
            bind:value={$form.travelInformation.departurePoint.country}
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
            bind:value={$form.travelInformation.departurePoint.outwardJourney}
            maxlength="300"
          ></textarea>
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
          bind:value={$form.travelInformation.returnJourney}
          maxlength="300"
        ></textarea>
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
                  defaultValue={$form.travelInformation.travelReductions?.includes(travelReduction)}
                  id={travelReduction}
                  onchange={(e) => {
                    if (!$form.travelInformation.travelReductions) {
                      $form.travelInformation.travelReductions = [];
                    }
                    if (!e.currentTarget.checked) {
                      $form.travelInformation.travelReductions =
                        $form.travelInformation.travelReductions?.filter(
                          (x) => x !== travelReduction
                        ) ?? [];
                    } else {
                      $form.travelInformation.travelReductions.push(travelReduction);
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
          defaultValue={$form.travelInformation.lastVisit}
          onchange={(e) => {
            const value = e.currentTarget.valueAsDate;
            if (value) {
              $form.travelInformation.lastVisit = value;
            }
          }}
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
        {#each Object.values(Titles) as title}
          <input
            type="radio"
            id="personal-information-title-{title}"
            name="personal-information-title"
            checked={title === 'they'}
            onchange={(e) => {
              if (e.currentTarget.checked) {
                $form.personalInformation.title = title;
              }
            }}
          />
          <label for="personal-information-title-{title}">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${title}`)}
          </label>
        {/each}
      </fieldset>

      <div class="personal-information-first-name">
        <label for="personal-information-first-name">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name`)}
        </label>
        <input
          type="text"
          id="personal-information-first-name"
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name-placeholder`
          )}
          bind:value={$form.personalInformation.firstName}
        />
      </div>

      <div class="personal-information-last-name">
        <label for="personal-information-last-name">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name`)}
        </label>
        <input
          type="text"
          id="personal-information-last-name"
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name-placeholder`
          )}
          bind:value={$form.personalInformation.lastName}
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
            onchange={(e) => ($form.personalInformation.freelance = false)}
          />
          <label for="personal-information-freelance-false">
            {$t(`${RouteTypes.Form}.no`)}
          </label>
        </div>
        <div class="freelance-true">
          <input
            type="radio"
            id="personal-information-freelance-true"
            name="personal-information-freelance"
            onchange={(e) => ($form.personalInformation.freelance = true)}
          />
          <label for="personal-information-freelance-true">
            {$t(`${RouteTypes.Form}.yes`)}
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
          placeholder={$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.placeholder`
          )}
          bind:value={$form.personalInformation.spokenLanguages}
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
            bind:value={$form.personalInformation.passport.number}
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
            defaultValue={$form.personalInformation.passport.validity}
            onchange={(e) => {
              const value = e.currentTarget.valueAsDate;
              if (value) {
                $form.personalInformation.passport.validity = value;
              }
            }}
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
          defaultValue={$form.personalInformation.birthday}
          onchange={(e) => {
            const value = e.currentTarget.valueAsDate;
            if (value) {
              $form.personalInformation.birthday = value;
            }
          }}
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
            bind:value={$form.personalInformation.address.streetAddress}
          />
        </div>

        <div class="personal-information-address-city">
          <label for="personal-information-address-city">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`)}
          </label>
          <input
            type="text"
            id="personal-information-address-city"
            bind:value={$form.personalInformation.address.city}
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
            bind:value={$form.personalInformation.address.postalcode}
          />
        </div>

        <div class="personal-information-address-country">
          <label for="personal-information-address-country">
            {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.country`)}
          </label>

          <select
            id="personal-information-address-country"
            bind:value={$form.personalInformation.address.country}
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
          bind:value={$form.personalInformation.phoneNumber}
        />
      </div>

      <div class="personal-information-email">
        <label for="personal-information-email">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.email`)}
        </label>
        <input
          type="email"
          id="personal-information-email"
          bind:value={$form.personalInformation.email}
        />
      </div>

      <div class="personal-information-allergies">
        <label for="personal-information-allergies">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.allergies`)}
        </label>
        <input
          type="text"
          id="personal-information-allergies"
          bind:value={$form.personalInformation.allergies}
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
          bind:value={$form.personalInformation.medicalAndPhysicalCondition}
        />
      </div>

      <div class="personal-information-emergency-contacts">
        <h3>
          {$t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.title`
          )}
        </h3>
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
        {#each $form.personalInformation.emergencyContacts as _, i}
          <div class="personal-information-emergency-contact">
            <input
              type="text"
              class="personal-information-emergency-contact-name"
              bind:value={$form.personalInformation.emergencyContacts[i].name}
            />
            <input
              type="text"
              class="personal-information-emergency-contact-phone-number"
              bind:value={$form.personalInformation.emergencyContacts[i].phoneNumber}
            />
            <button type="button" onclick={addEmergencyContact}>add</button>
            <button
              type="button"
              class={[!canDeleteEmergencyContacts && 'hidden']}
              onclick={() => removeEmergencyContact(i)}
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
            name="personal-information-travel-insurance"
            onchange={(e) => ($form.travelInsuranceCoveringSwitzerland = false)}
          />
          <label for="personal-information-travel-insurance-false">
            {$t(`${RouteTypes.Form}.no`)}
          </label>
        </div>
        <div class="travel-insurance-true">
          <input
            type="radio"
            id="personal-information-travel-insurance-true"
            name="personal-information-travel-insurance"
            onchange={(e) => ($form.travelInsuranceCoveringSwitzerland = true)}
          />
          <label for="personal-information-travel-insurance-true">
            {$t(`${RouteTypes.Form}.yes`)}
          </label>
        </div>
      </fieldset>

      <div class="personal-information-remarks">
        <label for="personal-information-remarks">
          {$t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.remarks`)}
        </label>
        <textarea id="personal-information-remarks" bind:value={$form.remarks}></textarea>
      </div>

      <div class="terms-of-acceptance">
        <h3>
          {$t(`${RouteTypes.Form}.terms-of-acceptance.title`)}
        </h3>
        <p>
          {$t(`${RouteTypes.Form}.terms-of-acceptance.content`)}
        </p>
        <input
          type="checkbox"
          defaultValue={false}
          id="terms-of-acceptance"
          onchange={(e) => {
            $form.readTermsOfAcceptance = e.currentTarget.checked;
          }}
        />
        <label for="terms-of-acceptance" class="">
          {$t(`${RouteTypes.Form}.terms-of-acceptance.accept-terms`)}
        </label>
      </div>

      <fieldset class="newsletter">
        <legend>
          {$t(`${RouteTypes.Form}.newsletter.title`)}
        </legend>
        <p>
          {$t(`${RouteTypes.Form}.newsletter.paragraph`)}
        </p>
        <div class="newsletter-false">
          <input
            type="radio"
            id="personal-information-newsletter-false"
            name="personal-information-newsletter"
            onchange={(e) => ($form.newsletter = false)}
          />
          <label for="personal-information-newsletter-false">
            {$t(`${RouteTypes.Form}.no`)}
          </label>
        </div>
        <div class="newsletter-true">
          <input
            type="radio"
            id="personal-information-newsletter-true"
            name="personal-information-newsletter"
            onchange={(e) => ($form.newsletter = true)}
          />
          <label for="personal-information-newsletter-true">
            {$t(`${RouteTypes.Form}.yes`)}
          </label>
        </div>
      </fieldset>
    </section>
  {/if}
  <button>Submit</button>
</form>
