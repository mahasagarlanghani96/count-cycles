"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { MobileDrawer } from "./mobile-drawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileDrawer />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
