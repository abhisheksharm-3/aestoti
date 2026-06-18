import type { PanelType } from '$lib/types';

let commandOpen = $state(false);
let activePanel = $state<PanelType | null>(null);
let fullscreen = $state(false);

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
