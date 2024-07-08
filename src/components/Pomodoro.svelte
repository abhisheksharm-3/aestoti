<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    RiBrainLine,
    RiCupLine,
    RiMoreFill,
    RiPlayLargeFill,
    RiPauseLargeFill,
    RiSkipForwardFill,
    RiTreeLine,
    RiRestartLine,
    RiSettings5Fill,
  } from "svelte-remixicon";
  import * as Drawer from "$lib/components/ui/drawer";
  import Button from "$lib/components/ui/button/button.svelte";
  import DrawerComponent from "./../components/DrawerComponent.svelte";
  import { crossfade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { settings } from "$lib/store";
  import { toast } from "svelte-sonner";

  interface Mode {
    title: string;
    icon: typeof RiBrainLine | typeof RiCupLine | typeof RiTreeLine;
    duration: number;
  }

  let currentModeIndex = 0;
  let isTimerRunning = false;
  let timer: number | undefined = undefined;
  let focusSessions = 0;
  let playPauseIcon = RiPlayLargeFill;
  let audio: HTMLAudioElement;
  let drawerOpen = false;
  let modeStartTime: number;

  // Box the currentTime to force reactivity
  let currentTimeBox = { value: 0 };

  $: modes = [
    {
      title: "Focus",
      icon: RiBrainLine,
      duration: $settings.focus_length * 60,
    },
    {
      title: "Short Break",
      icon: RiCupLine,
      duration: $settings.short_length * 60,
    },
    {
      title: "Long Break",
      icon: RiTreeLine,
      duration: $settings.long_length * 60,
    },
  ];

  $: updateCurrentTime(modes[currentModeIndex].duration);

  function updateCurrentTime(newDuration: number): void {
    if (isTimerRunning) {
      const oldDuration = modes[currentModeIndex].duration;
      const progress = 1 - currentTimeBox.value / oldDuration;
      currentTimeBox.value = Math.round(newDuration * (1 - progress));
    } else {
      currentTimeBox.value = newDuration;
    }
  }

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
    modeStartTime = Date.now();
    timer = setInterval(() => {
      if (currentTimeBox.value > 0) {
        currentTimeBox.value--;
      } else {
        clearInterval(timer);
        moveToNextMode();
      }
    }, 1000);

    if (currentModeIndex === 0 && $settings.sound) {
      audio
        .play()
        .then(() => {
          audio.loop = true;
        })
        .catch((error) => console.error("Audio playback error:", error));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  function calculateTimeSpent(): number {
  const endTime = Date.now();
  return Math.floor((endTime - modeStartTime) / 1000); // Convert to seconds
}
//TODO: Fix infinte skip glitch
  function moveToNextMode() {
    const previousModeIndex = currentModeIndex;
    const actualTimeSpent = calculateTimeSpent();

    if (currentModeIndex === 0) {
      focusSessions++;
      currentModeIndex =
        focusSessions % $settings.long_break_interval === 0 ? 2 : 1;
    } else {
      currentModeIndex = 0;
    }
    updateCurrentTime(modes[currentModeIndex].duration);

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if ($settings.notification) {
      const previousMode = modes[previousModeIndex].title;
      const nextMode = modes[currentModeIndex].title;
      const timeSpent = formatTime(actualTimeSpent);
      const timeSpentString = `${timeSpent.minutes}:${timeSpent.seconds}`;

      toast.success("Great job! Time's up!", {
  description: `You've completed ${timeSpentString} minutes of ${previousMode}. Ready for a ${nextMode} session?`,
  action: {
    label: `Skip ${nextMode}`,
    onClick: (event: MouseEvent) => skipMode(),
  },
});
    }

    if ($settings.auto_time) {
      startTimer();
    } else {
      isTimerRunning = false;
      playPauseIcon = RiPlayLargeFill;
    }
  }

  function toggleTimer() {
    if (isTimerRunning) {
      clearInterval(timer);
      if ($settings.sound) audio.pause();
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
    if (isTimerRunning) {
      startTimer();
    }
  }

  function restartMode() {
    clearInterval(timer);
    updateCurrentTime(modes[currentModeIndex].duration);
    if (isTimerRunning) {
      startTimer();
    }
  }

  function openSettings() {
    drawerOpen = !drawerOpen;
  }

  function handleShortcut(event: KeyboardEvent) {
    if (event.altKey && event.key === "s") {
      event.preventDefault();
      openSettings();
    } else if (event.key === " ") {
      event.preventDefault();
      toggleTimer();
    } else if (event.altKey && event.key === "n") {
      event.preventDefault();
      skipMode();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  });

  onDestroy(() => {
    clearInterval(timer);
    if (audio) {
      audio.pause();
    }
  });
</script>

<svelte:head>
  <title
    >{modes[currentModeIndex].title} for {formatTime(currentTimeBox.value)
      .minutes} : {formatTime(currentTimeBox.value).seconds} @Aestoti</title
  >
  <link rel="icon" href="/logo-short.png" />
</svelte:head>

<Drawer.Root open={drawerOpen}>
  <audio bind:this={audio} src="/clock-sound-tick.mp3"></audio>
  <div class="flex flex-col items-center justify-center h-full">
    {#key currentModeIndex}
      <div
        class="flex items-center text-xl border-white bg-[#FF4C4C26] font-bold mb-8 border px-4 py-1 rounded-full lg:mr-2"
        in:receive={{ key: currentModeIndex }}
        out:send={{ key: currentModeIndex }}
      >
        <svelte:component this={modes[currentModeIndex].icon} class="mr-2" />
        {modes[currentModeIndex].title}
      </div>
    {/key}
    <div
      class={`flex flex-col items-center ml-2 text-9xl mb-12 tracking-widest ${isTimerRunning ? "font-extrabold transition-all duration-300" : "font-light transition-all duration-300"}`}
    >
      <div>{formatTime(currentTimeBox.value).minutes}</div>
      <div>{formatTime(currentTimeBox.value).seconds}</div>
    </div>
    <div class="flex space-x-4 items-center">
      <Drawer.Trigger>
        <Button
          class="bg-[#FF4C4C26] text-[#471515] dark:text-white rounded-2xl p-6 hover:bg-red-500/70 dark:hover:bg-red-950 text-2xl font-bold transition-transform duration-300 transform hover:scale-110"
        >
          <RiMoreFill />
        </Button>
      </Drawer.Trigger>
      <Button
        class="bg-[#FF4C4Cb5] text-[#471515] dark:text-white rounded-3xl p-8 hover:bg-red-700 text-3xl transition-transform duration-300 transform hover:scale-110"
        on:click={toggleTimer}
      >
        <svelte:component this={playPauseIcon} />
      </Button>
      <Button
        class="bg-[#FF4C4C26] text-2xl font-bold text-[#471515] dark:text-white rounded-2xl p-6 hover:bg-red-500/70 dark:hover:bg-red-950 transition-transform duration-300 transform hover:scale-110"
        on:click={skipMode}
      >
        <RiSkipForwardFill />
      </Button>
    </div>
  </div>
  <DrawerComponent />
</Drawer.Root>
