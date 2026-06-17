<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/ui.js';
  import type { Snippet } from 'svelte';

  let {
    class: className,
    value,
    children,
    ...restProps
  }: TabsPrimitive.ContentProps & { children?: Snippet } = $props();
</script>

<TabsPrimitive.Content
  class={cn(
    'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    className
  )}
  {value}
  {...restProps}
>
  {@render children?.()}
</TabsPrimitive.Content>
