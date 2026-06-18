import { browser } from '$app/environment';
import type { TaskType } from '$lib/types';
import { generateId } from '$lib/utils/id';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_tasks';

let items = $state<TaskType[]>([]);
let activeTaskId = $state<string | null>(null);

function persist(): void {
  writeStorage(STORAGE_KEY, JSON.stringify(items));
}

export const tasks = {
  get tasks() { return items; },
  get activeTaskId() { return activeTaskId; },
  set activeTaskId(id: string | null) { activeTaskId = id; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) items = JSON.parse(stored) as TaskType[];
    } catch {
      items = [];
    }
  },

  add(title: string): void {
    items = [
      {
        id: generateId('task'),
        title,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        focusSessionsSpent: 0
      },
      ...items
    ];
    persist();
  },

  toggle(id: string): void {
    items = items.map(t =>
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
    items = items.filter(t => t.id !== id);
    if (activeTaskId === id) activeTaskId = null;
    persist();
  },

  incrementSession(id: string): void {
    items = items.map(t =>
      t.id !== id ? t : { ...t, focusSessionsSpent: t.focusSessionsSpent + 1 }
    );
    persist();
  },

  clearCompleted(): void {
    items = items.filter(t => !t.isCompleted);
    persist();
  }
};
