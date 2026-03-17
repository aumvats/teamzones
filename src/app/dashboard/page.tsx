"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { TeamMember, WeatherData, Holiday } from "@/types";
import { getMembers, saveMembers, getWeatherForLocation, getHolidaysForCountry, setWeatherCache, setHolidayCache } from "@/lib/storage";
import { fetchWeather } from "@/lib/api/weather";
import { fetchHolidays } from "@/lib/api/holidays";
import MemberCard from "@/components/features/MemberCard";
import AddMemberModal from "@/components/features/AddMemberModal";
import EditMemberModal from "@/components/features/EditMemberModal";
import UpgradeModal from "@/components/features/UpgradeModal";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { Plus, Users } from "lucide-react";
import { getUtcOffsetHours } from "@/lib/timezone";

const FREE_MEMBER_LIMIT = 3;

export default function DashboardPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [holidayMap, setHolidayMap] = useState<Record<string, Holiday[]>>({});
  const [weatherLoading, setWeatherLoading] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const loadData = useCallback(async (memberList: TeamMember[]) => {
    const year = new Date().getFullYear();
    const newWeatherMap: Record<string, WeatherData> = {};
    const newHolidayMap: Record<string, Holiday[]> = {};
    const staleWeatherLocations: { lat: number; lng: number; key: string }[] = [];
    const staleHolidayCountries: Set<string> = new Set();

    for (const m of memberList) {
      const wKey = `${m.lat.toFixed(2)}:${m.lng.toFixed(2)}`;
      const cached = getWeatherForLocation(m.lat, m.lng);
      if (cached) {
        newWeatherMap[wKey] = cached;
      } else {
        staleWeatherLocations.push({ lat: m.lat, lng: m.lng, key: wKey });
      }

      const hCached = getHolidaysForCountry(m.countryCode, year);
      if (hCached) {
        newHolidayMap[m.countryCode] = hCached;
      } else {
        staleHolidayCountries.add(m.countryCode);
      }
    }

    setWeatherMap(newWeatherMap);
    setHolidayMap(newHolidayMap);

    const uniqueWeather = staleWeatherLocations.filter(
      (loc, i, arr) => arr.findIndex((l) => l.key === loc.key) === i
    );
    if (uniqueWeather.length > 0) {
      setWeatherLoading(new Set(uniqueWeather.map((l) => l.key)));
      const weatherResults = await Promise.allSettled(
        uniqueWeather.map((loc) => fetchWeather(loc.lat, loc.lng))
      );
      const updatedWeather = { ...newWeatherMap };
      weatherResults.forEach((result, i) => {
        if (result.status === "fulfilled") {
          updatedWeather[uniqueWeather[i].key] = result.value;
          setWeatherCache(uniqueWeather[i].key, result.value);
        }
      });
      setWeatherMap(updatedWeather);
      setWeatherLoading(new Set());
    }

    if (staleHolidayCountries.size > 0) {
      const holidayResults = await Promise.allSettled(
        Array.from(staleHolidayCountries).map((code) => fetchHolidays(code, year))
      );
      const updatedHolidays = { ...newHolidayMap };
      const countryCodes = Array.from(staleHolidayCountries);
      holidayResults.forEach((result, i) => {
        if (result.status === "fulfilled") {
          updatedHolidays[countryCodes[i]] = result.value;
          setHolidayCache(countryCodes[i], year, result.value);
        }
      });
      setHolidayMap(updatedHolidays);
    }
  }, []);

  useEffect(() => {
    const stored = getMembers();
    setMembers(stored);
    setLoading(false);
    if (stored.length > 0) {
      loadData(stored);
    }
  }, [loadData]);

  const handleAdd = (member: TeamMember) => {
    const updated = [...members, member];
    setMembers(updated);
    saveMembers(updated);
    setShowAdd(false);
    loadData(updated);
  };

  const handleEdit = (updated: TeamMember) => {
    const newMembers = members.map((m) => (m.id === updated.id ? updated : m));
    setMembers(newMembers);
    saveMembers(newMembers);
    setEditMember(null);
    loadData(newMembers);
  };

  const handleRemove = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    saveMembers(updated);
  };

  const handleAddClick = () => {
    if (members.length >= FREE_MEMBER_LIMIT) {
      setShowUpgrade(true);
    } else {
      setShowAdd(true);
    }
  };

  const sortedMembers = useMemo(
    () => [...members].sort(
      (a, b) => getUtcOffsetHours(a.timezone) - getUtcOffsetHours(b.timezone)
    ),
    [members]
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-2xl">Team Dashboard</h1>
          {members.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-bg text-text-secondary rounded-full">
              <Users size={12} />
              {members.length}
            </span>
          )}
        </div>
        <Button onClick={handleAddClick} size="sm">
          <Plus size={16} className="mr-1" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-lg animate-fade-in-up">
          <div className="text-5xl mb-5">&#127760;</div>
          <h2 className="font-heading font-semibold text-xl mb-2">
            Add your first teammate
          </h2>
          <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto leading-relaxed">
            Search for their city to see their local time, weather, and upcoming
            public holidays — all at a glance.
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1" />
            Add Team Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMembers.map((member, i) => {
            const wKey = `${member.lat.toFixed(2)}:${member.lng.toFixed(2)}`;
            return (
              <div key={member.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <MemberCard
                  member={member}
                  weather={weatherMap[wKey] ?? null}
                  holidays={holidayMap[member.countryCode] ?? []}
                  weatherLoading={weatherLoading.has(wKey)}
                  onEdit={setEditMember}
                  onRemove={handleRemove}
                />
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddMemberModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {editMember && (
        <EditMemberModal
          member={editMember}
          onSave={handleEdit}
          onClose={() => setEditMember(null)}
        />
      )}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
