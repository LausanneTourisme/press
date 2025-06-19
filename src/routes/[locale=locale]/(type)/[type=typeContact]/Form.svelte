<script lang="ts">
  import { dev } from '$app/environment';
  import { applyAction, enhance } from '$app/forms';
  import { PUBLIC_BOTPOISON_PUBLICKEY } from '$env/static/public';
  import { t } from '$lib/translations';
  import Botpoison from '@botpoison/browser';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Send } from 'lucide-svelte';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import Container from '$lib/components/Container.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import Button from '$lib/components/Button.svelte';

  import { page } from '$app/state';
  import type { ActionData } from './$types';

  const pageForm = $derived(page.form as ActionData);
  type Success = Record<string, unknown> | undefined;
  type Failure = Record<string, unknown> | undefined;

  type Props = {
    class?: string;
    method?: 'dialog' | 'get' | 'post' | 'DIALOG' | 'GET' | 'POST' | undefined | null;
    action: string;
    validation?: (formData: FormData) => { status: 'success' | 'failed'; message?: string };
    onSubmit?: () => void;
    onSuccess?: () => void;
    onFailure?: () => void;
    children: Snippet<[{ isLoading: boolean }]>;
  };

  const {
    class: additionalClass,
    method = 'POST',
    action,
    validation,
    onSubmit,
    onSuccess,
    onFailure,
    children
  }: Props = $props();
  let incorrectData = $state(false);
  let sendWithSuccess = $state(false);
  let botpoison: undefined | Botpoison = $state(undefined);
  let isLoading = $state(false);
  let failedMessage: undefined | string = $state();

  const submit: SubmitFunction<Success, Failure> = async ({
    formElement,
    formData,
    action,
    cancel
  }) => {
    isLoading = true;

    if (!botpoison) {
      cancel();
      isLoading = false;
      return;
    }

    try {
      const { solution } = await botpoison.challenge();
      formData.append('_botpoison', solution);
      const validationState = validation?.(formData);
      if (validationState?.status === 'failed') {
        incorrectData = true;
        failedMessage = validationState?.message;
        isLoading = false;
        onFailure?.();
        cancel();
        return;
      }
      incorrectData = false;
      onSubmit?.();
    } catch (error) {
      if (dev) {
        console.error(error);
      }

      cancel();
    } 

    return async ({ result }) => {
      console.log({ result });
      if (result.type === 'success') {
        onSuccess?.();
        incorrectData = false;
        sendWithSuccess = true;
      } else if (result.type === 'error' || result.type === 'failure') {
        onFailure?.();
        incorrectData = true;
        sendWithSuccess = false;
      }

      await applyAction(result);
      isLoading = false;
    };
  };

  onMount(() => {
    botpoison = new Botpoison({
      publicKey: PUBLIC_BOTPOISON_PUBLICKEY
    });
  });
</script>

<!-- SUCCESS -->
<Container width="medium" class={sendWithSuccess ? '' : 'hidden'}>
  <div class="flex flex-col items-center justify-center rounded p-4">
    <p
      class="bg-apple-300 text-apple-950 mb-4 inline-flex w-full justify-center rounded p-6 text-xl font-semibold"
    >
      <Send class="mr-2 h-6 w-6 rotate-45" />
      {$t('page.form.confirmation-section.success.title')}
    </p>
    {$t('page.form.confirmation-section.success.message')}
  </div>
</Container>
<!-- FAIL -->
<Container width="medium" class={incorrectData && !sendWithSuccess ? '' : 'hidden'}>
  <div class="rounded bg-red-300 p-4">
    <p class="text-xl font-semibold text-red-950">
      {$t('page.form.confirmation-section.invalid.title')}
    </p>
  </div>
</Container>

<form {action} {method} use:enhance={submit} class={additionalClass}>
  {@render children({ isLoading })}
  <div class="flex w-full justify-center">
    <Button
      type="submit"
      class="btn group flex items-center rounded border-gray-700 bg-gray-200 text-gray-800"
      disabled={isLoading}
    >
      <span
        class={twMerge(
          !isLoading ? '' : 'hidden',
          'h-4 w-4 transition-transform group-hover:rotate-45'
        )}
      >
        <Send class="h-4 w-4" />
      </span>
      <span class={twMerge(isLoading ? '' : 'hidden')}>
        <Loading />
      </span>

      {$t('page.form.mail-section.form.send')}
    </Button>
  </div>
</form>
