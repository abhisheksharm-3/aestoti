<script lang="ts">
  import { browser } from '$app/environment';
  import Pomodoro from '$lib/components/Pomodoro.svelte';
</script>

<div class="flex items-center justify-center h-[calc(100vh-14.5rem)] scroll-smooth">
  {#if browser}
    <Pomodoro />
  {:else}
    <div class="flex flex-col items-center text-9xl tracking-widest font-light">
      <div>25</div>
      <div>00</div>
    </div>
  {/if}
</div>
