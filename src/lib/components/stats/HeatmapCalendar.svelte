<script lang="ts">
  import { analytics } from '$lib/stores/analytics.svelte';
  import { dayKey } from '$lib/utils/date';

  const WEEKS = 18;
  // Monday-first rows; label every other row like GitHub.
  const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

  type Cell = { date: string; count: number; isToday: boolean; isFuture: boolean };

  let dailyMap = $derived(buildDailyMap(analytics.sessions));
  let columns = $derived(buildColumns(dailyMap));
  let monthLabels = $derived(buildMonthLabels(columns));
  let totalSessions = $derived([...dailyMap.values()].reduce((sum, c) => sum + c, 0));

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

  // Week-aligned grid (each column is a Mon–Sun calendar week) so weekday rows
  // and month labels are accurate; days after today render as blanks.
  function buildColumns(map: Map<string, number>): Cell[][] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayK = dayKey(today);
    const sinceMonday = (today.getDay() + 6) % 7;
    const firstMonday = new Date(today);
    firstMonday.setDate(today.getDate() - sinceMonday - (WEEKS - 1) * 7);

    const cols: Cell[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(firstMonday);
        date.setDate(firstMonday.getDate() + w * 7 + d);
        const k = dayKey(date);
        col.push({
          date: k,
          count: map.get(k) ?? 0,
          isToday: k === todayK,
          isFuture: date.getTime() > today.getTime()
        });
      }
      cols.push(col);
    }
    return cols;
  }

  // Label a column with its month abbreviation when the month changes.
  function buildMonthLabels(cols: Cell[][]): string[] {
    const labels: string[] = new Array(cols.length).fill('');
    let prevMonth = -1;
    cols.forEach((col, i) => {
      const d = new Date(`${col[0].date}T00:00:00`);
      const m = d.getMonth();
      if (m !== prevMonth) {
        labels[i] = d.toLocaleDateString('en-US', { month: 'short' });
        prevMonth = m;
      }
    });
    return labels;
  }

  // Empty days recede to faint scaffolding; activity climbs the accent.
  function getColor(count: number): string {
    if (count === 0) return 'bg-foreground/[0.06]';
    if (count === 1) return 'bg-primary/30';
    if (count <= 3) return 'bg-primary/55';
    if (count <= 5) return 'bg-primary/80';
    return 'bg-primary';
  }

  function formatDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
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

  <div class="overflow-x-auto pb-2">
    <div class="inline-flex flex-col gap-1.5">
      <!-- month labels, aligned over the week columns -->
      <div class="flex gap-2">
        <div class="w-8 shrink-0"></div>
        <div class="flex gap-1">
          {#each monthLabels as label, i (i)}
            <div class="w-4 shrink-0 whitespace-nowrap font-mono text-[9px] leading-none text-muted-foreground">
              {label}
            </div>
          {/each}
        </div>
      </div>

      <!-- weekday gutter + grid -->
      <div class="flex gap-2">
        <div class="flex w-8 shrink-0 flex-col gap-1">
          {#each DAY_LABELS as label, i (i)}
            <div class="h-4 text-right text-[9px] leading-4 text-muted-foreground">{label}</div>
          {/each}
        </div>

        <div class="flex gap-1">
          {#each columns as week, w (w)}
            <div class="flex shrink-0 flex-col gap-1">
              {#each week as day (day.date)}
                {#if day.isFuture}
                  <div class="size-4" aria-hidden="true"></div>
                {:else}
                  <div
                    class="size-4 rounded-[3px] transition-colors hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-foreground/30 {getColor(
                      day.count
                    )} {day.isToday ? 'ring-1 ring-inset ring-foreground/70' : ''}"
                    role="img"
                    title="{formatDate(day.date)}: {day.count} sessions"
                    aria-label="{formatDate(day.date)}: {day.count} focus session{day.count === 1 ? '' : 's'}"
                  ></div>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="flex items-center gap-2">
    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Less</span>
    <div class="flex gap-1">
      <div class="size-3 rounded-[3px] bg-foreground/[0.06]"></div>
      <div class="size-3 rounded-[3px] bg-primary/30"></div>
      <div class="size-3 rounded-[3px] bg-primary/55"></div>
      <div class="size-3 rounded-[3px] bg-primary/80"></div>
      <div class="size-3 rounded-[3px] bg-primary"></div>
    </div>
    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">More</span>
  </div>
</div>
