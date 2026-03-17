"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CalendarDays, Layers, Home } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Clock },
  { href: "/dashboard/overlap", label: "Find Overlap", icon: Layers },
  { href: "/dashboard/holidays", label: "Holidays", icon: CalendarDays },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-heading font-bold text-lg text-primary tracking-tight">
                TeamZones
              </Link>
              <nav className="hidden sm:flex items-center gap-1" aria-label="Dashboard navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                        active
                          ? "bg-primary/8 text-primary font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg"
                      }`}
                    >
                      <Icon size={15} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none rounded-md px-2 py-1"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>

          {/* Mobile nav */}
          <nav className="sm:hidden flex items-center gap-1 pb-2 -mx-1 overflow-x-auto" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                    active
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
