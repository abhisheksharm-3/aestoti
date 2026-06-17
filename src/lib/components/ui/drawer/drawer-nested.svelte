<script lang="ts">
  import { Drawer as DrawerPrimitive } from 'vaul-svelte';
  import type { Snippet } from 'svelte';

  let {
    children,
    ...restProps
  }: DrawerPrimitive.RootProps & { children?: Snippet } = $props();
</script>

<DrawerPrimitive.NestedRoot {...restProps}>
  {@render children?.()}
</DrawerPrimitive.NestedRoot>
