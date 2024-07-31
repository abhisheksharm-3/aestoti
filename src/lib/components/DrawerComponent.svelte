<script>
  import {
    RiBarChart2Line,
    RiKeyboardBoxFill,
    RiSettings3Fill,
  } from "svelte-remixicon";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Tabs from "$lib/components/ui/tabs";
  import Prefrences from "./Prefrences.svelte";
  import Shortcuts from "./Shortcuts.svelte";
  import PomodoroStats from "./PomodoroStats.svelte";
  const mockSessions = [
    { duration: 25, startTime: '2024-07-28T09:00:00Z' },
    { duration: 30, startTime: '2024-07-28T10:00:00Z' },
    { duration: 20, startTime: '2024-07-28T11:00:00Z' },
    { duration: 25, startTime: '2024-07-27T14:00:00Z' },
    { duration: 35, startTime: '2024-07-27T16:00:00Z' },
    { duration: 40, startTime: '2024-07-26T10:00:00Z' },
    { duration: 25, startTime: '2024-07-26T13:00:00Z' },
    { duration: 30, startTime: '2024-07-25T11:00:00Z' },
  ];
</script>

<Drawer.Content>
  <Drawer.Header>
    <Drawer.Title>Control Center</Drawer.Title>
    <Drawer.Description>Manage Your Pomodoro</Drawer.Description>
  </Drawer.Header>
  <Tabs.Root value="prefrences" class="flex items-center justify-center flex-col gap-10">
    <Tabs.List class=" w-max flex gap-6">
      <Tabs.Trigger class="flex items-center gap-2" value="stats"> <RiBarChart2Line /> Statistics</Tabs.Trigger>
      <Tabs.Trigger class="flex items-center gap-2" value="prefrences"><RiSettings3Fill /> Prefrences</Tabs.Trigger>
      <Tabs.Trigger class="flex items-center gap-2" value="shortcuts"><RiKeyboardBoxFill /> Shortcuts</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="stats">
      <PomodoroStats sessions={mockSessions} />
    </Tabs.Content>
    <Tabs.Content value="prefrences">
      <Prefrences />
    </Tabs.Content>
    <Tabs.Content value="shortcuts">
      <Shortcuts />
    </Tabs.Content>
  </Tabs.Root>
  <Drawer.Footer  class="flex items-center justify-self-center">
    <Drawer.Close class="border w-max px-4 py-2 rounded-3xl hover:bg-gray-400/10 ease-linear duration-300">Close</Drawer.Close>
  </Drawer.Footer>
</Drawer.Content>
