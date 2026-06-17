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

<div class={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...restProps}>
  {@render children?.()}
</div>
