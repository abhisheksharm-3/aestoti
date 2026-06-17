<script lang="ts">
  import { goals, computeDailyProgress } from '$lib/stores/goals.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { Target, ChevronUp, ChevronDown } from 'lucide-svelte';

  let dailyProgress = $derived(computeDailyProgress(analytics.sessions, goals.current));
  let progressColor = $derived(dailyProgress.isGoalMet ? 'bg-green-500' : 'bg-red-500');

  function handleIncrementGoal(): void {
    goals.setTarget(dailyProgress.target + 1);
  }

  function handleDecrementGoal(): void {
    if (dailyProgress.target > 1) goals.setTarget(dailyProgress.target - 1);
  }
</script>

<div class="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-muted">
  <Target class="h-4 w-4 text-muted-foreground" />
  <span class="text-sm font-medium text-muted-foreground">Daily Goal</span>

  <div class="flex items-center gap-1">
    <span class="text-sm font-bold">{dailyProgress.completed}</span>
    <span class="text-sm text-muted-foreground">/</span>
    <span class="text-sm font-medium">{dailyProgress.target}</span>
    <span class="text-xs text-muted-foreground">sessions</span>
  </div>

  <div class="flex items-center gap-0.5 ml-1">
    <button
      onclick={handleDecrementGoal}
      class="p-0.5 rounded hover:bg-muted transition-colors"
      title="Decrease goal"
    >
      <ChevronDown class="h-3 w-3" />
    </button>
    <button
      onclick={handleIncrementGoal}
      class="p-0.5 rounded hover:bg-muted transition-colors"
      title="Increase goal"
    >
      <ChevronUp class="h-3 w-3" />
    </button>
  </div>

  <div class="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
    <div
      class="h-full transition-all duration-300 rounded-full {progressColor}"
      style="width: {dailyProgress.percentage}%"
    ></div>
  </div>

  {#if dailyProgress.isGoalMet}
    <span class="text-sm">🎉</span>
  {:else}
    <span class="text-xs text-muted-foreground">{dailyProgress.percentage}%</span>
  {/if}
</div>
