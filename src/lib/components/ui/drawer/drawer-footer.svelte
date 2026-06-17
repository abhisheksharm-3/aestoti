<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils/ui.js';
  import type { Snippet } from 'svelte';

  let {
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
</script>

<div class={cn('mt-auto flex flex-col gap-2 p-4', className)} {...restProps}>
  {@render children?.()}
</div>
