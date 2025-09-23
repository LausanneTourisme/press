<script lang="ts">
  import { page } from '$app/state';
  import {
    Forms,
    MediaTypes,
    RouteTypes,
    SocialNetworks,
    Titles,
    TravelReductions,
    type SocialNetwork
  } from '$enums';
  import { PUBLIC_BOTPOISON_PUBLICKEY } from '$env/static/public';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import { t } from '$lib/translations';
  import Botpoison from '@botpoison/browser';
  import { CircleMinus, CirclePlus, Trash2, X } from 'lucide-svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { schemaStep1, schemaStep2, schemaStep3, schemaStep4 } from './schema';
  import Loading from '$lib/components/Loading.svelte';
  import { file } from 'zod';
  import { onMount } from 'svelte';

  const countries = $derived(Object.values((page.data as PageData).countries));
  const steps = [zod4(schemaStep1), zod4(schemaStep2), zod4(schemaStep3), zod4(schemaStep4)];
  let step = $state(0);
  let canDeleteEmergencyContacts = $state(false);
  let isSubmitting = $state(false);

  const { form, errors, enhance, message, options, validateForm, constraints } = $derived.by(() =>
    superForm((page.data as PageData).form, {
      dataType: 'json',
      resetForm: false,
      applyAction: true,
      clearOnSubmit: 'none',
      onUpdate: async ({ form }) => {
        if (form.valid) step = 0;
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
          // if ([MediaTypes.Radio, MediaTypes.Tv].some((x) => $form.mediaTypes.includes(x))) {
          //   $form.mediaCoverageTvOrRadio = {
          //     articleThematic: '',
          //     publishDate: '',
          //     ...$form.mediaCoverageTvOrRadio
          //   };
          // }
          // if ($form.mediaTypes.includes(MediaTypes.Online)) {
          //   $form.mediaCoverageOnline = {
          //     articleLength: '',
          //     articleThematic: '',
          //     publishDate: '',
          //     ...$form.mediaCoverageOnline
          //   };
          // }
          // if ($form.mediaTypes.includes(MediaTypes.Print)) {
          //   $form.mediaCoveragePrint = {
          //     totalPages: 0,
          //     articleLength: '',
          //     publishDate: '',
          //     ...$form.mediaCoveragePrint
          //   };
          // }
        }

        cancel();

        const result = await validateForm({ update: true });
        if (result.valid) {
          document.querySelector('body')?.scrollIntoView();
          step = step + 1;
        }
        isSubmitting = false;
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

  function handleAddFiles(
    socialNetwork: SocialNetwork,
    type: 'subscriberStatisticsScreenshots' | 'accountsThatRespondedScreenshots',
    files: FileList | null
  ) {
    const tempFiles = [...(files ?? [])];

    // sync into superform field
    $form.statistics[socialNetwork][type] = [
      ...$form.statistics[socialNetwork][type],
      ...tempFiles
    ];
  }

  function removeFile(
    socialNetwork: SocialNetwork,
    type: 'subscriberStatisticsScreenshots' | 'accountsThatRespondedScreenshots',
    index: number
  ) {
    const tempFiles = $form.statistics[socialNetwork][type].filter((_, i) => i !== index);
    $form.statistics[socialNetwork].subscriberStatisticsScreenshots = tempFiles;
  }

  function removeEmergencyContact(index: number) {
    $form.personalInformation.emergencyContacts =
      $form.personalInformation.emergencyContacts.filter((_, i) => i !== index);
    if ($form.personalInformation.emergencyContacts.length <= 1) canDeleteEmergencyContacts = false;
  }

  function humanFileSize(size: number) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +(size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['o', 'ko', 'Mo', 'Go', 'To'][i];
  }
</script>

<Container width="small">
  {#if $message}
    <p class="text-green-600">{$message}</p>
  {/if}

  <!-- maybe show summary of $form -->
  <form method="POST" class="w-full" use:enhance>
    {#if step === 0}
      <section class="step1 about-media w-full">
        <Heading tag="h2" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.title`)}
        </Heading>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.social-media-information`)}
        </Heading>
        <fieldset
          class="fieldset social-media-information bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="social-media-information" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.content-positioning`)}
            {#if $constraints.contentPositioning?.required}
              <span class="text-brand-600 italic">
                {$t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="social-media-information"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.content-positioning-placeholder`
            )}
            bind:value={$form.contentPositioning}
            aria-invalid={$errors.contentPositioning ? 'true' : undefined}
            class="input w-full {$errors.contentPositioning ? 'input-error' : ''}"
          />

          <label for="target-audience" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.target-audience`)}
            {#if $constraints.targetAudience?.required}
              <span class="text-brand-600 italic">
                {$t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            type="text"
            id="target-audience"
            placeholder={$t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.target-audience-placeholder`
            )}
            bind:value={$form.targetAudience}
            aria-invalid={$errors.targetAudience ? 'true' : undefined}
            class="input w-full {$errors.targetAudience ? 'input-error' : ''}"
          />

          <div id="online-presence" class="join join-vertical">
            <p class="label mb-1 text-wrap break-words">
              {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.title`)}
              {#if $constraints.onlinePresence?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </p>

            {#each Object.values(SocialNetworks) as SocialNetworkType}
              <label
                class="label my-1 text-wrap break-words {$errors.onlinePresence
                  ? 'text-error'
                  : ''}"
              >
                <input
                  class="checkbox color-white {$errors.onlinePresence ? 'border-error' : ''}"
                  type="checkbox"
                  checked={$form.onlinePresence.includes(SocialNetworkType)}
                  value={SocialNetworkType}
                  id="media-type-{SocialNetworkType}"
                  onchange={(e) => {
                    if (e.currentTarget.checked) {
                      $form.onlinePresence = [...$form.onlinePresence, SocialNetworkType];
                    } else {
                      $form.onlinePresence = $form.onlinePresence.filter(
                        (x) => x !== SocialNetworkType
                      ) as typeof $form.onlinePresence;
                    }
                  }}
                  aria-label={$t(
                    `${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.${SocialNetworkType}`
                  )}
                />
                {@html $t(
                  `${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.${SocialNetworkType}`
                )}
              </label>
            {/each}
          </div>
        </fieldset>

        {#if $form.onlinePresence?.includes(SocialNetworks.Instagram)}
          <Heading tag="h3" class="mt-6  mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.title`
            )}
          </Heading>

          <fieldset
            class="fieldset instagram-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="instagram-statistics-profile-url" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.profile-url`
              )}
              {#if $constraints.statistics?.instagram?.profileURL?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              id="instagram-statistics-profile-url"
              type="url"
              placeholder="https://"
              class="input w-full {$errors.statistics?.instagram?.profileURL ? 'input-error' : ''}"
              bind:value={$form.statistics.instagram.profileURL}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.profile-url`
              )}
              aria-invalid={$errors.statistics?.instagram?.profileURL ? 'true' : undefined}
            />

            <label
              for="instagram-subscriber-statistics-screenshots"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.subscriber-statistics-screenshots.title`
              )}
              {#if Number($constraints.statistics?.instagram?.subscriberStatisticsScreenshots?.min) >= 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <p class="instagram-subscriber-statistics-screenshots information">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.subscriber-statistics-screenshots.description`
              )}
            </p>
            <input
              id="instagram-subscriber-statistics-screenshots"
              type="file"
              class="file-input w-full {$errors.statistics?.instagram
                ?.subscriberStatisticsScreenshots
                ? 'file-input-error'
                : ''}"
              multiple
              onchange={(e) =>
                handleAddFiles(
                  SocialNetworks.Instagram,
                  'subscriberStatisticsScreenshots',
                  e.currentTarget.files
                )}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.subscriber-statistics-screenshots.title`
              )}
              aria-invalid={$errors.statistics?.instagram?.subscriberStatisticsScreenshots
                ? 'true'
                : undefined}
            />
            <ul
              class="list-subscriber-statistics-screenshots-files mt-2 ml-2 max-w-md list-inside list-none space-y-1"
            >
              {#each $form.statistics?.instagram?.subscriberStatisticsScreenshots as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 h-4 w-4 cursor-pointer"
                    strokeWidth={3}
                    onclick={() => {
                      removeFile(
                        SocialNetworks.Instagram,
                        'subscriberStatisticsScreenshots',
                        index
                      );
                    }}
                  />
                  <span class="ml-2">{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>

            <label
              for="instagram-accounts-that-responded-screenshots"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.accounts-that-responded-screenshots.title`
              )}
              {#if Number($constraints.statistics?.instagram?.accountsThatRespondedScreenshots?.min) >= 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <p class="instagram-accounts-that-responded-screenshots information">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.accounts-that-responded-screenshots.description`
              )}
            </p>
            <input
              id="instagram-accounts-that-responded-screenshots"
              type="file"
              class="file-input w-full {$errors.statistics?.instagram
                ?.accountsThatRespondedScreenshots
                ? 'file-input-error'
                : ''}"
              multiple
              onchange={(e) =>
                handleAddFiles(
                  SocialNetworks.Instagram,
                  'accountsThatRespondedScreenshots',
                  e.currentTarget.files
                )}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.accounts-that-responded-screenshots.title`
              )}
              aria-invalid={$errors.statistics?.instagram?.accountsThatRespondedScreenshots
                ? 'true'
                : undefined}
            />
            <ul
              class="list-accounts-that-responded-screenshots-files mt-2 ml-2 max-w-md list-inside list-none space-y-1"
            >
              {#each $form.statistics?.instagram?.accountsThatRespondedScreenshots as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 h-4 w-4 cursor-pointer"
                    strokeWidth={3}
                    onclick={() => {
                      removeFile(
                        SocialNetworks.Instagram,
                        'accountsThatRespondedScreenshots',
                        index
                      );
                    }}
                  />
                  <span class="ml-2">{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          </fieldset>
        {/if}

        {#if $form.onlinePresence?.includes(SocialNetworks.TikTok)}
          <Heading tag="h3" class="mt-6  mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.title`
            )}
          </Heading>

          <fieldset
            class="fieldset tiktok-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="tiktok-statistics-profile-url" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.profile-url`
              )}
              {#if $constraints.statistics?.tiktok?.profileURL?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>

            <input
              id="tiktok-statistics-profile-url"
              type="url"
              placeholder="https://"
              class="input w-full {$errors.statistics?.tiktok?.profileURL ? 'input-error' : ''}"
              bind:value={$form.statistics.tiktok.profileURL}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.profile-url`
              )}
              aria-invalid={$errors.statistics?.tiktok?.profileURL ? 'true' : undefined}
            />

            <label
              for="tiktok-subscriber-statistics-screenshots"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.subscriber-statistics-screenshots.title`
              )}
              {#if Number($constraints.statistics?.tiktok?.subscriberStatisticsScreenshots?.min) >= 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <p class="tiktok-subscriber-statistics-screenshots information">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.subscriber-statistics-screenshots.description`
              )}
            </p>
            <input
              id="tiktok-subscriber-statistics-screenshots"
              type="file"
              class="file-input w-full {$errors.statistics?.tiktok?.subscriberStatisticsScreenshots
                ? 'file-input-error'
                : ''}"
              multiple
              onchange={(e) =>
                handleAddFiles(
                  SocialNetworks.TikTok,
                  'subscriberStatisticsScreenshots',
                  e.currentTarget.files
                )}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.subscriber-statistics-screenshots.title`
              )}
              aria-invalid={$errors.statistics?.tiktok?.subscriberStatisticsScreenshots
                ? 'true'
                : undefined}
            />
            <ul
              class="list-subscriber-statistics-screenshots-files mt-2 ml-2 max-w-md list-inside list-none space-y-1"
            >
              {#each $form.statistics?.tiktok?.subscriberStatisticsScreenshots as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 h-4 w-4 cursor-pointer"
                    strokeWidth={3}
                    onclick={() => {
                      removeFile(SocialNetworks.TikTok, 'subscriberStatisticsScreenshots', index);
                    }}
                  />
                  <span class="ml-2">{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          </fieldset>
        {/if}

        {#if $form.onlinePresence?.includes(SocialNetworks.YouTube)}
          <Heading tag="h3" class="mt-6  mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.title`
            )}
          </Heading>

          <fieldset
            class="fieldset youtube-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="youtube-statistics-profile-url" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.profile-url`
              )}
              {#if $constraints.statistics?.youtube?.profileURL?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>

            <input
              id="youtube-statistics-profile-url"
              type="url"
              placeholder="https://"
              class="input w-full {$errors.statistics?.youtube?.profileURL ? 'input-error' : ''}"
              bind:value={$form.statistics.youtube.profileURL}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.profile-url`
              )}
              aria-invalid={$errors.statistics?.youtube?.profileURL ? 'true' : undefined}
            />

            <label
              for="youtube-subscriber-statistics-screenshots"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.subscriber-statistics-screenshots.title`
              )}
              {#if Number($constraints.statistics?.youtube?.subscriberStatisticsScreenshots?.min) >= 0}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <p class="youtube-subscriber-statistics-screenshots information">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.subscriber-statistics-screenshots.description`
              )}
            </p>
            <input
              id="youtube-subscriber-statistics-screenshots"
              type="file"
              class="file-input w-full {$errors.statistics?.youtube?.subscriberStatisticsScreenshots
                ? 'file-input-error'
                : ''}"
              multiple
              onchange={(e) =>
                handleAddFiles(
                  SocialNetworks.YouTube,
                  'subscriberStatisticsScreenshots',
                  e.currentTarget.files
                )}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.subscriber-statistics-screenshots.title`
              )}
              aria-invalid={$errors.statistics?.youtube?.subscriberStatisticsScreenshots
                ? 'true'
                : undefined}
            />
            <ul
              class="list-subscriber-statistics-screenshots-files mt-2 ml-2 max-w-md list-inside list-none space-y-1"
            >
              {#each $form.statistics?.youtube?.subscriberStatisticsScreenshots as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 h-4 w-4 cursor-pointer"
                    strokeWidth={3}
                    onclick={() => {
                      removeFile(SocialNetworks.YouTube, 'subscriberStatisticsScreenshots', index);
                    }}
                  />
                  <span class="ml-2">{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          </fieldset>
        {/if}

        {#if $form.onlinePresence?.includes(SocialNetworks.Blog)}
          <Heading tag="h3" class="mt-6  mb-2 text-lg md:text-lg">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.title`
            )}
          </Heading>

          <fieldset
            class="fieldset blog-statistics bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label for="blog-statistics-url" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.url`
              )}
              {#if $constraints.statistics?.blog?.url?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <input
              id="blog-statistics-url"
              type="url"
              placeholder="https://"
              class="input w-full {$errors.statistics?.blog?.url ? 'input-error' : ''}"
              bind:value={$form.statistics.blog.url}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.url`
              )}
              aria-invalid={$errors.statistics?.blog?.url ? 'true' : undefined}
            />

            <label for="blog-statistics-audience-profile" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.audience-profile.title`
              )}
              {#if $constraints.statistics?.blog?.audienceProfile?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </label>
            <p>
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.audience-profile.description`
              )}
            </p>
            <textarea
              id="blog-statistics-audience-profile"
              class="input w-full {$errors.statistics?.blog?.audienceProfile ? 'input-error' : ''}"
              bind:value={$form.statistics.blog.audienceProfile}
              aria-label={$t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.url`
              )}
              aria-invalid={$errors.statistics?.blog?.audienceProfile ? 'true' : undefined}
            >
            </textarea>
          </fieldset>
          <fieldset
            class="fieldset blog-statistics-performances mt-6 bg-base-200/50 border-base-300 rounded-box border p-4"
          >
            <label
              for="blog-statistics-monthly-unique-visitors"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.performances.monthly-unique-visitors`
              )}
              {#if $constraints.statistics?.blog?.performance?.monthlyUniqueVisitors?.required}<span
                  class="text-brand-600 italic"
                >
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>{/if}
            </label>
            <input
              type="number"
              id="blog-statistics-monthly-unique-visitors"
              class="input w-full {$errors.statistics?.blog?.performance?.monthlyUniqueVisitors
                ? 'input-error'
                : ''}"
              bind:value={$form.statistics.blog.performance.monthlyUniqueVisitors}
              aria-invalid={$errors.statistics?.blog?.performance?.monthlyUniqueVisitors
                ? 'true'
                : undefined}
            />

            <label for="blog-statistics-montlhy-page-views" class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.performances.montlhy-page-views`
              )}
              {#if $constraints.onlineMediaStatistics?.montlhyPageViews?.required}<span
                  class="text-brand-600 italic"
                >
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>{/if}
            </label>
            <input
              type="number"
              id="blog-statistics-montlhy-page-views"
              class="input w-full {$errors.statistics?.blog?.performance?.montlhyPageViews
                ? 'input-error'
                : ''}"
              bind:value={$form.statistics.blog.performance.montlhyPageViews}
              aria-invalid={$errors.statistics?.blog?.performance?.montlhyPageViews
                ? 'true'
                : undefined}
            />
          </fieldset>
        {/if}
      </section>
    {/if}
    {#if step === 1}{/if}
    {#if step === 2}{/if}
    {#if step === 3}{/if}

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
