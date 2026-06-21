import type { PanelType } from '$lib/types';

let isCommandOpen = $state(false);
let activePanel = $state<PanelType | null>(null);
let isFullscreen = $state(false);

export const ui = {
  get isCommandOpen() {
    return isCommandOpen;
  },
  set isCommandOpen(value: boolean) {
    isCommandOpen = value;
  },

  get activePanel() {
    return activePanel;
  },

  get isFullscreen() {
    return isFullscreen;
  },
  set isFullscreen(value: boolean) {
    isFullscreen = value;
  },

  openPanel(panel: PanelType): void {
    activePanel = panel;
    isCommandOpen = false;
  },

  closePanel(): void {
    activePanel = null;
  },

  toggleCommand(): void {
    isCommandOpen = !isCommandOpen;
  }
};
