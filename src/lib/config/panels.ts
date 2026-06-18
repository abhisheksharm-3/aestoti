import type { PanelType } from '$lib/types';

export const PANEL_META: Record<PanelType, { title: string; description: string }> = {
  tasks: { title: 'Tasks', description: 'What are you focusing on?' },
  stats: { title: 'Insights', description: 'Your focus, measured.' },
  sound: { title: 'Sound', description: 'Set the room tone.' },
  theme: { title: 'Appearance', description: 'Presets and color.' },
  settings: { title: 'Settings', description: 'Timer, behavior, shortcuts.' }
};
