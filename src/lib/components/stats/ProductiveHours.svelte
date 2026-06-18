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

<div class="space-y-4">
  <div class="flex items-end justify-between">
    <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Productive Hours</div>
    <span class="font-mono text-[10px] text-muted-foreground">
      Peak: <span class="text-primary">{formatHour(bestHour)}</span>
    </span>
  </div>

  <div class="flex items-end gap-px h-20">
    {#each hourlyData as data (data.hour)}
      {@const height = (data.totalMinutes / maxMinutes) * 100}
      <div class="flex-1">
        <div
          class="w-full transition-opacity {data.hour === bestHour ? 'bg-primary' : 'bg-muted'}"
          style="height: {Math.max(2, height)}%"
          title="{formatHour(data.hour)}: {data.sessionCount} sessions, {data.totalMinutes} min"
        ></div>
      </div>
    {/each}
  </div>

  <div class="flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
    <span>12 AM</span>
    <span>6 AM</span>
    <span>12 PM</span>
    <span>6 PM</span>
    <span>12 AM</span>
  </div>
</div>
