<script lang="ts">
  import { Check, Trash2, Plus, Play } from '@lucide/svelte';
  import { tasksStore } from '$lib/stores/tasks.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  let newTaskTitle = $state('');

  function handleAddTask(): void {
    if (newTaskTitle.trim()) {
      tasksStore.add(newTaskTitle.trim());
      newTaskTitle = '';
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') handleAddTask();
  }

  function handleSetActive(taskId: string): void {
    tasksStore.activeTaskId = tasksStore.activeTaskId === taskId ? null : taskId;
  }

  let activeTasks = $derived(tasksStore.tasks.filter(t => !t.isCompleted));
  let completedTasks = $derived(tasksStore.tasks.filter(t => t.isCompleted));
</script>

<div class="w-full space-y-6">
  <div class="flex gap-2">
    <Input
      type="text"
      placeholder="Add a new task..."
      bind:value={newTaskTitle}
      onkeydown={handleKeydown}
      class="flex-1"
    />
    <button
      onclick={handleAddTask}
      aria-label="Add task"
      class="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      <Plus class="h-4 w-4" />
    </button>
  </div>

  <div class="divide-y divide-border">
    {#each activeTasks as task (task.id)}
      <div class="flex items-center gap-3 py-3 group">
        <button
          onclick={() => tasksStore.toggle(task.id)}
          aria-label="Mark task complete"
          class="h-4 w-4 shrink-0 rounded-sm border transition-colors {tasksStore.activeTaskId === task.id ? 'border-primary' : 'border-border hover:border-foreground/30'}"
        ></button>
        {#if tasksStore.activeTaskId === task.id}
          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
        {/if}
        <span class="flex-1 text-sm {tasksStore.activeTaskId === task.id ? 'font-medium text-primary' : 'text-foreground'}">{task.title}</span>
        {#if task.focusSessionsSpent > 0}
          <span class="text-xs tabular-nums text-muted-foreground">🍅 {task.focusSessionsSpent}</span>
        {/if}
        <button
          onclick={() => handleSetActive(task.id)}
          aria-label={tasksStore.activeTaskId === task.id ? 'Currently focusing on this' : 'Focus on this task'}
          class="p-1 transition-colors {tasksStore.activeTaskId === task.id ? 'text-primary' : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground'}"
        >
          <Play class="h-3 w-3" />
        </button>
        <button
          onclick={() => tasksStore.remove(task.id)}
          aria-label="Remove task"
          class="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity hover:text-foreground"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    {:else}
      <p class="py-4 text-sm text-muted-foreground">No active tasks. Add one above.</p>
    {/each}
  </div>

  {#if completedTasks.length > 0}
    <details>
      <summary class="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
        Completed ({completedTasks.length})
      </summary>
      <div class="mt-3 divide-y divide-border">
        {#each completedTasks as task (task.id)}
          <div class="flex items-center gap-3 py-3 opacity-50">
            <button
              onclick={() => tasksStore.toggle(task.id)}
              aria-label="Mark task incomplete"
              class="h-4 w-4 shrink-0 rounded-sm border border-border bg-secondary flex items-center justify-center"
            >
              <Check class="h-2.5 w-2.5 text-foreground" />
            </button>
            <span class="flex-1 text-sm line-through text-muted-foreground">{task.title}</span>
            {#if task.focusSessionsSpent > 0}
              <span class="text-xs tabular-nums text-muted-foreground">🍅 {task.focusSessionsSpent}</span>
            {/if}
          </div>
        {/each}
        <Button
          variant="ghost"
          size="sm"
          class="mt-2 w-full text-muted-foreground"
          onclick={() => tasksStore.clearCompleted()}
        >
          Clear completed
        </Button>
      </div>
    </details>
  {/if}
</div>
