<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { ui, PANEL_META } from '$lib/stores/ui.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Download } from '@lucide/svelte';
  import TaskList from './TaskList.svelte';
  import PomodoroStats from './PomodoroStats.svelte';
  import HeatmapCalendar from './HeatmapCalendar.svelte';
  import ProductiveHours from './ProductiveHours.svelte';
  import SoundSelector from './SoundSelector.svelte';
  import PresetSelector from './PresetSelector.svelte';
  import ThemePicker from './ThemePicker.svelte';
  import Preferences from './Preferences.svelte';
  import ShortcutEditor from './ShortcutEditor.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { exportToCSV, exportToJSON, downloadFile } from '$lib/utils/export-utils';

  let meta = $derived(ui.activePanel ? PANEL_META[ui.activePanel] : null);
  let wide = $derived(ui.activePanel === 'stats');

  function handleOpenChange(open: boolean): void {
    if (!open) ui.closePanel();
  }

  function stamp(): string {
    return new Date().toISOString().split('T')[0];
  }
  function exportCSV(): void {
    downloadFile(exportToCSV(analytics.sessions), `aestoti-sessions-${stamp()}.csv`, 'text/csv');
  }
  function exportJSON(): void {
    downloadFile(exportToJSON(analytics.sessions), `aestoti-sessions-${stamp()}.json`, 'application/json');
  }
</script>

<Sheet.Root open={ui.activePanel !== null} onOpenChange={handleOpenChange}>
  <Sheet.Content
    side="right"
    class="flex w-full flex-col gap-0 p-0 {wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}"
  >
    {#if meta}
      <Sheet.Header class="border-b border-border px-6 py-5">
        <Sheet.Title class="font-display text-3xl italic leading-none">{meta.title}</Sheet.Title>
        <Sheet.Description>{meta.description}</Sheet.Description>
      </Sheet.Header>
    {/if}

    <div class="hide-scrollbar flex-1 overflow-y-auto px-6 py-6">
      {#if ui.activePanel === 'tasks'}
        <TaskList />
      {:else if ui.activePanel === 'stats'}
        <div class="space-y-6">
          <PomodoroStats />
          <HeatmapCalendar />
          <ProductiveHours />
          <div class="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onclick={exportCSV}>
              <Download class="mr-2 size-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onclick={exportJSON}>
              <Download class="mr-2 size-4" /> Export JSON
            </Button>
          </div>
        </div>
      {:else if ui.activePanel === 'sound'}
        <SoundSelector />
      {:else if ui.activePanel === 'theme'}
        <div class="space-y-8">
          <PresetSelector />
          <ThemePicker />
        </div>
      {:else if ui.activePanel === 'settings'}
        <div class="space-y-8">
          <Preferences />
          <ShortcutEditor />
        </div>
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>
