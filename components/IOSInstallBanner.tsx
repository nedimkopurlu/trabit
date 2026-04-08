"use client";
import { useEffect, useState } from "react";
import { enableFirestoreOffline } from "@/lib/firestore-offline";

const STORAGE_KEY = "trabit:ios-install-banner-dismissed";

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    enableFirestoreOffline();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    if (isIOS && !isStandalone && !dismissed) setShow(true);
  }, []);
  if (!show) return null;
  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };
  return (
    <div className="fixed bottom-20 left-2 right-2 z-50 mx-auto max-w-md rounded-xl bg-surface p-4 shadow-lg border border-fg/10">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold mb-1">Trabit'i ana ekranına ekle</p>
          <p className="text-sm opacity-80">
            Safari'de paylaş simgesine dokun, ardından "Ana Ekrana Ekle" seç.
          </p>
        </div>
        <button onClick={dismiss} aria-label="Kapat" className="text-xl leading-none px-2">
          ×
        </button>
      </div>
    </div>
  );
}
