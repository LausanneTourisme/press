<script lang="ts">
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import {
    Forms,
    getValues,
    RouteTypes,
    SocialNetworks,
    SocialNetworksKeys,
    Titles,
    TravelReductions,
    type SocialNetwork,
    type TravelReduction
  } from '$enums';
  import { PUBLIC_BOTPOISON_PUBLICKEY } from '$env/static/public';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import { t } from '$lib/translations';
  import Botpoison from '@botpoison/browser';
  import { CircleMinus, CirclePlus, Trash2 } from 'lucide-svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { schema } from './schema';
  import { humanFileSize } from '$lib/helpers';
  import { dev } from '$app/environment';

  let isSubmitting = $state(false);
  const socialNetworksRequirements = getValues(SocialNetworks).filter(
    (x) => x !== SocialNetworks.Blog
  );
  const { form, errors, enhance, message, options, validateForm, constraints } = superForm(
    (page.data as PageData).form,
    {
      errorSelector: '[aria-invalid="true"],[data-invalid]',
      validators: zod4(schema),
      scrollToError: 'smooth',
      autoFocusOnError: 'detect',
      resetForm: false,
      applyAction: true,
      clearOnSubmit: 'none',
      onUpdate: async ({ form }) => {
        isSubmitting = false;
      },
      onSubmit: async ({ cancel, formData }) => {
        isSubmitting = true;

        // antibot
        const botpoison = new Botpoison({
          publicKey: PUBLIC_BOTPOISON_PUBLICKEY
        });
        const { solution } = await botpoison.challenge();
        formData.append('_botpoison', solution);

        const result = await validateForm({ update: true });

        if (!result.valid) {
          cancel();
          document.querySelector('body')?.scrollIntoView();
          isSubmitting = false;
          return;
        }

        document.querySelector('body')?.scrollIntoView();
      },
      onError: (error) => {
        console.error(
          `Please contact us and explain us how to get this error please. (error ${error.result.status})`
        );
        isSubmitting = false;
      }
    }
  );

  const hasArrayErrors = (fieldErrors: Record<string | number, unknown> | undefined): boolean => {
    if (!fieldErrors) return false;
    return Object.values(fieldErrors).some((v) => Array.isArray(v) && v.length > 0);
  };

  let scopeOfPostsInput: HTMLInputElement = $state()!;
  let interactionWithPostsInput: HTMLInputElement = $state()!;
  let averageStoryReachInput: HTMLInputElement = $state()!;
  let interactionWithStoriesInput: HTMLInputElement = $state()!;

  if (dev) {
    $effect(() => {
      console.log({ errors: $errors });
    });
  }
</script>

<Container width="small">
  <form method="POST" class="w-full" enctype="multipart/form-data" use:enhance>
    <Heading tag="h1" class="mt-6 mb-2 text-lg md:text-2xl">
      {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.title`)}
    </Heading>
    <section class="w-full">
      <fieldset class="fieldset bg-base-200/50 border-base-300 rounded-box border p-4">
        <!-- Social Network -->
        <div class="join join-vertical">
          <p class="label mb-1 text-wrap break-words">
            {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.social-networks.title`)}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          </p>

          {#each Object.values(SocialNetworks) as socialNetwork}
            <label
              class="label my-1 text-wrap break-words {$errors.socialNetworks?._errors
                ? 'text-error'
                : ''}"
            >
              <input
                type="checkbox"
                name="socialNetworks"
                value={socialNetwork}
                checked={($form.socialNetworks as SocialNetwork[]).includes(socialNetwork) ?? false}
                class="checkbox {$errors.socialNetworks?._errors ? 'border-error' : ''}"
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    $form.socialNetworks = [
                      ...($form.socialNetworks as SocialNetwork[]),
                      socialNetwork
                    ];
                  } else {
                    $form.socialNetworks = ($form.socialNetworks as SocialNetwork[]).filter(
                      (x: SocialNetwork) => x !== socialNetwork
                    );
                  }
                }}
              />
              {@html $t(
                `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.social-networks.${socialNetwork}`
              )}
            </label>
          {/each}
        </div>
      </fieldset>

      <fieldset
        class="fieldset bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        class:hidden={!$form.socialNetworks.length ||
          ($form.socialNetworks.length === 1 &&
            $form.socialNetworks?.includes(SocialNetworks.Blog))}
      >
        <!-- Username -->
        <label for="posts-section-username" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.username`)}
          {#if $form.socialNetworks?.some( (x: SocialNetwork) => (socialNetworksRequirements as string[]).includes(x) )}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          {/if}
        </label>
        <input
          type="text"
          id="posts-section-username"
          name="username"
          bind:value={$form.username}
          class="input w-full {$errors.username !== undefined ? 'input-error' : ''}"
          aria-invalid={$errors.username !== undefined ? 'true' : undefined}
        />
      </fieldset>

      <fieldset
        class="fieldset bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        class:hidden={!$form.socialNetworks.length}
      >
        <!-- Blog url -->
        <label
          for="posts-section-blog-post-url"
          class="label text-wrap break-words"
          class:hidden={!$form.socialNetworks?.includes(SocialNetworks.Blog)}
        >
          {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.blog-post-url`)}
          {#if $form.socialNetworks?.includes(SocialNetworks.Blog)}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          {/if}
        </label>
        <input
          type="url"
          id="posts-section-blog-post-url"
          name="blogPostURL"
          bind:value={$form.blogPostURL}
          placeholder="https://"
          class="input w-full {$errors.blogPostURL ? 'input-error' : ''}"
          class:hidden={!$form.socialNetworks?.includes(SocialNetworks.Blog)}
          aria-invalid={$errors.blogPostURL ? 'true' : undefined}
        />

        <label
          for="blogMonthlyUniqueVisitors"
          class:hidden={!$form.socialNetworks?.includes(SocialNetworks.Blog)}
          class="label text-wrap break-words"
        >
          {@html $t(
            `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.blog-monthly-unique-visitors`
          )}
          <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
        </label>
        <input
          type="number"
          id="blogMonthlyUniqueVisitors"
          name="blogMonthlyUniqueVisitors"
          bind:value={$form.blogMonthlyUniqueVisitors}
          aria-invalid={$errors.blogMonthlyUniqueVisitors ? 'true' : undefined}
          class="input w-full {$errors.blogMonthlyUniqueVisitors !== undefined
            ? 'input-error'
            : ''}"
          class:hidden={!$form.socialNetworks?.includes(SocialNetworks.Blog)}
        />

        <div
          class={$form.socialNetworks.length === 1 &&
          $form.socialNetworks.includes(SocialNetworks.Blog)
            ? 'hidden'
            : ''}
        >
          <!-- Number of posts -->
          <label for="posts-section-number-of-posts" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.number-of-posts`
            )}
            {#if $form.socialNetworks?.some( (x: SocialNetwork) => getValues(SocialNetworks).includes(x) )}
              <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
            {/if}
          </label>
          <input
            type="number"
            id="posts-section-number-of-posts"
            name="numberOfPosts"
            bind:value={$form.numberOfPosts}
            class="input w-full {$errors.numberOfPosts ? 'input-error' : ''}"
            aria-invalid={$errors.numberOfPosts ? 'true' : undefined}
          />

          <!-- Number of clicks -->
          <label for="posts-section-number-of-clicks" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.number-of-clicks`
            )}
          </label>
          <input
            type="number"
            id="posts-section-number-of-clicks"
            name="numberOfClicks"
            bind:value={$form.numberOfClicks}
            class="input w-full {$errors.numberOfClicks ? 'input-error' : ''}"
            aria-invalid={$errors.numberOfClicks ? 'true' : undefined}
          />

          <!-- Scope of posts -->
          <label for="posts-section-scope-of-posts" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.scope-of-posts`
            )}
            {#if $form.socialNetworks?.some( (x: SocialNetwork) => getValues(SocialNetworks).includes(x) )}
              <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
            {/if}
          </label>
          <p class={hasArrayErrors($errors.scopeOfPosts) ? 'text-brand-600' : ''}>
            {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.upload-files`)}
          </p>
          <input
            type="file"
            id="posts-section-scope-of-posts"
            name="scopeOfPosts"
            bind:this={scopeOfPostsInput}
            multiple
            accept="image/*"
            class="file-input w-full {hasArrayErrors($errors.scopeOfPosts)
              ? 'file-input-error'
              : ''}"
            onchange={(e) => {
              $form.scopeOfPosts = [
                ...($form.scopeOfPosts as File[]),
                ...Array.from(e.currentTarget.files ?? [])
              ];
            }}
            aria-invalid={hasArrayErrors($errors.scopeOfPosts) ? 'true' : undefined}
          />
          {#if $form.scopeOfPosts?.length}
            <ul class="mt-2 space-y-1">
              {#each $form.scopeOfPosts as File[] as file, index}
                <li class="flex flex-wrap items-center gap-x-2">
                  <Trash2
                    class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                    onclick={() => {
                      $form.scopeOfPosts = ($form.scopeOfPosts as File[]).filter(
                        (_, i) => i !== index
                      );
                      const dt = new DataTransfer();
                      ($form.scopeOfPosts as File[]).forEach((f) => dt.items.add(f));
                      scopeOfPostsInput.files = dt.files;
                    }}
                  />
                  <span class={$errors.scopeOfPosts?.[index]?.length ? 'text-error' : ''}
                    >{file.name} ({humanFileSize(file.size)})</span
                  >
                  {#if $errors.scopeOfPosts?.[index]?.length}
                    <span class="text-error text-sm">{$t($errors.scopeOfPosts[index][0])}</span>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}

          <!-- Interaction with posts -->
          <label for="posts-section-interaction-with-posts" class="label text-wrap break-words">
            {@html $t(
              `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.interaction-with-posts`
            )}
            {#if $form.socialNetworks?.some( (x: SocialNetwork) => getValues(SocialNetworks).includes(x) )}
              <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
            {/if}
          </label>
          <p class={hasArrayErrors($errors.interactionWithPosts) ? 'text-brand-600' : ''}>
            {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.upload-files`)}
          </p>
          <input
            type="file"
            id="posts-section-interaction-with-posts"
            name="interactionWithPosts"
            bind:this={interactionWithPostsInput}
            multiple
            accept="image/*"
            class="file-input w-full {hasArrayErrors($errors.interactionWithPosts)
              ? 'file-input-error'
              : ''}"
            onchange={(e) => {
              $form.interactionWithPosts = [
                ...($form.interactionWithPosts as File[]),
                ...Array.from(e.currentTarget.files ?? [])
              ];
            }}
            aria-invalid={hasArrayErrors($errors.interactionWithPosts) ? 'true' : undefined}
          />
          {#if $form.interactionWithPosts?.length}
            <ul class="mt-2 space-y-1">
              {#each $form.interactionWithPosts as File[] as file, index}
                <li class="flex flex-wrap items-center gap-x-2">
                  <Trash2
                    class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                    onclick={() => {
                      $form.interactionWithPosts = ($form.interactionWithPosts as File[]).filter(
                        (_, i) => i !== index
                      );
                      const dt = new DataTransfer();
                      ($form.interactionWithPosts as File[]).forEach((f) => dt.items.add(f));
                      interactionWithPostsInput.files = dt.files;
                    }}
                  />
                  <span class={$errors.interactionWithPosts?.[index]?.length ? 'text-error' : ''}
                    >{file.name} ({humanFileSize(file.size)})</span
                  >
                  {#if $errors.interactionWithPosts?.[index]?.length}
                    <span class="text-error text-sm"
                      >{$t($errors.interactionWithPosts[index][0])}</span
                    >
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </fieldset>

      <fieldset
        class="fieldset bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        class:hidden={!$form.socialNetworks.length ||
          ($form.socialNetworks.length === 1 && $form.socialNetworks.includes(SocialNetworks.Blog))}
      >
        <!-- Number of stories -->
        <label for="stories-section-number-of-stories" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.stories-section.number-of-stories`
          )}
          {#if $form.socialNetworks?.includes('instagram')}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          {/if}
        </label>
        <input
          type="number"
          id="stories-section-number-of-stories"
          name="numberOfStories"
          bind:value={$form.numberOfStories}
          class="input w-full {$errors.numberOfStories ? 'input-error' : ''}"
          aria-invalid={$errors.numberOfStories ? 'true' : undefined}
        />

        <!-- Average story reach -->
        <label for="stories-section-average-story-reach" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.stories-section.average-story-reach`
          )}
          {#if $form.socialNetworks?.includes('instagram')}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          {/if}
        </label>
        <p class={hasArrayErrors($errors.averageStoryReach) ? 'text-brand-600' : ''}>
          {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.upload-files`)}
        </p>
        <input
          type="file"
          id="stories-section-average-story-reach"
          name="averageStoryReach"
          bind:this={averageStoryReachInput}
          multiple
          accept="image/*"
          class="file-input w-full {hasArrayErrors($errors.averageStoryReach)
            ? 'file-input-error'
            : ''}"
          onchange={(e) => {
            $form.averageStoryReach = [
              ...($form.averageStoryReach as File[]),
              ...Array.from(e.currentTarget.files ?? [])
            ];
          }}
          aria-invalid={hasArrayErrors($errors.averageStoryReach) ? 'true' : undefined}
        />
        {#if $form.averageStoryReach?.length}
          <ul class="mt-2 space-y-1">
            {#each $form.averageStoryReach as File[] as file, index}
              <li class="flex flex-wrap items-center gap-x-2">
                <Trash2
                  class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                  onclick={() => {
                    $form.averageStoryReach = ($form.averageStoryReach as File[]).filter(
                      (_, i) => i !== index
                    );
                    const dt = new DataTransfer();
                    ($form.averageStoryReach as File[]).forEach((f) => dt.items.add(f));
                    averageStoryReachInput.files = dt.files;
                  }}
                />
                <span class={$errors.averageStoryReach?.[index]?.length ? 'text-error' : ''}
                  >{file.name} ({humanFileSize(file.size)})</span
                >
                {#if $errors.averageStoryReach?.[index]?.length}
                  <span class="text-error text-sm">{$t($errors.averageStoryReach[index][0])}</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}

        <!-- Interaction with stories -->
        <label for="stories-section-interaction-with-stories" class="label text-wrap break-words">
          {@html $t(
            `${RouteTypes.Forms}.${Forms.MediaCoverage}.form.stories-section.interaction-with-stories`
          )}
          {#if $form.socialNetworks?.includes('instagram')}
            <span class="text-brand-600 italic">{$t(`${RouteTypes.Forms}.required`)}</span>
          {/if}
        </label>
        <p class={hasArrayErrors($errors.interactionWithStories) ? 'text-brand-600' : ''}>
          {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.upload-files`)}
        </p>
        <input
          type="file"
          id="stories-section-interaction-with-stories"
          name="interactionWithStories"
          bind:this={interactionWithStoriesInput}
          multiple
          accept="image/*"
          class="file-input w-full {hasArrayErrors($errors.interactionWithStories)
            ? 'file-input-error'
            : ''}"
          onchange={(e) => {
            $form.interactionWithStories = [
              ...($form.interactionWithStories as File[]),
              ...Array.from(e.currentTarget.files ?? [])
            ];
          }}
          aria-invalid={hasArrayErrors($errors.interactionWithStories) ? 'true' : undefined}
        />
        {#if $form.interactionWithStories?.length}
          <ul class="mt-2 space-y-1">
            {#each $form.interactionWithStories as File[] as file, index}
              <li class="flex flex-wrap items-center gap-x-2">
                <Trash2
                  class="text-brand-600 mr-2 h-4 w-4 cursor-pointer"
                  onclick={() => {
                    $form.interactionWithStories = ($form.interactionWithStories as File[]).filter(
                      (_, i) => i !== index
                    );
                    const dt = new DataTransfer();
                    ($form.interactionWithStories as File[]).forEach((f) => dt.items.add(f));
                    interactionWithStoriesInput.files = dt.files;
                  }}
                />
                <span class={$errors.interactionWithStories?.[index]?.length ? 'text-error' : ''}
                  >{file.name} ({humanFileSize(file.size)})</span
                >
                {#if $errors.interactionWithStories?.[index]?.length}
                  <span class="text-error text-sm"
                    >{$t($errors.interactionWithStories[index][0])}</span
                  >
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </fieldset>

      <fieldset
        class="fieldset bg-base-200/50 border-base-300 rounded-box mt-6 border p-4"
        class:hidden={!$form.socialNetworks.length}
      >
        <!-- Remarks -->
        <label for="remarks" class="label text-wrap break-words">
          {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.remarks.title`)}
          {#if $constraints.remarks?.required}
            <span class="text-brand-600 italic">
              {@html $t(`${RouteTypes.Forms}.required`)}
            </span>
          {/if}
        </label>
        <p class="information">
          {@html $t(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.remarks.paragraph`)}
        </p>
        <textarea
          id="remarks"
          name="remarks"
          class="textarea w-full {$errors.remarks ? 'textarea-error' : ''}"
          bind:value={$form.remarks}
          maxlength={$constraints.remarks?.maxlength}
          aria-invalid={$errors.remarks ? 'true' : undefined}
        ></textarea>
      </fieldset>
    </section>

    <div class="mt-6 mb-2 flex flex-wrap">
      <button class="btn" disabled={isSubmitting}>
        <span class={isSubmitting ? '' : 'hidden'}>
          <Loading />
        </span>
        <span class={!isSubmitting ? '' : 'hidden'}>
          {$t(`${RouteTypes.Forms}.submit`)}
        </span>
      </button>
    </div>
  </form>
</Container>
