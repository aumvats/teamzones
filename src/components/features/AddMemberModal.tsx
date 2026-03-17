"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { GeoResult, TeamMember } from "@/types";
import { searchCity } from "@/lib/api/geocode";
import { fetchWeather } from "@/lib/api/weather";
import { fetchHolidays } from "@/lib/api/holidays";
import { fetchCountry } from "@/lib/api/country";
import { resolveTimezone } from "@/lib/timezone";
import { setWeatherCache, setHolidayCache, setCountryCache } from "@/lib/storage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X, MapPin, Loader2 } from "lucide-react";

interface AddMemberModalProps {
  onAdd: (member: TeamMember) => void;
  onClose: () => void;
}

export default function AddMemberModal({ onAdd, onClose }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [selected, setSelected] = useState<GeoResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const data = await searchCity(q);
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setResults([]);
      setError("Location lookup unavailable. Try again in a moment.");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleCityChange = (value: string) => {
    setCityQuery(value);
    setSelected(null);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 500);
  };

  const handleSelect = (result: GeoResult) => {
    setSelected(result);
    setCityQuery(result.displayName.split(",")[0]);
    setShowDropdown(false);
    setResults([]);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    if (!selected) {
      setError("Please select a city");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const year = new Date().getFullYear();
      const [weatherResult, holidaysResult, countryResult] = await Promise.allSettled([
        fetchWeather(selected.lat, selected.lng),
        fetchHolidays(selected.countryCode, year),
        fetchCountry(selected.countryCode),
      ]);

      const country =
        countryResult.status === "fulfilled" ? countryResult.value : null;
      const timezone = resolveTimezone(
        selected.countryCode,
        country?.timezones
      );

      if (weatherResult.status === "fulfilled") {
        const key = `${selected.lat.toFixed(2)}:${selected.lng.toFixed(2)}`;
        setWeatherCache(key, weatherResult.value);
      }
      if (holidaysResult.status === "fulfilled") {
        setHolidayCache(selected.countryCode, year, holidaysResult.value);
      }
      if (country) {
        setCountryCache(selected.countryCode, country);
      }

      const member: TeamMember = {
        id: crypto.randomUUID(),
        name: name.trim(),
        city: selected.displayName.split(",")[0],
        countryCode: selected.countryCode,
        countryName: country?.name ?? selected.countryCode,
        flagEmoji: country?.flagEmoji ?? selected.countryCode,
        timezone,
        lat: selected.lat,
        lng: selected.lng,
        workStart: 9,
        workEnd: 17,
        addedAt: Date.now(),
      };

      onAdd(member);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] animate-fade-in" role="dialog" aria-modal="true" aria-label="Add team member">
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg">Add Team Member</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-bg rounded-md text-text-secondary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. Sarah"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="relative" ref={dropdownRef}>
            <Input
              label="City"
              placeholder="e.g. Berlin"
              value={cityQuery}
              onChange={(e) => handleCityChange(e.target.value)}
            />
            {searching && (
              <div className="absolute right-3 top-8">
                <Loader2 size={16} className="animate-spin text-text-secondary" />
              </div>
            )}
            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-h-48 overflow-y-auto">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-bg flex items-center gap-2 transition-colors duration-150"
                  >
                    <MapPin size={14} className="text-text-secondary flex-shrink-0" />
                    <span className="truncate">{r.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <p className="text-xs text-text-secondary">
              Selected: {selected.displayName.split(",").slice(0, 2).join(",")}{" "}
              ({selected.countryCode})
            </p>
          )}

          {error && <p className="text-sm text-error" role="alert">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={adding || !name.trim() || !selected}>
              {adding ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
