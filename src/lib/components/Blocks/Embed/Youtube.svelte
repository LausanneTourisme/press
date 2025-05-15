<script lang="ts">
  type HeadingProps = {
    class?: string;
    src: string;
  };
  const { class: additionalClass = '', src }: HeadingProps = $props();
  let youtubeUrl = $state(src.replace('watch?v=', 'embed/'));
</script>

<iframe src={youtubeUrl} title="YouTube video" class="aspect-video w-full"></iframe>
