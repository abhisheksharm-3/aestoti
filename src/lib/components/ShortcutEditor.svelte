<script lang="ts">
  import { shortcuts, SHORTCUT_LABELS } from '$lib/stores/shortcuts.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { ShortcutActionType } from '$lib/types';

  let recordingAction = $state<ShortcutActionType | null>(null);

  function handleStartRecording(action: ShortcutActionType): void {
    recordingAction = action;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!recordingAction) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      recordingAction = null;
      return;
    }

    shortcuts.updateShortcut(recordingAction, {
      key: event.key,
      hasAlt: event.altKey,
      hasCtrl: event.ctrlKey,
      hasShift: event.shiftKey
    });
    recordingAction = null;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-medium">Keyboard Shortcuts</h3>
    <Button variant="ghost" size="sm" onclick={() => shortcuts.reset()}>Reset</Button>
  </div>

  <div class="space-y-2">
    {#each shortcuts.current as shortcut (shortcut.action)}
      <div class="flex items-center justify-between p-2 rounded-lg bg-muted/50">
        <span class="text-sm">{SHORTCUT_LABELS[shortcut.action]}</span>
        <button
          onclick={() => handleStartRecording(shortcut.action)}
          class="px-3 py-1 text-xs font-mono rounded bg-background border min-w-20 text-center {recordingAction === shortcut.action ? 'animate-pulse border-primary' : ''}"
        >
          {recordingAction === shortcut.action ? 'Press key...' : shortcuts.format(shortcut)}
        </button>
      </div>
    {/each}
  </div>

  <p class="text-xs text-muted-foreground">Click a shortcut to reassign. Press Escape to cancel.</p>
</div>
