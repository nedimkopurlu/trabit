"use client";

import TabBar from "@/components/TabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md min-h-screen pb-20 md:pb-0 md:pl-56">
      {children}
      <TabBar />
    </div>
  );
}
