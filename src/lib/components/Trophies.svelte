<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import Card from './Card.svelte';
  import Clickable from './Clickable.svelte';
  import Container from './Container.svelte';
  import Heading from './Heading.svelte';
  import Paragraph from './Paragraph.svelte';
  import Swiper from './Swiper.svelte';

  export type Trophy = {
      name: string;
      content: string;
      image: string;
      link: string;
    }
  type Props = {
    values: Trophy[];
    class?: string;
  };

  const { class: additionalClass, values }: Props = $props();

  const style = twMerge('md:mx-auto gap-8 p-4', 'flex', additionalClass);
</script>

<Container width="large">
  <Swiper options={{ slidesToScroll: 1 }} containerClass={style}>
    {#each values as article, k}
      <Clickable overflow={true} href={article.link}>
        <Card
          src={article.image}
          alt={article.name}
          background="bg-glacier-300"
          class="carousel-item"
          nofx={true}
        >
          <Heading tag="h3" class="text-white text-shadow:_0_0_20px_var(--tw-shadow-color)] shadow-gray-950">
            {article.name}
          </Heading>
          <Paragraph
            class="text-shadow:_0_0_2px_var(--tw-shadow-color)] text-white shadow-gray-950"
          >
            {article.content}
          </Paragraph>
        </Card>
      </Clickable>
    {/each}
  </Swiper>
</Container>
