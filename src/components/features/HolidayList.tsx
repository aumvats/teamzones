"use client";

import type { TeamMember, Holiday } from "@/types";
import Badge from "@/components/ui/Badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface HolidayEntry {
  date: string;
  holidays: (Holiday & { affectedMembers: TeamMember[] })[];
}

interface HolidayListProps {
  entries: HolidayEntry[];
}

export default function HolidayList({ entries }: HolidayListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">&#9971;&#65039;</p>
        <p className="text-text-secondary">
          No public holidays in the next 30 days for your team. Smooth sailing!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.date} className="border border-border rounded-lg overflow-hidden">
          {/* Date header */}
          <div className="bg-bg px-4 py-2.5">
            <p className="text-sm font-medium text-text-primary">
              {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Holiday rows */}
          {entry.holidays.map((holiday, i) => {
            const key = `${entry.date}-${holiday.countryCode}-${i}`;
            const isExpanded = expanded.has(key);

            return (
              <div key={key} className="border-t border-border">
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg/50 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 focus-visible:outline-none"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-text-secondary flex-shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-text-secondary flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {holiday.name}
                      </span>
                      {holiday.localName !== holiday.name && (
                        <span className="text-xs text-text-secondary">
                          ({holiday.localName})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {holiday.countryCode}
                    </p>
                  </div>

                  <div className="flex gap-1 flex-wrap justify-end">
                    {holiday.affectedMembers.map((m) => (
                      <Badge key={m.id}>
                        {m.flagEmoji} {m.name}
                      </Badge>
                    ))}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 pl-10 text-xs text-text-secondary space-y-1 animate-fade-in">
                    <p>
                      Type:{" "}
                      {holiday.types.join(", ") || "Public"}
                    </p>
                    <p>
                      Scope: {holiday.global ? "Nationwide" : "Regional"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
