export type SettingsType = {
  isAutoTime: boolean;
  hasSound: boolean;
  hasNotification: boolean;
  hasBreakPrompts: boolean;
  focusLength: number;
  longBreakInterval: number;
  shortLength: number;
  longLength: number;
};

export type PomodoroModeType = 'focus' | 'shortBreak' | 'longBreak';

export type PomodoroSessionType = {
  id: string;
  mode: PomodoroModeType;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  isCompleted: boolean;
  note?: string;
};

export type TimerStateType = {
  currentMode: PomodoroModeType;
  remainingSeconds: number;
  isRunning: boolean;
  focusSessionCount: number;
};

export type AnalyticsSummaryType = {
  totalSessions: number;
  totalFocusMinutes: number;
  averageSessionMinutes: number;
  longestSessionMinutes: number;
  totalDays: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  currentStreak: number;
};

export type TaskType = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
  focusSessionsSpent: number;
};

export type DailyGoalType = {
  targetSessions: number;
  isEnabled: boolean;
};

export type DailyProgressType = {
  completed: number;
  target: number;
  percentage: number;
  isGoalMet: boolean;
};

export type TimerPresetType = {
  id: string;
  name: string;
  focusLength: number;
  shortLength: number;
  longLength: number;
  longBreakInterval: number;
};

export type ThemeType = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
};

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

export type SoundPresetType = {
  id: string;
  name: string;
  icon: string;
  src: string;
};

export type HourlyProductivityType = {
  hour: number;
  sessionCount: number;
  totalMinutes: number;
};

export type DailySessionDataType = {
  date: string;
  sessionCount: number;
  totalMinutes: number;
};

export type SessionCompleteCallbackType = (
  mode: PomodoroModeType,
  startTime: Date,
  endTime: Date,
  isCompleted: boolean
) => void;
