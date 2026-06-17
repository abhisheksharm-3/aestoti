<script lang="ts">
  import {
    RiBarChart2Line,
    RiSettings3Fill,
    RiPaletteFill,
    RiListCheck,
    RiVolumeUpFill
  } from 'svelte-remixicon';
  import { Download } from 'lucide-svelte';
  import * as Drawer from '$lib/components/ui/drawer';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import Preferences from './Preferences.svelte';
  import PomodoroStats from './PomodoroStats.svelte';
  import TaskList from './TaskList.svelte';
  import HeatmapCalendar from './HeatmapCalendar.svelte';
  import ProductiveHours from './ProductiveHours.svelte';
  import SoundSelector from './SoundSelector.svelte';
  import PresetSelector from './PresetSelector.svelte';
  import ThemePicker from './ThemePicker.svelte';
  import ShortcutEditor from './ShortcutEditor.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { exportToCSV, exportToJSON, downloadFile } from '$lib/utils/export-utils';

  function handleExportCSV(): void {
    const csv = exportToCSV(analytics.sessions);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `aestoti-sessions-${date}.csv`, 'text/csv');
  }

  function handleExportJSON(): void {
    const json = exportToJSON(analytics.sessions);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `aestoti-sessions-${date}.json`, 'application/json');
  }
</script>

<Drawer.Content class="max-h-[90vh]">
  <Drawer.Header>
    <Drawer.Title>Control Center</Drawer.Title>
    <Drawer.Description>Manage Your Pomodoro</Drawer.Description>
  </Drawer.Header>

  <div class="overflow-y-auto max-h-[60vh] px-4">
    <Tabs.Root value="tasks" class="flex items-center justify-center flex-col gap-6">
      <Tabs.List class="w-max flex gap-4 flex-wrap justify-center">
        <Tabs.Trigger class="flex items-center gap-2" value="tasks">
          <RiListCheck /> Tasks
        </Tabs.Trigger>
        <Tabs.Trigger class="flex items-center gap-2" value="stats">
          <RiBarChart2Line /> Stats
        </Tabs.Trigger>
        <Tabs.Trigger class="flex items-center gap-2" value="sounds">
          <RiVolumeUpFill /> Sounds
        </Tabs.Trigger>
        <Tabs.Trigger class="flex items-center gap-2" value="customize">
          <RiPaletteFill /> Customize
        </Tabs.Trigger>
        <Tabs.Trigger class="flex items-center gap-2" value="settings">
          <RiSettings3Fill /> Settings
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="tasks" class="w-full">
        <TaskList />
      </Tabs.Content>

      <Tabs.Content value="stats" class="w-full space-y-6">
        <PomodoroStats />
        <HeatmapCalendar />
        <ProductiveHours />
        <div class="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onclick={handleExportCSV}>
            <Download class="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onclick={handleExportJSON}>
            <Download class="h-4 w-4 mr-2" /> Export JSON
          </Button>
        </div>
      </Tabs.Content>

      <Tabs.Content value="sounds" class="w-full">
        <SoundSelector />
      </Tabs.Content>

      <Tabs.Content value="customize" class="w-full space-y-6">
        <PresetSelector />
        <ThemePicker />
      </Tabs.Content>

      <Tabs.Content value="settings" class="w-full space-y-6">
        <Preferences />
        <ShortcutEditor />
      </Tabs.Content>
    </Tabs.Root>
  </div>

  <Drawer.Footer class="flex items-center justify-self-center">
    <Drawer.Close class="border w-max px-4 py-2 rounded-3xl hover:bg-gray-400/10 ease-linear duration-300">
      Close
    </Drawer.Close>
  </Drawer.Footer>
</Drawer.Content>
