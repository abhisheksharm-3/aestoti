<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Switch from '$lib/components/ui/switch/switch.svelte';
  import { mode, toggleMode } from 'mode-watcher';
  import { settings } from '$lib/store';
  import { timer } from '$lib/timer';

  $: isDarkMode = $mode === 'dark';

  function handleSettingChange<K extends keyof typeof $settings>(
    key: K,
    value: (typeof $settings)[K]
  ): void {
    settings.updateSetting(key, value);
    timer.syncWithSettings();
  }
</script>

<div class="flex justify-between w-screen container flex-col gap-12 lg:gap-0 lg:flex-row">
  <div id="switch" class="flex items-center justify-center gap-3 flex-col">
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="mode">Dark Mode</Label>
      <Switch id="mode" on:click={toggleMode} checked={isDarkMode} />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="timer-auto">Auto Resume Timer</Label>
      <Switch
        id="timer-auto"
        checked={$settings.isAutoTime}
        on:click={() => handleSettingChange('isAutoTime', !$settings.isAutoTime)}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="sound">Sound</Label>
      <Switch
        id="sound"
        checked={$settings.hasSound}
        on:click={() => handleSettingChange('hasSound', !$settings.hasSound)}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="notification">Notifications</Label>
      <Switch
        id="notification"
        checked={$settings.hasNotification}
        on:click={() => handleSettingChange('hasNotification', !$settings.hasNotification)}
      />
    </div>
  </div>

  <div id="inputs" class="flex items-center justify-center gap-6 flex-col">
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="focus-length">Focus Length</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="focus-length"
        value={$settings.focusLength}
        on:change={(e) => handleSettingChange('focusLength', Number(e.currentTarget.value))}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="long-break-interval">Pomodoros Until Long Break</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="long-break-interval"
        value={$settings.longBreakInterval}
        on:change={(e) => handleSettingChange('longBreakInterval', Number(e.currentTarget.value))}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="short-length">Short Break Length</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="short-length"
        value={$settings.shortLength}
        on:change={(e) => handleSettingChange('shortLength', Number(e.currentTarget.value))}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="long-length">Long Break Length</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="long-length"
        value={$settings.longLength}
        on:change={(e) => handleSettingChange('longLength', Number(e.currentTarget.value))}
      />
    </div>
  </div>
</div>
