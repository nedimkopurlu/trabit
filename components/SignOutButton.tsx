"use client";

import { useAuth } from "@/lib/auth-context";

export function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={() => signOut()}
      className="rounded-lg border border-surface px-4 py-2 text-critical"
    >
      Çıkış Yap
    </button>
  );
}
