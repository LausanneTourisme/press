<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import Card from './Card.svelte';
  import Clickable from './Clickable.svelte';
  import Container from './Container.svelte';
  import Heading from './Heading.svelte';
  import Paragraph from './Paragraph.svelte';
  import { Swiper, Slide } from './swiper';

  export type Trophy = {
    name: string;
    content: string;
    image: string;
    link: string;
  };
  type Props = {
    values: Trophy[];
    isMobile?: boolean;
    class?: string;
  };

  const { class: additionalClass, isMobile = false, values }: Props = $props();

  const style = twMerge('md:mx-auto gap-8 p-4', 'flex', additionalClass);
</script>

<Swiper>
  {#each values as article, k}
    <Slide>
      <Clickable href={article.link}>
        <Card src={article.image} alt={article.name} background="bg-glacier-300" nofx={true}>
          <Heading
            tag="h3"
            class="text-shadow:_0_0_20px_var(--tw-shadow-color)] text-white shadow-gray-950"
          >
            {article.name}
          </Heading>
          <Paragraph
            class="text-shadow:_0_0_2px_var(--tw-shadow-color)] line-clamp-none text-white shadow-gray-950"
          >
            {article.content}
          </Paragraph>
        </Card>
      </Clickable>
    </Slide>
  {/each}
</Swiper>
