<script lang="ts">
  import { browser } from '$app/environment';
  import Pomodoro from '$lib/components/Pomodoro.svelte';
</script>

<div class="flex h-full items-center justify-center">
  {#if browser}
    <Pomodoro />
  {:else}
    <div class="text-8xl font-medium tabular-nums tracking-tight text-foreground">25:00</div>
  {/if}
</div>
