<script lang="ts">
  import { RiBrainLine, RiCupLine, RiTreeLine } from "svelte-remixicon";

  interface Mode {
    title: string;
    icon: typeof RiBrainLine | typeof RiCupLine | typeof RiTreeLine; // Icon component type
    duration: number; // Duration in seconds
  }

  const modes: Mode[] = [
    { title: 'Focus', icon: RiBrainLine, duration: 25 * 60 },
    { title: 'Short Break', icon: RiCupLine, duration: 5 * 60 },
    { title: 'Long Break', icon: RiTreeLine, duration: 15 * 60 }
  ];

  let currentModeIndex: number = 0; // Index to track current mode
  let time: number = modes[currentModeIndex].duration;
  let interval: number | undefined = undefined;
  let formattedTime: string = '';

  function startTimer() {
    if (interval !== undefined) return;
    interval = window.setInterval(() => {
      if (time > 0) {
        time -= 1;
      } else {
        clearInterval(interval);
        interval = undefined;
        // Switch mode logic here
        switchMode();
      }
    }, 1000);
  }

  function stopTimer() {
    if (interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  function resetTimer() {
    stopTimer();
    currentModeIndex = 0; // Reset to default mode
    time = modes[currentModeIndex].duration; // Reset to default duration
  }

  function switchMode() {
    currentModeIndex = (currentModeIndex + 1) % modes.length; // Circular increment
    time = modes[currentModeIndex].duration; // Set new mode duration
  }

  $: formattedTime = `${Math.floor(time / 60)}:${`0${time % 60}`.slice(-2)}`;
</script>

<div class="flex flex-col items-center justify-center h-full">
  <div class="flex items-center text-xl border-white bg-[#FF4C4C26] font-light mb-8 border px-4 py-1 rounded-full">
    <svelte:component this={modes[currentModeIndex].icon} class="mr-2" />
    {modes[currentModeIndex].title}
  </div>
  <div class="text-6xl font-mono mb-12">{formattedTime}</div>
  <div class="flex space-x-4">
    <button class="px-4 py-2 bg-blue-500 text-white rounded" on:click={startTimer}>Start</button>
    <button class="px-4 py-2 bg-red-500 text-white rounded" on:click={stopTimer}>Stop</button>
    <button class="px-4 py-2 bg-gray-500 text-white rounded" on:click={resetTimer}>Reset</button>
  </div>
</div>
