import { browser } from '$app/environment';

/**
 * Notification permission state
 */
export type NotificationPermissionType = 'granted' | 'denied' | 'default';

/**
 * Creates a notification service for browser notifications
 */
function createNotificationService() {
    /**
     * Checks if browser notifications are supported
     */
    function isSupported(): boolean {
        return browser && 'Notification' in window;
    }

    /**
     * Gets the current permission status
     */
    function getPermission(): NotificationPermissionType {
        if (!isSupported()) return 'denied';
        return Notification.permission as NotificationPermissionType;
    }

    /**
     * Requests permission from the user
     */
    async function requestPermission(): Promise<NotificationPermissionType> {
        if (!isSupported()) return 'denied';

        const permission = await Notification.requestPermission();
        return permission as NotificationPermissionType;
    }

    /**
     * Shows a browser notification
     */
    function show(title: string, options?: NotificationOptions): Notification | null {
        if (!isSupported()) return null;
        if (getPermission() !== 'granted') return null;

        const notification = new Notification(title, {
            icon: '/logo-short.png',
            badge: '/logo-short.png',
            ...options
        });

        return notification;
    }

    /**
     * Shows a timer completion notification
     */
    function showTimerComplete(completedMode: string, nextMode: string): Notification | null {
        return show(`${completedMode} Complete! 🎉`, {
            body: `Great work! Ready for ${nextMode}?`,
            tag: 'pomodoro-timer',
            requireInteraction: true
        });
    }

    return {
        isSupported,
        getPermission,
        requestPermission,
        show,
        showTimerComplete
    };
}

export const notifications = createNotificationService();
