<script lang="ts">
  import { page } from '$app/state';
  import { Forms, getValues, MediaTypes, RouteTypes, Titles, TravelReductions } from '$enums';
  import { t } from '$lib/translations';
  import type { MediaProfileJournalist } from '$types';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  // TODO SEO
  // TODO all dates return a string and not Date object
  const countries = $derived(Object.values((page.data as PageData).countries));
  const { form, formId, errors, message, enhance, submit: formSubmit } = $derived.by(() =>
    superForm((page.data as PageData).form, {
      dataType: 'json'
    })
  );
  const step = $derived($message?.step ?? 0);

  $effect(() => {
    console.log({ form: $form, errors: $errors, message: $message });
  });

  async function onSubmit() {
    const res = await formSubmit(); // sends JSON
    console.log(res);
  }
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
                defaultValue={$form.printMediaStatistics.broadcastLocation}
                bind:value={$form.printMediaStatistics.broadcastLocation}
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
                defaultValue={$form.printMediaStatistics.copies}
                bind:value={$form.printMediaStatistics.copies}
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
                defaultValue={$form.printMediaStatistics.readers}
                bind:value={$form.printMediaStatistics.readers}
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
                bind:value={$form.radioAndTVMediaStatistics.emissionName}
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
                defaultValue={$form.radioAndTVMediaStatistics.viewers}
                bind:value={$form.radioAndTVMediaStatistics.viewers}
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
                bind:value={$form.onlineMediaStatistics.website}
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
                defaultValue={$form.onlineMediaStatistics.monthlyUniqueVisitors}
                bind:value={$form.onlineMediaStatistics.monthlyUniqueVisitors}
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
                defaultValue={$form.onlineMediaStatistics.montlhyPageViews}
                bind:value={$form.onlineMediaStatistics.montlhyPageViews}
                aria-invalid={$errors.onlineMediaStatistics?.montlhyPageViews ? 'true' : undefined}
              />
            </div>
          </div>
        </section>
      {/if}
    </section>
  {/if}

  <button>Submit</button>
</form>
