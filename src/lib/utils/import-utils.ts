import type { PomodoroSessionType, PomodoroModeType } from '$lib/types';

const MODES: readonly PomodoroModeType[] = ['focus', 'shortBreak', 'longBreak'];

function isValidSession(value: unknown): value is PomodoroSessionType {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.mode === 'string' &&
    MODES.includes(s.mode as PomodoroModeType) &&
    typeof s.startTime === 'string' &&
    typeof s.endTime === 'string' &&
    typeof s.durationSeconds === 'number' &&
    Number.isFinite(s.durationSeconds) &&
    typeof s.isCompleted === 'boolean' &&
    (s.note === undefined || typeof s.note === 'string')
  );
}

/**
 * Parse a previously-exported sessions JSON file. Throws if the text isn't a
 * JSON array (so the UI can report an invalid file); silently drops individual
 * entries that don't match the session shape rather than failing the whole import.
 */
export function parseSessionsImport(text: string): PomodoroSessionType[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of sessions.');
  return parsed.filter(isValidSession);
}
