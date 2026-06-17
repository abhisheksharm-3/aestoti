<script lang="ts">
  import { mode, toggleMode } from 'mode-watcher';
  import { settings } from '$lib/stores/settings.svelte';
  import { timer } from '$lib/stores/timer.svelte';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Input } from '$lib/components/ui/input';

  let isDarkMode = $derived(mode.current === 'dark');

  function handleSettingChange<K extends keyof typeof settings.current>(
    key: K,
    value: (typeof settings.current)[K]
  ): void {
    settings.updateSetting(key, value);
    timer.syncWithSettings();
  }
</script>

<div class="flex justify-between w-screen container flex-col gap-12 lg:gap-0 lg:flex-row">
  <div id="switch" class="flex items-center justify-center gap-3 flex-col">
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="mode">Dark Mode</Label>
      <Switch id="mode" onclick={toggleMode} checked={isDarkMode} />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="timer-auto">Auto Resume Timer</Label>
      <Switch
        id="timer-auto"
        checked={settings.current.isAutoTime}
        onclick={() => handleSettingChange('isAutoTime', !settings.current.isAutoTime)}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="sound">Sound</Label>
      <Switch
        id="sound"
        checked={settings.current.hasSound}
        onclick={() => handleSettingChange('hasSound', !settings.current.hasSound)}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="notification">Notifications</Label>
      <Switch
        id="notification"
        checked={settings.current.hasNotification}
        onclick={() => handleSettingChange('hasNotification', !settings.current.hasNotification)}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="break-prompts">Break Prompts</Label>
      <Switch
        id="break-prompts"
        checked={settings.current.hasBreakPrompts}
        onclick={() => handleSettingChange('hasBreakPrompts', !settings.current.hasBreakPrompts)}
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
        value={settings.current.focusLength}
        onchange={(e) => handleSettingChange('focusLength', Number(e.currentTarget.value))}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="long-break-interval">Pomodoros Until Long Break</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="long-break-interval"
        value={settings.current.longBreakInterval}
        onchange={(e) => handleSettingChange('longBreakInterval', Number(e.currentTarget.value))}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="short-length">Short Break Length</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="short-length"
        value={settings.current.shortLength}
        onchange={(e) => handleSettingChange('shortLength', Number(e.currentTarget.value))}
      />
    </div>
    <div class="flex items-center text-left gap-5 lg:gap-8 w-full">
      <Label class="text-left flex-grow" for="long-length">Long Break Length</Label>
      <Input
        type="number"
        class="w-24 p-2 border border-gray-300 rounded"
        id="long-length"
        value={settings.current.longLength}
        onchange={(e) => handleSettingChange('longLength', Number(e.currentTarget.value))}
      />
    </div>
  </div>
</div>
