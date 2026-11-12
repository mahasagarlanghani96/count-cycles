"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Heart,
  BarChart3,
  User,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/period-history", label: "History", icon: ClipboardList },
  { href: "/daily-care", label: "Daily Care", icon: Heart },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/education", label: "Learn", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface h-screen sticky top-0">
      <div className="flex items-center px-6 py-5 border-b border-border">
        <BrandLogo variant="full" size="sm" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-50 text-primary-600 shadow-sm"
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
    </aside>
  );
}
