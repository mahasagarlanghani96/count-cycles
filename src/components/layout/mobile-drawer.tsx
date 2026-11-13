"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ClipboardList,
  BookOpen,
  Stethoscope,
  SmilePlus,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { cn } from "@/lib/utils";

const drawerItems = [
  { href: "/period-history", label: "Period History", icon: ClipboardList },
  { href: "/symptoms", label: "Symptoms", icon: Stethoscope },
  { href: "/mood", label: "Mood", icon: SmilePlus },
  { href: "/education", label: "Learn", icon: BookOpen },
];

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3 md:hidden">
        <BrandLogo variant="full" size="sm" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl p-2 text-muted hover:bg-surface-alt hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {visible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: open ? 1 : 0 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-72 bg-surface border-l border-border shadow-xl transition-transform duration-200 ease-out"
            style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 text-muted hover:bg-surface-alt hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {drawerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400"
                        : "text-muted hover:bg-surface-alt hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
