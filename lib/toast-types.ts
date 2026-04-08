/**
 * Toast Types
 */

export interface Toast {
  id: string; // Unique ID
  message: string;
  type: "success" | "error" | "info"; // Color mapping
  duration?: number; // ms before auto-dismiss (default 3000)
  icon?: string; // Optional emoji or icon
}
