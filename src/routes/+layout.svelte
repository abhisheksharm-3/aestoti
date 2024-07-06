<script>
	import DrawerComponent from './../components/DrawerComponent.svelte';
  import "../app.css";
  import {
    RiSettings3Fill,
  } from "svelte-remixicon";
  import * as Drawer from "$lib/components/ui/drawer";
  import Button from "$lib/components/ui/button/button.svelte";
</script>

<Drawer.Root>
  <div class="h-screen lg:px-10">
    <nav class="p-8 flex items-center justify-between">
      <img src="/logo.png" alt="logo" class="w-[60%] lg:w-[15%]" />
      <div
        class="flex items-center justify-self-center gap-3 text-2xl cursor-pointer hover:text-gray-400 duration-500 ease-linear  p-2 rounded-sm border"
      >
        <Drawer.Trigger><RiSettings3Fill /></Drawer.Trigger>
      </div>
    </nav>
  <DrawerComponent />
    <slot />
  </div>
</Drawer.Root>