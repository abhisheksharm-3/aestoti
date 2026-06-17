import { browser } from '$app/environment';
import type { NotificationPermissionType } from '$lib/types';

function isSupported(): boolean {
  return browser && 'Notification' in window;
}

function getPermission(): NotificationPermissionType {
  if (!isSupported()) return 'denied';
  return Notification.permission as NotificationPermissionType;
}

async function requestPermission(): Promise<NotificationPermissionType> {
  if (!isSupported()) return 'denied';
  return Notification.requestPermission() as Promise<NotificationPermissionType>;
}

function show(title: string, options?: NotificationOptions): Notification | null {
  if (!isSupported() || getPermission() !== 'granted') return null;
  return new Notification(title, {
    icon: '/logo-short.png',
    badge: '/logo-short.png',
    ...options
  });
}

function showTimerComplete(completedMode: string, nextMode: string): Notification | null {
  return show(`${completedMode} Complete!`, {
    body: `Great work! Ready for ${nextMode}?`,
    tag: 'pomodoro-timer',
    requireInteraction: true
  });
}

export const notifications = {
  isSupported,
  getPermission,
  requestPermission,
  show,
  showTimerComplete
};
