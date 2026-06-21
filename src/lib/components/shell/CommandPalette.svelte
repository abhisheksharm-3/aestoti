<script lang="ts">
  import * as Command from '$lib/components/ui/command';
  import { ui } from '$lib/stores/ui.svelte';
  import { timer } from '$lib/stores/timer.svelte';
  import { toggleMode } from 'mode-watcher';
  import {
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    Maximize2,
    ListTodo,
    ChartColumn,
    Volume2,
    Palette,
    Settings,
    SunMoon
  } from '@lucide/svelte';

  function run(fn: () => void): void {
    fn();
    ui.isCommandOpen = false;
  }
</script>

<Command.Dialog bind:open={ui.isCommandOpen}>
  <Command.Input placeholder="Type a command or search…" />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>

    <Command.Group heading="Timer">
      <Command.Item onSelect={() => run(() => timer.toggle())}>
        {#if timer.state.isRunning}
          <Pause class="mr-2 size-4" /> Pause timer
        {:else}
          <Play class="mr-2 size-4" /> Start timer
        {/if}
      </Command.Item>
      <Command.Item onSelect={() => run(() => timer.skip())}>
        <SkipForward class="mr-2 size-4" /> Skip to next mode
      </Command.Item>
      <Command.Item onSelect={() => run(() => timer.restart())}>
        <RotateCcw class="mr-2 size-4" /> Restart this mode
      </Command.Item>
      <Command.Item onSelect={() => run(() => (ui.isFullscreen = true))}>
        <Maximize2 class="mr-2 size-4" /> Enter fullscreen
      </Command.Item>
    </Command.Group>

    <Command.Group heading="Open">
      <Command.Item onSelect={() => ui.openPanel('tasks')}>
        <ListTodo class="mr-2 size-4" /> Tasks
      </Command.Item>
      <Command.Item onSelect={() => ui.openPanel('stats')}>
        <ChartColumn class="mr-2 size-4" /> Insights
      </Command.Item>
      <Command.Item onSelect={() => ui.openPanel('sound')}>
        <Volume2 class="mr-2 size-4" /> Sound
      </Command.Item>
      <Command.Item onSelect={() => ui.openPanel('theme')}>
        <Palette class="mr-2 size-4" /> Appearance
      </Command.Item>
      <Command.Item onSelect={() => ui.openPanel('settings')}>
        <Settings class="mr-2 size-4" /> Settings
      </Command.Item>
    </Command.Group>

    <Command.Group heading="General">
      <Command.Item onSelect={() => run(() => toggleMode())}>
        <SunMoon class="mr-2 size-4" /> Toggle light / dark
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Dialog>
