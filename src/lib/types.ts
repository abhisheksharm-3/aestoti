/**
 * Settings configuration for the Pomodoro timer
 */
export type SettingsType = {
  isAutoTime: boolean;
  hasSound: boolean;
  hasNotification: boolean;
  focusLength: number;
  longBreakInterval: number;
  shortLength: number;
  longLength: number;
};

/**
 * Pomodoro timer mode types
 */
export type PomodoroModeType = 'focus' | 'shortBreak' | 'longBreak';

/**
 * A completed Pomodoro session record
 */
export type PomodoroSessionType = {
  id: string;
  mode: PomodoroModeType;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  isCompleted: boolean;
};

/**
 * Timer state representation
 */
export type TimerStateType = {
  currentMode: PomodoroModeType;
  remainingSeconds: number;
  isRunning: boolean;
  focusSessionCount: number;
};

/**
 * Analytics summary statistics
 */
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

/**
 * Task item for to-do list
 */
export type TaskType = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
  focusSessionsSpent: number;
};

/**
 * Daily goal configuration
 */
export type DailyGoalType = {
  targetSessions: number;
  isEnabled: boolean;
};

/**
 * Timer preset configuration
 */
export type TimerPresetType = {
  id: string;
  name: string;
  focusLength: number;
  shortLength: number;
  longLength: number;
  longBreakInterval: number;
};

/**
 * Theme configuration
 */
export type ThemeType = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
};

/**
 * Keyboard shortcut binding
 */
export type ShortcutType = {
  action: ShortcutActionType;
  key: string;
  hasAlt: boolean;
  hasCtrl: boolean;
  hasShift: boolean;
};

/**
 * Available shortcut actions
 */
export type ShortcutActionType =
  | 'toggleTimer'
  | 'skipMode'
  | 'restartMode'
  | 'openSettings'
  | 'toggleFullscreen';

/**
 * Sound preset for ambient audio
 */
export type SoundPresetType = {
  id: string;
  name: string;
  icon: string;
  src: string;
};

/**
 * Hourly productivity data
 */
export type HourlyProductivityType = {
  hour: number;
  sessionCount: number;
  totalMinutes: number;
};

/**
 * Daily session data for heatmap
 */
export type DailySessionDataType = {
  date: string;
  sessionCount: number;
  totalMinutes: number;
};
