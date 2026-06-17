<script lang="ts">
  import { analytics } from '$lib/stores/analytics.svelte';
  import {
    calculateHourlyProductivity,
    getMostProductiveHour,
    formatHour
  } from '$lib/utils/analytics-utils';

  let hourlyData = $derived(calculateHourlyProductivity(analytics.sessions));
  let maxMinutes = $derived(Math.max(...hourlyData.map(h => h.totalMinutes), 1));
  let bestHour = $derived(getMostProductiveHour(hourlyData));
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-medium">Productive Hours</h3>
    <span class="text-sm text-muted-foreground">
      Best: <span class="font-medium text-primary">{formatHour(bestHour)}</span>
    </span>
  </div>

  <div class="flex items-end gap-1 h-20">
    {#each hourlyData as data (data.hour)}
      {@const height = (data.totalMinutes / maxMinutes) * 100}
      <div class="flex-1 flex flex-col items-center gap-1">
        <div
          class="w-full rounded-t transition-all hover:opacity-80 {data.hour === bestHour ? 'bg-primary' : 'bg-muted-foreground/30'}"
          style="height: {Math.max(2, height)}%"
          title="{formatHour(data.hour)}: {data.sessionCount} sessions, {data.totalMinutes} min"
        ></div>
      </div>
    {/each}
  </div>

  <div class="flex justify-between text-xs text-muted-foreground">
    <span>12 AM</span>
    <span>6 AM</span>
    <span>12 PM</span>
    <span>6 PM</span>
    <span>12 AM</span>
  </div>
</div>
