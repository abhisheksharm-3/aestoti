export type ShortcutActionType =
  | 'toggleTimer'
  | 'skipMode'
  | 'restartMode'
  | 'openSettings'
  | 'toggleFullscreen';

export type ShortcutType = {
  action: ShortcutActionType;
  key: string;
  hasAlt: boolean;
  hasCtrl: boolean;
  hasShift: boolean;
};
