<script lang="ts">
  import { page } from '$app/state';
  import {
    Forms,
    RouteTypes,
    SocialNetworks,
    Titles,
    TravelReductions,
    type SocialNetwork,
    type TravelReduction
  } from '$enums';
  import { PUBLIC_BOTPOISON_PUBLICKEY } from '$env/static/public';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import { t } from '$lib/translations';
  import Botpoison from '@botpoison/browser';
  import { CircleMinus, CirclePlus, Trash2 } from 'lucide-svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { schemaStep1, schemaStep2, schemaStep3, schemaStep4 } from './schema';
  import { humanFileSize } from '$lib/helpers';
  import { dev } from '$app/environment';

  const steps = [zod4(schemaStep1), zod4(schemaStep2), zod4(schemaStep3), zod4(schemaStep4)];
  const countries = $derived(Object.values((page.data as PageData).countries));
  let step = $state(1);
  let emergencyContacts = $state([{ name: '', phonenunmber: '' }]);
  let canDeleteEmergencyContacts = $state(false);
  let isSubmitting = $state(false);

  const { form, errors, enhance, message, options, validateForm, constraints } = superForm(
    (page.data as PageData).form,
    {
      errorSelector: '[aria-invalid="true"],[data-invalid]',
      scrollToError: 'smooth',
      autoFocusOnError: 'detect',
      resetForm: false,
      applyAction: true,
      clearOnSubmit: 'none',
      onUpdate: async ({ form }) => {
        if (form.valid) step = 0;
        isSubmitting = false;
      },
      onSubmit: async ({ cancel, formData }) => {
        isSubmitting = true;
        const isLast = steps.length === step;
        options.validators = steps[step - 1];
        // antibot
        const botpoison = new Botpoison({
          publicKey: PUBLIC_BOTPOISON_PUBLICKEY
        });
        const { solution } = await botpoison.challenge();
        formData.append('_botpoison', solution);

        emergencyContacts.forEach((contact, index) => {
          if ($form.emergencyContactNames === undefined) $form.emergencyContactNames = [];
          if ($form.emergencyContactPhones === undefined) $form.emergencyContactPhones = [];

          ($form.emergencyContactNames as string[])[index] = contact.name;
          ($form.emergencyContactPhones as string[])[index] = contact.phonenunmber;
        });

        const result = await validateForm({ update: true });

        if (!result.valid) {
          cancel();
          document.querySelector('body')?.scrollIntoView();
          isSubmitting = false;
          return;
        }

        if (isLast) {
          return;
        }

        cancel();

        if (result.valid) {
          document.querySelector('body')?.scrollIntoView();
          step = step + 1;
        }
        isSubmitting = false;
      },
      onError: (error) => {
        console.error(
          `Please contact us and explain us how to get this error please. (error ${error.result.status})`
        );
        isSubmitting = false;
      }
    }
  );

  const addEmergencyContact = () => {
    emergencyContacts.push({ name: '', phonenunmber: '' });
    canDeleteEmergencyContacts = true;
  };

  const removeEmergencyContact = (index: number) => {
    emergencyContacts = emergencyContacts.filter((_, i) => i !== index);
    if (emergencyContacts.length <= 1) canDeleteEmergencyContacts = false;
  };

  $effect(() => {
    // force reset step when locale changes
    page.data.locale;
    step = 1;
  });

  if (dev) {
    $effect(() => {
      console.log({ errors: $errors });
    });
  }
</script>

<Container width="small">
  <form method="POST" class="w-full" enctype="multipart/form-data" use:enhance>
    <section class="step1 about-media w-full" class:hidden={step !== 1}>
      <Heading tag="h2" class="mt-6 mb-2 text-lg md:text-2xl">
        {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.title`)}
      </Heading>

      <fieldset class="fieldset bg-base-200/50 border-base-300 rounded-box border p-4">
        <!-- Content Positioning -->
        <label for="contentPositioning" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.content-positioning`)}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <input
          type="text"
          id="contentPositioning"
          name="contentPositioning"
          bind:value={$form.contentPositioning}
          class="input w-full {$errors.contentPositioning ? 'input-error' : ''}"
          aria-invalid={$errors.contentPositioning ? 'true' : undefined}
        />

        <!-- Target Audience -->
        <label for="targetAudience" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.target-audience`)}
          {#if $constraints.targetAudience?.required}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          {/if}
        </label>
        <input
          type="text"
          id="targetAudience"
          name="targetAudience"
          bind:value={$form.targetAudience}
          class="input w-full {$errors.targetAudience ? 'input-error' : ''}"
          aria-invalid={$errors.targetAudience ? 'true' : undefined}
        />

        <!-- Online Presence -->
        <div class="join join-vertical">
          <p class="label mb-1 text-wrap break-words">
            {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.online-presence.title`)}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </p>

          {#each Object.values(SocialNetworks) as socialNetwork}
            <label
              class="label my-1 text-wrap break-words {$errors.onlinePresence?._errors !== undefined
                ? 'text-error'
                : ''}"
            >
              <input
                type="checkbox"
                name="onlinePresence"
                value={socialNetwork}
                checked={($form.onlinePresence as SocialNetwork[]).includes(socialNetwork) ?? false}
                class="checkbox {$errors.onlinePresence?._errors !== undefined
                  ? 'border-error'
                  : ''}"
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    $form.onlinePresence = [
                      ...($form.onlinePresence as SocialNetwork[]),
                      socialNetwork
                    ];
                  } else {
                    $form.onlinePresence = ($form.onlinePresence as SocialNetwork[]).filter(
                      (x: SocialNetwork) => x !== socialNetwork
                    );
                  }
                }}
              />
              {@html $t(
                `${RouteTypes.Forms}.${Forms.ContentCreator}.form.online-presence.${socialNetwork}`
              )}
            </label>
          {/each}
        </div>

        <label for="object-request" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.object-request`)}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <textarea
          id="object-request"
          name="objectRequest"
          defaultValue={($form.objectRequest as string | undefined) ?? ''}
          bind:value={$form.objectRequest}
          class="textarea w-full {$errors.objectRequest ? 'textarea-error' : ''}"
          aria-required={$errors.objectRequest ? 'true' : undefined}
        ></textarea>
      </fieldset>

      <!-- Instagram Section -->
      {#if ($form.onlinePresence as SocialNetwork[]).includes(SocialNetworks.Instagram)}
        <Heading tag="h3" class="mb-4 text-lg">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.title`
          )}
        </Heading>
        <fieldset
          class="fieldset instagram-statistics bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <!-- Instagram Profile URL -->
          <label for="instagramProfileURL" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.profile-url`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="url"
            id="instagramProfileURL"
            name="instagramProfileURL"
            bind:value={$form.instagramProfileURL}
            class="input w-full {$errors.instagramProfileURL ? 'input-error' : ''}"
            placeholder="https://"
            aria-invalid={$errors.instagramProfileURL ? 'true' : undefined}
          />

          <!-- Instagram Subscriber Screenshots -->
          <label for="instagramSubscriberScreenshots" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.subscriber-statistics-screenshots.title`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="file"
            id="instagramSubscriberScreenshots"
            name="instagramSubscriberScreenshots"
            multiple
            accept="image/*"
            class="file-input w-full {$errors.instagramSubscriberScreenshots?._errors !== undefined
              ? 'file-input-error'
              : ''}"
            onchange={(e) => {
              $form.instagramSubscriberScreenshots = [
                ...($form.instagramSubscriberScreenshots as File[]),
                ...Array.from(e.currentTarget.files ?? [])
              ];
            }}
            aria-invalid={$errors.instagramSubscriberScreenshots?._errors !== undefined
              ? 'true'
              : undefined}
          />

          {#if $form.instagramSubscriberScreenshots?.length}
            <ul class="mt-2 space-y-1">
              {#each $form.instagramSubscriberScreenshots as File[] as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                    onclick={() => {
                      $form.instagramSubscriberScreenshots = (
                        $form.instagramSubscriberScreenshots as File[]
                      ).filter((_, i) => i !== index);
                    }}
                  />
                  <span>{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          {/if}

          <!-- Instagram Accounts Screenshots -->
          <label for="instagramAccountsScreenshots" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Instagram}.accounts-that-responded-screenshots.title`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="file"
            id="instagramAccountsScreenshots"
            name="instagramAccountsScreenshots"
            multiple
            accept="image/*"
            class="file-input w-full {$errors.instagramAccountsScreenshots?._errors !== undefined
              ? 'file-input-error'
              : ''}"
            onchange={(e) => {
              $form.instagramAccountsScreenshots = [
                ...($form.instagramAccountsScreenshots as File[]),
                ...Array.from(e.currentTarget.files ?? [])
              ];
            }}
            aria-invalid={$errors.instagramAccountsScreenshots?._errors !== undefined
              ? 'true'
              : undefined}
          />

          {#if $form.instagramAccountsScreenshots?.length}
            <ul class="mt-2 space-y-1">
              {#each $form.instagramAccountsScreenshots as File[] as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                    onclick={() => {
                      $form.instagramAccountsScreenshots = (
                        $form.instagramAccountsScreenshots as File[]
                      ).filter((_, i) => i !== index);
                    }}
                  />
                  <span>{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          {/if}
        </fieldset>
      {/if}

      <!-- TikTok Section -->
      {#if ($form.onlinePresence as SocialNetwork[]).includes(SocialNetworks.TikTok)}
        <Heading tag="h3" class="mb-4 text-lg">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.title`
          )}
        </Heading>
        <fieldset
          class="fieldset tiktok-statistics bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="tiktokProfileURL" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.profile-url`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="url"
            id="tiktokProfileURL"
            name="tiktokProfileURL"
            bind:value={$form.tiktokProfileURL}
            class="input w-full {$errors.tiktokProfileURL ? 'input-error' : ''}"
            placeholder="https://"
          />

          <label for="tiktokSubscriberScreenshots" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.TikTok}.subscriber-statistics-screenshots.title`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="file"
            id="tiktokSubscriberScreenshots"
            name="tiktokSubscriberScreenshots"
            multiple
            accept="image/*"
            class="file-input w-full {$errors.tiktokSubscriberScreenshots?._errors !== undefined
              ? 'file-input-error'
              : ''}"
            onchange={(e) => {
              $form.tiktokSubscriberScreenshots = [
                ...($form.tiktokSubscriberScreenshots as File[]),
                ...Array.from(e.currentTarget.files ?? [])
              ];
            }}
            aria-invalid={$errors.tiktokSubscriberScreenshots?._errors !== undefined
              ? 'true'
              : undefined}
          />

          {#if $form.tiktokSubscriberScreenshots?.length}
            <ul class="mt-2 space-y-1">
              {#each $form.tiktokSubscriberScreenshots as File[] as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                    onclick={() => {
                      $form.tiktokSubscriberScreenshots = (
                        $form.tiktokSubscriberScreenshots as File[]
                      ).filter((_, i) => i !== index);
                    }}
                  />
                  <span>{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          {/if}
        </fieldset>
      {/if}

      <!-- YouTube Section -->
      {#if ($form.onlinePresence as SocialNetwork[]).includes(SocialNetworks.YouTube)}
        <Heading tag="h3" class="mb-4 text-lg">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.title`
          )}
        </Heading>
        <fieldset
          class="fieldset youtube-statistics bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="youtubeProfileURL" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.profile-url`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="url"
            id="youtubeProfileURL"
            name="youtubeProfileURL"
            bind:value={$form.youtubeProfileURL}
            class="input w-full {$errors.youtubeProfileURL ? 'input-error' : ''}"
            placeholder="https://"
          />

          <label for="youtubeSubscriberScreenshots" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.YouTube}.subscriber-statistics-screenshots.title`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="file"
            id="youtubeSubscriberScreenshots"
            name="youtubeSubscriberScreenshots"
            multiple
            accept="image/*"
            class="file-input w-full {$errors.youtubeSubscriberScreenshots?._errors !== undefined
              ? 'file-input-error'
              : ''}"
            aria-invalid={$errors.youtubeSubscriberScreenshots?._errors !== undefined
              ? 'true'
              : undefined}
            onchange={(e) => {
              $form.youtubeSubscriberScreenshots = [
                ...($form.youtubeSubscriberScreenshots as File[]),
                ...Array.from(e.currentTarget.files ?? [])
              ];
            }}
          />

          {#if $form.youtubeSubscriberScreenshots?.length}
            <ul class="mt-2 space-y-1">
              {#each $form.youtubeSubscriberScreenshots as File[] as file, index}
                <li class="flex items-center">
                  <Trash2
                    class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                    onclick={() => {
                      $form.youtubeSubscriberScreenshots = (
                        $form.youtubeSubscriberScreenshots as File[]
                      ).filter((_, i) => i !== index);
                    }}
                  />
                  <span>{file.name} ({humanFileSize(file.size)})</span>
                </li>
              {/each}
            </ul>
          {/if}
        </fieldset>
      {/if}

      <!-- Blog Section -->
      {#if ($form.onlinePresence as SocialNetwork[]).includes(SocialNetworks.Blog)}
        <Heading tag="h3" class="mb-4 text-lg">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.title`
          )}
        </Heading>
        <fieldset
          class="fieldset blog-statistics bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        >
          <label for="blogURL" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.url`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="url"
            id="blogURL"
            name="blogURL"
            bind:value={$form.blogURL}
            class="input w-full {$errors.blogURL ? 'input-error' : ''}"
            placeholder="https://"
          />

          <label for="blogAudienceProfile" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.audience-profile.title`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <textarea
            id="blogAudienceProfile"
            name="blogAudienceProfile"
            bind:value={$form.blogAudienceProfile}
            class="textarea w-full {$errors.blogAudienceProfile ? 'textarea-error' : ''}"
          ></textarea>

          <label for="blogMonthlyUniqueVisitors" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.performances.monthly-unique-visitors`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="number"
            id="blogMonthlyUniqueVisitors"
            name="blogMonthlyUniqueVisitors"
            bind:value={$form.blogMonthlyUniqueVisitors}
            class="input w-full {$errors.blogMonthlyUniqueVisitors ? 'input-error' : ''}"
          />

          <label for="blogMonthlyPageViews" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.${SocialNetworks.Blog}.performances.montlhy-page-views`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </label>
          <input
            type="number"
            id="blogMonthlyPageViews"
            name="blogMonthlyPageViews"
            bind:value={$form.blogMonthlyPageViews}
            class="input w-full {$errors.blogMonthlyPageViews ? 'input-error' : ''}"
          />
        </fieldset>
      {/if}
    </section>

    <section class="step2 coverage w-full" class:hidden={step !== 2}>
      <Heading tag="h2" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.coverages.title`)}
      </Heading>

      <fieldset class="fieldset coverage bg-base-200/50 border-base-300 rounded-box border p-4">
        <label for="coveragePublicationAngle" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.coverages.publication-angle.title`
          )}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <input
          type="text"
          id="coveragePublicationAngle"
          name="coveragePublicationAngle"
          bind:value={$form.coveragePublicationAngle}
          class="input w-full {$errors.coveragePublicationAngle ? 'input-error' : ''}"
        />

        <label for="coverageSubjectsOfInterest" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.coverages.subjects-of-interest`
          )}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <input
          type="text"
          id="coverageSubjectsOfInterest"
          name="coverageSubjectsOfInterest"
          bind:value={$form.coverageSubjectsOfInterest}
          class="input w-full {$errors.coverageSubjectsOfInterest ? 'input-error' : ''}"
        />

        <!-- Publication Channels -->
        <div class="join join-vertical">
          <p class="label mb-1 text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.coverages.publication-channels`
            )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </p>

          {#each Object.values(SocialNetworks) as socialNetwork}
            <label
              class="label my-1 text-wrap break-words {$errors.coveragePublicationChannels?._errors
                ? 'text-error'
                : ''}"
            >
              <input
                type="checkbox"
                name="coveragePublicationChannels"
                value={socialNetwork}
                checked={($form.coveragePublicationChannels as SocialNetwork[]).includes(
                  socialNetwork
                ) || false}
                class="checkbox {$errors.coveragePublicationChannels?._errors
                  ? 'border-error'
                  : ''}"
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    $form.coveragePublicationChannels = [
                      ...($form.coveragePublicationChannels as SocialNetwork[]),
                      socialNetwork
                    ];
                  } else {
                    $form.coveragePublicationChannels = (
                      $form.coveragePublicationChannels as SocialNetwork[]
                    ).filter((x) => x !== socialNetwork);
                  }
                }}
              />
              {@html $t(
                `${RouteTypes.Forms}.${Forms.ContentCreator}.form.online-presence.${socialNetwork}`
              )}
            </label>
          {/each}
        </div>

        <label for="coverageProposedMediaCoverage" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.coverages.proposed-media-coverage.title`
          )}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <textarea
          id="coverageProposedMediaCoverage"
          name="coverageProposedMediaCoverage"
          bind:value={$form.coverageProposedMediaCoverage}
          class="textarea w-full {$errors.coverageProposedMediaCoverage ? 'textarea-error' : ''}"
        ></textarea>

        <label for="coverageTimingAndPublicationDates" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.coverages.timing-and-publication-Dates.title`
          )}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <textarea
          id="coverageTimingAndPublicationDates"
          name="coverageTimingAndPublicationDates"
          bind:value={$form.coverageTimingAndPublicationDates}
          class="textarea w-full {$errors.coverageTimingAndPublicationDates
            ? 'textarea-error'
            : ''}"
        ></textarea>
      </fieldset>
    </section>

    <section class="step3 travel-information" class:hidden={step !== 3}>
      <Heading tag="h2" class="mt-6 mb-2 text-2xl md:text-2xl">
        {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.title`)}
      </Heading>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(
          `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.title`
        )}
      </Heading>
      <fieldset
        class="fieldset departure-point bg-base-200/50 border-base-300 rounded-box border p-4"
      >
        <label for="travel-departure-city" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.city`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="travel-departure-city"
          name="travelDepartureCity"
          class="input w-full {$errors.travelDepartureCity ? 'input-error' : ''}"
          placeholder={$t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.city-placeholder`
          )}
          bind:value={$form.travelDepartureCity}
          aria-invalid={$errors.travelDepartureCity ? 'true' : undefined}
        />

        <label for="travel-departure-country" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.country`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <select
          id="travel-departure-country"
          name="travelDepartureCountry"
          class="select w-full {$errors.travelDepartureCountry ? 'select-error' : ''}"
          bind:value={$form.travelDepartureCountry}
          aria-invalid={$errors.travelDepartureCountry ? 'true' : undefined}
        >
          <option disabled selected value={undefined}>
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.country-placeholder`
            )}
          </option>
          {#each countries as country}
            <option value={country}>{country}</option>
          {/each}
        </select>

        <label for="travel-outward-journey" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.title`
          )}
        </label>
        <p class="departure-point-outward-journey information">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.information`
          )}
        </p>
        <textarea
          id="travel-outward-journey"
          name="travelOutwardJourney"
          class="textarea w-full {$errors.travelOutwardJourney ? 'textarea-error' : ''}"
          bind:value={$form.travelOutwardJourney}
          maxlength={$constraints.travelOutwardJourney?.maxlength}
          aria-invalid={$errors.travelOutwardJourney ? 'true' : undefined}
        ></textarea>
      </fieldset>

      <fieldset
        class="fieldset departure-point bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
      >
        <label for="travel-return-journey" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.return-journey.title`
          )}
        </label>
        <p class="travel-information-return-journey information">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.return-journey.information`
          )}
        </p>
        <textarea
          id="travel-return-journey"
          name="travelReturnJourney"
          class="textarea w-full {$errors.travelReturnJourney ? 'textarea-error' : ''}"
          bind:value={$form.travelReturnJourney}
          aria-invalid={$errors.travelReturnJourney ? 'true' : undefined}
        ></textarea>
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(
          `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.travel-reduction.title`
        )}
      </Heading>
      <fieldset
        class="fieldset travel-reductions bg-base-200/50 border-base-300 rounded-box border p-4"
      >
        <label for="travel-travel-reduction" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.travel-reduction.please-tick`
          )}
        </label>
        <div id="travel-travel-reduction" class="join join-vertical">
          {#each Object.values(TravelReductions) as travelReduction}
            <label
              class="label my-1 text-wrap break-words {$errors.travelReductions
                ? 'text-error'
                : ''}"
            >
              <input
                class="checkbox"
                type="checkbox"
                name="travelReductions"
                value={travelReduction}
                checked={($form.travelReductions as TravelReduction[]).includes(travelReduction)}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    $form.travelReductions = [
                      ...($form.travelReductions as TravelReduction[]),
                      travelReduction
                    ];
                  } else {
                    $form.travelReductions = ($form.travelReductions as TravelReduction[]).filter(
                      (x) => x !== travelReduction
                    );
                  }
                }}
                aria-label={$t(
                  `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${travelReduction}`
                )}
              />
              {@html $t(
                `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${travelReduction}`
              )}
            </label>
          {/each}
        </div>
      </fieldset>

      <fieldset
        class="fieldset last-visit bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
      >
        <label for="travel-last-journey" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.last-visit`
          )}
        </label>
        <input
          type="date"
          id="travel-last-journey"
          class="input w-full {$errors.travelLastVisit ? 'input-error' : ''}"
          name="travelLastVisit"
          bind:value={$form.travelLastVisit}
          aria-invalid={$errors.travelLastVisit ? 'true' : undefined}
        />
      </fieldset>
    </section>

    <section class="step4 personal-information" class:hidden={step !== 4}>
      <Heading tag="h2" class="mt-6 mb-2 text-xl md:text-xl">
        {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.title`)}
      </Heading>

      <fieldset
        class="fieldset personal-information bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
      >
        <p class="label mb-1 text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.titles.title`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </p>
        {#each Object.values(Titles) as title}
          <label
            aria-invalid={$errors.personalTitle ? 'true' : undefined}
            class="label text-wrap break-words"
          >
            <input
              type="radio"
              name="personalTitle"
              value={title}
              checked={title === $form.personalTitle}
              class="radio {$errors.personalTitle ? 'radio-error' : ''}"
              onchange={(e) => {
                if (e.currentTarget.checked) {
                  $form.personalTitle = title;
                }
              }}
              aria-label={$t(
                `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.titles.${title}`
              )}
            />
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.titles.${title}`
            )}
          </label>
        {/each}

        <label for="personal-information-first-name" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.first-name`
          )}

          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-first-name"
          class="input w-full {$errors.personalFirstName ? 'input-error' : ''}"
          name="personalFirstName"
          placeholder={$t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.first-name-placeholder`
          )}
          bind:value={$form.personalFirstName}
          aria-invalid={$errors.personalFirstName ? 'true' : undefined}
        />

        <label for="personal-information-last-name">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.last-name`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-last-name"
          class="input w-full {$errors.personalLastName ? 'input-error' : ''}"
          placeholder={$t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.last-name-placeholder`
          )}
          name="personalLastName"
          bind:value={$form.personalLastName}
          aria-invalid={$errors.personalLastName ? 'true' : undefined}
        />

        <label for="personal-information-spoken-languages" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.spoken-languages.title`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-spoken-languages"
          class="input w-full {$errors.personalSpokenLanguages ? 'input-error' : ''}"
          placeholder={$t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.spoken-languages.placeholder`
          )}
          name="personalSpokenLanguages"
          bind:value={$form.personalSpokenLanguages}
          aria-invalid={$errors.personalSpokenLanguages ? 'true' : undefined}
        />

        <label for="personal-information-birthdate" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.birth-date`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="date"
          id="personal-information-birthdate"
          class="input w-full {$errors.personalBirthday ? 'input-error' : ''}"
          name="personalBirthday"
          bind:value={$form.personalBirthday}
          aria-invalid={$errors.personalBirthday ? 'true' : undefined}
        />

        <label for="personal-information-allergies" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.allergies`
          )}
        </label>
        <input
          type="text"
          id="personal-information-allergies"
          class="input w-full {$errors.personalAllergies ? 'input-error' : undefined}"
          name="personalAllergies"
          bind:value={$form.personalAllergies}
          aria-invalid={$errors.personalAllergies ? 'true' : undefined}
        />

        <label
          for="personal-information-medical-and-physical-condition"
          class="label text-wrap break-words"
        >
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.medical-and-physical-condition`
          )}
        </label>
        <input
          type="text"
          id="personal-information-medical-and-physical-condition"
          class="input w-full {$errors.personalMedicalCondition ? 'input-error' : undefined}"
          name="personalMedicalCondition"
          bind:value={$form.personalMedicalCondition}
          aria-invalid={$errors.personalMedicalCondition ? 'true' : undefined}
        />
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-xl md:text-xl">
        {@html $t(
          `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.passport.title`
        )}
      </Heading>
      <fieldset class="fieldset passport bg-base-200/50 border-base-300 rounded-box border p-4">
        <label for="personal-information-passport-number" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.passport.number`
          )}
        </label>
        <input
          type="text"
          id="personal-information-passport-number"
          class="input w-full {$errors.personalInformationPassport ? 'input-error' : ''}"
          name="passportNumber"
          bind:value={$form.passportNumber}
          aria-invalid={$errors.personalInformationPassport ? 'true' : undefined}
        />

        <label for="personal-information-passport-validity" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.passport.validity`
          )}
        </label>
        <input
          type="date"
          id="personal-information-passport-validity"
          class="input w-full {$errors.personalInformationPassport ? 'input-error' : ''}"
          name="passportValidity"
          bind:value={$form.passportValidity}
          aria-invalid={$errors.personalInformationPassport ? 'true' : undefined}
        />
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.title`)}
      </Heading>
      <fieldset class="fieldset address bg-base-200/50 border-base-300 rounded-box border p-4">
        <label
          for="personal-information-address-street-address"
          class="label text-wrap break-words"
        >
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.street-address`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-address-street-address"
          class="input w-full {$errors.addressStreetAddress ? 'input-error' : ''}"
          name="addressStreetAddress"
          bind:value={$form.addressStreetAddress}
          aria-invalid={$errors.addressStreetAddress ? 'true' : undefined}
        />

        <label for="personal-information-address-city" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.city`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-address-city"
          class="input w-full {$errors.addressCity ? 'input-error' : ''}"
          name="addressCity"
          bind:value={$form.addressCity}
          aria-invalid={$errors.addressCity ? 'true' : undefined}
        />

        <label for="personal-information-address-zip" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.postal-code`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-address-zip"
          class="input w-full {$errors.addressPostalCode ? 'input-error' : ''}"
          name="addressPostalCode"
          bind:value={$form.addressPostalCode}
          aria-invalid={$errors.addressPostalCode ? 'true' : undefined}
        />

        <label for="personal-information-address-country" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.country`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <select
          id="personal-information-address-country"
          class="select w-full {$errors.addressCountry ? 'select-error' : ''}"
          name="addressCountry"
          bind:value={$form.addressCountry}
          aria-invalid={$errors.addressCountry ? 'true' : undefined}
        >
          <option disabled selected value={undefined}>
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.country-placeholder`
            )}
          </option>
          {#each countries as country}
            <option value={country}>{country}</option>
          {/each}
        </select>

        <label for="personal-information-phone-number" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.phone-number`
          )}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="text"
          id="personal-information-phone-number"
          class="input w-full {$errors.personalPhoneNumber ? 'input-error' : ''}"
          name="personalPhoneNumber"
          bind:value={$form.personalPhoneNumber}
          aria-invalid={$errors.personalPhoneNumber ? 'true' : undefined}
        />

        <label for="personal-information-email" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.email`)}
          <span class="text-brand-600 italic">
            {@html $t(`${RouteTypes.Forms}.required`)}
          </span>
        </label>
        <input
          type="email"
          id="personal-information-email"
          class="input w-full {$errors.personalEmail ? 'input-error' : ''}"
          name="personalEmail"
          bind:value={$form.personalEmail}
          aria-invalid={$errors.personalEmail ? 'true' : undefined}
        />
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(
          `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.title`
        )}
        <span class="text-brand-600 italic">
          {@html $t(`${RouteTypes.Forms}.required`)}
        </span>
      </Heading>
      <fieldset
        class="fieldset personal-information-emergency-contacts bg-base-200/50 border-base-300 rounded-box border p-4"
      >
        <div class="hidden md:grid md:grid-cols-[1fr_1fr_100px] md:gap-4">
          <p class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`
            )}
          </p>
          <p class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`
            )}
          </p>
        </div>
        {#each emergencyContacts as _, i}
          <div
            class="personal-information-emergency-contact my-1 rounded-sm border border-gray-300 md:my-0 md:grid md:grid-cols-[1fr_1fr_100px] md:gap-4 md:rounded-none md:border-none"
          >
            <div
              class="p-1 before:content-[attr(data-label)] md:flex md:flex-col md:justify-end md:p-0 md:before:content-none"
              data-label={$t(
                `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`
              )}
            >
              {#if ($errors?.[`emergencyContactNames_${i}`] as string | undefined) !== undefined}
                <p class="text-brand-600 my-1">
                  {@html $t(
                    `${RouteTypes.Forms}.${Forms.ContentCreator}.validations.emergency-contacts.name`
                  )}
                </p>
              {/if}
              <input
                type="text"
                aria-label={$t(
                  `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`
                )}
                class="personal-information-emergency-contact-name input w-full {$errors?.[
                  `emergencyContactNames_${i}`
                ] !== undefined
                  ? 'input-error'
                  : ''}"
                name="emergencyContactNames"
                bind:value={emergencyContacts[i].name}
                aria-invalid={$errors?.[`emergencyContactNames_${i}`] !== undefined
                  ? 'true'
                  : undefined}
              />
            </div>
            <div
              class="p-1 before:content-[attr(data-label)] md:flex md:flex-col md:justify-end md:p-0 md:before:content-none"
              data-label={$t(
                `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`
              )}
            >
              {#if ($errors?.[`emergencyContactPhones_${i}`] as string | undefined) !== undefined}
                <p class="text-brand-600 my-1">
                  {@html $t(
                    `${RouteTypes.Forms}.${Forms.ContentCreator}.validations.emergency-contacts.phone-number`
                  )}
                </p>
              {/if}
              <input
                type="text"
                aria-label={$t(
                  `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`
                )}
                class="personal-information-emergency-contact-phone-number input w-full {$errors?.[
                  `emergencyContactPhones_${i}`
                ] !== undefined
                  ? 'input-error'
                  : ''}"
                name="emergencyContactPhones"
                bind:value={emergencyContacts[i].phonenunmber}
                aria-invalid={$errors?.[`emergencyContactPhones_${i}`] !== undefined
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
          `${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.travel-insurance`
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
            name="travelInsuranceCoveringSwitzerland"
            value={false}
            class="radio {$errors.travelInsuranceCoveringSwitzerland ? 'radio-error' : ''}"
            checked={$form.travelInsuranceCoveringSwitzerland === false}
            onchange={(e) => ($form.travelInsuranceCoveringSwitzerland = false)}
            aria-label={$t(`${RouteTypes.Forms}.no`)}
            required
          />
          {@html $t(`${RouteTypes.Forms}.no`)}
        </label>
        <label class="label text-wrap break-words">
          <input
            type="radio"
            name="travelInsuranceCoveringSwitzerland"
            value={true}
            class="radio {$errors.travelInsuranceCoveringSwitzerland ? 'radio-error' : ''}"
            checked={$form.travelInsuranceCoveringSwitzerland === true}
            onchange={(e) => ($form.travelInsuranceCoveringSwitzerland = true)}
            aria-label={$t(`${RouteTypes.Forms}.yes`)}
          />
          {@html $t(`${RouteTypes.Forms}.yes`)}
        </label>
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.remarks`)}
      </Heading>
      <fieldset
        class="fieldset personal-information-remarks bg-base-200/50 border-base-300 rounded-box border p-4"
      >
        <label for="personal-information-remarks" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.remarks`)}
        </label>
        <textarea
          id="personal-information-remarks"
          name="remarks"
          defaultValue={($form.remarks as string | undefined) ?? ''}
          bind:value={$form.remarks}
          class="textarea w-full"
        ></textarea>
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(`${RouteTypes.Forms}.terms-of-acceptance.title`)}
        <span class="text-brand-600 italic">
          {@html $t(`${RouteTypes.Forms}.required`)}
        </span>
      </Heading>
      <fieldset
        class="fieldset terms-of-acceptance bg-base-200/50 border-base-300 rounded-box border p-4"
      >
        <p class="text-wrap">
          {@html $t(`${RouteTypes.Forms}.terms-of-acceptance.content`)}
        </p>

        <label class="label text-wrap break-words">
          <input
            type="checkbox"
            name="readTermsOfAcceptance"
            value={$form.readTermsOfAcceptance ?? false}
            defaultValue={false}
            class="checkbox {$errors.readTermsOfAcceptance ? 'checkbox-error' : ''}"
            checked={$form.readTermsOfAcceptance === true}
            onchange={(e) => {
              $form.readTermsOfAcceptance = e.currentTarget.checked;
            }}
            aria-invalid={$errors.readTermsOfAcceptance ? 'true' : undefined}
          />
          {@html $t(`${RouteTypes.Forms}.terms-of-acceptance.accept-terms`)}
        </label>
      </fieldset>

      <Heading tag="h3" class="mt-6 mb-2 text-lg md:text-lg">
        {@html $t(`${RouteTypes.Forms}.newsletter.title`)}
      </Heading>
      <fieldset class="fieldset newsletter bg-base-200/50 border-base-300 rounded-box border p-4">
        <p class="">
          {@html $t(`${RouteTypes.Forms}.newsletter.paragraph`)}
        </p>

        <label
          class="label text-wrap break-words"
          aria-invalid={$errors.travelInsuranceCoveringSwitzerland ? 'true' : undefined}
        >
          <input
            type="radio"
            name="newsletter"
            value={false}
            class="radio {$errors.newsletter ? 'radio-error' : ''}"
            checked={$form.newsletter === false}
            onchange={(e) => ($form.newsletter = false)}
            aria-label={$t(`${RouteTypes.Forms}.no`)}
            required
          />
          {@html $t(`${RouteTypes.Forms}.no`)}
        </label>

        <label
          class="label text-wrap break-words"
          aria-invalid={$errors.travelInsuranceCoveringSwitzerland ? 'true' : undefined}
        >
          <input
            type="radio"
            name="newsletter"
            value={true}
            class="radio {$errors.newsletter ? 'radio-error' : ''}"
            checked={$form.newsletter === true}
            onchange={(e) => ($form.newsletter = true)}
            aria-label={$t(`${RouteTypes.Forms}.yes`)}
          />
          {@html $t(`${RouteTypes.Forms}.yes`)}
        </label>
      </fieldset>
    </section>

    <div class="mt-6 mb-2 flex flex-wrap">
      <button
        type="button"
        class="btn mr-2 {step === 1 ? 'hidden' : ''}"
        onclick={(e) => {
          if (step > 1) step = step - 1;
        }}
        disabled={isSubmitting}
      >
        {@html $t(`${RouteTypes.Forms}.previous`)}
      </button>
      <button class="btn" disabled={isSubmitting}>
        <span class={isSubmitting ? '' : 'hidden'}>
          <Loading />
        </span>
        <span class={!isSubmitting ? '' : 'hidden'}>
          {step < steps.length ? $t(`${RouteTypes.Forms}.next`) : $t(`${RouteTypes.Forms}.submit`)}
        </span>
      </button>
    </div>
  </form>
</Container>
