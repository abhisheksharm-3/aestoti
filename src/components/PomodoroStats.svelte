<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Separator } from "$lib/components/ui/separator";
  import { Button } from "$lib/components/ui/button";
  import { ArrowUpRight } from "lucide-svelte";
  import StatCard from './StatCard.svelte';

  export let sessions: Array<{ duration: number, startTime: string }> = [];

  // Calculate statistics
  $: totalSessions = sessions.length;
  $: totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
  $: averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
  $: longestSession = Math.max(...sessions.map(s => s.duration), 0);
  $: totalDays = new Set(sessions.map(s => new Date(s.startTime).toDateString())).size;

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
</script>

<Card class="w-full max-w-4xl mx-auto">
  <CardHeader>
    <CardTitle class="text-2xl font-bold">Your Pomodoro Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    <Tabs value="overview" class="w-full">
      <TabsList class="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Sessions" value={totalSessions.toString()} />
          <StatCard title="Total Focus Time" value={formatTime(totalMinutes)} />
          <StatCard title="Average Session" value={formatTime(Math.round(averageSessionLength))} />
        </div>
      </TabsContent>
      <TabsContent value="detailed">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Longest Session" value={formatTime(longestSession)} />
          <StatCard title="Total Days" value={totalDays.toString()} />
          <StatCard title="Productivity Score" value={`${Math.round((totalMinutes / (totalDays * 1440)) * 100)}%`} />
        </div>
      </TabsContent>
    </Tabs>
    <Separator class="my-6" />
    <div class="flex justify-end">
      <Button variant="outline">
        View Full Report
        <ArrowUpRight class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>

<!-- {#if import.meta.env.DEV}
  <pre class="mt-4 p-4 bg-gray-800 text-white rounded">
    {JSON.stringify({ totalSessions, totalMinutes, averageSessionLength, longestSession, totalDays }, null, 2)}
  </pre>
{/if} -->