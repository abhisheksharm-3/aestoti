<script>
  import { onMount } from 'svelte';
  import Pomodoro from '$lib/components/Pomodoro.svelte';

  let isMounted = false;

  onMount(() => {
    isMounted = true;
  });
</script>

<div class="flex items-center justify-center h-[calc(100vh-14.5rem)] scroll-smooth">
  {#if isMounted}
    <Pomodoro />
  {:else}
    <div class="flex flex-col items-center text-9xl tracking-widest font-light">
      <div>25</div>
      <div>00</div>
    </div>
  {/if}
</div>