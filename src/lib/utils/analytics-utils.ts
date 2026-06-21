import type { PomodoroSessionType, DailySessionDataType, HourlyProductivityType } from '$lib/types';
import { dayKey } from './date';

/** Reference length of one focus block, used to benchmark a session's focus score. */
const DEFAULT_FOCUS_SECONDS = 25 * 60;

/** Filter a session list down to focus blocks, dropping breaks. */
export function focusOnly(sessions: PomodoroSessionType[]): PomodoroSessionType[] {
  return sessions.filter((s) => s.mode === 'focus');
}

/**
 * Count the consecutive-day focus streak ending on the most recent active day.
 *
 * Day keys are local `YYYY-MM-DD` strings (so they sort lexicographically and
 * match the heatmap/"today" counters). The streak stays alive while today is
 * still in progress and only breaks once the most recent active day is older
 * than yesterday. The anchor is parsed at local midnight (`T00:00:00`) so day
 * arithmetic isn't shifted by UTC.
 */
export function calculateStreak(sessions: PomodoroSessionType[]): number {
  if (sessions.length === 0) return 0;
  const uniqueDays = [...new Set(sessions.map((s) => dayKey(s.startTime)))].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (uniqueDays[0] !== dayKey(today) && uniqueDays[0] !== dayKey(yesterday)) {
    return 0;
  }
  const anchor = new Date(`${uniqueDays[0]}T00:00:00`);
  let streak = 0;
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(anchor);
    expected.setDate(anchor.getDate() - i);
    if (uniqueDays[i] === dayKey(expected)) streak++;
    else break;
  }
  return streak;
}

/** Score one focus session 0–100: half for completing it, half scaled by duration. */
export function sessionFocusScore(session: PomodoroSessionType): number {
  const completionBonus = session.isCompleted ? 50 : 0;
  const durationBonus = Math.min(
    50,
    Math.floor((session.durationSeconds / DEFAULT_FOCUS_SECONDS) * 50)
  );
  return completionBonus + durationBonus;
}

export function calculateDailyData(
  sessions: PomodoroSessionType[],
  days: number = 365
): DailySessionDataType[] {
  const focusSessions = sessions.filter(s => s.mode === 'focus');
  const dailyMap = new Map<string, DailySessionDataType>();

  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Local day key so the grid lines up with the streak/"today" counters.
    const dateStr = dayKey(date);
    dailyMap.set(dateStr, { date: dateStr, sessionCount: 0, totalMinutes: 0 });
  }

  focusSessions.forEach(session => {
    const existing = dailyMap.get(dayKey(session.startTime));
    if (existing) {
      existing.sessionCount++;
      existing.totalMinutes += Math.round(session.durationSeconds / 60);
    }
  });

  return Array.from(dailyMap.values()).reverse();
}

export function calculateHourlyProductivity(
  sessions: PomodoroSessionType[]
): HourlyProductivityType[] {
  const focusSessions = sessions.filter(s => s.mode === 'focus');
  const hourlyData: HourlyProductivityType[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sessionCount: 0,
    totalMinutes: 0
  }));

  focusSessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourlyData[hour].sessionCount++;
    hourlyData[hour].totalMinutes += Math.round(session.durationSeconds / 60);
  });

  return hourlyData;
}

export function getMostProductiveHour(hourlyData: HourlyProductivityType[]): number {
  return hourlyData.reduce(
    (bestHour, curr) =>
      curr.totalMinutes > hourlyData[bestHour].totalMinutes ? curr.hour : bestHour,
    0
  );
}

export function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
}
