<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/ui.js';
  import type { Snippet } from 'svelte';

  let {
    class: className,
    children,
    ...restProps
  }: TabsPrimitive.ListProps & { children?: Snippet } = $props();
</script>

<TabsPrimitive.List
  class={cn(
    'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</TabsPrimitive.List>
