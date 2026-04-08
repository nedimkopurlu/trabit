"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TabBar from "@/components/TabBar";
import FAB from "@/components/FAB";
import HabitFormSheet from "@/components/HabitFormSheet";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, hasOnboarded } = useAuth();
  const router = useRouter();
  const [fabSheetOpen, setFabSheetOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!hasOnboarded) router.replace("/onboarding"); // D-12
  }, [user, loading, hasOnboarded, router]);

  if (loading || !user || !hasOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md min-h-screen pb-20 md:pb-0 md:pl-56">
      {children}
      <FAB onClick={() => setFabSheetOpen(true)} />
      <TabBar />
      <HabitFormSheet open={fabSheetOpen} onClose={() => setFabSheetOpen(false)} />
    </div>
  );
}
