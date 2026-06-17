export type PanelType = 'tasks' | 'stats' | 'sound' | 'theme' | 'settings';

let commandOpen = $state(false);
let activePanel = $state<PanelType | null>(null);
let fullscreen = $state(false);

export const PANEL_META: Record<PanelType, { title: string; description: string }> = {
  tasks: { title: 'Tasks', description: 'What are you focusing on?' },
  stats: { title: 'Insights', description: 'Your focus, measured.' },
  sound: { title: 'Sound', description: 'Set the room tone.' },
  theme: { title: 'Appearance', description: 'Presets and color.' },
  settings: { title: 'Settings', description: 'Timer, behavior, shortcuts.' }
};

export const ui = {
  get commandOpen() {
    return commandOpen;
  },
  set commandOpen(value: boolean) {
    commandOpen = value;
  },

  get activePanel() {
    return activePanel;
  },

  get fullscreen() {
    return fullscreen;
  },
  set fullscreen(value: boolean) {
    fullscreen = value;
  },

  openPanel(panel: PanelType): void {
    activePanel = panel;
    commandOpen = false;
  },

  closePanel(): void {
    activePanel = null;
  },

  toggleCommand(): void {
    commandOpen = !commandOpen;
  }
};
