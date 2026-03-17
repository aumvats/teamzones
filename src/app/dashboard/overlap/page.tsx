"use client";

import { useEffect, useState, useCallback } from "react";
import type { TeamMember, Holiday } from "@/types";
import { getMembers, getHolidaysForCountry, setHolidayCache } from "@/lib/storage";
import { fetchHolidays } from "@/lib/api/holidays";
import OverlapTimeline from "@/components/features/OverlapTimeline";
import Skeleton from "@/components/ui/Skeleton";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import Link from "next/link";

export default function OverlapPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [holidays, setHolidays] = useState<Record<string, Holiday[]>>({});
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(true);

  const loadHolidays = useCallback(async (memberList: TeamMember[]) => {
    const year = new Date(selectedDate).getFullYear();
    const countryCodes = [...new Set(memberList.map((m) => m.countryCode))];
    const newHolidayMap: Record<string, Holiday[]> = {};
    const toFetch: string[] = [];

    for (const code of countryCodes) {
      const cached = getHolidaysForCountry(code, year);
      if (cached) {
        newHolidayMap[code] = cached;
      } else {
        toFetch.push(code);
      }
    }

    if (toFetch.length > 0) {
      const results = await Promise.allSettled(
        toFetch.map((code) => fetchHolidays(code, year))
      );
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          newHolidayMap[toFetch[i]] = result.value;
          setHolidayCache(toFetch[i], year, result.value);
        }
      });
    }

    setHolidays(newHolidayMap);
  }, [selectedDate]);

  useEffect(() => {
    const stored = getMembers();
    setMembers(stored);
    setLoading(false);
    if (stored.length > 0) {
      loadHolidays(stored);
    }
  }, [loadHolidays]);

  // Use UTC methods so date arithmetic works correctly in negative-UTC-offset timezones
  const navigateDay = (direction: number) => {
    const d = new Date(selectedDate + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + direction);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <Users size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h2 className="font-heading font-semibold text-lg mb-2">
          Add team members to find meeting overlap
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Go to the dashboard to add your first teammates.
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none rounded-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="font-heading font-bold text-2xl">Find Overlap</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDay(-1)}
            aria-label="Previous day"
            className="p-1.5 rounded-md hover:bg-bg text-text-secondary active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <ChevronLeft size={18} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="Select date"
            className="px-3 py-1.5 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
          />
          <button
            onClick={() => navigateDay(1)}
            aria-label="Next day"
            className="p-1.5 rounded-md hover:bg-bg text-text-secondary active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "75ms" }}>
        <OverlapTimeline
          members={members}
          date={new Date(selectedDate + "T12:00:00Z")}
          holidays={holidays}
        />
      </div>
    </div>
  );
}
