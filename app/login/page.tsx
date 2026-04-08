"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, loading, hasOnboarded, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && hasOnboarded) router.replace("/bugun");
    else if (user && !hasOnboarded) router.replace("/onboarding");
  }, [user, loading, hasOnboarded, router]);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <h1 className="text-4xl font-bold tracking-tight">Trabit</h1>
          <p className="text-sm opacity-60 text-center">
            Alışkanlıklarını takip et, serinle büyü.
          </p>
        </div>

        {error && (
          <div className="w-full rounded-lg bg-critical/10 border border-critical/30 px-4 py-3 text-sm text-critical text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-surface bg-surface px-6 py-3 font-medium transition hover:opacity-80 disabled:opacity-50"
        >
          {/* Google logo SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.1-6.1C34.47 3.13 29.56 1 24 1 14.82 1 7.07 6.48 3.82 14.32l7.1 5.52C12.6 13.47 17.88 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.57-.14-3.08-.4-4.55H24v9.02h12.67c-.56 2.93-2.22 5.41-4.72 7.08l7.28 5.66C43.44 37.25 46.5 31.35 46.5 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.92 28.16A14.55 14.55 0 0 1 9.5 24c0-1.44.25-2.84.68-4.16l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.57 10.76l8.35-6.6z"
            />
            <path
              fill="#34A853"
              d="M24 47c5.56 0 10.23-1.84 13.63-5l-7.28-5.66c-1.87 1.26-4.27 2-6.35 2-6.12 0-11.4-3.97-13.08-9.34l-8.35 6.6C7.07 41.52 14.82 47 24 47z"
            />
          </svg>
          {signingIn ? "Giriş yapılıyor..." : "Google ile Giriş Yap"}
        </button>
      </div>
    </main>
  );
}
