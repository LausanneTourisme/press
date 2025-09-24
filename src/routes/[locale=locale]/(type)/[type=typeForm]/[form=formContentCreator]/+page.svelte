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
          if (!$form.onlinePresence?.includes(SocialNetworks.Instagram)) {
            $form.statistics.instagram = null;
          }
          if (!$form.onlinePresence?.includes(SocialNetworks.TikTok)) {
            $form.statistics.tiktok = null;
          }
          if (!$form.onlinePresence?.includes(SocialNetworks.YouTube)) {
            $form.statistics.youtube = null;
          }
          if (!$form.onlinePresence?.includes(SocialNetworks.Blog)) {
            $form.statistics.blog = null;
          }
        }

        cancel();

        const result = await validateForm({ update: true });
        console.log(result);
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
    $form.statistics[socialNetwork][type] = tempFiles;
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
                    switch (SocialNetworkType) {
                      case SocialNetworks.Instagram:
                        $form.statistics.instagram = {
                          profileURL: '',
                          subscriberStatisticsScreenshots: [],
                          accountsThatRespondedScreenshots: [],
                          ...$form.statistics?.instagram
                        };
                        break;
                      case SocialNetworks.TikTok:
                        $form.statistics.tiktok = {
                          profileURL: '',
                          subscriberStatisticsScreenshots: [],
                          ...$form.statistics?.tiktok
                        };
                        break;
                      case SocialNetworks.YouTube:
                        $form.statistics.youtube = {
                          profileURL: '',
                          subscriberStatisticsScreenshots: [],
                          ...$form.statistics?.youtube
                        };
                        break;
                      case SocialNetworks.Blog:
                        $form.statistics.blog = {
                          url: '',
                          audienceProfile: '',
                          performance: {
                            monthlyUniqueVisitors: undefined,
                            montlhyPageViews: undefined
                          },
                          ...$form.statistics?.blog
                        };
                        break;

                      default:
                        break;
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
              {#if $constraints.statistics?.instagram?.subscriberStatisticsScreenshots?.required}
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
                ?.subscriberStatisticsScreenshots && !$form.statistics?.instagram?.subscriberStatisticsScreenshots?.length
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
              {#if $constraints.statistics?.instagram?.accountsThatRespondedScreenshots?.required}
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
                ?.accountsThatRespondedScreenshots && !$form.statistics?.instagram?.accountsThatRespondedScreenshots?.length
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
              {#if $constraints.statistics?.tiktok?.subscriberStatisticsScreenshots?.required}
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
              class="file-input w-full {$errors.statistics?.tiktok?.subscriberStatisticsScreenshots && !$form.statistics?.tiktok?.subscriberStatisticsScreenshots?.length
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
              {#if $constraints.statistics?.youtube?.subscriberStatisticsScreenshots?.required}
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
              class="file-input w-full {$errors.statistics?.youtube?.subscriberStatisticsScreenshots && !$form.statistics?.youtube?.subscriberStatisticsScreenshots?.length
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
              aria-invalid={$errors.statistics?.youtube?.subscriberStatisticsScreenshots && !$form.statistics?.youtube?.subscriberStatisticsScreenshots?.length
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
            class="fieldset blog-statistics-performances bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
          >
            <label
              for="blog-statistics-monthly-unique-visitors"
              class="label text-wrap break-words"
            >
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.performances.monthly-unique-visitors`
              )}
              {#if Number($constraints.statistics?.blog?.performance?.monthlyUniqueVisitors?.min) > 0}<span
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
    {#if step === 1}
      <section class="step2 about-media w-full">
        <Heading tag="h2" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.title`)}
        </Heading>

        <fieldset class="fieldset coverage bg-base-200/50 border-base-300 rounded-box border p-4">
          <label for="coverage-publication-angle" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.publication-angle.title`
            )}
            {#if $constraints.coverage?.publicationAngle?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p>
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.publication-angle.description`
            )}
          </p>
          <input
            id="coverage-publication-angle"
            type="text"
            class="input w-full {$errors.coverage?.publicationAngle ? 'input-error' : ''}"
            bind:value={$form.coverage.publicationAngle}
            aria-label={$t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.publication-angle.title`
            )}
            aria-invalid={$errors.coverage?.publicationAngle ? 'true' : undefined}
          />

          <label for="coverage-subjects-of-interest" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.subjects-of-interest`
            )}
            {#if $constraints.coverage?.subjectsOfInterest?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <input
            id="coverage-subjects-of-interest"
            type="text"
            class="input w-full {$errors.coverage?.subjectsOfInterest ? 'input-error' : ''}"
            bind:value={$form.coverage.subjectsOfInterest}
            aria-label={$t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.subjects-of-interest`
            )}
            aria-invalid={$errors.coverage?.subjectsOfInterest ? 'true' : undefined}
          />
        </fieldset>

        <fieldset
          class="fieldset coverage-publication-channels bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <div id="publication-channels" class="join join-vertical">
            <p class="label mb-1 text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.publication-channels`
              )}
              {#if $constraints.coverage?.publicationChannels?.required}
                <span class="text-brand-600 italic">
                  {@html $t(`${RouteTypes.Form}.required`)}
                </span>
              {/if}
            </p>
            {#each Object.values(SocialNetworks) as SocialNetworkType}
              <label
                class="label my-1 text-wrap break-words {$errors.coverage?.publicationChannels
                  ? 'text-error'
                  : ''}"
              >
                <input
                  class="checkbox social-network-{SocialNetworkType} color-white {$errors.onlinePresence
                    ? 'border-error'
                    : ''}"
                  type="checkbox"
                  checked={$form.coverage.publicationChannels.includes(SocialNetworkType)}
                  value={SocialNetworkType}
                  onchange={(e) => {
                    if (e.currentTarget.checked) {
                      $form.coverage.publicationChannels = [
                        ...$form.coverage.publicationChannels,
                        SocialNetworkType
                      ];
                    } else {
                      $form.coverage.publicationChannels =
                        $form.coverage.publicationChannels.filter(
                          (x) => x !== SocialNetworkType
                        ) as typeof $form.coverage.publicationChannels;
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

        <fieldset
          class="fieldset coverage-details bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="departure-point-outward-journey" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.proposed-media-coverage.title`
            )}
            {#if $constraints.coverage?.proposedMediaCoverage?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p class="departure-point-outward-journey information">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.proposed-media-coverage.description`
            )}
          </p>
          <textarea
            id="departure-point-outward-journey"
            class="textarea w-full {$errors.coverage?.proposedMediaCoverage
              ? 'textarea-error'
              : ''}"
            bind:value={$form.coverage.proposedMediaCoverage}
            maxlength="300"
            aria-invalid={$errors.coverage?.proposedMediaCoverage ? 'true' : undefined}
          ></textarea>

          <label for="departure-point-outward-journey" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.timing-and-publication-Dates.title`
            )}
            {#if $constraints.coverage?.timingAndPublicationDates?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p class="departure-point-outward-journey information">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.coverage.timing-and-publication-Dates.description`
            )}
          </p>
          <textarea
            id="departure-point-outward-journey"
            class="textarea w-full {$errors.coverage?.timingAndPublicationDates
              ? 'textarea-error'
              : ''}"
            bind:value={$form.coverage.timingAndPublicationDates}
            maxlength="300"
            aria-invalid={$errors.coverage?.timingAndPublicationDates ? 'true' : undefined}
          ></textarea>
        </fieldset>
      </section>
    {/if}
    

    {#if step === 2}
      <section class="step3 travel-information">
        <Heading tag="h2" class="mt-6 mb-2 text-2xl md:text-2xl">
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.title`)}
        </Heading>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(
            `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.title`
          )}
        </Heading>
        <fieldset
          class="fieldset departure-point bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="departure-point-city" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.city`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.city-placeholder`
            )}
            bind:value={$form.travelInformation.departurePoint.city}
            aria-invalid={$errors.travelInformation?.departurePoint?.city ? 'true' : undefined}
          />

          <label for="departure-point-country" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.country`
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
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.country-placeholder`
              )}
            </option>
            {#each countries as country}
              <option value={country}>{country}</option>
            {/each}
          </select>

          <label for="departure-point-outward-journey" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.title`
            )}
            {#if $constraints.travelInformation?.departurePoint?.outwardJourney?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p class="departure-point-outward-journey information">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.information`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.return-journey.title`
            )}
            {#if $constraints.travelInformation?.returnJourney?.required}
              <span class="text-brand-600 italic">
                {@html $t(`${RouteTypes.Form}.required`)}
              </span>
            {/if}
          </label>
          <p class="travel-information-return-journey information">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.return-journey.information`
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
            `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.title`
          )}
        </Heading>
        <fieldset
          class="fieldset travel-reductions bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="travel-information-travel-reduction" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.please-tick`
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
                    `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${travelReduction}`
                  )}
                />
                {@html $t(
                  `${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${travelReduction}`
                )}
              </label>
            {/each}
          </div>
        </fieldset>

        <fieldset
          class="fieldset last-visit bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="travel-information-return-journey" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.last-visit`)}
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
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.title`)}
        </Heading>

        <fieldset
          class="fieldset personal-information bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <p class="label mb-1 text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.title`
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
                  `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.${title}`
                )}
              />
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.${title}`
              )}
            </label>
          {/each}

          <label for="personal-information-first-name" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.first-name`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.first-name-placeholder`
            )}
            bind:value={$form.personalInformation.firstName}
            aria-invalid={$errors.personalInformation?.firstName ? 'true' : undefined}
          />

          <label for="personal-information-last-name">
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.last-name`)}
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.last-name-placeholder`
            )}
            bind:value={$form.personalInformation.lastName}
            aria-invalid={$errors.personalInformation?.lastName ? 'true' : undefined}
          />

          <p class="label mb-1 text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.freelance`)}
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.spoken-languages.title`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.spoken-languages.placeholder`
            )}
            bind:value={$form.personalInformation.spokenLanguages}
            aria-invalid={$errors.personalInformation?.spokenLanguages ? 'true' : undefined}
          />

          <label for="personal-information-birthdate" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.birth-date`
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
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.allergies`)}
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.medical-and-physical-condition`
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
            `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.title`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.number`
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
            defaultValue={$form.personalInformation.passport?.number ?? ''}
            onchange={(e) => {
              $form.personalInformation = {
                ...$form.personalInformation,
                passport: {
                  validity: '',
                  ...$form.personalInformation.passport,
                  number: e.currentTarget.value
                }
              };
            }}
            aria-invalid={$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'true'
              : undefined}
          />

          <label for="personal-information-passport-validity" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.validity`
            )}
          </label>
          <input
            type="date"
            id="personal-information-passport-validity"
            class="input w-full {$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'input-error'
              : ''}"
            defaultValue={$form.personalInformation.passport?.validity ?? ''}
            onchange={(e) => {
              $form.personalInformation = {
                ...$form.personalInformation,
                passport: {
                  number: '',
                  ...$form.personalInformation.passport,
                  validity: e.currentTarget.value
                }
              };
            }}
            aria-invalid={$errors.personalInformation?.passport ||
            $errors.personalInformation?.passport?._errors
              ? 'true'
              : undefined}
          />
        </fieldset>

        <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.title`)}
        </Heading>
        <fieldset class="fieldset address bg-base-200/50 border-base-300 rounded-box border p-4">
          <label
            for="personal-information-address-street-address"
            class="label text-wrap break-words"
          >
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.street-address`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.postal-code`
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
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.country`
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
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.country-placeholder`
              )}
            </option>
            {#each countries as country}
              <option value={country}>{country}</option>
            {/each}
          </select>

          <label for="personal-information-phone-number" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.phone-number`
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
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.email`)}
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
            `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.title`
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
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`
              )}
            </p>
            <p class="label text-wrap break-words">
              {@html $t(
                `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`
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
                  `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`
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
                    `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`
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
                  `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`
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
                    `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`
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
            `${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.travel-insurance`
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
          {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.remarks`)}
        </Heading>
        <fieldset
          class="fieldset personal-information-remarks bg-base-200/50 border-base-300 rounded-box border p-4"
        >
          <label for="personal-information-remarks" class="label text-wrap break-words">
            {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.remarks`)}
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
