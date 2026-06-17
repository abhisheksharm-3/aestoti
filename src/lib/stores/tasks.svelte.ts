import { browser } from '$app/environment';
import type { TaskType } from '$lib/types';
import { generateId } from '$lib/utils/id';

const STORAGE_KEY = 'aestoti_tasks';

let tasks = $state<TaskType[]>([]);
let activeTaskId = $state<string | null>(null);

function persist(): void {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const tasksStore = {
  get tasks() { return tasks; },
  get activeTaskId() { return activeTaskId; },
  set activeTaskId(id: string | null) { activeTaskId = id; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) tasks = JSON.parse(stored) as TaskType[];
    } catch {
      tasks = [];
    }
  },

  add(title: string): void {
    tasks = [
      {
        id: generateId('task'),
        title,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        focusSessionsSpent: 0
      },
      ...tasks
    ];
    persist();
  },

  toggle(id: string): void {
    tasks = tasks.map(t =>
      t.id !== id
        ? t
        : {
            ...t,
            isCompleted: !t.isCompleted,
            completedAt: !t.isCompleted ? new Date().toISOString() : null
          }
    );
    persist();
  },

  remove(id: string): void {
    tasks = tasks.filter(t => t.id !== id);
    if (activeTaskId === id) activeTaskId = null;
    persist();
  },

  incrementSession(id: string): void {
    tasks = tasks.map(t =>
      t.id !== id ? t : { ...t, focusSessionsSpent: t.focusSessionsSpent + 1 }
    );
    persist();
  },

  clearCompleted(): void {
    tasks = tasks.filter(t => !t.isCompleted);
    persist();
  }
};
