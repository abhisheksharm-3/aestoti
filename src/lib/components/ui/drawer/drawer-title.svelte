<script lang="ts">
  import { Drawer as DrawerPrimitive } from 'vaul-svelte';
  import { cn } from '$lib/utils/ui.js';
  import type { Snippet } from 'svelte';

  let {
    class: className,
    children,
    ...restProps
  }: DrawerPrimitive.TitleProps & { children?: Snippet } = $props();
</script>

<DrawerPrimitive.Title
  class={cn('text-lg font-semibold leading-none tracking-tight', className)}
  {...restProps}
>
  {@render children?.()}
</DrawerPrimitive.Title>
