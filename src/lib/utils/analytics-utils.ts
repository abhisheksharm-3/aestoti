import type { PomodoroSessionType, DailySessionDataType, HourlyProductivityType } from '$lib/types';

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
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { date: dateStr, sessionCount: 0, totalMinutes: 0 });
  }

  focusSessions.forEach(session => {
    const dateStr = session.startTime.split('T')[0];
    const existing = dailyMap.get(dateStr);
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
