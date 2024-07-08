<script>
  import * as Command from "$lib/components/ui/command/index";
</script>

<Command.Root class="flex w-screen container">
  <Command.List>
    <Command.Group heading="App Shortcuts">
      <Command.Item>
        <span>Open Settings</span>
        <Command.Shortcut>Alt + S</Command.Shortcut>
      </Command.Item>
      <Command.Item>
        <span>Play / Pause Timer</span>
        <Command.Shortcut>Space Bar</Command.Shortcut>
      </Command.Item>
      <Command.Item>
        <span>Next Mode</span>
        <Command.Shortcut>Alt + N</Command.Shortcut>
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Root>
