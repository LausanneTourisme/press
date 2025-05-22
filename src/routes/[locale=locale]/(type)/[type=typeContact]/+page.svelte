<script lang="ts">
  import { page } from '$app/state';
  import Anchor from '$lib/components/Anchor.svelte';
  import Container from '$lib/components/Container.svelte';
  import Faq from '$lib/components/Faq.svelte';
  import Form from './Form.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { locale, t } from '$lib/translations';
  import { ArrowLeft, Mail, Phone } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { ActionData } from './$types';
  import type { SvelteComponent } from 'svelte';

  const pageForm = $derived(page.form as ActionData);
  let displayForm: boolean = $state(false);
  let formSended: boolean = $state(false);
  let displayPhone: boolean = $state(false);
  let bgColor = $state('bg-shakespeare-400');

  let mailForm: HTMLElement | undefined = $state();
  let titleSection: HTMLElement | undefined = $state();
  let titleSectionFailed = $state(false);
  const reset = () => {
    displayForm = false;
    displayPhone = false;
    formSended = false;
    bgColor = 'bg-shakespeare-400';
  };
  const onSuccess = () => {
    bgColor = 'bg-apple-100';
    formSended = true;
    setTimeout(() => {
      mailForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };
  const onFailure = () => {
    bgColor = 'bg-orange-100';
  };
  const validateFields = (
    formData: FormData
  ): {
    status: 'success' | 'failed';
    message?: string;
  } => {
    const title = formData.get('title');

    if (!title) {
      titleSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      titleSectionFailed = true;
      onFailure();
      return {
        status: 'failed',
        message: $t('page.form.mail-section.validations.radio-buttons')
      };
    }

    return {
      status: 'success'
    };
  };
</script>

<Container>
  <Heading tag="h1" class="text-center">
    {$t('page.heading')}
  </Heading>

  <Paragraph centered={true} class="">
    {@html $t('page.description')}
  </Paragraph>
  <div class="text-center md:flex md:items-center md:justify-center">
    <div class="mt-12 md:mx-12">
      <article>
        <div class="avatar w-full">
          <div class="mx-auto w-48 rounded-full md:w-64">
            <Image src="/images/olivia.jpg" alt="Olivia Bosshart" />
          </div>
        </div>
        <Heading tag="h3">Olivia Bosshart</Heading>
        <Paragraph>Press & Public Relations Manager</Paragraph>
      </article>
    </div>
    <div class="mt-12 md:mx-12">
      <article>
        <div class="avatar w-full">
          <div class="mx-auto w-48 rounded-full md:w-64">
            <Image src="/images/laura.jpg" alt="Laura Ragonese" />
          </div>
        </div>
        <Heading tag="h3">Laura Ragonese</Heading>
        <Paragraph>Media & Press Coordinator</Paragraph>
      </article>
    </div>
  </div>
</Container>
<Anchor name="form" />
<Container fullscreen={true} class={twMerge(bgColor, 'py-32')}>
  <section class="my-12 rounded px-4" transition:fade={{ delay: 200 }}>
    <div
      class="flex flex-col items-center justify-center py-4 {displayForm || displayPhone
        ? 'hidden'
        : ''}"
      out:fade
    >
      <Heading class="-mt-4 mb-8 text-lg font-bold">
        {$t('page.form.select-section.title')}
      </Heading>
      <div
        class="flex flex-col items-center justify-center space-y-4 md:flex-row md:space-y-0 md:space-x-4"
      >
        <button
          class="btn btn-wide btn-outline bg-shakespeare-900 border-shakespeare-500 h-16 rounded-lg text-white shadow"
          onclick={() => (displayForm = true)}
        >
          <Mail strokeWidth={2.5} class="aspect-square h-5" />
          {$t('page.form.select-section.button.message')}
        </button>
        <button
          class="btn bg-shakespeare-600 border-shakespeare-500 hover:bg-shakespeare-800 btn-wide h-16 rounded-lg text-white shadow"
          onclick={() => (displayPhone = true)}
        >
          <Phone strokeWidth={2.5} class="aspect-square h-5" />
          {$t('page.form.select-section.button.call')}
        </button>
      </div>
    </div>
    <!-- Mail Form -->
    <section
      bind:this={mailForm}
      class="mx-auto md:w-1/3 {displayForm && !displayPhone ? '' : 'hidden'}"
      in:fade
    >
      <Heading class="pb-4 text-lg font-bold">
        {$t('page.form.mail-section.title')}
      </Heading>
      <Form
        action="/{$locale}/contact"
        {onSuccess}
        {onFailure}
        validation={validateFields}
        class={formSended ? 'hidden' : ''}
      >
        <!-- Gender -->
        <div class="my-4" id="title-section" bind:this={titleSection}>
          <p class="font-lighter my-3 text-sm text-neutral-700">
            {$t('page.form.mail-section.form.gender-section.title')}
            <span class="text-brand-600">*</span>
          </p>
          <div>
            <ul class="flex items-center justify-center gap-4">
              <li class="w-full">
                <input
                  type="radio"
                  id="title-0"
                  name="title"
                  value={$t('page.form.mail-section.form.gender-section.madam')}
                  class="peer hidden"
                  onchange={() => (titleSectionFailed = false)}
                />
                <label
                  for="title-0"
                  class={twMerge(
                    'inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500 peer-checked:border-blue-600 peer-checked:font-semibold peer-checked:text-blue-600 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-gray-300',
                    pageForm?.fields?.title?.incorrect || titleSectionFailed
                      ? 'border border-red-500 text-red-500 ring-1 ring-red-500'
                      : ''
                  )}
                >
                  <span class="block w-full text-center">
                    {$t('page.form.mail-section.form.gender-section.madam')}
                  </span>
                </label>
              </li>
              <li class="w-full">
                <input
                  type="radio"
                  id="title-1"
                  name="title"
                  value={$t('page.form.mail-section.form.gender-section.sir')}
                  class="peer hidden"
                  onchange={() => (titleSectionFailed = false)}
                />
                <label
                  for="title-1"
                  class={twMerge(
                    'inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500 peer-checked:border-blue-600 peer-checked:font-semibold peer-checked:text-blue-600 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-gray-300',
                    pageForm?.fields?.title?.incorrect || titleSectionFailed
                      ? 'border border-red-500 text-red-500 ring-1  ring-red-500'
                      : ''
                  )}
                >
                  <span class="block w-full text-center">
                    {$t('page.form.mail-section.form.gender-section.sir')}
                  </span>
                </label>
              </li>
            </ul>
          </div>
          <div class="label">
            <span class="label-text-alt"
              >{pageForm?.fields?.title?.incorrect || titleSectionFailed
                ? (pageForm?.fields?.title?.message ??
                  $t('page.form.mail-section.validations.radio-buttons'))
                : undefined}</span
            >
          </div>
        </div>
        <!-- Name -->
        <label class="form-control my-4 block w-full">
          <p class="font-lighter my-3 w-full text-sm text-neutral-700">
            {$t('page.form.mail-section.form.name-section.title')}
            <span class="text-brand-600">*</span>
          </p>
          <input
            type="text"
            name="name"
            required
            placeholder={$t('page.form.mail-section.form.name-section.placeholder')}
            class={twMerge(
              'input input-bordered h-12 w-full rounded-lg',
              pageForm?.fields?.name?.incorrect ? 'color-red-500 border-red-500' : undefined
            )}
          />
          <div class="label w-full text-sm">
            <span class="label-text-alt">{pageForm?.fields?.name?.message}</span>
          </div>
        </label>
        <!-- Email -->
        <label class="form-control my-4 block w-full">
          <p class="font-lighter my-3 w-full text-sm text-neutral-700">
            {$t('page.form.mail-section.form.email-section.title')}
            <span class="text-brand-600">*</span>
          </p>
          <input
            type="email"
            name="email"
            required
            placeholder={$t('page.form.mail-section.form.email-section.placeholder')}
            class={twMerge(
              'input input-bordered h-12 w-full rounded-lg',
              pageForm?.fields?.email?.incorrect ? 'color-red-500 border-red-500' : undefined
            )}
          />
          <div class="label w-full text-sm">
            <span class="label-text-alt">{pageForm?.fields?.email?.message}</span>
          </div>
        </label>
        <!-- Activity -->
        <label class="form-control my-4 block w-full">
          <div class="label my-3 w-full">
            <span class="label-text">
              {$t('page.form.mail-section.form.area-of-activity-section.title')}
              <span class="text-brand-600">*</span>
            </span>
          </div>
          <select
            name="job_title"
            class={twMerge(
              'select select-bordered h-12 w-full rounded-lg',
              pageForm?.fields?.job_title?.incorrect ? 'color-red-500 border-red-500' : undefined
            )}
            required
          >
            <option disabled selected value>
              -- {$t('page.form.mail-section.form.area-of-activity-section.choices.please-select')} --
            </option>
            <option
              value={$t('page.form.mail-section.form.area-of-activity-section.choices.journalist')}
            >
              {$t('page.form.mail-section.form.area-of-activity-section.choices.journalist')}
            </option>
            <option
              value={$t('page.form.mail-section.form.area-of-activity-section.choices.influencer')}
            >
              {$t('page.form.mail-section.form.area-of-activity-section.choices.influencer')}
            </option>
            <option
              value={$t('page.form.mail-section.form.area-of-activity-section.choices.media')}
            >
              {$t('page.form.mail-section.form.area-of-activity-section.choices.media')}
            </option>
            <option
              value={$t('page.form.mail-section.form.area-of-activity-section.choices.other')}
            >
              {$t('page.form.mail-section.form.area-of-activity-section.choices.other')}
            </option>
          </select>
          <div class="label w-full text-sm">
            <span class="label-text-alt">{pageForm?.fields?.job_title?.message}</span>
          </div>
        </label>
        <!-- Message -->
        <label class="form-control my-4 block">
          <div class="label my-3 w-full">
            <span class="label-text">
              {$t('page.form.mail-section.form.message-section.title')}
              <span class="text-brand-600">*</span>
            </span>
          </div>
          <textarea
            class={twMerge(
              'textarea textarea-bordered h-24 w-full rounded-lg',
              pageForm?.fields?.message?.incorrect ? 'color-red-500 border-red-500' : undefined
            )}
            name="message"
            placeholder={$t('page.form.mail-section.form.message-section.placeholder')}
            required
          ></textarea>
          <div class="label w-full text-sm">
            <span class="label-text-alt">{pageForm?.fields?.message?.message}</span>
          </div>
        </label>
      </Form>
    </section>
    <!-- Call Form -->
    <section
      class="my-4 flex flex-col items-center justify-center {!displayForm && displayPhone
        ? ''
        : 'hidden'}"
      in:fly
    >
      <Paragraph class="text-lg font-bold text-gray-800">
        {$t('page.form.call-section.title')}
      </Paragraph>
      <a
        href="tel:0041216137373"
        class="bg-shakespeare-600 broder-white hover:bg-shakespeare-800 inline-flex h-20 w-full max-w-64 items-center justify-center rounded-lg border-1 text-center text-white shadow transition-colors ease-in-out hover:border-transparent hover:shadow-lg"
      >
        <Phone strokeWidth={2.5} class="aspect-square h-5" />
        +41 21 613 73 73
      </a>
    </section>
    <!-- Reset Form -->
    <section
      class="flex flex-col items-center justify-center {(displayForm || displayPhone) && !formSended
        ? ''
        : 'hidden'}"
      in:fly
    >
      <hr class="my-4 w-1/2 rounded-lg border-t-[2px] border-gray-700 shadow-lg" />
      <button
        class=" inline-flex h-12 w-full max-w-64 items-center justify-center rounded-lg border-2 border-gray-700 bg-white text-black transition-colors ease-in-out hover:border-transparent hover:bg-gray-950 hover:text-white hover:shadow-lg"
        onclick={reset}
      >
        <ArrowLeft class="h-4 w-4" />
        {$t('page.form.restart-button')}
      </button>
    </section>
  </section>
</Container>
<Anchor name="faq" />
<Container class="mb-16">
  <Heading class="my-8 text-center">
    {$t('common.faq.title')}
  </Heading>
  <Faq />
</Container>
