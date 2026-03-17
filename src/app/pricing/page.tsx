import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — TeamZones",
  description: "Simple, transparent pricing for TeamZones. Start free with up to 3 team members. Upgrade to Pro or Team for more.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For solo founders testing the tool with a small team.",
    cta: "Get Started Free",
    href: "/dashboard",
    highlight: false,
    features: [
      "Up to 3 team members",
      "Live timezone clocks",
      "Current weather display",
      "Next-holiday badge per member",
      "localStorage persistence",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For remote founders and consultants managing distributed teams.",
    cta: "Start Pro Trial",
    href: "/dashboard",
    highlight: true,
    features: [
      "Up to 25 team members",
      "Everything in Free, plus:",
      "Meeting overlap finder with date picker",
      "Full 30-day holiday calendar view",
      "Custom working hours per member",
      "Copy meeting time to clipboard",
    ],
  },
  {
    name: "Team",
    price: "$24",
    period: "/month",
    description: "For agency PMs who need to share team awareness across the org.",
    cta: "Start Team Trial",
    href: "/dashboard",
    highlight: false,
    features: [
      "Unlimited team members",
      "Everything in Pro, plus:",
      "Multiple team groups",
      "Shareable read-only dashboard link",
      "Export holiday calendar as ICS",
      "Priority weather refresh (15 min)",
    ],
  },
];

const faqs = [
  {
    q: "Do I need to sign up to try TeamZones?",
    a: "No. TeamZones works instantly with no sign-up required. Your team data is saved in your browser's local storage. Cloud sync with accounts is coming in v2.",
  },
  {
    q: "What happens if I hit the free plan limit?",
    a: "When you try to add a 4th team member on the free plan, you'll see a prompt to upgrade. Your existing 3 members continue working normally.",
  },
  {
    q: "Which countries' holidays are supported?",
    a: "TeamZones uses the Nager.Date API which covers public holidays for 90+ countries worldwide, including the US, UK, Germany, India, Japan, Brazil, and many more.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="font-heading font-bold text-lg text-primary tracking-tight">
            TeamZones
          </Link>
          <nav className="flex items-center gap-6" aria-label="Main navigation">
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors duration-150">
              <Home size={14} />
              Home
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
      {/* Pricing */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-3 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-text-secondary">
              Start free. Upgrade when your team grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`bg-surface border rounded-lg p-6 flex flex-col hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up ${
                  tier.highlight
                    ? "border-primary ring-1 ring-primary shadow-[0_2px_8px_rgba(37,99,235,0.08)]"
                    : "border-border"
                }`}
                style={{ animationDelay: `${100 + i * 75}ms` }}
              >
                {tier.highlight && (
                  <span className="inline-block self-start px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-full mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading font-semibold text-lg">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="font-heading font-bold text-4xl tracking-tight">{tier.price}</span>
                  <span className="text-sm text-text-secondary">{tier.period}</span>
                </div>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">{tier.description}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                    tier.highlight
                      ? "bg-primary text-white hover:bg-primary/90 shadow-[0_1px_2px_rgba(37,99,235,0.2)]"
                      : "bg-surface text-text-primary border border-border hover:bg-bg"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-heading font-semibold text-2xl sm:text-[1.75rem] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-border rounded-lg p-5 hover:border-text-secondary/20 transition-colors duration-200">
                <h3 className="font-heading font-medium text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
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
