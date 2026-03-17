import type { Metadata } from "next";
import Link from "next/link";
import { Clock, CalendarDays, Layers, Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "TeamZones — See your remote team at a glance",
  description: "Live clocks, weather, and public holidays for every teammate in one dashboard. Find meeting overlaps across timezones in seconds.",
};

const features = [
  {
    icon: Clock,
    title: "Live Clocks",
    description:
      "See every teammate's local time updating in real time. Know instantly whether it's morning or midnight for them.",
  },
  {
    icon: CalendarDays,
    title: "Holiday Awareness",
    description:
      "Upcoming public holidays from 90+ countries appear right on each member's card. No more scheduling during Diwali or Bastille Day.",
  },
  {
    icon: Layers,
    title: "Overlap Finder",
    description:
      "A visual timeline shows exactly when everyone's working hours overlap — accounting for holidays. Find the perfect meeting slot in seconds.",
  },
];

const sampleMembers = [
  { name: "Sarah", city: "Berlin", flag: "\uD83C\uDDE9\uD83C\uDDEA", time: "3:42 PM", temp: "12\u00B0C", weather: "\u2601\uFE0F", holiday: "Oct 3 \u2014 German Unity Day", offset: "UTC+1", working: true },
  { name: "Raj", city: "Mumbai", flag: "\uD83C\uDDEE\uD83C\uDDF3", time: "8:12 PM", temp: "32\u00B0C", weather: "\u2600\uFE0F", holiday: "Oct 2 \u2014 Gandhi Jayanti", offset: "UTC+5:30", working: false },
  { name: "Alex", city: "New York", flag: "\uD83C\uDDFA\uD83C\uDDF8", time: "10:42 AM", temp: "18\u00B0C", weather: "\u26C5", holiday: "Nov 28 \u2014 Thanksgiving", offset: "UTC-5", working: true },
  { name: "Yuki", city: "Tokyo", flag: "\uD83C\uDDEF\uD83C\uDDF5", time: "11:42 PM", temp: "22\u00B0C", weather: "\uD83C\uDF19", holiday: "Nov 3 \u2014 Culture Day", offset: "UTC+9", working: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <span className="font-heading font-bold text-lg text-primary tracking-tight">TeamZones</span>
          <nav className="flex items-center gap-6" aria-label="Main navigation">
            <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-primary text-white px-4 py-1.5 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-all duration-150"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main>
      {/* Hero */}
      <section className="pt-20 sm:pt-28 pb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full mb-6 animate-fade-in"
          >
            <Globe size={14} />
            Works across 90+ countries
          </div>
          <h1
            className="font-heading font-bold text-4xl sm:text-5xl lg:text-[3.5rem] text-text-primary mb-5 tracking-tight leading-[1.1] animate-fade-in-up"
          >
            See your remote team<br className="hidden sm:block" /> at a glance
          </h1>
          <p
            className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "75ms" }}
          >
            Live clocks, weather, and public holidays for every teammate &mdash; in one
            dashboard. Find meeting overlaps across timezones in seconds.
          </p>
          <div
            className="flex flex-col sm:flex-row justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-[0_1px_2px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-surface text-text-primary border border-border px-7 py-3 rounded-lg font-medium text-sm hover:bg-bg hover:border-border active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Preview cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleMembers.map((m, i) => (
              <div
                key={m.name}
                className="bg-surface border border-border rounded-lg p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${200 + i * 75}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.working ? "bg-success shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-text-secondary/30"}`} />
                  <span className="font-heading font-semibold text-sm text-text-primary">{m.name}</span>
                </div>
                <p className="text-xs text-text-secondary mb-3">
                  {m.flag} {m.city}
                </p>
                <p className="text-2xl font-heading font-bold text-text-primary mb-1 tabular-nums">{m.time}</p>
                <p className="text-xs text-text-secondary mb-3">
                  {m.weather} {m.temp} &middot; {m.offset}
                </p>
                <span className="inline-block px-2.5 py-1 text-[11px] font-medium bg-warning/10 text-warning rounded-full leading-none">
                  {m.holiday}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-2xl sm:text-[1.75rem] text-center mb-3">
            Everything you need for timezone sanity
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-lg mx-auto">
            Built for teams that span the globe. No more scheduling mishaps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center group">
                  <div className="w-11 h-11 bg-primary/8 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors duration-200">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-6 text-text-secondary flex-wrap">
            <span className="text-sm">Free to start</span>
            <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <span className="text-sm">No signup required</span>
            <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <span className="text-sm">90+ countries</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-heading font-semibold text-2xl sm:text-[1.75rem] mb-4">
            Stop guessing what time it is there
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Set up your team dashboard in under 30 seconds. Free for up to 3 members.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-[0_1px_2px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading font-semibold text-sm text-text-secondary">TeamZones</span>
          <p className="text-xs text-text-secondary">
            Built for distributed teams
          </p>
        </div>
      </footer>
    </div>
  );
}
