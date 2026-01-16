import { writable, get } from 'svelte/store';
import type { TaskType } from './types';

const STORAGE_KEY = 'aestoti_tasks';

/**
 * Generates a unique task ID
 */
function generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Loads tasks from localStorage
 */
function loadTasks(): TaskType[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as TaskType[];
}

/**
 * Saves tasks to localStorage
 */
function saveTasks(tasks: TaskType[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Creates the tasks store
 */
function createTasksStore() {
    const { subscribe, set, update } = writable<TaskType[]>([]);

    return {
        subscribe,

        /**
         * Initializes store from localStorage
         */
        initialize(): void {
            set(loadTasks());
        },

        /**
         * Adds a new task
         */
        add(title: string): void {
            const task: TaskType = {
                id: generateId(),
                title,
                isCompleted: false,
                createdAt: new Date().toISOString(),
                completedAt: null,
                focusSessionsSpent: 0
            };
            update(tasks => {
                const updated = [task, ...tasks];
                saveTasks(updated);
                return updated;
            });
        },

        /**
         * Toggles task completion status
         */
        toggle(id: string): void {
            update(tasks => {
                const updated = tasks.map(task => {
                    if (task.id === id) {
                        return {
                            ...task,
                            isCompleted: !task.isCompleted,
                            completedAt: !task.isCompleted ? new Date().toISOString() : null
                        };
                    }
                    return task;
                });
                saveTasks(updated);
                return updated;
            });
        },

        /**
         * Removes a task
         */
        remove(id: string): void {
            update(tasks => {
                const updated = tasks.filter(task => task.id !== id);
                saveTasks(updated);
                return updated;
            });
        },

        /**
         * Increments focus sessions for a task
         */
        incrementSession(id: string): void {
            update(tasks => {
                const updated = tasks.map(task => {
                    if (task.id === id) {
                        return { ...task, focusSessionsSpent: task.focusSessionsSpent + 1 };
                    }
                    return task;
                });
                saveTasks(updated);
                return updated;
            });
        },

        /**
         * Clears all completed tasks
         */
        clearCompleted(): void {
            update(tasks => {
                const updated = tasks.filter(task => !task.isCompleted);
                saveTasks(updated);
                return updated;
            });
        },

        /**
         * Gets active (incomplete) tasks
         */
        getActive(): TaskType[] {
            return get({ subscribe }).filter(t => !t.isCompleted);
        }
    };
}

export const tasks = createTasksStore();

/**
 * Currently active task being focused on
 */
export const activeTaskId = writable<string | null>(null);
