<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import { Separator } from '$lib/components/ui/separator';
  import { AlertTriangle } from 'lucide-svelte';
  import StatCard from './StatCard.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  let scoreColor = $derived(
    analytics.weeklyFocusScore >= 80
      ? 'text-green-500'
      : analytics.weeklyFocusScore >= 50
        ? 'text-yellow-500'
        : 'text-red-500'
  );
</script>

<Card class="w-full max-w-4xl mx-auto">
  <CardHeader>
    <div class="flex items-center justify-between">
      <CardTitle class="text-2xl font-bold">Your Pomodoro Statistics</CardTitle>
      <div class="flex flex-col items-center">
        <span class="text-xs text-muted-foreground">7-day score</span>
        <span class="text-3xl font-bold {scoreColor}">{analytics.weeklyFocusScore}</span>
      </div>
    </div>
    <div class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
      <AlertTriangle class="h-4 w-4 flex-shrink-0" />
      <span>Data is stored locally in your browser. Clearing browser cache will erase all statistics.</span>
    </div>
  </CardHeader>
  <CardContent>
    <Tabs value="overview" class="w-full">
      <TabsList class="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Sessions" value={analytics.summary.totalSessions.toString()} />
          <StatCard title="Total Focus Time" value={formatTime(analytics.summary.totalFocusMinutes)} />
          <StatCard title="Average Session" value={formatTime(analytics.summary.averageSessionMinutes)} />
        </div>
      </TabsContent>
      <TabsContent value="detailed">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Longest Session" value={formatTime(analytics.summary.longestSessionMinutes)} />
          <StatCard title="Sessions Today" value={analytics.summary.sessionsToday.toString()} />
          <StatCard title="Current Streak" value={`${analytics.summary.currentStreak} days`} />
        </div>
      </TabsContent>
    </Tabs>
    <Separator class="my-6" />
    <div class="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
      <div>Sessions this week: <span class="font-medium text-foreground">{analytics.summary.sessionsThisWeek}</span></div>
      <div>Total days tracked: <span class="font-medium text-foreground">{analytics.summary.totalDays}</span></div>
    </div>
  </CardContent>
</Card>
