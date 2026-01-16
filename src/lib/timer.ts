import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { PomodoroModeType, TimerStateType } from './types';
import { settings } from './store';
import { sessions } from './analytics';
import { tasks, activeTaskId } from './tasks';

/**
 * Creates the timer store with all timer logic
 */
function createTimerStore() {
    const state = writable<TimerStateType>({
        currentMode: 'focus',
        remainingSeconds: 25 * 60,
        isRunning: false,
        focusSessionCount: 0
    });

    let intervalId: number | undefined;
    let modeStartTime: Date | undefined;

    /**
     * Gets the duration for a mode based on current settings
     */
    function getModeDuration(mode: PomodoroModeType): number {
        const currentSettings = get(settings);
        switch (mode) {
            case 'focus':
                return currentSettings.focusLength * 60;
            case 'shortBreak':
                return currentSettings.shortLength * 60;
            case 'longBreak':
                return currentSettings.longLength * 60;
        }
    }

    /**
     * Determines the next mode based on current state
     */
    function getNextMode(currentMode: PomodoroModeType, focusCount: number): PomodoroModeType {
        const currentSettings = get(settings);
        if (currentMode === 'focus') {
            return (focusCount + 1) % currentSettings.longBreakInterval === 0
                ? 'longBreak'
                : 'shortBreak';
        }
        return 'focus';
    }

    /**
     * Records the completed session to analytics
     */
    function recordCompletedSession(mode: PomodoroModeType, isCompleted: boolean): void {
        if (modeStartTime) {
            sessions.recordSession(mode, modeStartTime, new Date(), isCompleted);
        }
    }

    return {
        subscribe: state.subscribe,

        /**
         * Initializes timer with current settings
         */
        initialize(): void {
            const currentSettings = get(settings);
            state.update(s => ({
                ...s,
                remainingSeconds: currentSettings.focusLength * 60
            }));
        },

        /**
         * Starts or resumes the timer
         */
        start(): void {
            if (!browser) return;

            state.update(s => {
                if (!modeStartTime) {
                    modeStartTime = new Date();
                }
                return { ...s, isRunning: true };
            });

            intervalId = window.setInterval(() => {
                state.update(s => {
                    if (s.remainingSeconds <= 0) {
                        this.handleModeComplete();
                        return s;
                    }
                    return { ...s, remainingSeconds: s.remainingSeconds - 1 };
                });
            }, 1000);
        },

        /**
         * Pauses the timer
         */
        pause(): void {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
            state.update(s => ({ ...s, isRunning: false }));
        },

        /**
         * Toggles between start and pause
         */
        toggle(): void {
            const current = get(state);
            if (current.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        },

        /**
         * Handles mode completion
         */
        handleModeComplete(): void {
            this.pause();

            const current = get(state);
            recordCompletedSession(current.currentMode, true);

            // Increment active task session count if focus completed
            if (current.currentMode === 'focus') {
                const taskId = get(activeTaskId);
                if (taskId) {
                    tasks.incrementSession(taskId);
                }
            }

            const newFocusCount = current.currentMode === 'focus'
                ? current.focusSessionCount + 1
                : current.focusSessionCount;

            const nextMode = getNextMode(current.currentMode, current.focusSessionCount);

            state.set({
                currentMode: nextMode,
                remainingSeconds: getModeDuration(nextMode),
                isRunning: false,
                focusSessionCount: newFocusCount
            });

            modeStartTime = undefined;

            const currentSettings = get(settings);
            if (currentSettings.isAutoTime) {
                this.start();
            }
        },

        /**
         * Skips to the next mode without completing current
         */
        skip(): void {
            this.pause();

            const current = get(state);
            if (modeStartTime) {
                recordCompletedSession(current.currentMode, false);
            }

            const newFocusCount = current.currentMode === 'focus'
                ? current.focusSessionCount + 1
                : current.focusSessionCount;

            const nextMode = getNextMode(current.currentMode, current.focusSessionCount);

            state.set({
                currentMode: nextMode,
                remainingSeconds: getModeDuration(nextMode),
                isRunning: false,
                focusSessionCount: newFocusCount
            });

            modeStartTime = undefined;
        },

        /**
         * Restarts the current mode
         */
        restart(): void {
            const current = get(state);
            state.update(s => ({
                ...s,
                remainingSeconds: getModeDuration(current.currentMode)
            }));
            modeStartTime = undefined;

            if (current.isRunning) {
                this.pause();
                this.start();
            }
        },

        /**
         * Updates remaining time when settings change
         */
        syncWithSettings(): void {
            const current = get(state);
            if (!current.isRunning && !modeStartTime) {
                state.update(s => ({
                    ...s,
                    remainingSeconds: getModeDuration(s.currentMode)
                }));
            }
        },

        /**
         * Cleans up interval on destroy
         */
        destroy(): void {
            if (intervalId) {
                clearInterval(intervalId);
            }
        }
    };
}

export const timer = createTimerStore();

/**
 * Derived store for formatted time display
 */
export const formattedTime = derived(timer, ($timer) => {
    const minutes = Math.floor($timer.remainingSeconds / 60);
    const seconds = $timer.remainingSeconds % 60;
    return {
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
    };
});

/**
 * Mode display configuration
 */
export const MODE_CONFIG = {
    focus: { title: 'Focus', color: 'focus' },
    shortBreak: { title: 'Short Break', color: 'break' },
    longBreak: { title: 'Long Break', color: 'break' }
} as const;
