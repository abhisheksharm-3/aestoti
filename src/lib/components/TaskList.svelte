<script lang="ts">
  import { Check, Trash2, Plus, Play } from 'lucide-svelte';
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

<div class="w-full max-w-md mx-auto space-y-4">
  <div class="flex gap-2">
    <Input
      type="text"
      placeholder="Add a new task..."
      bind:value={newTaskTitle}
      onkeydown={handleKeydown}
      class="flex-1"
    />
    <Button onclick={handleAddTask} size="icon" variant="outline">
      <Plus class="h-4 w-4" />
    </Button>
  </div>

  <div class="space-y-2 max-h-64 overflow-y-auto">
    {#each activeTasks as task (task.id)}
      <div
        class="flex items-center gap-3 p-3 rounded-lg transition-colors group {tasksStore.activeTaskId === task.id ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted/50 hover:bg-muted'}"
      >
        <button
          onclick={() => tasksStore.toggle(task.id)}
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-muted-foreground hover:border-green-500"
        ></button>
        <span class="flex-1 text-sm font-medium">{task.title}</span>
        {#if task.focusSessionsSpent > 0}
          <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            🍅 {task.focusSessionsSpent}
          </span>
        {/if}
        <button
          onclick={() => handleSetActive(task.id)}
          class="p-1.5 rounded transition-colors {tasksStore.activeTaskId === task.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100'}"
          title={tasksStore.activeTaskId === task.id ? 'Currently focusing on this' : 'Focus on this task'}
        >
          <Play class="h-3 w-3" />
        </button>
        <button
          onclick={() => tasksStore.remove(task.id)}
          class="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    {:else}
      <p class="text-center text-muted-foreground text-sm py-4">No active tasks. Add one above!</p>
    {/each}
  </div>

  {#if completedTasks.length > 0}
    <details class="group">
      <summary class="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
        Completed ({completedTasks.length})
      </summary>
      <div class="mt-2 space-y-2">
        {#each completedTasks as task (task.id)}
          <div class="flex items-center gap-3 p-2 rounded-lg opacity-50">
            <button
              onclick={() => tasksStore.toggle(task.id)}
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
          onclick={() => tasksStore.clearCompleted()}
        >
          Clear completed
        </Button>
      </div>
    </details>
  {/if}
</div>
