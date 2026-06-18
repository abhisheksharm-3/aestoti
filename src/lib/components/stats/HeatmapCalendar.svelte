<script lang="ts">
  import { analytics } from '$lib/stores/analytics.svelte';
  import { dayKey } from '$lib/utils/date';

  const WEEKS = 16;
  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  let dailyMap = $derived(buildDailyMap(analytics.sessions));
  let weeks = $derived(buildWeeks(dailyMap));
  let totalSessions = $derived(analytics.sessions.filter(s => s.mode === 'focus').length);

  function buildDailyMap(sessionsList: typeof analytics.sessions): Map<string, number> {
    const map = new Map<string, number>();
    sessionsList
      .filter(s => s.mode === 'focus')
      .forEach(s => {
        const date = dayKey(s.startTime);
        map.set(date, (map.get(date) ?? 0) + 1);
      });
    return map;
  }

  function buildWeeks(map: Map<string, number>): { date: string; count: number }[][] {
    const result: { date: string; count: number }[][] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - WEEKS * 7 + 1);

    for (let week = 0; week < WEEKS; week++) {
      const weekData: { date: string; count: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = dayKey(date);
        weekData.push({ date: dateStr, count: map.get(dateStr) ?? 0 });
      }
      result.push(weekData);
    }
    return result;
  }

  function getColor(count: number): string {
    if (count === 0) return 'bg-secondary';
    if (count === 1) return 'bg-primary/15';
    if (count <= 3) return 'bg-primary/35';
    if (count <= 5) return 'bg-primary/60';
    return 'bg-primary';
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="space-y-4">
  <div>
    <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Focus Activity</div>
    <p class="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">{totalSessions} sessions recorded</p>
  </div>

  <div class="flex gap-2">
    <div class="flex flex-col gap-1 pt-0.5">
      {#each DAY_LABELS as label}
        <div class="h-3 text-[10px] text-muted-foreground leading-3 text-right w-6">{label}</div>
      {/each}
    </div>

    <div class="flex gap-1 flex-1 overflow-x-auto pb-2">
      {#each weeks as week}
        <div class="flex flex-col gap-1 min-w-[12px]">
          {#each week as day}
            <div
              class="w-3 h-3 {getColor(day.count)} transition-opacity"
              role="img"
              title="{formatDate(day.date)}: {day.count} sessions"
              aria-label="{formatDate(day.date)}: {day.count} focus session{day.count === 1 ? '' : 's'}"
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="flex items-center gap-2">
    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Less</span>
    <div class="flex gap-1">
      <div class="w-3 h-3 bg-secondary"></div>
      <div class="w-3 h-3 bg-primary/15"></div>
      <div class="w-3 h-3 bg-primary/35"></div>
      <div class="w-3 h-3 bg-primary/60"></div>
      <div class="w-3 h-3 bg-primary"></div>
    </div>
    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">More</span>
  </div>
</div>
