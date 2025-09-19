<script lang="ts">
  import { page } from '$app/state';
  import { Forms, MediaTypes, RouteTypes, SocialNetworks, Titles, TravelReductions } from '$enums';
  import { PUBLIC_BOTPOISON_PUBLICKEY } from '$env/static/public';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import { t } from '$lib/translations';
  import Botpoison from '@botpoison/browser';
  import { CircleMinus, CirclePlus } from 'lucide-svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { schemaStep1, schemaStep2, schemaStep3, schemaStep4 } from './schema';
  import Loading from '$lib/components/Loading.svelte';

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

  function removeEmergencyContact(index: number) {
    $form.personalInformation.emergencyContacts =
      $form.personalInformation.emergencyContacts.filter((_, i) => i !== index);
    if ($form.personalInformation.emergencyContacts.length <= 1) canDeleteEmergencyContacts = false;
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
                class="label my-1 text-wrap break-words {$errors.onlinePresence ? 'text-error' : ''}"
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
                      $form.onlinePresence.filter(
                        (x) => x !== SocialNetworkType
                      ) as typeof $form.onlinePresence;
                    }
                  }}
                  aria-label={$t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.${SocialNetworkType}`)}
                />
                {@html $t(`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.${SocialNetworkType}`)}
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
