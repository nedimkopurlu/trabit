"use client";

import { useEffect, useState } from "react";
import { requestNotificationPermission } from "@/lib/notification-permissions";

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;
    
    // Check if Notification API is supported
    if (!("Notification" in window)) return;

    // Check if permission is "default" (undecided)
    if (Notification.permission === "default") {
      setShowBanner(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setShowBanner(false);
      }
    } catch (err) {
      console.error("Permission request failed:", err);
    } finally {
      setRequesting(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="bg-medium/20 border border-medium p-4 rounded-lg mb-4">
      <p className="text-sm text-fg mb-2">
        Alışkanlık bildirimlerini almak için izin verin
      </p>
      <button
        onClick={handleRequestPermission}
        disabled={requesting}
        className="px-4 py-2 bg-medium text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {requesting ? "Yükleniyor..." : "İzin Ver"}
      </button>
    </div>
  );
}
