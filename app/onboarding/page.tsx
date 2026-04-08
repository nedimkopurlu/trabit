"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingPage() {
  const { user, loading, hasOnboarded, setIdentitySentence } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (hasOnboarded) router.replace("/bugun"); // D-03: never shown again
  }, [user, loading, hasOnboarded, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Lütfen bir kimlik cümlesi girin.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await setIdentitySentence(trimmed);
      router.replace("/bugun");
    } catch (err) {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || hasOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold">Kimlik cümlen nedir?</h1>
          <p className="text-sm opacity-60">
            Kendini bir cümleyle tanımla. Bu cümle, alışkanlıklarını her tamamladığında seni karşılayacak.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="w-full rounded-xl border border-surface bg-surface px-4 py-3 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-fg/20"
            placeholder="Ben her gün öğrenen biriyim..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
            autoFocus
          />

          {error && (
            <p className="text-sm text-critical">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !value.trim()}
            className="w-full rounded-xl bg-fg text-bg px-6 py-3 font-medium transition hover:opacity-80 disabled:opacity-40"
          >
            {saving ? "Kaydediliyor..." : "Devam"}
          </button>
        </form>
      </div>
    </main>
  );
}
