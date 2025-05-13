<script lang="ts">
  import { Themes } from '$enums';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Blocks/Heading.svelte';
  import Paragraph from '$lib/components/Blocks/Paragraph.svelte';
  import { chunkify } from '$lib/helpers';
  import { t } from '$lib/translations';
  import Button from './Button.svelte';
  import ThemeCard from './ThemeCard.svelte';
  type Props = {
    class?: string;
    expanded?: boolean;
    title: string;
    paragraph: string;
    onShowMore?: () => void;
  };

  const {
    class: additionalClass,
    title,
    paragraph,
    onShowMore = () => {},
    expanded = false
  }: Props = $props();

  const chunks = chunkify(Object.values(Themes));
  let showMore: boolean = $state(expanded);

  const displayMore = () => {
    showMore = true;
    onShowMore();
  };
</script>

<div class="p-6 md:pt-16">
  <Heading class="text-center ">
    {title}
  </Heading>
  <Paragraph centered>
    {paragraph}
  </Paragraph>
</div>

<Container width="medium">
  {#each chunks as chunk, chunckIndex}
    {@const length = chunk.length}
    {#if chunckIndex === 0}
      <section class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:grid-rows-8">
        {#each chunk as theme, index}
          <ThemeCard {theme} gridIndex={index} inverted={!!(chunckIndex % 2)} />
        {/each}
      </section>
    {/if}

    {#if chunckIndex}
      <section
        class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:grid-rows-8 {!showMore
          ? 'hidden'
          : ''}"
      >
        {#each chunk as theme, index}
          <ThemeCard {theme} gridIndex={index} inverted={!!(chunckIndex % 2)} {length} />
        {/each}
      </section>
    {/if}
  {/each}
</Container>
<div class="mt-8 flex justify-center {showMore ? 'hidden' : ''}">
  <Button onclick={displayMore}>{$t(`common.btn.showMoreThemes`)}</Button>
</div>
