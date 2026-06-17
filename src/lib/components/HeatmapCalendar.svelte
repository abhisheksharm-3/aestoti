<script lang="ts">
  import { analytics } from '$lib/stores/analytics.svelte';

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
        const date = s.startTime.split('T')[0];
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
        const dateStr = date.toISOString().split('T')[0];
        weekData.push({ date: dateStr, count: map.get(dateStr) ?? 0 });
      }
      result.push(weekData);
    }
    return result;
  }

  function getColor(count: number): string {
    if (count === 0) return 'bg-muted/80';
    if (count === 1) return 'bg-emerald-400/50 dark:bg-emerald-900/50';
    if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="flex flex-col gap-4 p-4 rounded-xl border bg-card/50">
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <h3 class="text-sm font-medium leading-none">Focus Activity</h3>
      <p class="text-xs text-muted-foreground">{totalSessions} sessions recorded</p>
    </div>
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
              class="w-3 h-3 rounded-[2px] {getColor(day.count)} transition-all hover:scale-125 hover:ring-2 hover:ring-background hover:shadow-sm"
              title="{formatDate(day.date)}: {day.count} sessions"
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="flex items-center gap-2 text-xs text-muted-foreground">
    <span>Less</span>
    <div class="flex gap-1">
      <div class="w-3 h-3 rounded-[2px] bg-muted/80"></div>
      <div class="w-3 h-3 rounded-[2px] bg-emerald-400/50 dark:bg-emerald-900/50"></div>
      <div class="w-3 h-3 rounded-[2px] bg-emerald-400 dark:bg-emerald-700"></div>
      <div class="w-3 h-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-600"></div>
      <div class="w-3 h-3 rounded-[2px] bg-emerald-600 dark:bg-emerald-500"></div>
    </div>
    <span>More</span>
  </div>
</div>
