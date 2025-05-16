<script lang="ts">
  import { page } from '$app/state';
  import Anchor from '$lib/components/Anchor.svelte';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { locale, t } from '$lib/translations';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import Clickable from '$lib/components/Clickable.svelte';
  import Card from '$lib/components/Card.svelte';
  import { Cloudinary } from '$lib/cloudinary';
  import { DateTime } from 'luxon';

  const pageData = page.data as PageData;
  const events = pageData.events;
  const group = pageData.group;
  const news = pageData.news;
</script>

<Anchor name="news" />
<Container width="medium">
  <Heading tag="h1">
    {$t('page.news.title')}
  </Heading>
  <Paragraph>
    {$t('page.news.paragraph')}
  </Paragraph>
</Container>

<Container width="large">
  {#each news as n, k (`${n.published_at}-${n.name}`)}
    <Clickable overflow={true} href={n.link ?? '#'}>
      <Card
  src={Cloudinary.make(n.medias?.at(0)?.cloudinary_id ?? '').url({
          w: 500,
          h: 500,
          ar: '16:9',
          g: 'auto',
          c: 'fill'
        })}
        alt={n.medias?.at(0)?.public_name}
        background="bg-glacier-300"
        class="carousel-item"
        nofx={true}
      >
        <p>
          <small>
            {$t('common.published-at')}&nbsp;{DateTime.fromSeconds(Number(n.published_at))
              .setLocale($locale)
              .toFormat('dd/MM/yyyy')}
          </small>
        </p>
        <Heading tag="h3" class="text-white text-shadow:_0_0_20px_var(--tw-shadow-color)] shadow-gray-950">
          {n.name}
        </Heading>
        <Paragraph class="text-shadow:_0_0_2px_var(--tw-shadow-color)] text-white shadow-gray-950">
          {n.lead}
        </Paragraph>
      </Card>
    </Clickable>
  {/each}
</Container>
