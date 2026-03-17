"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { GeoResult, TeamMember } from "@/types";
import { searchCity } from "@/lib/api/geocode";
import { fetchCountry } from "@/lib/api/country";
import { resolveTimezone } from "@/lib/timezone";
import { setCountryCache } from "@/lib/storage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X, MapPin, Loader2 } from "lucide-react";

interface EditMemberModalProps {
  member: TeamMember;
  onSave: (member: TeamMember) => void;
  onClose: () => void;
}

function formatHour(i: number): string {
  if (i === 0) return "12 AM";
  if (i < 12) return `${i} AM`;
  if (i === 12) return "12 PM";
  return `${i - 12} PM`;
}

export default function EditMemberModal({ member, onSave, onClose }: EditMemberModalProps) {
  const [name, setName] = useState(member.name);
  const [cityQuery, setCityQuery] = useState(member.city);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [selected, setSelected] = useState<GeoResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [workStart, setWorkStart] = useState(member.workStart);
  const [workEnd, setWorkEnd] = useState(member.workEnd);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
      setError("Location lookup unavailable");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleCityChange = (value: string) => {
    setCityQuery(value);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 500);
  };

  const handleSelect = (result: GeoResult) => {
    setSelected(result);
    setCityQuery(result.displayName.split(",")[0]);
    setShowDropdown(false);
    setResults([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let updatedMember = { ...member, name: name.trim(), workStart, workEnd };

      if (selected) {
        const country = await fetchCountry(selected.countryCode).catch(() => null);
        const timezone = resolveTimezone(
          selected.countryCode,
          country?.timezones
        );
        if (country) setCountryCache(selected.countryCode, country);

        updatedMember = {
          ...updatedMember,
          city: selected.displayName.split(",")[0],
          countryCode: selected.countryCode,
          countryName: country?.name ?? selected.countryCode,
          flagEmoji: country?.flagEmoji ?? selected.countryCode,
          timezone,
          lat: selected.lat,
          lng: selected.lng,
        };
      }

      onSave(updatedMember);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] animate-fade-in" role="dialog" aria-modal="true" aria-label="Edit team member">
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg">Edit Team Member</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-bg rounded-md text-text-secondary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="relative" ref={dropdownRef}>
            <Input
              label="City"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="work-start" className="text-sm font-medium text-text-primary">Work Start</label>
              <select
                id="work-start"
                value={workStart}
                onChange={(e) => setWorkStart(Number(e.target.value))}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="work-end" className="text-sm font-medium text-text-primary">Work End</label>
              <select
                id="work-end"
                value={workEnd}
                onChange={(e) => setWorkEnd(Number(e.target.value))}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-error" role="alert">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
