"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  { href: "/bugun", label: "Bugün" },
  { href: "/seri", label: "Seri" },
  { href: "/ayarlar", label: "Ayarlar" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-surface bg-bg flex justify-around items-center md:hidden z-50">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full text-sm font-medium transition-colors ${
                isActive ? "text-critical" : "text-fg/60"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-critical rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: left sidebar */}
      <nav className="hidden md:fixed md:top-0 md:left-0 md:bottom-0 md:w-56 md:flex md:flex-col md:border-r md:border-surface md:bg-bg md:p-4 z-50">
        <div className="text-xl font-bold mb-8 text-fg">Trabit</div>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive ? "text-critical bg-critical/10" : "text-fg/60 hover:text-fg hover:bg-surface"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-active-desktop"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-critical rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
