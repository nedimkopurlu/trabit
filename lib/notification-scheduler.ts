import type { Habit } from "./habit-types";

export interface ScheduledNotification {
  habitId: string;
  habitName: string;
  notificationTime: string; // HH:MM
  nextTrigger: Date;
}

/**
 * Calculate next trigger time for a habit notification.
 * @param timeStr - Time in HH:MM format (e.g., "09:00")
 * @returns Date object set to today at that time (or tomorrow if already passed)
 */
export function getNextNotificationTime(timeStr: string): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  const now = new Date();
  const nextTrigger = new Date(now);
  nextTrigger.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, move to tomorrow
  if (nextTrigger.getTime() <= now.getTime()) {
    nextTrigger.setDate(nextTrigger.getDate() + 1);
  }

  return nextTrigger;
}

/**
 * Check which habits should fire notifications now.
 * @param habits - Array of habits from useHabits() hook
 * @returns Array of habit IDs that should fire notifications (within 60-second window)
 */
export function checkNotifications(habits: Habit[]): string[] {
  const now = new Date();
  const dueHabitIds: string[] = [];

  for (const habit of habits) {
    if (!habit.notificationTime) {
      // Habit doesn't have a notification time set
      continue;
    }

    const nextTrigger = getNextNotificationTime(habit.notificationTime);
    const timeDiff = now.getTime() - nextTrigger.getTime();

    // Check if we're within a 1-minute window of the trigger time
    // This accounts for polling at ~60-second intervals
    if (timeDiff >= 0 && timeDiff <= 60000) {
      dueHabitIds.push(habit.id);
    }
  }

  return dueHabitIds;
}

/**
 * Fire a local notification for a habit.
 * @param habitId - Habit ID for tracking
 * @param habitName - Habit name to display in notification
 */
export async function fireNotification(
  habitId: string,
  habitName: string
): Promise<void> {
  // Check if Notification API is available
  if (!("Notification" in window)) {
    console.warn("Notification API not supported in this browser");
    return;
  }

  // Check if permission is granted
  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    new Notification(habitName, {
      body: "Bildirimi görmek için buraya dokunun",
      badge: "/icons/icon-192.png",
      tag: `habit-${habitId}`,
      data: { habitId },
    });
  } catch (error) {
    console.error("Error firing notification:", error);
  }
}
