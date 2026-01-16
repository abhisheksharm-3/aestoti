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
