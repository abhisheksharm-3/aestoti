import { writable, derived, get } from 'svelte/store';
import type { PomodoroSessionType, AnalyticsSummaryType, PomodoroModeType } from './types';

const STORAGE_KEY = 'aestoti_sessions';

/**
 * Generates a unique session ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Loads sessions from localStorage
 */
function loadSessions(): PomodoroSessionType[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored) as PomodoroSessionType[];
}

/**
 * Saves sessions to localStorage
 */
function saveSessions(sessions: PomodoroSessionType[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * Creates the sessions store with localStorage persistence
 */
function createSessionsStore() {
    const { subscribe, set, update } = writable<PomodoroSessionType[]>([]);

    return {
        subscribe,

        /**
         * Initializes the store from localStorage
         */
        initialize(): void {
            set(loadSessions());
        },

        /**
         * Records a new completed session
         */
        recordSession(
            mode: PomodoroModeType,
            startTime: Date,
            endTime: Date,
            isCompleted: boolean
        ): void {
            const session: PomodoroSessionType = {
                id: generateId(),
                mode,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                durationSeconds: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
                isCompleted
            };

            update(sessions => {
                const updated = [...sessions, session];
                saveSessions(updated);
                return updated;
            });
        },

        /**
         * Clears all session data
         */
        clearAll(): void {
            set([]);
            saveSessions([]);
        }
    };
}

export const sessions = createSessionsStore();

/**
 * Derived store providing computed analytics
 */
export const analytics = derived<typeof sessions, AnalyticsSummaryType>(
    sessions,
    ($sessions) => {
        const focusSessions = $sessions.filter(s => s.mode === 'focus');
        const totalMinutes = focusSessions.reduce(
            (sum, s) => sum + Math.floor(s.durationSeconds / 60),
            0
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const sessionsToday = focusSessions.filter(
            s => new Date(s.startTime) >= today
        ).length;

        const sessionsThisWeek = focusSessions.filter(
            s => new Date(s.startTime) >= weekAgo
        ).length;

        const uniqueDays = new Set(
            focusSessions.map(s => new Date(s.startTime).toDateString())
        );

        const longestSession = focusSessions.length > 0
            ? Math.max(...focusSessions.map(s => s.durationSeconds))
            : 0;

        const currentStreak = calculateStreak(focusSessions);

        return {
            totalSessions: focusSessions.length,
            totalFocusMinutes: totalMinutes,
            averageSessionMinutes: focusSessions.length > 0
                ? Math.round(totalMinutes / focusSessions.length)
                : 0,
            longestSessionMinutes: Math.floor(longestSession / 60),
            totalDays: uniqueDays.size,
            sessionsToday,
            sessionsThisWeek,
            currentStreak
        };
    }
);

/**
 * Calculates the current streak of consecutive days with focus sessions
 */
function calculateStreak(sessions: PomodoroSessionType[]): number {
    if (sessions.length === 0) return 0;

    const uniqueDates = [...new Set(
        sessions.map(s => new Date(s.startTime).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (uniqueDates[i] === expectedDate.toDateString()) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
