<script lang="ts">
  import { page } from '$app/state';
  import { Forms, MediaTypes, RouteTypes, Titles, TravelReductions, MediaType } from '$enums';
  import { PUBLIC_BOTPOISON_PUBLICKEY } from '$env/static/public';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import { t } from '$lib/translations';
  import Botpoison from '@botpoison/browser';
  import { CircleMinus, CirclePlus } from 'lucide-svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { schemaStep1, schemaStep2, schemaStep3, schemaStep4 } from './schema';
  import Loading from '$lib/components/Loading.svelte';

  const countries = $derived(Object.values((page.data as PageData).countries));
  const steps = [zod4Client(schemaStep1), zod4Client(schemaStep2), zod4Client(schemaStep3), zod4Client(schemaStep4)];
  let step = $state(0);
  let canDeleteEmergencyContacts = $state(false);
  let isSubmitting = $state(false);

  const { form, errors, enhance, message, options, validateForm, constraints } = superForm(
    (page.data as PageData).form,
    {
      dataType: 'json',
      resetForm: false,
      applyAction: true,
      clearOnSubmit: 'none',
      onUpdate: async ({ form }) => {
        if (form.valid) step = 0;
        isSubmitting = false;
      },
      onError: async () => {
        isSubmitting = false;
      },
      onSubmit: async ({ cancel, formData }) => {
        isSubmitting = true;
        const isLast = steps.length - 1 === step;
        options.validators = steps[step];

        // If on last step, make a normal request
        if (isLast) {
          $form.personalInformation.emergencyContacts =
            $form.personalInformation.emergencyContacts.filter(
              (x) => x.name !== undefined && x.phoneNumber !== undefined
            );

          // antibot
          const botpoison = new Botpoison({
            publicKey: PUBLIC_BOTPOISON_PUBLICKEY
          });

          const { solution } = await botpoison.challenge();
          formData.append('_botpoison', solution);

          return;
        }

        if (step === 0) {
          if ([MediaTypes.Radio, MediaTypes.Tv].some((x) => $form.mediaTypes.includes(x))) {
            $form.mediaCoverageTvOrRadio = {
              articleThematic: '',
              publishDate: '',
              ...$form.mediaCoverageTvOrRadio
            };
          }
          if ($form.mediaTypes.includes(MediaTypes.Online)) {
            $form.mediaCoverageOnline = {
              articleLength: '',
              articleThematic: '',
              publishDate: '',
              ...$form.mediaCoverageOnline
            };
          }
          if ($form.mediaTypes.includes(MediaTypes.Print)) {
            $form.mediaCoveragePrint = {
              totalPages: 0,
              articleLength: '',
              publishDate: '',
              ...$form.mediaCoveragePrint
            };
          }
        }

        cancel();

        const result = await validateForm({ update: true });
        if (result.valid) {
          document.querySelector('body')?.scrollIntoView();
          step = step + 1;
        }
        isSubmitting = false;
      }
    }
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

  $effect(() => {
    // force reset step when locale changes
    page.data.locale;
    step = 0;
  });
</script>

<Container width="small">
  {#if $message}
    <p class="text-green-600">{$message}</p>
  {/if}

  <!-- maybe show summary of $form -->
  <form method="POST" class="w-full" use:enhance>
    {#if step === 0}
      <section class="step1 about-media w-full">
        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.title`)}
        </Heading>
        <fieldset class="fieldset bg-base-200/50 border-base-300 rounded-box border p-4">
          <label for="media-name" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-name`)}
            {#if $constraints.mediaName?.required}
              <span class="text-brand-600 italic">
                {$t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="media-name"
            placeholder={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-name-placeholder`)}
            bind:value={$form.mediaName}
            aria-invalid={$errors.mediaName ? 'true' : undefined}
            class="input w-full {$errors.mediaName ? 'input-error' : ''}"
          />

          <label for="media-thematic" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic`)}
            {#if $constraints.thematic?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="media-thematic"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic-placeholder`
            )}
            bind:value={$form.thematic}
            aria-invalid={$errors.thematic ? 'true' : undefined}
            class="input w-full {$errors.thematic ? 'input-error' : ''}"
          />

          <label for="audience-profile" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile`)}
            {#if $constraints.audienceProfile?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="audience-profile"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile-placeholder`
            )}
            bind:value={$form.audienceProfile}
            aria-invalid={$errors.audienceProfile ? 'true' : undefined}
            class="input w-full {$errors.audienceProfile ? 'input-error' : ''}"
          />

          <div id="media-types" class="join join-vertical">
            <p class="label mb-1 text-wrap break-words">
              {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.title`)}
              {#if $constraints.mediaTypes?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </p>

            {#each Object.values(MediaTypes) as mediaType}
              <label
                class="label my-1 text-wrap break-words {$errors.mediaTypes ? 'text-error' : ''}"
              >
                <input
                  class="checkbox color-white {$errors.mediaTypes ? 'border-error' : ''}"
                  type="checkbox"
                  checked={$form.mediaTypes.includes(mediaType)}
                  value={mediaType}
                  id="media-type-{mediaType}"
                  onchange={(e) => {
                    if (e.currentTarget.checked) {
                      $form.mediaTypes = [...$form.mediaTypes, mediaType];
                    } else {
                      $form.mediaTypes = $form.mediaTypes.filter(
                        (x: MediaType) => x !== mediaType
                      ) as typeof $form.mediaTypes;
                    }
                  }}
                  aria-label={$t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.${mediaType}`)}
                />
                {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.types.${mediaType}`)}
              </label>
            {/each}
          </div>
        </fieldset>
        <!-- svelte-ignore a11y_role_supports_aria_props_implicit -->

        {#if $form.mediaTypes.includes(MediaTypes.Print)}
          <Heading tag="h3" class="mt-6  mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.title`
            )}
          </Heading>
          <fieldset
            class="fieldset print-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="print-statistics-broadcastLocation" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.broadcast-location`
              )}
              {#if Number($constraints.printMediaStatistics?.broadcastLocation?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              id="print-statistics-broadcastLocation"
              type="text"
              class="input w-full {$errors.printMediaStatistics?.broadcastLocation
                ? 'input-error'
                : ''}"
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
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.broadcast-location`
              )}
              aria-invalid={$errors.printMediaStatistics?.broadcastLocation ? 'true' : undefined}
            />

            {#if $errors.printMediaStatistics?._errors}
              {@const printErrors = $errors.printMediaStatistics?._errors ?? []}
              <p id="media-types-error" class="text-error error">
                {#each printErrors as error}
                  {@html $t(error)}<br />
                {/each}
              </p>
            {/if}
            <label for="print-statistics-copies" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.copies`
              )}
            </label>
            <input
              id="print-statistics-copies"
              type="number"
              class="input w-full {$errors.printMediaStatistics?._errors ? 'input-error' : ''}"
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
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.copies`
              )}
              aria-invalid={$errors.printMediaStatistics?._errors ? 'true' : undefined}
            />

            <label for="print-statistics-readers" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Print}.readers`
              )}
            </label>
            <input
              id="print-statistics-readers"
              type="number"
              class="input w-full {$errors.printMediaStatistics?._errors ? 'input-error' : ''}"
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
              aria-invalid={$errors.printMediaStatistics?._errors ? 'true' : undefined}
            />
          </fieldset>
        {/if}
        {#if ($form.mediaTypes.includes(MediaTypes.Tv) && $form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Tv) && !$form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Radio) && !$form.mediaTypes.includes(MediaTypes.Tv))}
          <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.title`
            )}
          </Heading>
          <fieldset
            class="fieldset {MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label
              for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-emission-name"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.emission-name`
              )}
              {#if Number($constraints.radioAndTVMediaStatistics?.emissionName?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="text"
              id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-emission-name"
              class="input w-full {$errors.radioAndTVMediaStatistics?.emissionName ||
              $errors.radioAndTVMediaStatistics?._errors
                ? 'input-error'
                : ''}"
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

            <label
              for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-viewers"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Radio}-and-${MediaTypes.Tv}.viewers`
              )}
              {#if Number($constraints.radioAndTVMediaStatistics?.viewers?.min) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="number"
              id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-statistics-viewers"
              class="input w-full {$errors.radioAndTVMediaStatistics?.viewers ||
              $errors.radioAndTVMediaStatistics?._errors
                ? 'input-error'
                : ''}"
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
          </fieldset>
        {/if}
        {#if $form.mediaTypes.includes(MediaTypes.Online)}
          <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.title`
            )}
          </Heading>

          <fieldset
            class="fieldset online-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="online-statistics-website" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.website`
              )}
              {#if $constraints.onlineMediaStatistics?.website?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="url"
              id="online-statistics-website"
              class="input w-full {$errors.onlineMediaStatistics?.website ? 'input-error' : ''}"
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

            {#if $errors.onlineMediaStatistics?._errors}
              <p id="media-types-error" class="text-error error">
                {#each $errors.onlineMediaStatistics._errors as error}
                  {@html $t(error)}<br />
                {/each}
              </p>
            {/if}
            <label
              for="online-statistics-monthly-unique-visitors"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.monthly-unique-visitors`
              )}
              {#if $constraints.onlineMediaStatistics?.monthlyUniqueVisitors?.required}<span
                  class="text-brand-600 italic"
                >
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>{/if}
            </label>
            <input
              type="number"
              id="online-statistics-monthly-unique-visitors"
              class="input w-full {$errors.onlineMediaStatistics?.monthlyUniqueVisitors ||
              $errors.onlineMediaStatistics?._errors
                ? 'input-error'
                : ''}"
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

            <label for="online-statistics-montlhy-page-views" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.statistics.${MediaTypes.Online}.montlhy-page-views`
              )}
              {#if $constraints.onlineMediaStatistics?.montlhyPageViews?.required}<span
                  class="text-brand-600 italic"
                >
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>{/if}
            </label>
            <input
              type="number"
              id="online-statistics-montlhy-page-views"
              class="input w-full {$errors.onlineMediaStatistics?.montlhyPageViews ||
              $errors.onlineMediaStatistics?._errors
                ? 'input-error'
                : ''}"
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
          </fieldset>
        {/if}
      </section>
    {/if}

    {#if step === 1}
      <section class="step2 media-coverage">
        <Heading tag="h2" class="mt-6 mb-2 text-2xl md:text-2xl">
          {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.title`)}
        </Heading>

        {#if $form.mediaTypes.includes(MediaTypes.Print)}
          <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.title`
            )}
          </Heading>
          <fieldset
            class="fieldset print-coverage bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="print-coverage-total-pages" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.total-pages`
              )}
              {#if Number($constraints.mediaCoveragePrint?.totalPages?.min) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="number"
              id="print-coverage-total-pages"
              class="input w-full {$errors.mediaCoveragePrint?.totalPages ? 'input-error' : ''}"
              name="print-coverage-total-pages"
              defaultValue={$form.mediaCoveragePrint!.totalPages ?? 0}
              bind:value={$form.mediaCoveragePrint!.totalPages}
              aria-invalid={$errors.mediaCoveragePrint?.totalPages ? 'true' : undefined}
            />

            <label for="print-coverage-article-length" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.article-length`
              )}
              {#if Number($constraints.mediaCoveragePrint?.articleLength?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            {#if $errors.mediaCoveragePrint?.articleLength}
              <p class="text-brand-600">
                {@html $t($errors.mediaCoveragePrint.articleLength[0])}
              </p>
            {/if}
            <input
              type="text"
              id="print-coverage-article-length"
              class="input w-full {$errors.mediaCoveragePrint?.articleLength ? 'input-error' : ''}"
              name="print-coverage-article-length"
              defaultValue={$form.mediaCoveragePrint!.articleLength}
              bind:value={$form.mediaCoveragePrint!.articleLength}
              aria-invalid={$errors.mediaCoveragePrint?.articleLength ? 'true' : undefined}
            />

            <label for="print-coverage-publish-date" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Print}.publish-date`
              )}
              {#if Number($constraints.mediaCoveragePrint?.publishDate?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="date"
              id="{MediaTypes.Print}-coverage-publish-date"
              class="input w-full {$errors.mediaCoveragePrint?.publishDate ? 'input-error' : ''}"
              name="{MediaTypes.Print}-coverage-publish-date"
              bind:value={$form.mediaCoveragePrint!.publishDate}
              aria-invalid={$errors.mediaCoveragePrint?.publishDate ? 'true' : undefined}
            />
          </fieldset>
        {/if}
        {#if ($form.mediaTypes.includes(MediaTypes.Tv) && $form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Tv) && !$form.mediaTypes.includes(MediaTypes.Radio)) || ($form.mediaTypes.includes(MediaTypes.Radio) && !$form.mediaTypes.includes(MediaTypes.Tv))}
          <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Radio}-and-${MediaTypes.Tv}.title`
            )}
          </Heading>
          <fieldset
            class="fieldset {MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage print-coverage bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label
              for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Radio}-and-${MediaTypes.Tv}.article-thematic`
              )}
              {#if Number($constraints.mediaCoverageTvOrRadio?.articleThematic?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="text"
              id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
              name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-article-thematic"
              class="input w-full {$errors.mediaCoverageTvOrRadio?.articleThematic
                ? 'input-error'
                : ''}"
              placeholder={$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Radio}-and-${MediaTypes.Tv}.article-thematic-placeholder`
              )}
              bind:value={$form.mediaCoverageTvOrRadio!.articleThematic}
              aria-invalid={$errors.mediaCoverageTvOrRadio?.articleThematic ? 'true' : undefined}
            />

            <label
              for="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-publish-date"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.publish-date`
              )}
              {#if Number($constraints.mediaCoverageTvOrRadio?.publishDate?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="date"
              id="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-publish-date"
              name="{MediaTypes.Radio}-and-{MediaTypes.Tv}-coverage-publish-date"
              class="input w-full {$errors.mediaCoverageTvOrRadio?.publishDate
                ? 'input-error'
                : ''}"
              bind:value={$form.mediaCoverageTvOrRadio!.publishDate}
              aria-invalid={$errors.mediaCoverageTvOrRadio?.publishDate ? 'true' : undefined}
            />
          </fieldset>
        {/if}
        {#if $form.mediaTypes.includes(MediaTypes.Online)}
          <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.title`
            )}
          </Heading>
          <fieldset
            class="fieldset online-coverage print-coverage bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="online-coverage-article-length" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-length`
              )}
              {#if Number($constraints.mediaCoverageOnline?.articleLength?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            {#if $errors.mediaCoverageOnline?.articleLength}
              <p class="text-brand-600">
                {@html $t($errors.mediaCoverageOnline.articleLength[0])}
              </p>
            {/if}
            <input
              type="text"
              id="online-coverage-article-length"
              class="input w-full {$errors.mediaCoverageOnline?.articleLength ? 'input-error' : ''}"
              bind:value={$form.mediaCoverageOnline!.articleLength}
              aria-invalid={$errors.mediaCoverageOnline?.articleLength ? 'true' : undefined}
            />

            <label for="online-coverage-article-thematic" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-thematic`
              )}
              {#if Number($constraints.mediaCoverageOnline?.articleThematic?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="text"
              id="online-coverage-article-thematic"
              class="input w-full {$errors.mediaCoverageOnline?.articleThematic
                ? 'input-error'
                : ''}"
              placeholder={$t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.article-thematic-placeholder`
              )}
              bind:value={$form.mediaCoverageOnline!.articleThematic}
              aria-invalid={$errors.mediaCoverageOnline?.articleThematic ? 'true' : undefined}
            />

            <label for="online-coverage-publish-date" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.coverage.${MediaTypes.Online}.publish-date`
              )}
              {#if Number($constraints.mediaCoverageOnline?.publishDate?.minlength) > 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              type="date"
              id="online-coverage-publish-date"
              class="input w-full {$errors.mediaCoverageOnline?.publishDate ? 'input-error' : ''}"
              bind:value={$form.mediaCoverageOnline!.publishDate}
              aria-invalid={$errors.mediaCoverageOnline?.publishDate ? 'true' : undefined}
            />
          </fieldset>
        {/if}
      </section>
    {/if}

    {#if step === 2}
      <section class="step3 travel-information">
        <Heading tag="h2" class="mt-6 mb-2 text-2xl md:text-2xl">
          {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.title`)}
        </Heading>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.title`
          )}
        </Heading>
        <fieldset
          class="fieldset departure-point bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="departure-point-city" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.city`
            )}
            {#if $constraints.travelInformation?.departurePoint?.city?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="departure-point-city"
            class="input w-full {$errors.travelInformation?.departurePoint?.city
              ? 'input-error'
              : ''}"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.city-placeholder`
            )}
            bind:value={$form.travelInformation.departurePoint.city}
            aria-invalid={$errors.travelInformation?.departurePoint?.city ? 'true' : undefined}
          />

          <label for="departure-point-country" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.country`
            )}
            {#if $constraints.travelInformation?.departurePoint?.country?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <select
            id="departure-point-country"
            class="select w-full {$errors.travelInformation?.departurePoint?.country
              ? 'select-error'
              : ''}"
            bind:value={$form.travelInformation.departurePoint.country}
            aria-invalid={$errors.travelInformation?.departurePoint?.country ? 'true' : undefined}
          >
            <option disabled selected value={undefined}>
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.country-placeholder`
              )}
            </option>
            {#each countries as country}
              <option value={country}>{country}</option>
            {/each}
          </select>

          <label for="departure-point-outward-journey" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.title`
            )}
            {#if $constraints.travelInformation?.departurePoint?.outwardJourney?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p class="departure-point-outward-journey information">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.information`
            )}
          </p>
          <textarea
            id="departure-point-outward-journey"
            class="textarea w-full {$errors.travelInformation?.departurePoint?.outwardJourney
              ? 'textarea-error'
              : ''}"
            bind:value={$form.travelInformation.departurePoint.outwardJourney}
            maxlength="300"
            aria-invalid={$errors.travelInformation?.departurePoint?.outwardJourney
              ? 'true'
              : undefined}
          ></textarea>
        </fieldset>

        <fieldset
          class="fieldset departure-point bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="travel-information-return-journey" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.return-journey.title`
            )}
            {#if $constraints.travelInformation?.returnJourney?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p class="travel-information-return-journey information">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.return-journey.information`
            )}
          </p>
          <textarea
            id="travel-information-return-journey"
            class="textarea w-full {$errors.travelInformation?.returnJourney
              ? 'textarea-error'
              : ''}"
            bind:value={$form.travelInformation.returnJourney}
            maxlength="300"
            aria-invalid={$errors.travelInformation?.returnJourney ? 'true' : undefined}
          ></textarea>
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.title`
          )}
        </Heading>
        <fieldset
          class="fieldset travel-reductions bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="travel-information-travel-reduction" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.please-tick`
            )}
            {#if $constraints.travelInformation?.travelReductions?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <div id="travel-information-travel-reduction" class="join join-vertical">
            {#each Object.values(TravelReductions) as travelReduction}
              <label
                for="travel-reduction-{travelReduction}"
                class="label my-1 text-wrap break-words {$errors.travelInformation?.travelReductions
                  ? 'text-error'
                  : ''}"
              >
                <input
                  class="checkbox"
                  type="checkbox"
                  checked={$form.travelInformation.travelReductions?.includes(travelReduction)}
                  id="travel-reduction-{travelReduction}"
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
                      $form.travelInformation.travelReductions = [
                        ...$form.travelInformation.travelReductions,
                        travelReduction
                      ];
                    }
                  }}
                  aria-label={$t(
                    `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${travelReduction}`
                  )}
                />
                {@html $t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${travelReduction}`
                )}
              </label>
            {/each}
          </div>
        </fieldset>

        <fieldset
          class="fieldset last-visit bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="travel-information-return-journey" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.last-visit`)}
            {#if $constraints.travelInformation?.lastVisit?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="date"
            id="travel-information-return-journey"
            class="input w-full {$errors.travelInformation?.lastVisit ? 'input-error' : ''}"
            bind:value={$form.travelInformation.lastVisit}
            aria-invalid={$errors.travelInformation?.lastVisit ? 'true' : undefined}
          />
        </fieldset>
      </section>
    {/if}

    {#if step === 3}
      <section class="step4 personal-information">
        <Heading tag="h3" class="mt-6 mb-2 text-xl md:text-xl">
          {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.title`)}
        </Heading>

        <fieldset
          class="fieldset personal-information bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <p class="label mb-1 text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.title`
            )}
            {#if $constraints.personalInformation?.title?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </p>
          {#each Object.values(Titles) as title}
            <label
              aria-invalid={$errors.personalInformation?.title ? 'true' : undefined}
              class="label text-wrap break-words"
            >
              <input
                type="radio"
                name="personal-information-title"
                checked={title === $form.personalInformation?.title}
                required
                class="radio {$errors.personalInformation?.title ? 'radio-error' : ''}"
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    $form.personalInformation.title = title;
                  }
                }}
                aria-label={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${title}`
                )}
              />
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${title}`
              )}
            </label>
          {/each}

          <label for="personal-information-first-name" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name`
            )}

            {#if $constraints.personalInformation?.firstName?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-first-name"
            class="input w-full {$errors.personalInformation?.firstName ? 'input-error' : ''}"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name-placeholder`
            )}
            bind:value={$form.personalInformation.firstName}
            aria-invalid={$errors.personalInformation?.firstName ? 'true' : undefined}
          />

          <label for="personal-information-last-name">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name`)}
            {#if $constraints.personalInformation?.lastName?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-last-name"
            class="input w-full {$errors.personalInformation?.lastName ? 'input-error' : ''}"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name-placeholder`
            )}
            bind:value={$form.personalInformation.lastName}
            aria-invalid={$errors.personalInformation?.lastName ? 'true' : undefined}
          />

          <p class="label mb-1 text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.freelance`)}
            {#if $constraints.personalInformation?.freelance?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </p>
          <label
            class="label text-wrap break-words"
            aria-invalid={$errors.personalInformation?.freelance ? 'true' : undefined}
          >
            <input
              type="radio"
              name="personal-information-freelance"
              class="radio {$errors.personalInformation?.freelance ? 'radio-error' : ''}"
              onchange={() => ($form.personalInformation.freelance = false)}
              checked={$form.personalInformation?.freelance === false}
              aria-label={$t(`${RouteTypes.Form}.no`)}
              required
            />
            {@html $t(`${RouteTypes.Form}.no`)}
          </label>
          <label
            class="label text-wrap break-words"
            aria-invalid={$errors.personalInformation?.freelance ? 'true' : undefined}
          >
            <input
              type="radio"
              name="personal-information-freelance"
              class="radio {$errors.personalInformation?.freelance ? 'radio-error' : ''}"
              onchange={() => ($form.personalInformation.freelance = true)}
              checked={$form.personalInformation?.freelance === true}
              aria-label={$t(`${RouteTypes.Form}.yes`)}
              required
            />
            {@html $t(`${RouteTypes.Form}.yes`)}
          </label>

          <label for="personal-information-spoken-languages" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.title`
            )}
            {#if $constraints.personalInformation?.spokenLanguages?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-spoken-languages"
            class="input w-full {$errors.personalInformation?.spokenLanguages ? 'input-error' : ''}"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.placeholder`
            )}
            bind:value={$form.personalInformation.spokenLanguages}
            aria-invalid={$errors.personalInformation?.spokenLanguages ? 'true' : undefined}
          />

          <label for="personal-information-birthdate" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.birth-date`
            )}
            {#if $constraints.personalInformation?.birthday?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="date"
            id="personal-information-birthdate"
            class="input w-full {$errors.personalInformation?.birthday ? 'input-error' : ''}"
            bind:value={$form.personalInformation.birthday}
            aria-invalid={$errors.personalInformation?.birthday ? 'true' : undefined}
          />

          <label for="personal-information-allergies" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.allergies`)}
            {#if $constraints.personalInformation?.allergies?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-allergies"
            class="input w-full {$errors.personalInformation?.allergies
              ? 'input-error'
              : undefined}"
            bind:value={$form.personalInformation.allergies}
            aria-invalid={$errors.personalInformation?.allergies ? 'true' : undefined}
          />

          <label
            for="personal-information-medical-and-physical-condition"
            class="label text-wrap break-words"
          >
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.medical-and-physical-condition`
            )}
            {#if $constraints.personalInformation?.medicalAndPhysicalCondition?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-medical-and-physical-condition"
            class="input w-full {$errors.personalInformation?.medicalAndPhysicalCondition
              ? 'input-error'
              : undefined}"
            bind:value={$form.personalInformation.medicalAndPhysicalCondition}
            aria-invalid={$errors.personalInformation?.medicalAndPhysicalCondition
              ? 'true'
              : undefined}
          />
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-xl md:text-xl">
          {@html $t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.title`
          )}
        </Heading>
        <fieldset class="fieldset passport bg-base-200/50 border-base-300 rounded-box border p-4">
          {#if $errors.personalInformation?.passport}
            <p class="text-brand-600">
              {@html $t($errors.personalInformation?.passport?.personalInformationPassport?.[0])}
            </p>
          {/if}
          <label for="personal-information-passport-number" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.number`
            )}
            {#if $constraints.personalInformation?.passport?.number?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-passport-number"
            class="input w-full {$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'input-error'
              : ''}"
            bind:value={$form.personalInformation.passport.number}
            aria-invalid={$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'true'
              : undefined}
          />

          <label for="personal-information-passport-validity" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.validity`
            )}
          </label>
          <input
            type="date"
            id="personal-information-passport-validity"
            class="input w-full {$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'input-error'
              : ''}"
            bind:value={$form.personalInformation.passport.validity}
            aria-invalid={$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'true'
              : undefined}
          />
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.title`)}
        </Heading>
        <fieldset class="fieldset address bg-base-200/50 border-base-300 rounded-box border p-4">
          <label
            for="personal-information-address-street-address"
            class="label text-wrap break-words"
          >
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.street-address`
            )}
            {#if $constraints.personalInformation?.address?.streetAddress?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-address-street-address"
            class="input w-full {$errors.personalInformation?.address?.streetAddress
              ? 'input-error'
              : ''}"
            bind:value={$form.personalInformation.address.streetAddress}
            aria-invalid={$errors.personalInformation?.address?.streetAddress ? 'true' : undefined}
          />

          <label for="personal-information-address-city" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`
            )}
            {#if $constraints.personalInformation?.address?.city?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-address-city"
            class="input w-full {$errors.personalInformation?.address?.city ? 'input-error' : ''}"
            bind:value={$form.personalInformation.address.city}
            aria-invalid={$errors.personalInformation?.address?.city ? 'true' : undefined}
          />

          <label for="personal-information-address-zip" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.postal-code`
            )}
            {#if $constraints.personalInformation?.address?.postalcode?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-address-zip"
            class="input w-full {$errors.personalInformation?.address?.postalcode
              ? 'input-error'
              : ''}"
            bind:value={$form.personalInformation.address.postalcode}
            aria-invalid={$errors.personalInformation?.address?.postalcode ? 'true' : undefined}
          />

          <label for="personal-information-address-country" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.country`
            )}
            {#if $constraints.personalInformation?.address?.country?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <select
            id="personal-information-address-country"
            class="select w-full {$errors.personalInformation?.address?.country
              ? 'select-error'
              : ''}"
            bind:value={$form.personalInformation.address.country}
            aria-invalid={$errors.personalInformation?.address?.country ? 'true' : undefined}
          >
            <option hidden disabled selected value={undefined}>
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.country-placeholder`
              )}
            </option>
            {#each countries as country}
              <option value={country}>{country}</option>
            {/each}
          </select>

          <label for="personal-information-phone-number" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.phone-number`
            )}
            {#if $constraints.personalInformation?.phoneNumber?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="personal-information-phone-number"
            class="input w-full {$errors.personalInformation?.phoneNumber ? 'input-error' : ''}"
            bind:value={$form.personalInformation.phoneNumber}
            aria-invalid={$errors.personalInformation?.phoneNumber ? 'true' : undefined}
          />

          <label for="personal-information-email" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.email`)}
            {#if $constraints.personalInformation?.email?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="email"
            id="personal-information-email"
            class="input w-full {$errors.personalInformation?.email ? 'input-error' : ''}"
            bind:value={$form.personalInformation.email}
            aria-invalid={$errors.personalInformation?.email ? 'true' : undefined}
          />
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.title`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Form}.required`)}
          </span>
        </Heading>
        <fieldset
          class="fieldset personal-information-emergency-contacts bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <div class="hidden md:grid md:grid-cols-[1fr_1fr_100px] md:gap-4">
            <p class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`
              )}
            </p>
            <p class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`
              )}
            </p>
          </div>
          {#each $form.personalInformation.emergencyContacts as _, i}
            <div
              class="personal-information-emergency-contact my-1 rounded-sm border border-gray-300 md:my-0 md:grid md:grid-cols-[1fr_1fr_100px] md:gap-4 md:rounded-none md:border-none"
            >
              <div
                class="p-1 before:content-[attr(data-label)] md:flex md:flex-col md:justify-end md:p-0 md:before:content-none"
                data-label={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`
                )}
              >
                {#if $errors.personalInformation?.emergencyContacts?.[i]?.name}
                  <p class="text-brand-600 my-1">
                    {@html $t($errors.personalInformation?.emergencyContacts?.[i]?.name?.[0])}
                  </p>
                {/if}
                <input
                  type="text"
                  aria-label={$t(
                    `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`
                  )}
                  class="personal-information-emergency-contact-name input w-full {$errors
                    .personalInformation?.emergencyContacts?.[i]?.name
                    ? 'input-error'
                    : ''}"
                  bind:value={$form.personalInformation.emergencyContacts[i].name}
                  aria-invalid={$errors.personalInformation?.emergencyContacts?.[i]?.name
                    ? 'true'
                    : undefined}
                />
              </div>
              <div
                class="p-1 before:content-[attr(data-label)] md:flex md:flex-col md:justify-end md:p-0 md:before:content-none"
                data-label={$t(
                  `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`
                )}
              >
                {#if $errors.personalInformation?.emergencyContacts?.[i]?.phoneNumber}
                  <p class="text-brand-600 my-1">
                    {@html $t(
                      $errors.personalInformation?.emergencyContacts?.[i]?.phoneNumber?.[0]
                    )}
                  </p>
                {/if}
                <input
                  type="text"
                  aria-label={$t(
                    `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`
                  )}
                  class="personal-information-emergency-contact-phone-number input w-full {$errors
                    .personalInformation?.emergencyContacts?.[i]?.phoneNumber
                    ? 'input-error'
                    : ''}"
                  bind:value={$form.personalInformation.emergencyContacts[i].phoneNumber}
                  aria-invalid={$errors.personalInformation?.emergencyContacts?.[i]?.phoneNumber
                    ? 'true'
                    : undefined}
                />
              </div>
              <div
                class={twMerge(
                  'flex md:mt-auto md:justify-around',
                  'rounded-sm border-t border-gray-300 md:border-none'
                )}
              >
                <button
                  type="button"
                  class={twMerge(
                    'btn',
                    'rounded-none border-gray-300 md:rounded',
                    'flex-1 md:flex-auto',
                    'h-full w-full md:h-fit md:w-auto',
                    'py-2'
                  )}
                  onclick={addEmergencyContact}
                >
                  <CirclePlus
                    strokeWidth={2.5}
                    class="label aspect-square h-5 text-wrap break-words"
                  />
                </button>
                <button
                  type="button"
                  class={twMerge(
                    'btn',
                    'rounded-none  border-gray-300 md:rounded',
                    [!canDeleteEmergencyContacts && 'hidden'],
                    'flex-1 md:flex-auto',
                    'h-full w-full md:h-fit md:w-auto',
                    'py-2'
                  )}
                  onclick={() => removeEmergencyContact(i)}
                  disabled={!canDeleteEmergencyContacts}
                >
                  <CircleMinus
                    strokeWidth={2.5}
                    class="label aspect-square h-5 text-wrap break-words"
                  />
                </button>
              </div>
            </div>
          {/each}
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(
            `${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.travel-insurance`
          )}
        </Heading>
        <fieldset
          class="fieldset has-travel-insurance bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label
            class="label text-wrap break-words"
            aria-invalid={$errors.travelInsuranceCoveringSwitzerland ? 'true' : undefined}
          >
            <input
              type="radio"
              name="personal-information-travel-insurance"
              class="radio {$errors.travelInsuranceCoveringSwitzerland ? 'radio-error' : ''}"
              checked={$form.travelInsuranceCoveringSwitzerland === false}
              onchange={(e) => ($form.travelInsuranceCoveringSwitzerland = false)}
              aria-label={$t(`${RouteTypes.Form}.no`)}
              required
            />
            {@html $t(`${RouteTypes.Form}.no`)}
          </label>
          <label class="label text-wrap break-words">
            <input
              type="radio"
              name="personal-information-travel-insurance"
              class="radio {$errors.travelInsuranceCoveringSwitzerland ? 'radio-error' : ''}"
              checked={$form.travelInsuranceCoveringSwitzerland === true}
              onchange={(e) => ($form.travelInsuranceCoveringSwitzerland = true)}
              aria-label={$t(`${RouteTypes.Form}.yes`)}
            />
            {@html $t(`${RouteTypes.Form}.yes`)}
          </label>
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.remarks`)}
        </Heading>
        <fieldset
          class="fieldset personal-information-remarks bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="personal-information-remarks" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.remarks`)}
            {#if $constraints.remarks?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <textarea
            id="personal-information-remarks"
            defaultValue={($form.remarks as string | undefined) ?? ''}
            bind:value={$form.remarks}
            class="textarea w-full"
          ></textarea>
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.terms-of-acceptance.title`)}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Form}.required`)}
          </span>
        </Heading>
        <fieldset
          class="fieldset terms-of-acceptance bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <p class="text-wrap">
            {@html $t(`${RouteTypes.Form}.terms-of-acceptance.content`)}
          </p>

          <label class="label text-wrap break-words">
            <input
              type="checkbox"
              defaultValue={false}
              class="checkbox {$errors.readTermsOfAcceptance ? 'checkbox-error' : ''}"
              checked={$form.readTermsOfAcceptance === true}
              onchange={(e) => {
                $form.readTermsOfAcceptance = e.currentTarget.checked;
              }}
              aria-invalid={$errors.readTermsOfAcceptance ? 'true' : undefined}
            />
            {@html $t(`${RouteTypes.Form}.terms-of-acceptance.accept-terms`)}
          </label>
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.newsletter.title`)}
        </Heading>
        <fieldset class="fieldset newsletter bg-base-200/50 border-base-300 rounded-box border p-4">
          <p class="">
            {@html $t(`${RouteTypes.Form}.newsletter.paragraph`)}
          </p>

          <label
            class="label text-wrap break-words"
            aria-invalid={$errors.travelInsuranceCoveringSwitzerland ? 'true' : undefined}
          >
            <input
              type="radio"
              name="personal-information-newsletter"
              class="radio {$errors.newsletter ? 'radio-error' : ''}"
              checked={$form.newsletter === false}
              onchange={(e) => ($form.newsletter = false)}
              aria-label={$t(`${RouteTypes.Form}.no`)}
              required
            />
            {@html $t(`${RouteTypes.Form}.no`)}
          </label>

          <label
            class="label text-wrap break-words"
            aria-invalid={$errors.travelInsuranceCoveringSwitzerland ? 'true' : undefined}
          >
            <input
              type="radio"
              name="personal-information-newsletter"
              class="radio {$errors.newsletter ? 'radio-error' : ''}"
              checked={$form.newsletter === true}
              onchange={(e) => ($form.newsletter = true)}
              aria-label={$t(`${RouteTypes.Form}.yes`)}
            />
            {@html $t(`${RouteTypes.Form}.yes`)}
          </label>
        </fieldset>
      </section>
    {/if}

    <div class="mt-6 mb-2 flex flex-wrap">
      <button
        type="button"
        class="btn mr-2 {step === 0 ? 'hidden' : ''}"
        onclick={(e) => {
          step = step - 1;
        }}
        disabled={isSubmitting}
      >
        {@html $t(`${RouteTypes.Form}.previous`)}
      </button>
      <button class="btn" disabled={isSubmitting}>
        <span class={isSubmitting ? '' : 'hidden'}>
          <Loading />
        </span>
        <span class={!isSubmitting ? '' : 'hidden'}>
          {step < steps.length - 1
            ? $t(`${RouteTypes.Form}.next`)
            : $t(`${RouteTypes.Form}.submit`)}
        </span>
      </button>
    </div>
  </form>
</Container>
