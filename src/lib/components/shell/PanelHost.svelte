<script lang="ts">
  import type { Component } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { ui } from '$lib/stores/ui.svelte';
  import type { PanelType } from '$lib/types';
  import { PANEL_META } from '$lib/config/panels';
  import { timer } from '$lib/stores/timer.svelte';
  import { MODE_CONFIG } from '$lib/config/modes';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { exportToCSV, exportToJSON, downloadFile } from '$lib/utils/export-utils';
  import { parseSessionsImport } from '$lib/utils/import-utils';
  import { toast } from 'svelte-sonner';
  import { X, ListTodo, ChartColumn, Volume2, Palette, Settings2, Play, Pause } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { trapFocus } from '$lib/actions/focus-trap';
  import TaskList from '../tasks/TaskList.svelte';
  import PomodoroStats from '../stats/PomodoroStats.svelte';
  import HeatmapCalendar from '../stats/HeatmapCalendar.svelte';
  import ProductiveHours from '../stats/ProductiveHours.svelte';
  import SoundSelector from '../settings/SoundSelector.svelte';
  import PresetSelector from '../settings/PresetSelector.svelte';
  import ThemePicker from '../settings/ThemePicker.svelte';
  import Preferences from '../settings/Preferences.svelte';
  import ShortcutEditor from '../settings/ShortcutEditor.svelte';

  const NAV: { id: PanelType; label: string; icon: Component }[] = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'stats', label: 'Insights', icon: ChartColumn },
    { id: 'sound', label: 'Sound', icon: Volume2 },
    { id: 'theme', label: 'Appearance', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings2 }
  ];

  let active = $derived(ui.activePanel);
  let meta = $derived(active ? PANEL_META[active] : null);

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && ui.activePanel) ui.closePanel();
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

  let fileInput = $state<HTMLInputElement>();
  async function importJSON(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const sessions = parseSessionsImport(await file.text());
      const added = analytics.importSessions(sessions);
      const skipped = sessions.length - added;
      toast.success(`Imported ${added} session${added === 1 ? '' : 's'}`, {
        description: skipped > 0 ? `${skipped} already present, skipped.` : undefined
      });
    } catch (e) {
      toast.error('Import failed', {
        description: e instanceof Error ? e.message : 'Could not read that file.'
      });
    } finally {
      input.value = ''; // let the same file be re-selected later
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if active}
  <div
    class="fixed inset-0 z-40 bg-background"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    aria-label="{meta?.title ?? 'Workspace'} panel"
    transition:fade={{ duration: 140 }}
    use:trapFocus
  >
    <div class="flex h-svh flex-col" in:fly={{ y: 14, duration: 260 }}>
      <!-- header: wordmark · live timer · close -->
      <header class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8">
        <span class="font-display text-2xl italic leading-none">aestoti<span class="text-primary">.</span></span>
        <div class="flex items-center gap-2">
          <button
            onclick={() => timer.toggle()}
            class="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:border-foreground/30"
            aria-label={timer.state.isRunning ? 'Pause timer' : 'Start timer'}
          >
            {#if timer.state.isRunning}
              <Pause class="size-3.5 text-primary" />
            {:else}
              <Play class="size-3.5 text-muted-foreground" />
            {/if}
            <span class="font-mono text-sm tabular-nums">{timer.formattedTime.minutes}:{timer.formattedTime.seconds}</span>
            <span class="hidden text-xs text-muted-foreground sm:inline">{MODE_CONFIG[timer.state.currentMode].title}</span>
          </button>
          <button
            onclick={() => ui.closePanel()}
            class="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to timer"
            title="Back to timer (Esc)"
          >
            <X class="size-4" />
          </button>
        </div>
      </header>

      <div class="flex min-h-0 flex-1">
        <!-- desktop nav -->
        <nav class="hidden w-56 shrink-0 flex-col gap-1 border-r border-border p-4 lg:flex">
          {#each NAV as item (item.id)}
            {@const Icon = item.icon}
            <button
              onclick={() => ui.openPanel(item.id)}
              class="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors {active === item.id
                ? 'bg-secondary font-medium text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}"
            >
              <Icon class="size-4 {active === item.id ? 'text-primary' : ''}" />
              {item.label}
            </button>
          {/each}
        </nav>

        <div class="flex min-h-0 min-w-0 flex-1 flex-col">
          <!-- mobile/tablet nav: even bottom-nav style, all five fit -->
          <div class="flex border-b border-border lg:hidden">
            {#each NAV as item (item.id)}
              {@const Icon = item.icon}
              <button
                onclick={() => ui.openPanel(item.id)}
                class="flex flex-1 flex-col items-center gap-1 border-b-2 py-2.5 text-[10px] font-medium transition-colors {active ===
                item.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'}"
              >
                <Icon class="size-4" />
                {item.label}
              </button>
            {/each}
          </div>

          <div class="hide-scrollbar flex-1 overflow-y-auto">
            <div class="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
              {#if meta}
                <header class="mb-9">
                  <div class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{meta.description}</div>
                  <h1 class="mt-1.5 font-display text-4xl italic leading-none">{meta.title}</h1>
                </header>
              {/if}

              {#if active === 'tasks'}
                <TaskList />
              {:else if active === 'stats'}
                <div class="space-y-10">
                  <PomodoroStats />
                  <HeatmapCalendar />
                  <ProductiveHours />
                  <div class="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
                    <input
                      bind:this={fileInput}
                      type="file"
                      accept="application/json,.json"
                      class="hidden"
                      onchange={importJSON}
                    />
                    <Button variant="outline" size="sm" onclick={() => fileInput?.click()}>Import JSON</Button>
                    <Button variant="outline" size="sm" onclick={exportCSV}>Export CSV</Button>
                    <Button variant="outline" size="sm" onclick={exportJSON}>Export JSON</Button>
                  </div>
                </div>
              {:else if active === 'sound'}
                <SoundSelector />
              {:else if active === 'theme'}
                <div class="space-y-10">
                  <PresetSelector />
                  <ThemePicker />
                </div>
              {:else if active === 'settings'}
                <div class="space-y-10">
                  <Preferences />
                  <ShortcutEditor />
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
