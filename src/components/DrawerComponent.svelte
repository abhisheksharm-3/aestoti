<script>
  import {
    RiBarChart2Line,
    RiKeyboardBoxFill,
    RiSettings3Fill,
  } from "svelte-remixicon";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Tabs from "$lib/components/ui/tabs";
  import ComingSoon from "./ComingSoon.svelte";
</script>

<Drawer.Content>
  <Drawer.Header>
    <Drawer.Title>Control Center</Drawer.Title>
    <Drawer.Description>Manage Your Pomodoro</Drawer.Description>
  </Drawer.Header>
  <Tabs.Root value="prefrences" class="flex items-center justify-center flex-col gap-10">
    <Tabs.List class=" w-max flex gap-6">
      <Tabs.Trigger value="stats"> <RiBarChart2Line /> Statistics</Tabs.Trigger>
      <Tabs.Trigger value="prefrences"><RiSettings3Fill /> Prefrences</Tabs.Trigger>
      <Tabs.Trigger value="shortcuts"><RiKeyboardBoxFill /> Shortcuts</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="stats">
      <ComingSoon />
    </Tabs.Content>
    <Tabs.Content value="prefrences">
      <ComingSoon />
    </Tabs.Content>
    <Tabs.Content value="shortcuts">
      <ComingSoon />
    </Tabs.Content>
  </Tabs.Root>
  <Drawer.Footer  class="flex items-center justify-self-center">
    <Drawer.Close class="border w-max px-4 py-2 rounded-3xl hover:bg-gray-400/10 ease-linear duration-300">Close</Drawer.Close>
  </Drawer.Footer>
</Drawer.Content>
