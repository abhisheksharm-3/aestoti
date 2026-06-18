/**
 * Local calendar-day key as `YYYY-MM-DD`. Uses the viewer's timezone so the
 * heatmap, streak, and "today" counts all agree on which day a session belongs
 * to — sessions are stored as UTC ISO strings, and bucketing by UTC would
 * mis-attribute evening sessions for anyone west of UTC.
 */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
