<script lang="ts">
  import { locale, t } from '$lib/translations';
  import { ChevronRight } from 'lucide-svelte';
  import { twMerge } from 'tailwind-merge';
  import Heading from './Heading.svelte';
  import Paragraph from './Paragraph.svelte';
  import Shelf from './Shelf.svelte';
  import Link from './Link.svelte';
  import Instagram from '$lib/Icons/Instagram.svelte';
  import LinkedIn from '$lib/Icons/LinkedIn.svelte';
  import Facebook from '$lib/Icons/Facebook.svelte';
  import Youtube from '$lib/Icons/Youtube.svelte';
  import { onMount } from 'svelte';

  type Props = {
    class?: string;
  };

  const { class: additionalClass }: Props = $props();
  let openShelfIndex: number | null = $state(null); // Stores which shelf is open

  const toggleShelf: (index: number) => void = (index) => {
    openShelfIndex = openShelfIndex === index ? null : index;
    // TODO check if it's really necessary
    // sessionStorage.setItem('FAQindex', openShelfIndex !== null ? openShelfIndex.toString() : '');
  };

  // onMount(() => {
  //   const FAQindex: string | null = sessionStorage.getItem('FAQindex');
  //   if (!FAQindex || isNaN(parseInt(FAQindex as string))) openShelfIndex = null;
  //   else openShelfIndex = parseInt(FAQindex as string);
  // });
  const style = twMerge('h-full', additionalClass);
</script>

<div class={style}>
  <Shelf
    onToggle={() => toggleShelf(0)}
    isOpen={openShelfIndex === 0}
    class="dark:hover:bg-base-dark-hover border-b-4  border-gray-300 hover:bg-slate-100"
    titleClass="min-h-14 pt-10 pb-8 px-4 rounded-md"
    childClass="px-4 pb-12"
  >
    {#snippet title()}
      <Heading tag="h3" class="mt-0 text-left text-xl font-semibold">
        {$t('page.faq.authorisation.title')}
      </Heading>
    {/snippet}

    {#snippet children()}
      <Paragraph class="font-semibold">
        <ChevronRight strokeWidth={3} class="mb-2 inline h-3 w-3" />
        {$t('page.faq.authorisation.paragraph1')}
      </Paragraph>
      <Paragraph>
        {$t('page.faq.authorisation.paragraph2')}
      </Paragraph>
      <Paragraph>
        {$t('page.faq.authorisation.paragraph3')}
      </Paragraph>
      <Paragraph class="font-semibold">
        <ChevronRight strokeWidth={3} class="mb-2 inline h-3 w-3" />
        {$t('page.faq.authorisation.paragraph4')}
      </Paragraph>
      <Paragraph>
        {$t('page.faq.authorisation.paragraph5')}
      </Paragraph>
    {/snippet}
  </Shelf>

  <Shelf
    onToggle={() => toggleShelf(1)}
    isOpen={openShelfIndex === 1}
    class="dark:hover:bg-base-dark-hover border-b-4 border-gray-300"
    titleClass="min-h-14 pt-10 pb-8 px-4 rounded-md"
    childClass="px-4 pb-12"
  >
    {#snippet title()}
      <Heading tag="h3" class="mt-0 text-left text-xl font-semibold">
        {$t('page.faq.drone.title')}
      </Heading>
    {/snippet}

    {#snippet children()}
      <Paragraph class="font-semibold">
        <ChevronRight class="mb-2 inline h-2 w-2" />
        {$t('page.faq.drone.paragraph1')}
      </Paragraph>
      <Paragraph>
        {$t('page.faq.drone.paragraph2.part1')}
        (
        <a class="inline text-blue-500" href="mailto:drones@lausanne-airport.ch" target="_blank">
          drones@lausanne-airport.ch
        </a>
        )
        {$t('page.faq.drone.paragraph2.part2')}
        &nbsp; (
        <a class="inline text-blue-500" href="mailto:drones@lausanne.ch" target="_blank">
          drones@lausanne.ch
        </a>
        ).
      </Paragraph>
      <Paragraph>
        {$t('page.faq.drone.paragraph3')}
        <a
          class="inline text-blue-500"
          href="https://www.lausanne.ch/officiel/administration/securite-et-economie/police-de-lausanne/bons-reflexes/autorisation-survol-drone.html"
          target="_blank"
        >
          {$t('page.faq.drone.paragraph3.link-text')}
        </a>.
      </Paragraph>
      <Paragraph>
        {$t('page.faq.drone.paragraph4')}
      </Paragraph>
    {/snippet}
  </Shelf>

  <Shelf
    onToggle={() => toggleShelf(2)}
    isOpen={openShelfIndex === 2}
    class="dark:hover:bg-base-dark-hover border-b-4 border-gray-300"
    titleClass="min-h-14 pt-10 pb-8 px-4 rounded-md"
    childClass="px-4 pb-12"
  >
    {#snippet title()}
      <Heading tag="h3" class="mt-0 text-left text-xl font-semibold">
        {$t('page.faq.access.title')}
      </Heading>
    {/snippet}

    {#snippet children()}
      <Paragraph>
        {$t('page.faq.access.paragraph1')}
        &nbsp;
        <a
          href="https://www.lausanne-tourisme.ch/{$locale}/{$t('page.faq.access.paragraph1.slug')}/"
          class="inline-flex items-center border-b border-b-blue-500 text-blue-500"
        >
          {$t('page.faq.access.paragraph1.more-informations')}
          <ChevronRight class="ml-1 inline h-4 w-4 stroke-3" />
        </a>
      </Paragraph>
    {/snippet}
  </Shelf>

  <Shelf
    onToggle={() => toggleShelf(3)}
    isOpen={openShelfIndex === 3}
    class="dark:hover:bg-base-dark-hover border-b-4 border-gray-300"
    titleClass="min-h-14 pt-10 pb-8 px-4 rounded-md"
    childClass="px-4 pb-12"
  >
    {#snippet title()}
      <Heading tag="h3" class="mt-0 text-left text-xl font-semibold">
        {$t('page.faq.travel.title')}
      </Heading>
    {/snippet}

    {#snippet children()}
      <Paragraph>
        {$t('page.faq.travel.paragraph1.part1')}
        <!-- TODO inject tag inside translation !!! -->
        <a
          href={$t('page.faq.travel.paragraph1.link')}
          class="inline-flex items-center border-b border-b-blue-500 text-blue-500"
        >
          Lausanne Transport Card
          <ChevronRight class="ml-1 inline h-4 w-4 stroke-3" />
        </a>
        <br />
        {$t('page.faq.travel.paragraph1.part2')}
      </Paragraph>
    {/snippet}
  </Shelf>

  <Shelf
    onToggle={() => toggleShelf(4)}
    isOpen={openShelfIndex === 4}
    class="dark:hover:bg-base-dark-hover border-b-4 border-gray-300"
    titleClass="min-h-14 pt-10 pb-8 px-4 rounded-md"
    childClass="px-4 pb-12"
  >
    {#snippet title()}
      <Heading tag="h3" class="mt-0 text-left text-xl font-semibold">
        {$t('page.faq.mention.title')}
      </Heading>
    {/snippet}

    {#snippet children()}
      <Paragraph>
        {$t('page.faq.mention.paragraph1')}
        <span class="font-bold">
          <Link
            withIcon={false}
            href="https://www.lausanne-tourisme.ch"
            class="m-0 inline-block p-0"
          >
            Lausanne Transport Card
            <ChevronRight class="ml-1 inline h-4 w-4 stroke-3" />
          </Link>
        </span>
      </Paragraph>

      <div class="overflow-x-auto bg-red-50 dark:text-black">
        <Paragraph class="px-4 font-bold dark:text-black">
          {$t('page.faq.mention.paragraph2.in-social-networks')}
        </Paragraph>

        <table class="table">
          <tbody>
            <tr class="h-auto border-gray-300 md:h-20">
              <td class="w-16 text-center">
                <div class="flex items-center gap-3">
                  <Link
                    withIcon={false}
                    href="https://www.instagram.com/thelausanner/"
                    class="ml-4"
                  >
                    <Instagram class="h-6 w-6" />
                  </Link>
                </div>
              </td>
              <td>
                {$t('page.faq.mention.paragraph2.instagram')}
              </td>
            </tr>
            <tr class="h-auto md:h-20">
              <td class="w-16 text-center">
                <div class="flex items-center gap-3">
                  <Link
                    withIcon={false}
                    href="https://www.linkedin.com/company/lausanne-capitale-olympique"
                    class="ml-4"
                  >
                    <LinkedIn class="h-6 w-6" />
                  </Link>
                </div>
              </td>
              <td>
                {$t('page.faq.mention.paragraph2.linkedIn')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-1 bg-red-50 p-4 pb-5 dark:text-black">
        <Paragraph class="font-bold  dark:text-black">
          {$t('page.faq.mention.paragraph3.find-us')}
        </Paragraph>
        <div class="inline-flex">
          <Link
            withIcon={false}
            href="https://www.facebook.com/LausanneCapitaleOlympique/"
            class="mr-6"
          >
            <Facebook class="h-5 w-5 md:h-7 md:w-7" />
          </Link>
          <Link withIcon={false} href="https://www.youtube.com/LausanneTourisme" class="mr-6">
            <Youtube class="h-6 w-6 md:h-8 md:w-8" />
          </Link>
        </div>
      </div>
    {/snippet}
  </Shelf>
</div>
