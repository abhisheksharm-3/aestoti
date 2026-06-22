<script lang="ts">
  import { mode, setMode } from 'mode-watcher';
  import { settings } from '$lib/stores/settings.svelte';
  import { timer } from '$lib/stores/timer.svelte';
  import { goals } from '$lib/stores/goals.svelte';
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

{#snippet field(title: string, hint: string, htmlFor: string, dim = false)}
  <div class="min-w-0 {dim ? 'opacity-45' : ''}">
    <Label for={htmlFor} class="text-[15px] font-medium text-foreground">{title}</Label>
    <div class="mt-1 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">{hint}</div>
  </div>
{/snippet}

<div class="space-y-12">
  <section>
    <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Behavior</div>
    <div class="mt-4 divide-y divide-border/70">
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Dark Mode', 'Use a dark interface.', 'mode')}
        <Switch id="mode" checked={isDarkMode} onCheckedChange={v => setMode(v ? 'dark' : 'light')} />
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Auto Resume Timer', 'Start the next block automatically.', 'timer-auto')}
        <Switch
          id="timer-auto"
          checked={settings.current.isAutoTime}
          onCheckedChange={v => handleSettingChange('isAutoTime', v)}
        />
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Sound', 'Play ambient audio while focusing.', 'sound')}
        <Switch
          id="sound"
          checked={settings.current.hasSound}
          onCheckedChange={v => handleSettingChange('hasSound', v)}
        />
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Notifications', 'Alert me when a block ends.', 'notification')}
        <Switch
          id="notification"
          checked={settings.current.hasNotification}
          onCheckedChange={v => handleSettingChange('hasNotification', v)}
        />
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Break Prompts', 'Suggest a way to rest on breaks.', 'break-prompts')}
        <Switch
          id="break-prompts"
          checked={settings.current.hasBreakPrompts}
          onCheckedChange={v => handleSettingChange('hasBreakPrompts', v)}
        />
      </div>
    </div>
  </section>

  <section>
    <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Goal</div>
    <div class="mt-4 divide-y divide-border/70">
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Daily Goal', 'Aim for a number of sessions each day.', 'goal-enabled')}
        <Switch
          id="goal-enabled"
          checked={goals.current.isEnabled}
          onCheckedChange={v => {
            if (v !== goals.current.isEnabled) goals.toggle();
          }}
        />
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field("Target Sessions", "Counts toward today's goal.", 'goal-target', !goals.current.isEnabled)}
        <div class="flex items-center gap-2.5">
          <Input
            type="number"
            min="1"
            max="24"
            class="h-9 w-16 rounded-md text-right tabular-nums"
            id="goal-target"
            disabled={!goals.current.isEnabled}
            value={goals.current.targetSessions}
            onchange={e => goals.setTarget(Number(e.currentTarget.value))}
          />
          <span class="w-10 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">/ day</span>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Durations</div>
    <div class="mt-4 divide-y divide-border/70">
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Focus Length', 'Length of one focus block.', 'focus-length')}
        <div class="flex items-center gap-2.5">
          <Input
            type="number"
            min="1"
            max="180"
            class="h-9 w-16 rounded-md text-right tabular-nums"
            id="focus-length"
            value={settings.current.focusLength}
            onchange={e => handleSettingChange('focusLength', Number(e.currentTarget.value))}
          />
          <span class="w-10 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">min</span>
        </div>
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Pomodoros Until Long Break', 'Focus blocks before a long break.', 'long-break-interval')}
        <div class="flex items-center gap-2.5">
          <Input
            type="number"
            min="1"
            max="10"
            class="h-9 w-16 rounded-md text-right tabular-nums"
            id="long-break-interval"
            value={settings.current.longBreakInterval}
            onchange={e => handleSettingChange('longBreakInterval', Number(e.currentTarget.value))}
          />
          <span class="w-10 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">blocks</span>
        </div>
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Short Break Length', 'Quick breather between blocks.', 'short-length')}
        <div class="flex items-center gap-2.5">
          <Input
            type="number"
            min="1"
            max="60"
            class="h-9 w-16 rounded-md text-right tabular-nums"
            id="short-length"
            value={settings.current.shortLength}
            onchange={e => handleSettingChange('shortLength', Number(e.currentTarget.value))}
          />
          <span class="w-10 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">min</span>
        </div>
      </div>
      <div class="flex items-center justify-between gap-8 py-4">
        {@render field('Long Break Length', 'A longer rest after several blocks.', 'long-length')}
        <div class="flex items-center gap-2.5">
          <Input
            type="number"
            min="1"
            max="120"
            class="h-9 w-16 rounded-md text-right tabular-nums"
            id="long-length"
            value={settings.current.longLength}
            onchange={e => handleSettingChange('longLength', Number(e.currentTarget.value))}
          />
          <span class="w-10 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">min</span>
        </div>
      </div>
    </div>
  </section>
</div>
