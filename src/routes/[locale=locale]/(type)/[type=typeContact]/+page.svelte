<script lang="ts">
  import Anchor from '$lib/components/Anchor.svelte';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Faq from '$lib/components/Faq.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { t } from '$lib/translations';
  import { ArrowLeft, Mail, Phone } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  let displayForm: boolean = $state(false);
  let displayPhone: boolean = $state(false);
  const bgColor = 'bg-shakespeare-400';
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
          class="rounded-lg shadow btn btn-wide btn-outline bg-shakespeare-900 border-shakespeare-500 h-16 text-white"
          onclick={() => (displayForm = true)}
        >
          <Mail strokeWidth={2.5} class="aspect-square h-5" />
          {$t('page.form.select-section.button.message')}
        </button>
        <button
          class="rounded-lg shadow btn bg-shakespeare-600 border-shakespeare-500 hover:bg-shakespeare-800 btn-wide h-16 text-white"
          onclick={() => (displayPhone = true)}
        >
          <Phone strokeWidth={2.5} class="aspect-square h-5" />
          {$t('page.form.select-section.button.call')}
        </button>
      </div>
    </div>
    <!-- Mail Form -->
    <section class="mx-auto md:w-1/3 {displayForm && !displayPhone ? '' : 'hidden'}" in:fade>
      <Heading class="pb-4 text-lg font-bold">
        {$t('page.form.mail-section.title')}
      </Heading>
      <!-- <Form bind:this={form} action="/{$locale}/forms/contact" {fields} on:success={onSuccess}
              on:failure={onFailure}/> -->
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
        class="shadow inline-flex justify-center items-center bg-shakespeare-600 border-1 broder-white hover:bg-shakespeare-800 rounded-lg text-center text-white w-full max-w-64 h-20  hover:shadow-lg hover:border-transparent ease-in-out transition-colors"
      >

        <Phone strokeWidth={2.5} class="aspect-square h-5" />
        +41 21 613 73 73
      </a>
    </section>
    <!-- Reset Form -->
    <section
      class="flex flex-col items-center justify-center {displayForm || displayPhone
        ? ''
        : 'hidden'}"
      in:fly
    >
      <hr class="my-4 w-1/2 rounded-lg border-t-[2px] border-gray-700 shadow-lg" />
      <button
        class=" w-full max-w-64 h-12 inline-flex justify-center items-center rounded-lg border-2 border-gray-700 bg-white text-black hover:shadow-lg hover:text-white hover:bg-gray-950 hover:border-transparent ease-in-out transition-colors"
        onclick={() => {
          displayForm = false;
          displayPhone = false;
        }}
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

