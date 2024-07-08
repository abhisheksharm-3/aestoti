<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import { mode, toggleMode } from "mode-watcher";
  import { settings } from "$lib/store";
  import type { Settings } from "$lib/store";

  let currentMode: string;
  $: currentMode = $mode || "dark";

  $: isLightMode = currentMode === "dark";

  $: if ($settings) {
    settings.set($settings);
  }
</script>

<div
  class="flex justify-between w-screen container flex-col gap-12 lg:gap-0 lg:flex-row"
>
  <div id="switch" class="flex items-center justify-center gap-3 flex-col">
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="mode">Dark Mode</Label>
      <Switch id="mode" on:click={toggleMode} bind:checked={isLightMode}/>
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="timer-auto"
        >Auto Resume Timer</Label
      >
      <Switch id="timer-auto" disabled bind:checked={$settings.auto_time} />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="sound">Sound</Label>
      <Switch id="sound" bind:checked={$settings.sound} />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="notification">Notifications</Label
      >
      <Switch id="notification" bind:checked={$settings.notification} />
    </div>
  </div>

  <div id="inputs" class="flex items-center justify-center gap-6 flex-col">
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="focus-length">Focus Length</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="focus-length"
        bind:value={$settings.focus_length}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="long-break-interval"
        >Pomodoros Until Long Break</Label
      >
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="long-break-interval"
        bind:value={$settings.long_break_interval}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="short-length"
        >Short Break Length</Label
      >
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="short-length"
        bind:value={$settings.short_length}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="long-length"
        >Long Break Length</Label
      >
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="long-length"
        bind:value={$settings.long_length}
      />
    </div>
  </div>
</div>
