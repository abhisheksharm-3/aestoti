import type { PomodoroModeType } from './timer';

export type PomodoroSessionType = {
  id: string;
  mode: PomodoroModeType;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  isCompleted: boolean;
  note?: string;
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

export type HourlyProductivityType = {
  hour: number;
  sessionCount: number;
  totalMinutes: number;
};
