import type { PomodoroSessionType, DailySessionDataType, HourlyProductivityType } from './types';

/**
 * Generates CSV content from sessions
 */
export function exportToCSV(sessions: PomodoroSessionType[]): string {
    const headers = ['ID', 'Mode', 'Start Time', 'End Time', 'Duration (min)', 'Completed'];
    const rows = sessions.map(s => [
        s.id,
        s.mode,
        s.startTime,
        s.endTime,
        Math.round(s.durationSeconds / 60).toString(),
        s.isCompleted ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Generates JSON export data
 */
export function exportToJSON(sessions: PomodoroSessionType[]): string {
    return JSON.stringify(sessions, null, 2);
}

/**
 * Downloads content as a file
 */
export function downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Calculates daily session data for heatmap
 */
export function calculateDailyData(sessions: PomodoroSessionType[], days: number = 365): DailySessionDataType[] {
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

/**
 * Calculates hourly productivity data
 */
export function calculateHourlyProductivity(sessions: PomodoroSessionType[]): HourlyProductivityType[] {
    const focusSessions = sessions.filter(s => s.mode === 'focus');
    const hourlyData: HourlyProductivityType[] = [];

    for (let hour = 0; hour < 24; hour++) {
        hourlyData.push({ hour, sessionCount: 0, totalMinutes: 0 });
    }

    focusSessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        hourlyData[hour].sessionCount++;
        hourlyData[hour].totalMinutes += Math.round(session.durationSeconds / 60);
    });

    return hourlyData;
}

/**
 * Gets the most productive hour
 */
export function getMostProductiveHour(hourlyData: HourlyProductivityType[]): number {
    let maxHour = 0;
    let maxMinutes = 0;

    hourlyData.forEach(data => {
        if (data.totalMinutes > maxMinutes) {
            maxMinutes = data.totalMinutes;
            maxHour = data.hour;
        }
    });

    return maxHour;
}

/**
 * Formats hour for display
 */
export function formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
}
