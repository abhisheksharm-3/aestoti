<script lang="ts">
  import { sessions } from '$lib/analytics';

  const WEEKS = 16; // Show last 16 weeks ~ 4 months
  
  $: dailyMap = buildDailyMap($sessions);
  $: weeks = buildWeeks(dailyMap);
  $: totalSessions = $sessions.filter(s => s.mode === 'focus').length;

  function buildDailyMap(sessionsList: typeof $sessions): Map<string, number> {
    const map = new Map<string, number>();
    sessionsList
      .filter(s => s.mode === 'focus')
      .forEach(s => {
        const date = s.startTime.split('T')[0];
        map.set(date, (map.get(date) || 0) + 1);
      });
    return map;
  }

  function buildWeeks(dailyMap: Map<string, number>): { date: string; count: number }[][] {
    const result: { date: string; count: number }[][] = [];
    // Align to start of last 16 weeks, ensuring we end on "today" or this week
    const today = new Date();
    // Find the Sunday of the current week (end point)
    const endOfWeek = new Date(today);
    // actually standard heatmap usually ends Today.
    // Let's go back WEEKS * 7 days
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (WEEKS * 7) + 1);
    
    // Adjust start date to previous Sunday to keep alignement? 
    // Actually lets just iterate weeks.
    
    for (let week = 0; week < WEEKS; week++) {
      const weekData: { date: string; count: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        const dateStr = date.toISOString().split('T')[0];
        weekData.push({ date: dateStr, count: dailyMap.get(dateStr) || 0 });
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
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
</script>

<div class="flex flex-col gap-4 p-4 rounded-xl border bg-card/50">
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <h3 class="text-sm font-medium leading-none">Focus Activity</h3>
      <p class="text-xs text-muted-foreground">{totalSessions} sessions recorded</p>
    </div>
  </div>
  
  <div class="flex gap-2">
    <!-- Day Labels Column -->
    <div class="flex flex-col gap-1 pt-0.5">
      {#each DAY_LABELS as label}
        <div class="h-3 text-[10px] text-muted-foreground leading-3 text-right w-6">{label}</div>
      {/each}
    </div>

    <!-- Heatmap Grid -->
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
