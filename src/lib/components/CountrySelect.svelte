<script lang="ts">
  interface Props {
    id: string;
    value: string | undefined;
    countries: [string, string][];
    placeholder: string;
    error?: boolean;
    'aria-invalid'?: 'true' | undefined;
  }

  let {
    id,
    value = $bindable(),
    countries,
    placeholder,
    error = false,
    'aria-invalid': ariaInvalid
  }: Props = $props();

  let query = $state('');
  let open = $state(false);
  let highlightedIndex = $state(-1);
  let listEl = $state<HTMLUListElement>();

  const displayValue = $derived(value ? (countries.find(([c]) => c === value)?.[1] ?? '') : '');
  const filtered = $derived(
    query
      ? countries.filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()))
      : countries
  );

  $effect(() => {
    if (!open) {
      query = displayValue;
      highlightedIndex = -1;
    }
  });

  function select(code: string) {
    value = code;
    open = false;
  }

  function onInput(e: Event) {
    query = (e.currentTarget as HTMLInputElement).value;
    open = true;
    highlightedIndex = -1;
    if (!query) value = undefined;
  }

  // Catches password manager autofill (fires change, not input)
  function onChange(e: Event) {
    const filled = (e.currentTarget as HTMLInputElement).value;
    query = filled;
    const match = countries.find(([, name]) => name.toLowerCase() === filled.toLowerCase());
    value = match ? match[0] : undefined;
    open = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, filtered.length - 1);
      scrollToHighlighted();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
      scrollToHighlighted();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        select(filtered[highlightedIndex][0]);
      }
    } else if (e.key === 'Escape') {
      open = false;
    }
  }

  const scrollToHighlighted = () => {
    const item = listEl?.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  };

  const onFocus = (e: FocusEvent) => {
    open = true;
    (e.currentTarget as HTMLInputElement).select();
  };

  const onBlur = () => {
    setTimeout(() => {
      open = false;
      query = displayValue;
    }, 150);
  };
</script>

<div class="relative w-full">
  <input
    {id}
    type="text"
    class="input w-full {error ? 'input-error' : ''}"
    value={query}
    {placeholder}
    aria-invalid={ariaInvalid}
    autocomplete="country-name"
    oninput={onInput}
    onchange={onChange}
    onkeydown={onKeydown}
    onfocus={onFocus}
    onblur={onBlur}
  />
  {#if open}
    <ul
      bind:this={listEl}
      class="rounded-box border-base-300 bg-base-100 absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border shadow-lg"
    >
      {#each filtered as [code, name], i (`${code}-${name}`)}
        <li>
          <button
            type="button"
            class="hover:bg-base-200 w-full px-4 py-2 text-left {value === code ||
            i === highlightedIndex
              ? 'bg-base-200 font-medium'
              : ''}"
            onmousedown={() => select(code)}
          >
            {name}
          </button>
        </li>
      {/each}
      {#if filtered.length === 0}
        <li class="text-base-content/50 px-4 py-2">{query}</li>
      {/if}
    </ul>
  {/if}
</div>
