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
    <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Productive Hours</div>
    <span class="font-mono text-[10px] text-muted-foreground">
      Peak: <span class="text-primary">{formatHour(bestHour)}</span>
    </span>
  </div>

  <div class="flex h-20 items-end gap-px">
    {#each hourlyData as data (data.hour)}
      {@const height = (data.totalMinutes / maxMinutes) * 100}
      <div class="flex h-full flex-1 items-end">
        <div
          class="w-full rounded-sm transition-[height] {data.hour === bestHour && data.totalMinutes > 0
            ? 'bg-primary'
            : 'bg-muted'}"
          style="height: {data.totalMinutes > 0 ? Math.max(6, height) : 2}%"
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
