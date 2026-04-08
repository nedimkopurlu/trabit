/**
 * Request notification permission from the user.
 * Safe to call multiple times — browser enforces single prompt.
 * @returns true if permission granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Check if Notification API exists
  if (!("Notification" in window)) {
    console.warn("Notification API not supported in this browser");
    return false;
  }

  // Check current permission state
  if (Notification.permission === "granted") {
    // Already have permission
    return true;
  }

  if (Notification.permission === "denied") {
    // User has denied permission, don't ask again
    console.warn("User has denied notification permission");
    return false;
  }

  // permission === "default" — ask user
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
}
