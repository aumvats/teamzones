"use client";

import type { TeamMember, Holiday } from "@/types";
import { getMemberUtcRange, memberHasHoliday, computeOverlap, formatUtcHour, utcHourToLocalString } from "@/lib/overlap";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface OverlapTimelineProps {
  members: TeamMember[];
  date: Date;
  holidays: Record<string, Holiday[]>;
}

const HOUR_LABELS = Array.from({ length: 25 }, (_, i) => i);

export default function OverlapTimeline({ members, date, holidays }: OverlapTimelineProps) {
  const [copied, setCopied] = useState(false);
  const dateStr = date.toISOString().split("T")[0];
  const overlap = computeOverlap(members, date, holidays);

  const handleCopy = async () => {
    if (!overlap) return;

    const lines = [
      `Available: ${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
      `${formatUtcHour(overlap.startUtc)}–${formatUtcHour(overlap.endUtc)} UTC`,
      ...members
        .filter((m) => !memberHasHoliday(m, dateStr, holidays))
        .map(
          (m) =>
            `${utcHourToLocalString(overlap.startUtc, m.timezone, date)}–${utcHourToLocalString(
              overlap.endUtc,
              m.timezone,
              date
            )} ${m.city}`
        ),
    ];

    try {
      await navigator.clipboard.writeText(lines.join(" | "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn("Clipboard write failed");
    }
  };

  return (
    <div className="w-full">
      {/* Summary bar */}
      {overlap ? (
        <div className="flex items-center gap-3 mb-5 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              Overlap: {formatUtcHour(overlap.startUtc)}–{formatUtcHour(overlap.endUtc)} UTC
              <span className="text-text-secondary font-normal ml-1">({Math.round((overlap.endUtc - overlap.startUtc) * 10) / 10}h)</span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {members
                .filter((m) => !memberHasHoliday(m, dateStr, holidays))
                .map((m) => (
                  <span key={m.id} className="text-xs text-text-secondary">
                    {utcHourToLocalString(overlap.startUtc, m.timezone, date)}–
                    {utcHourToLocalString(overlap.endUtc, m.timezone, date)} {m.city}
                  </span>
                ))}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-surface border border-border rounded-md hover:bg-bg active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <p className="text-sm text-text-secondary">
            No common working hours on this date.
            {members.some((m) => memberHasHoliday(m, dateStr, holidays)) &&
              ` ${members.filter((m) => memberHasHoliday(m, dateStr, holidays)).length} member(s) have holidays.`}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Hour labels */}
          <div className="flex mb-2 ml-36">
            {HOUR_LABELS.map((h) => (
              <div
                key={h}
                className="text-[10px] text-text-secondary"
                style={{ width: h < 24 ? `${100 / 24}%` : 0 }}
              >
                {h % 3 === 0 ? `${h.toString().padStart(2, "0")}` : ""}
              </div>
            ))}
          </div>

          {/* Member rows */}
          {members.map((m) => {
            const hasHoliday = memberHasHoliday(m, dateStr, holidays);
            const range = getMemberUtcRange(m, date);
            const holidayName = holidays[m.countryCode]?.find((h) => h.date === dateStr)?.name;

            // Calculate bar position
            let left: number, width: number;
            if (range.start < range.end) {
              left = (range.start / 24) * 100;
              width = ((range.end - range.start) / 24) * 100;
            } else {
              // Wraps midnight — show two bars
              left = (range.start / 24) * 100;
              width = ((24 - range.start + range.end) / 24) * 100;
            }

            return (
              <div
                key={m.id}
                className={`flex items-center mb-1.5 ${hasHoliday ? "opacity-50" : ""}`}
              >
                <div className="w-36 flex-shrink-0 pr-3">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {m.flagEmoji} {m.name}
                  </p>
                  {hasHoliday && (
                    <p className="text-[10px] text-warning truncate">{holidayName}</p>
                  )}
                </div>
                <div className="flex-1 h-8 bg-bg rounded-sm relative">
                  {/* Working hours bar */}
                  {range.start < range.end ? (
                    <div
                      className={`absolute top-0 h-full rounded-sm ${
                        hasHoliday ? "bg-text-secondary/20" : "bg-primary/20"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  ) : (
                    <>
                      <div
                        className={`absolute top-0 h-full rounded-l-sm ${
                          hasHoliday ? "bg-text-secondary/20" : "bg-primary/20"
                        }`}
                        style={{ left: `${left}%`, width: `${((24 - range.start) / 24) * 100}%` }}
                      />
                      <div
                        className={`absolute top-0 left-0 h-full rounded-r-sm ${
                          hasHoliday ? "bg-text-secondary/20" : "bg-primary/20"
                        }`}
                        style={{ width: `${(range.end / 24) * 100}%` }}
                      />
                    </>
                  )}

                  {/* Overlap overlay */}
                  {overlap && !hasHoliday && (
                    overlap.endUtc <= 24 ? (
                      <div
                        className="absolute top-0 h-full bg-success/30 rounded-sm cursor-pointer"
                        style={{
                          left: `${(overlap.startUtc / 24) * 100}%`,
                          width: `${((overlap.endUtc - overlap.startUtc) / 24) * 100}%`,
                        }}
                        onClick={handleCopy}
                        title="Click to copy meeting time"
                      />
                    ) : (
                      <>
                        <div
                          className="absolute top-0 h-full bg-success/30 rounded-l-sm cursor-pointer"
                          style={{
                            left: `${(overlap.startUtc / 24) * 100}%`,
                            width: `${((24 - overlap.startUtc) / 24) * 100}%`,
                          }}
                          onClick={handleCopy}
                          title="Click to copy meeting time"
                        />
                        <div
                          className="absolute top-0 left-0 h-full bg-success/30 rounded-r-sm cursor-pointer"
                          style={{ width: `${((overlap.endUtc - 24) / 24) * 100}%` }}
                          onClick={handleCopy}
                          title="Click to copy meeting time"
                        />
                      </>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
