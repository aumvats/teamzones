"use client";

import type { TeamMember, WeatherData, Holiday } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import LiveClock from "./LiveClock";
import WeatherIcon from "./WeatherIcon";
import { isInWorkingHours, getOffsetLabel } from "@/lib/timezone";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface MemberCardProps {
  member: TeamMember;
  weather: WeatherData | null;
  holidays: Holiday[];
  weatherLoading?: boolean;
  onEdit: (member: TeamMember) => void;
  onRemove: (id: string) => void;
}

export default function MemberCard({
  member,
  weather,
  holidays,
  weatherLoading,
  onEdit,
  onRemove,
}: MemberCardProps) {
  const [hovered, setHovered] = useState(false);
  const working = isInWorkingHours(member.timezone, member.workStart, member.workEnd);

  // Find next upcoming holiday
  const today = new Date().toISOString().split("T")[0];
  const nextHoliday = holidays
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <Card
      className="relative group hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Action buttons */}
      <div className={`absolute top-4 right-4 flex gap-1 transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button
          onClick={() => onEdit(member)}
          className="p-1.5 rounded-md hover:bg-bg text-text-secondary hover:text-text-primary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          aria-label={`Edit ${member.name}`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onRemove(member.id)}
          className="p-1.5 rounded-md hover:bg-error/10 text-text-secondary hover:text-error transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-error/30 focus-visible:outline-none"
          aria-label={`Remove ${member.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Header: name + working status */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            working ? "bg-success shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-text-secondary/25"
          }`}
          title={working ? "In working hours" : "Outside working hours"}
        />
        <h3 className="font-heading font-semibold text-text-primary truncate">
          {member.name}
        </h3>
      </div>

      {/* Location */}
      <p className="text-sm text-text-secondary mb-3">
        {member.flagEmoji} {member.city}, {member.countryName}
      </p>

      {/* Clock */}
      <div className="flex items-baseline gap-2 mb-3">
        <LiveClock
          timezone={member.timezone}
          className="text-2xl font-heading font-bold text-text-primary tabular-nums"
        />
        <span className="text-xs text-text-secondary">
          {getOffsetLabel(member.timezone)}
        </span>
      </div>

      {/* Weather */}
      <div className="flex items-center gap-2 mb-4">
        {weatherLoading ? (
          <Skeleton width="100px" height="20px" />
        ) : weather ? (
          <>
            <WeatherIcon code={weather.weatherCode} size="sm" />
            <span className="text-sm text-text-secondary">
              {Math.round(weather.temperature)}°C
            </span>
          </>
        ) : (
          <span className="text-sm text-text-secondary" title="Weather unavailable">
            — Weather unavailable
          </span>
        )}
      </div>

      {/* Next holiday */}
      {nextHoliday ? (
        <Badge variant="warning">
          {new Date(nextHoliday.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          — {nextHoliday.name}
        </Badge>
      ) : (
        <Badge>No upcoming holidays</Badge>
      )}
    </Card>
  );
}
