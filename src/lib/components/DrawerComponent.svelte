<script lang="ts">
  import {
    RiBarChart2Line,
    RiKeyboardBoxFill,
    RiSettings3Fill
  } from 'svelte-remixicon';
  import * as Drawer from '$lib/components/ui/drawer';
  import * as Tabs from '$lib/components/ui/tabs';
  import Preferences from './Preferences.svelte';
  import Shortcuts from './Shortcuts.svelte';
  import PomodoroStats from './PomodoroStats.svelte';
</script>

<Drawer.Content>
  <Drawer.Header>
    <Drawer.Title>Control Center</Drawer.Title>
    <Drawer.Description>Manage Your Pomodoro</Drawer.Description>
  </Drawer.Header>
  <Tabs.Root value="preferences" class="flex items-center justify-center flex-col gap-10">
    <Tabs.List class="w-max flex gap-6">
      <Tabs.Trigger class="flex items-center gap-2" value="stats">
        <RiBarChart2Line /> Statistics
      </Tabs.Trigger>
      <Tabs.Trigger class="flex items-center gap-2" value="preferences">
        <RiSettings3Fill /> Preferences
      </Tabs.Trigger>
      <Tabs.Trigger class="flex items-center gap-2" value="shortcuts">
        <RiKeyboardBoxFill /> Shortcuts
      </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="stats">
      <PomodoroStats />
    </Tabs.Content>
    <Tabs.Content value="preferences">
      <Preferences />
    </Tabs.Content>
    <Tabs.Content value="shortcuts">
      <Shortcuts />
    </Tabs.Content>
  </Tabs.Root>
  <Drawer.Footer class="flex items-center justify-self-center">
    <Drawer.Close class="border w-max px-4 py-2 rounded-3xl hover:bg-gray-400/10 ease-linear duration-300">
      Close
    </Drawer.Close>
  </Drawer.Footer>
</Drawer.Content>
