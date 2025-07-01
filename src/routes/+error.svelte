<script lang="ts">
  import { page } from '$app/state';
  import { defaultLocale, locale, t } from '$lib/translations';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import Heading from '$lib/components/Heading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import { getRandomTheme, ThemeDetails } from '$lib/helpers/themes';
  import { ThemeKeys } from '$enums';

  const url = $locale ? `/${$locale}` : `/${defaultLocale}`;
  const status = $derived(page.status);

  const error = $derived.by(() => {
    if (status === 404) {
      return {
        title: $t('common.error.404.title'),
        subtitle: $t('common.error.404.subtitle'),
        description: $t('common.error.404.description'),
        buttonText: $t('common.error.404.button-text')
      };
    }
    return {
      title: $t('common.error.default.title'),
      subtitle: $t('common.error.default.subtitle'),
      description: $t('common.error.default.description'),
      buttonText: $t('common.error.default.button-text')
    };
  });
  const themeInformation = $derived.by(() => {
    const theme = getRandomTheme()
    return ThemeDetails[ThemeKeys[theme]];
  })
</script>

<Container width="medium" class="md:h-screen flex justify-center flex-col">
  <Heading tag="h1" class="uppercase md:pb-20">{error.title}</Heading>
  <div class="flex flex-col-reverse md:flex-row md:pb-40">
    <div class="w-full md:w-2/3">
      <Heading>
        {error.subtitle}
      </Heading>
      <Paragraph>
        {error.description }
      </Paragraph>

      <Button href="/{$locale}/" tag="a">
        {error.buttonText}
      </Button>
    </div>

    <div class="flex w-full md:w-1/3 justify-center items-center min-h-40">
        <Figure src={themeInformation.head} class="aspect-square max-h-40 md:max-h-64" ignoreAutoSize={true} transform={{height: 320, width: 320}} />
    </div>
  </div>
</Container>
