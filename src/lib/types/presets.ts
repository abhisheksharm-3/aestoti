export type TimerPresetType = {
  id: string;
  name: string;
  focusLength: number;
  shortLength: number;
  longLength: number;
  longBreakInterval: number;
};

/** Presets store state: the active list (defaults + custom) and the selected preset id. */
export type PresetsStateType = {
  presets: TimerPresetType[];
  activePresetId: string | null;
};
