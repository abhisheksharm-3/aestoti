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

<div class="space-y-10">
  <section>
    <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Behavior</div>
    <div class="mt-3 divide-y divide-border">
      <div class="flex items-center justify-between py-3">
        <Label for="mode" class="text-sm text-foreground">Dark Mode</Label>
        <Switch id="mode" onclick={toggleMode} checked={isDarkMode} />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="timer-auto" class="text-sm text-foreground">Auto Resume Timer</Label>
        <Switch
          id="timer-auto"
          checked={settings.current.isAutoTime}
          onclick={() => handleSettingChange('isAutoTime', !settings.current.isAutoTime)}
        />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="sound" class="text-sm text-foreground">Sound</Label>
        <Switch
          id="sound"
          checked={settings.current.hasSound}
          onclick={() => handleSettingChange('hasSound', !settings.current.hasSound)}
        />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="notification" class="text-sm text-foreground">Notifications</Label>
        <Switch
          id="notification"
          checked={settings.current.hasNotification}
          onclick={() => handleSettingChange('hasNotification', !settings.current.hasNotification)}
        />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="break-prompts" class="text-sm text-foreground">Break Prompts</Label>
        <Switch
          id="break-prompts"
          checked={settings.current.hasBreakPrompts}
          onclick={() => handleSettingChange('hasBreakPrompts', !settings.current.hasBreakPrompts)}
        />
      </div>
    </div>
  </section>

  <section>
    <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Durations</div>
    <div class="mt-3 divide-y divide-border">
      <div class="flex items-center justify-between py-3">
        <Label for="focus-length" class="text-sm text-foreground">Focus Length</Label>
        <Input
          type="number"
          class="w-20 tabular-nums"
          id="focus-length"
          value={settings.current.focusLength}
          onchange={(e) => handleSettingChange('focusLength', Number(e.currentTarget.value))}
        />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="long-break-interval" class="text-sm text-foreground">Pomodoros Until Long Break</Label>
        <Input
          type="number"
          class="w-20 tabular-nums"
          id="long-break-interval"
          value={settings.current.longBreakInterval}
          onchange={(e) => handleSettingChange('longBreakInterval', Number(e.currentTarget.value))}
        />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="short-length" class="text-sm text-foreground">Short Break Length</Label>
        <Input
          type="number"
          class="w-20 tabular-nums"
          id="short-length"
          value={settings.current.shortLength}
          onchange={(e) => handleSettingChange('shortLength', Number(e.currentTarget.value))}
        />
      </div>
      <div class="flex items-center justify-between py-3">
        <Label for="long-length" class="text-sm text-foreground">Long Break Length</Label>
        <Input
          type="number"
          class="w-20 tabular-nums"
          id="long-length"
          value={settings.current.longLength}
          onchange={(e) => handleSettingChange('longLength', Number(e.currentTarget.value))}
        />
      </div>
    </div>
  </section>
</div>
