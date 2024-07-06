<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    RiBrainLine,
    RiCupLine,
    RiMoreFill,
    RiPlayLargeFill,
    RiPauseLargeFill,
    RiSkipForwardFill,
    RiTreeLine,
  } from "svelte-remixicon";
  import * as Drawer from "$lib/components/ui/drawer";
  import Button from "$lib/components/ui/button/button.svelte";
  import DrawerComponent from "./../components/DrawerComponent.svelte";
  import { crossfade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  interface Mode {
    title: string;
    icon: typeof RiBrainLine | typeof RiCupLine | typeof RiTreeLine; // Icon component type
    duration: number; // Duration in seconds
  }

  const modes: Mode[] = [
    { title: "Focus", icon: RiBrainLine, duration: 25 * 60 },
    { title: "Short Break", icon: RiCupLine, duration: 5 * 60 },
    { title: "Long Break", icon: RiTreeLine, duration: 15 * 60 },
  ];

  let currentModeIndex = 0; // Initial mode index (Focus)
  let currentTime = modes[currentModeIndex].duration;
  let isTimerRunning = false;
  let timer: number | undefined = undefined;
  let focusSessions = 0; // To keep track of focus sessions completed
  let playPauseIcon = RiPlayLargeFill;
  let audio: HTMLAudioElement;

  const [send, receive] = crossfade({
    duration: 500,
    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: cubicOut,
        css: (t) => `
        transform: ${transform} scale(${t});
        opacity: ${t}
      `,
      };
    },
  });

  function formatTime(seconds: number): { minutes: string; seconds: string } {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return {
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(remainingSeconds).padStart(2, "0"),
    };
  }

  function startTimer() {
    timer = setInterval(() => {
      if (currentTime > 0) {
        currentTime--;
      } else {
        clearInterval(timer);
        moveToNextMode();
      }
    }, 1000);

    if (currentModeIndex === 0) {
      audio.play().then(() => {
        audio.loop = true;
      }).catch(error => console.error('Audio playback error:', error));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function moveToNextMode() {
    if (currentModeIndex === 0) {
      // If currently in Focus mode
      focusSessions++;
      currentModeIndex = focusSessions % 3 === 0 ? 2 : 1; // Every 3rd focus session, go to Long Break, otherwise Short Break
    } else {
      // If currently in a break mode
      currentModeIndex = 0; // Always go back to Focus mode
    }
    currentTime = modes[currentModeIndex].duration;
    audio.pause();
    audio.currentTime = 0;
  }

  function toggleTimer() {
    if (isTimerRunning) {
      clearInterval(timer);
      audio.pause();
      isTimerRunning = false;
      playPauseIcon = RiPlayLargeFill;
    } else {
      startTimer();
      isTimerRunning = true;
      playPauseIcon = RiPauseLargeFill;
    }
  }

  function skipMode() {
    clearInterval(timer);
    moveToNextMode();
    playPauseIcon = RiPlayLargeFill;
    if (isTimerRunning) {
      startTimer();
    }
  }

  onDestroy(() => {
    clearInterval(timer);
    audio.pause();
  });
</script>

<Drawer.Root>
  <audio bind:this={audio} src="/clock-sound-tick.mp3"></audio>
  <div class="flex flex-col items-center justify-center h-full">
    {#key currentModeIndex}
      <div
        class="flex items-center text-xl border-white bg-[#FF4C4C26] font-bold mb-8 border px-4 py-1 rounded-full"
        in:receive={{ key: currentModeIndex }}
        out:send={{ key: currentModeIndex }}
      >
        <svelte:component this={modes[currentModeIndex].icon} class="mr-2" />
        {modes[currentModeIndex].title}
      </div>
    {/key}
    <div
      class={`flex flex-col items-center text-9xl mb-12 tracking-widest ${isTimerRunning ? "font-extrabold transition-all duration-300" : "font-light transition-all duration-300"}`}
    >
      <div>{formatTime(currentTime).minutes}</div>
      <div>{formatTime(currentTime).seconds}</div>
    </div>
    <div class="flex space-x-4 items-center">
      <Drawer.Trigger>
        <Button
          class="bg-[#FF4C4C26] text-white rounded-2xl p-6 hover:bg-red-950 text-2xl font-bold transition-transform duration-300 transform hover:scale-110"
        >
          <RiMoreFill />
        </Button>
      </Drawer.Trigger>
      <Button
        class="bg-[#FF4C4Cb5] text-white rounded-3xl p-8 hover:bg-red-700 text-3xl transition-transform duration-300 transform hover:scale-110"
        on:click={toggleTimer}
      >
        <svelte:component this={playPauseIcon} />
      </Button>
      <Button
        class="bg-[#FF4C4C26] text-2xl font-bold text-white rounded-2xl p-6 hover:bg-red-950 transition-transform duration-300 transform hover:scale-110"
        on:click={skipMode}
      >
        <RiSkipForwardFill />
      </Button>
    </div>
  </div>
  <DrawerComponent />
</Drawer.Root>
