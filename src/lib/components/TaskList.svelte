<script lang="ts">
  import { Check, Trash2, Plus, Play } from 'lucide-svelte';
  import { tasks, activeTaskId } from '$lib/tasks';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Input } from '$lib/components/ui/input';

  let newTaskTitle = '';

  function handleAddTask(): void {
    if (newTaskTitle.trim()) {
      tasks.add(newTaskTitle.trim());
      newTaskTitle = '';
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  }

  function handleSetActive(taskId: string): void {
    activeTaskId.set(taskId === $activeTaskId ? null : taskId);
  }
</script>

<div class="w-full max-w-md mx-auto space-y-4">
  <div class="flex gap-2">
    <Input
      type="text"
      placeholder="Add a new task..."
      bind:value={newTaskTitle}
      on:keydown={handleKeydown}
      class="flex-1"
    />
    <Button on:click={handleAddTask} size="icon" variant="outline">
      <Plus class="h-4 w-4" />
    </Button>
  </div>

  <div class="space-y-2 max-h-64 overflow-y-auto">
    {#each $tasks.filter(t => !t.isCompleted) as task (task.id)}
      <div
        class="flex items-center gap-3 p-3 rounded-lg transition-colors group {$activeTaskId === task.id ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted/50 hover:bg-muted'}"
      >
        <button
          on:click={() => tasks.toggle(task.id)}
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-muted-foreground hover:border-green-500"
        >
        </button>
        <span class="flex-1 text-sm font-medium">
          {task.title}
        </span>
        {#if task.focusSessionsSpent > 0}
          <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            🍅 {task.focusSessionsSpent}
          </span>
        {/if}
        <button
          on:click={() => handleSetActive(task.id)}
          class="p-1.5 rounded transition-colors {$activeTaskId === task.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100'}"
          title={$activeTaskId === task.id ? 'Currently focusing on this' : 'Focus on this task'}
        >
          <Play class="h-3 w-3" />
        </button>
        <button
          on:click={() => tasks.remove(task.id)}
          class="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    {:else}
      <p class="text-center text-muted-foreground text-sm py-4">
        No active tasks. Add one above!
      </p>
    {/each}
  </div>

  <!-- Completed section -->
  {#if $tasks.some(t => t.isCompleted)}
    <details class="group">
      <summary class="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
        Completed ({$tasks.filter(t => t.isCompleted).length})
      </summary>
      <div class="mt-2 space-y-2">
        {#each $tasks.filter(t => t.isCompleted) as task (task.id)}
          <div class="flex items-center gap-3 p-2 rounded-lg opacity-50">
            <button
              on:click={() => tasks.toggle(task.id)}
              class="w-5 h-5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center"
            >
              <Check class="h-3 w-3 text-white" />
            </button>
            <span class="flex-1 text-sm line-through">{task.title}</span>
            {#if task.focusSessionsSpent > 0}
              <span class="text-xs">🍅 {task.focusSessionsSpent}</span>
            {/if}
          </div>
        {/each}
        <Button
          variant="ghost"
          size="sm"
          class="w-full text-muted-foreground"
          on:click={() => tasks.clearCompleted()}
        >
          Clear completed
        </Button>
      </div>
    </details>
  {/if}
</div>
