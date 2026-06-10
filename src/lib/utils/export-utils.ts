import type { PomodoroSessionType } from '$lib/types';

export function exportToCSV(sessions: PomodoroSessionType[]): string {
  const headers = ['ID', 'Mode', 'Start Time', 'End Time', 'Duration (min)', 'Completed', 'Note'];
  const rows = sessions.map(s => [
    s.id,
    s.mode,
    s.startTime,
    s.endTime,
    Math.round(s.durationSeconds / 60).toString(),
    s.isCompleted ? 'Yes' : 'No',
    s.note ?? ''
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export function exportToJSON(sessions: PomodoroSessionType[]): string {
  return JSON.stringify(sessions, null, 2);
}

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
