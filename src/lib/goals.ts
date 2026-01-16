import { writable, derived, get } from 'svelte/store';
import type { DailyGoalType } from './types';
import { sessions } from './analytics';

const STORAGE_KEY = 'aestoti_goals';

const DEFAULT_GOAL: DailyGoalType = {
    targetSessions: 8,
    isEnabled: true
};

/**
 * Loads goals from localStorage
 */
function loadGoals(): DailyGoalType {
    if (typeof window === 'undefined') return DEFAULT_GOAL;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_GOAL;
    return { ...DEFAULT_GOAL, ...JSON.parse(stored) };
}

/**
 * Creates the goals store
 */
function createGoalsStore() {
    const { subscribe, set, update } = writable<DailyGoalType>(DEFAULT_GOAL);

    return {
        subscribe,

        /**
         * Initializes store from localStorage
         */
        initialize(): void {
            set(loadGoals());
        },

        /**
         * Updates the target sessions
         */
        setTarget(target: number): void {
            update(g => {
                const updated = { ...g, targetSessions: Math.max(1, target) };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        },

        /**
         * Toggles goal tracking
         */
        toggle(): void {
            update(g => {
                const updated = { ...g, isEnabled: !g.isEnabled };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        }
    };
}

export const goals = createGoalsStore();

/**
 * Derived store for today's progress
 */
export const dailyProgress = derived(
    [goals, sessions],
    ([$goals, $sessions]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySessions = $sessions.filter(s =>
            s.mode === 'focus' &&
            s.isCompleted &&
            new Date(s.startTime) >= today
        ).length;

        const percentage = $goals.targetSessions > 0
            ? Math.min(100, Math.round((todaySessions / $goals.targetSessions) * 100))
            : 0;

        return {
            completed: todaySessions,
            target: $goals.targetSessions,
            percentage,
            isGoalMet: todaySessions >= $goals.targetSessions
        };
    }
);
