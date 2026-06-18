<script lang="ts">
  import StatCard from './StatCard.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { formatDuration } from '$lib/utils/format';
</script>

<div class="space-y-8">
  <!-- prominent 7-day score -->
  <div>
    <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">7-DAY SCORE</div>
    <div class="mt-3 text-5xl font-semibold tabular-nums text-primary">{analytics.weeklyFocusScore}</div>
    <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Stored locally on this device.</p>
  </div>

  <!-- stat grid -->
  <div class="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
    <StatCard title="Total Sessions" value={analytics.summary.totalSessions.toString()} />
    <StatCard title="Total Focus Time" value={formatDuration(analytics.summary.totalFocusMinutes)} />
    <StatCard title="Average Session" value={formatDuration(analytics.summary.averageSessionMinutes)} />
    <StatCard title="Longest Session" value={formatDuration(analytics.summary.longestSessionMinutes)} />
    <StatCard title="Sessions Today" value={analytics.summary.sessionsToday.toString()} />
    <StatCard title="Current Streak" value={`${analytics.summary.currentStreak} days`} />
  </div>

  <!-- secondary stats row -->
  <div class="border-t border-border/70 pt-6 flex flex-wrap gap-x-12 gap-y-4">
    <StatCard title="Sessions This Week" value={analytics.summary.sessionsThisWeek.toString()} />
    <StatCard title="Total Days Tracked" value={analytics.summary.totalDays.toString()} />
  </div>
</div>
